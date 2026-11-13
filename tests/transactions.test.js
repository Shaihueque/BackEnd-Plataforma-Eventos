import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { env } from '../src/config/env.config.js';

test('MongoDB permite ejecutar transacciones', {
    timeout: 20000
}, async () => {

    // Verificar el entorno
    assert.equal(env.NODE_ENV, 'test');

    assert.ok(
        env.MONGO_URL,
        'La variable MONGO_URL no está definida'
    );

    // Conectar a MongoDB Atlas
    await mongoose.connect(env.MONGO_URL, {
        serverSelectionTimeoutMS: 10000
    });

    let session;

    try {
        // Verificar que estamos en la base correcta
        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        console.log('Conexión de pruebas verificada');

        // Crear la colección temporal antes de la transacción
        const collection = mongoose.connection.db.collection(
            'transaction_tests'
        );

        session = await mongoose.startSession();

        session.startTransaction();

        console.log('Transacción iniciada');

        // Escribir un documento temporal
        const result = await collection.insertOne(
            { test: true, createdAt: new Date() },
            { session }
        );

        assert.ok(result.insertedId);

        console.log('Escritura realizada dentro de la transacción');

        // Deshacer la escritura
        await session.abortTransaction();

        console.log('Transacción revertida correctamente');

        // Verificar que el documento no quedó guardado
        const document = await collection.findOne({
            _id: result.insertedId
        });

        assert.equal(document, null);

    } finally {
        if (session) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }

            await session.endSession();
        }

        await mongoose.disconnect();
    }
});