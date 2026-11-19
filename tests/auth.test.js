
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import app from '../src/app.js';
import { env } from '../src/config/env.config.js';
import User from '../src/models/User.js';

// Pruebas de integración de autenticación JWT
test('Autenticación de usuarios con JWT', {
    timeout: 30000
}, async (t) => {

    // Verificar que estamos utilizando el entorno de pruebas
    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);
    assert.ok(env.JWT_SECRET);

    assert.equal(
        new URL(env.MONGO_URL).pathname,
        '/akun_eventos_test',
        'La URI debe apuntar a la base de datos de pruebas'
    );

    let server;
    let userId;
    let authCookie;

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
        const email = `auth-${new mongoose.Types.ObjectId()}@example.com`;
        const password = 'Secreta123';

        // Registrar un usuario para las pruebas de autenticación
        const registerResponse = await fetch(
            `${baseURL}/api/sessions/register`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: 'Matías',
                    last_name: 'Fernández',
                    email,
                    password
                })
            }
        );

        const registerBody = await registerResponse.json();

        assert.equal(registerResponse.status, 201);
        userId = registerBody.payload.id;

        // Prueba 1: login exitoso y generación de cookie JWT
        await t.test('Inicia sesión y genera una cookie JWT', async () => {
            const response = await fetch(
                `${baseURL}/api/sessions/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const body = await response.json();

            // Verificar la respuesta del login
            assert.equal(response.status, 200);
            assert.equal(body.status, 'success');
            assert.equal(body.message, 'Login correcto');

            // Verificar que el servidor envía la cookie
const setCookie = response.headers.get('set-cookie');

assert.ok(setCookie);

            // Guardar la cookie para utilizarla en las siguientes pruebas
            authCookie = setCookie.split(';')[0];

            assert.match(setCookie, /^currentUser=/);
            assert.match(setCookie, /httponly/i);
            assert.match(setCookie, /samesite=lax/i);
            assert.match(setCookie, /max-age=3600/i);

            // En el entorno de pruebas no debe utilizar Secure
        assert.doesNotMatch(setCookie, /;\s*secure(?:;|$)/i);
    });

    // Prueba 2: acceder a /current con un JWT válido
    await t.test('Permite acceder a current con un JWT válido', async () => {

        // Verificar que tenemos la cookie del login
        assert.ok(authCookie);

        const response = await fetch(
            `${baseURL}/api/sessions/current`,
            {
                method: 'GET',
                headers: {
                    Cookie: authCookie
                }
            }
        );

        const body = await response.json();

        // Verificar que el acceso está permitido
        assert.equal(response.status, 200);
        assert.equal(body.status, 'success');

        // Verificar los datos del usuario autenticado
        assert.equal(body.payload.id, userId);
        assert.equal(body.payload.email, email);
        assert.equal(body.payload.role, 'user');

        // La respuesta no debe exponer la contraseña
        assert.equal(body.payload.password, undefined);


    });

    // Prueba 3: rechazar acceso a /current sin cookie JWT
        await t.test('Rechaza el acceso a current sin autenticación', async () => {

            // Realizar la solicitud sin enviar ninguna cookie
            const response = await fetch(
                `${baseURL}/api/sessions/current`,
                {
                    method: 'GET'
                }
            );

            const body = await response.json();

            // Verificar que el acceso es rechazado
            assert.equal(response.status, 401);
            assert.equal(body.status, 'error');
            assert.equal(body.message, 'No autenticado');

            // La respuesta no debe exponer datos del usuario
            assert.equal(body.payload, undefined);
        });

         // Prueba 4: rechazar acceso con un JWT inválido
        await t.test('Rechaza el acceso a current con un JWT inválido', async () => {

            // Enviar una cookie con un token inválido
            const response = await fetch(
                `${baseURL}/api/sessions/current`,
                {
                    method: 'GET',
                    headers: {
                        Cookie: 'currentUser=token-invalido-de-prueba'
                    }
                }
            );

            const body = await response.json();

            // Verificar que el acceso es rechazado
            assert.equal(response.status, 401);
            assert.equal(body.status, 'error');
            assert.equal(body.message, 'No autenticado');

            // La respuesta no debe exponer datos del usuario
            assert.equal(body.payload, undefined);
        });

        // Prueba 5: cerrar sesión correctamente
        await t.test('Cierra la sesión y elimina la cookie JWT', async () => {

            // Verificar que tenemos la cookie del login
            assert.ok(authCookie);

            // Solicitar el cierre de sesión
            const response = await fetch(
                `${baseURL}/api/sessions/logout`,
                {
                    method: 'POST',
                    headers: {
                        Cookie: authCookie
                    }
                }
            );

            const body = await response.json();

            // Verificar la respuesta del logout
            assert.equal(response.status, 200);
            assert.equal(body.status, 'success');
            assert.equal(body.message, 'Sesión cerrada');

            // Verificar que el servidor ordena eliminar la cookie
            const setCookie = response.headers.get('set-cookie');

            assert.ok(setCookie);
            assert.match(setCookie, /^currentUser=/);
            assert.match(setCookie, /expires=/i);

            // La cookie debe quedar sin valor
            assert.match(setCookie, /^currentUser=;/);
        });

        // Prueba 6: rechazar login con contraseña incorrecta
        await t.test('Rechaza el login con contraseña incorrecta', async () => {

            const response = await fetch(
                `${baseURL}/api/sessions/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password: 'ContrasenaIncorrecta123'
                    })
                }
            );

            const body = await response.json();

            // Verificar que las credenciales son rechazadas
            assert.equal(response.status, 401);
            assert.equal(body.status, 'error');
            assert.equal(body.message, 'Credenciales inválidas');

            // No debe generarse una cookie de autenticación
            assert.equal(response.headers.get('set-cookie'), null);
        });

        // Prueba 7: rechazar login con correo inexistente
        await t.test('Rechaza el login con un correo inexistente', async () => {

            const response = await fetch(
                `${baseURL}/api/sessions/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'usuario.inexistente@example.com',
                        password: 'Secreta123'
                    })
                }
            );

            const body = await response.json();

            // Verificar que las credenciales son rechazadas
            assert.equal(response.status, 401);
            assert.equal(body.status, 'error');
            assert.equal(body.message, 'Credenciales inválidas');

            // No debe generarse una cookie de autenticación
            assert.equal(response.headers.get('set-cookie'), null);
        });

        // Prueba 8: rechazar un JWT expirado
        await t.test('Rechaza el acceso a current con un JWT expirado', async () => {

            // Generar un JWT que ya haya expirado
            const expiredToken = jwt.sign(
                {
                    id: userId,
                    email,
                    role: 'user'
                },
                env.JWT_SECRET,
                {
                    expiresIn: -10
                }
            );

            // Intentar acceder utilizando el token expirado
            const response = await fetch(
                `${baseURL}/api/sessions/current`,
                {
                    method: 'GET',
                    headers: {
                        Cookie: `currentUser=${expiredToken}`
                    }
                }
            );

            const body = await response.json();

            // Verificar que el acceso es rechazado
            assert.equal(response.status, 401);
            assert.equal(body.status, 'error');
            assert.equal(body.message, 'No autenticado');

            // No deben exponerse datos del usuario
            assert.equal(body.payload, undefined);
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
