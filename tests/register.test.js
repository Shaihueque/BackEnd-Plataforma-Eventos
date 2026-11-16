
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import app from '../src/app.js';
import { env } from '../src/config/env.config.js';
import User from '../src/models/User.js';

// Pruebas de integración del registro seguro de usuarios
test('Registro seguro de usuarios', {
    timeout: 30000
}, async (t) => {

    // Verificar que estamos utilizando el entorno de pruebas
    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);

    assert.equal(
        new URL(env.MONGO_URL).pathname,
        '/akun_eventos_test',
        'La URI debe apuntar a la base de datos de pruebas'
    );

    let server;
    let userId;

    try {
        // Conectar exclusivamente a la base de datos de pruebas
        await mongoose.connect(env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });

        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        // Iniciar un servidor temporal en un puerto disponible
        server = app.listen(0);

        await new Promise((resolve, reject) => {
            if (server.listening) {
                resolve();
            } else {
                server.once('listening', resolve);
                server.once('error', reject);
            }
        });

        const address = server.address();
        const baseURL = `http://127.0.0.1:${address.port}`;

        // Crear un email único para evitar conflictos
        const email = `registro-${new mongoose.Types.ObjectId()}@example.com`;

        // Datos válidos para registrar un usuario
        const userData = {
            first_name: 'Ana',
            last_name: 'Pérez',
            email: ` ${email.toUpperCase()} `,
            password: 'Secreta123',
            role: 'admin'
        };

        // Función auxiliar para enviar solicitudes de registro
        const sendRegister = async (data) => {
            const response = await fetch(
                `${baseURL}/api/sessions/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }
            );

            const body = await response.json();

            return { response, body };
        };

        // Prueba 1: registro exitoso
        await t.test('Registra un usuario correctamente', async () => {
            const { response, body } = await sendRegister(userData);

            assert.equal(response.status, 201);
            assert.equal(body.status, 'success');

            assert.ok(body.payload.id);
            assert.equal(body.payload.first_name, 'Ana');
            assert.equal(body.payload.last_name, 'Pérez');
            assert.equal(body.payload.email, email);
            assert.equal(body.payload.role, 'user');

            // La respuesta nunca debe exponer la contraseña
            assert.equal(body.payload.password, undefined);
            assert.equal(body.password, undefined);

            userId = body.payload.id;

            // Verificar los datos almacenados en MongoDB
            const storedUser = await User.findById(userId)
                .select('+password');

            assert.ok(storedUser);
            assert.equal(storedUser.email, email);
            assert.equal(storedUser.role, 'user');

            // La contraseña debe estar hasheada con bcrypt
            assert.notEqual(
                storedUser.password,
                'Secreta123'
            );

            assert.match(
                storedUser.password,
                /^\$2[aby]\$\d{2}\$/
            );
        });

        // Prueba 2: email duplicado
        await t.test('Rechaza un email ya registrado', async () => {
            const { response, body } = await sendRegister(userData);

            assert.equal(response.status, 409);
            assert.equal(body.status, 'error');
            assert.equal(
                body.message,
                'El email ya está registrado'
            );
        });

        // Prueba 3: campos obligatorios
        await t.test('Rechaza campos obligatorios faltantes', async () => {
            const { response, body } = await sendRegister({
                first_name: 'Ana',
                email: 'ana@example.com'
            });

            assert.equal(response.status, 400);
            assert.equal(body.status, 'error');
            assert.equal(
                body.message,
                'Faltan campos obligatorios'
            );
        });

        // Prueba 4: formato de email inválido
        await t.test('Rechaza un email inválido', async () => {
            const { response, body } = await sendRegister({
                first_name: 'Ana',
                last_name: 'Pérez',
                email: 'correo-invalido',
                password: 'Secreta123'
            });

            assert.equal(response.status, 400);
            assert.equal(body.status, 'error');
            assert.equal(
                body.message,
                'El formato del correo electrónico no es válido'
            );
        });

        // Prueba 5: contraseña demasiado corta
        await t.test('Rechaza contraseñas cortas', async () => {
            const { response, body } = await sendRegister({
                first_name: 'Ana',
                last_name: 'Pérez',
                email: 'ana@example.com',
                password: '123'
            });

            assert.equal(response.status, 400);
            assert.equal(body.status, 'error');
            assert.equal(
                body.message,
                'La contraseña debe tener al menos 8 caracteres'
            );
        });

    } finally {
        // Eliminar únicamente el usuario creado por esta prueba
        if (userId && mongoose.connection.readyState === 1) {
            await User.findByIdAndDelete(userId);
        }

        // Cerrar el servidor temporal
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }

        // Cerrar la conexión a MongoDB
        await mongoose.disconnect();
    }
});
