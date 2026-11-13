import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { env } from '../src/config/env.config.js';
import User from '../src/models/User.js';
import Event from '../src/models/Event.js';
import Inscription from '../src/models/Inscription.js';

import { createInscription, cancelInscription  } from '../src/services/inscriptions.service.js';

test('Crear una inscripción reserva las entradas correctamente', {
    timeout: 20000
}, async () => {
    // Verificar el entorno de pruebas
    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);

assert.equal(
    new URL(env.MONGO_URL).pathname,
    '/akun_eventos_test',
    'La URI debe apuntar a la base de datos de pruebas'
);

    let user;
    let event;

    try {
        await mongoose.connect(env.MONGO_URL, {
            dbName: 'akun_eventos_test',
            serverSelectionTimeoutMS: 10000
        });

        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        // Crear un usuario temporal
        user = await User.create({
            firstName: 'Usuario',
            lastName: 'Prueba',
            email: `prueba-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123',
            role: 'user'
        });

        // Crear un evento temporal
        event = await Event.create({
            title: 'Evento de prueba',
            description: 'Evento para verificar las inscripciones',
            date: new Date('2027-06-15'),
            location: 'La Plata',
            capacity: 10,
            reservedTickets: 0,
            category: 'Tecnología',
            organizer: user._id,
            status: 'published'
        });

        // Crear inscripción de dos entradas
        const result = await createInscription({
            user: user._id,
            event: event._id,
            quantity: 2
        });

        assert.ok(result);
        assert.equal(result.error, undefined);

        // Verificar la inscripción almacenada
        const inscription = await Inscription.findOne({
            user: user._id,
            event: event._id
        });

        assert.ok(inscription);
        assert.equal(inscription.quantity, 2);
        assert.equal(inscription.status, 'pending');

        // Verificar las entradas reservadas
        const updatedEvent = await Event.findById(event._id);

        assert.equal(updatedEvent.reservedTickets, 2);

        console.log('Inscripción creada correctamente');
        console.log('Entradas reservadas: 2');

    } finally {
        // Limpiar únicamente los documentos de esta prueba
        if (user && event) {
            await Inscription.deleteMany({
                user: user._id,
                event: event._id
            });
        }

        if (event) {
            await Event.findByIdAndDelete(event._id);
        }

        if (user) {
            await User.findByIdAndDelete(user._id);
        }

        await mongoose.disconnect();
    }
});


test('No permite inscripciones duplicadas al mismo evento', {
    timeout: 20000
}, async () => {

    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);

    assert.equal(
        new URL(env.MONGO_URL).pathname,
        '/akun_eventos_test',
        'La URI debe apuntar a la base de datos de pruebas'
    );

    let user;
    let event;
    let connected = false;

    try {
        await mongoose.connect(env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });

        connected = true;

        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        // Crear usuario temporal
        user = await User.create({
            firstName: 'Usuario',
            lastName: 'Duplicado',
            email: `duplicado-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123',
            role: 'user'
        });

        // Crear evento temporal
        event = await Event.create({
            title: 'Evento para probar duplicados',
            description: 'Prueba de inscripciones duplicadas',
            date: new Date('2027-06-15'),
            location: 'La Plata',
            capacity: 10,
            reservedTickets: 0,
            category: 'Tecnología',
            organizer: user._id,
            status: 'published'
        });

        // Primera inscripción
        const firstResult = await createInscription({
            user: user._id,
            event: event._id,
            quantity: 2
        });

        assert.ok(firstResult);
        assert.equal(firstResult.error, undefined);

        // Segundo intento con el mismo usuario y evento
        // Debe rechazar la inscripción duplicada
        await assert.rejects(
            () => createInscription({
                user: user._id,
                event: event._id,
                quantity: 2
            }),
            {
                name: 'AppError',
                message: 'El usuario ya tiene una inscripción activa para este evento',
                statusCode: 409
            }
        );

        // Verificar que exista una sola inscripción
        const inscriptionsCount = await Inscription.countDocuments({
            user: user._id,
            event: event._id
        });

        assert.equal(inscriptionsCount, 1);

        // Verificar que no se reservaron entradas adicionales
        const updatedEvent = await Event.findById(event._id);

        assert.equal(updatedEvent.reservedTickets, 2);

        console.log('Inscripción duplicada rechazada correctamente');
        console.log('Entradas reservadas: 2');

    } finally {
        // Limpiar documentos de esta prueba
        if (connected) {
            try {
                if (user && event) {
                    await Inscription.deleteMany({
                        user: user._id,
                        event: event._id
                    });
                }

                if (event) {
                    await Event.findByIdAndDelete(event._id);
                }

                if (user) {
                    await User.findByIdAndDelete(user._id);
                }
            } finally {
                await mongoose.disconnect();
            }
        }
    }
});

test('No permite superar la capacidad del evento', {
    timeout: 20000
}, async () => {

    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);

    assert.equal(
        new URL(env.MONGO_URL).pathname,
        '/akun_eventos_test'
    );

    let user1;
    let user2;
    let event;
    let connected = false;

    try {
        await mongoose.connect(env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });

        connected = true;

        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        // Crear dos usuarios temporales
        user1 = await User.create({
            firstName: 'Usuario',
            lastName: 'Uno',
            email: `capacidad1-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123'
        });

        user2 = await User.create({
            firstName: 'Usuario',
            lastName: 'Dos',
            email: `capacidad2-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123'
        });

        // Evento con capacidad de 3 entradas
        event = await Event.create({
            title: 'Evento con capacidad limitada',
            description: 'Prueba del límite de entradas',
            date: new Date('2027-06-15'),
            location: 'La Plata',
            capacity: 3,
            reservedTickets: 0,
            category: 'Tecnología',
            organizer: user1._id,
            status: 'published'
        });

        // Primer usuario reserva 2 entradas
        const firstResult = await createInscription({
            user: user1._id,
            event: event._id,
            quantity: 2
        });

        assert.equal(firstResult.error, undefined);

        // Segundo usuario intenta reservar otras 2 entradas
        // Debe rechazar la operación por falta de capacidad
        await assert.rejects(
            () => createInscription({
                user: user2._id,
                event: event._id,
                quantity: 2
            }),
            {
                name: 'AppError',
                message: 'No hay suficientes entradas disponibles para este evento',
                statusCode: 409
            }
        );

        // La reserva inicial debe mantenerse
        const updatedEvent = await Event.findById(event._id);

        assert.equal(updatedEvent.reservedTickets, 2);

        // Solo debe existir una inscripción
        const count = await Inscription.countDocuments({
            event: event._id
        });

        assert.equal(count, 1);

        console.log('Capacidad máxima respetada correctamente');
        console.log('Entradas reservadas: 2 de 3');

    } finally {
        if (connected) {
            try {
                if (event) {
                    await Inscription.deleteMany({
                        event: event._id
                    });

                    await Event.findByIdAndDelete(event._id);
                }

                if (user1) {
                    await User.findByIdAndDelete(user1._id);
                }

                if (user2) {
                    await User.findByIdAndDelete(user2._id);
                }
            } finally {
                await mongoose.disconnect();
            }
        }
    }
});


test('Cancelar una inscripción libera las entradas reservadas', {
    timeout: 20000
}, async () => {

    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);

    assert.equal(
        new URL(env.MONGO_URL).pathname,
        '/akun_eventos_test'
    );

    let user;
    let event;
    let connected = false;

    try {
        await mongoose.connect(env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });

        connected = true;

        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        // Crear usuario temporal
        user = await User.create({
            firstName: 'Usuario',
            lastName: 'Cancelacion',
            email: `cancelacion-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123',
            role: 'user'
        });

        // Crear evento con capacidad de 5 entradas
        event = await Event.create({
            title: 'Evento para probar cancelaciones',
            description: 'Prueba de liberación de entradas',
            date: new Date('2027-06-15'),
            location: 'La Plata',
            capacity: 5,
            reservedTickets: 0,
            category: 'Tecnología',
            organizer: user._id,
            status: 'published'
        });

        // Crear una inscripción de 3 entradas
        const createdInscription = await createInscription({
            user: user._id,
            event: event._id,
            quantity: 3
        });

        assert.ok(createdInscription);
        assert.equal(createdInscription.error, undefined);

        // Verificar que las entradas se reservaron
        const eventBefore = await Event.findById(event._id);

        assert.equal(eventBefore.reservedTickets, 3);

        // Cancelar la inscripción
        const cancelledInscription = await cancelInscription(
            createdInscription._id
        );

        assert.ok(cancelledInscription);
        assert.equal(cancelledInscription.error, undefined);
        assert.equal(cancelledInscription.status, 'cancelled');

        // Verificar que la inscripción sigue almacenada
        const inscriptionInDB = await Inscription.findById(
            createdInscription._id
        );

        assert.ok(inscriptionInDB);
        assert.equal(inscriptionInDB.status, 'cancelled');

        // Verificar que se liberaron las entradas
        const eventAfter = await Event.findById(event._id);

        assert.equal(eventAfter.reservedTickets, 0);

        console.log('Inscripción cancelada correctamente');
        console.log('Entradas reservadas después de cancelar: 0');

    } finally {
        if (connected) {
            try {
                if (event) {
                    await Inscription.deleteMany({
                        event: event._id
                    });

                    await Event.findByIdAndDelete(event._id);
                }

                if (user) {
                    await User.findByIdAndDelete(user._id);
                }
            } finally {
                await mongoose.disconnect();
            }
        }
    }
});


test('Permite reactivar una inscripción cancelada', {
    timeout: 20000
}, async () => {

    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);

    assert.equal(
        new URL(env.MONGO_URL).pathname,
        '/akun_eventos_test'
    );

    let user;
    let event;
    let connected = false;

    try {
        await mongoose.connect(env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });

        connected = true;

        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        // Crear usuario temporal
        user = await User.create({
            firstName: 'Usuario',
            lastName: 'Reactivacion',
            email: `reactivacion-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123',
            role: 'user'
        });

        // Crear evento temporal
        event = await Event.create({
            title: 'Evento para probar reactivaciones',
            description: 'Prueba de reactivación de inscripciones',
            date: new Date('2027-06-15'),
            location: 'La Plata',
            capacity: 5,
            reservedTickets: 0,
            category: 'Tecnología',
            organizer: user._id,
            status: 'published'
        });

        // Primera inscripción: 3 entradas
        const firstInscription = await createInscription({
            user: user._id,
            event: event._id,
            quantity: 3
        });

        assert.equal(firstInscription.error, undefined);

        // Cancelar la inscripción
        const cancelled = await cancelInscription(
            firstInscription._id
        );

        assert.equal(cancelled.error, undefined);
        assert.equal(cancelled.status, 'cancelled');

        // Reactivar con 2 entradas
        const reactivated = await createInscription({
            user: user._id,
            event: event._id,
            quantity: 2
        });

        assert.ok(reactivated);
        assert.equal(reactivated.error, undefined);

        // Debe conservar el identificador original
        assert.equal(
            reactivated._id.toString(),
            firstInscription._id.toString()
        );

        // Verificar los datos de la inscripción
        const inscriptionInDB = await Inscription.findById(
            firstInscription._id
        );

        assert.equal(inscriptionInDB.status, 'pending');
        assert.equal(inscriptionInDB.quantity, 2);

        // Verificar que solo exista una inscripción
        const count = await Inscription.countDocuments({
            user: user._id,
            event: event._id
        });

        assert.equal(count, 1);

        // Verificar las entradas reservadas
        const updatedEvent = await Event.findById(event._id);

        assert.equal(updatedEvent.reservedTickets, 2);

        console.log('Inscripción reactivada correctamente');
        console.log('Entradas reservadas después de reactivar: 2');

    } finally {
        if (connected) {
            try {
                if (event) {
                    await Inscription.deleteMany({
                        event: event._id
                    });

                    await Event.findByIdAndDelete(event._id);
                }

                if (user) {
                    await User.findByIdAndDelete(user._id);
                }
            } finally {
                await mongoose.disconnect();
            }
        }
    }
});


test('Las reservas simultáneas no superan la capacidad del evento', {
    timeout: 30000
}, async () => {

    assert.equal(env.NODE_ENV, 'test');
    assert.ok(env.MONGO_URL);

    assert.equal(
        new URL(env.MONGO_URL).pathname,
        '/akun_eventos_test'
    );

    let user1;
    let user2;
    let event;
    let connected = false;

    try {
        await mongoose.connect(env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000
        });

        connected = true;

        assert.equal(
            mongoose.connection.name,
            'akun_eventos_test'
        );

        // Crear dos usuarios temporales
        user1 = await User.create({
            firstName: 'Usuario',
            lastName: 'Concurrente Uno',
            email: `concurrente1-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123',
            role: 'user'
        });

        user2 = await User.create({
            firstName: 'Usuario',
            lastName: 'Concurrente Dos',
            email: `concurrente2-${new mongoose.Types.ObjectId()}@example.com`,
            password: 'contraseña-temporal-123',
            role: 'user'
        });

        // Crear evento con una sola entrada
        event = await Event.create({
            title: 'Evento con última entrada',
            description: 'Prueba de reservas simultáneas',
            date: new Date('2027-06-15'),
            location: 'La Plata',
            capacity: 1,
            reservedTickets: 0,
            category: 'Tecnología',
            organizer: user1._id,
            status: 'published'
        });

        // Ejecutar ambas solicitudes simultáneamente
        const results = await Promise.allSettled([
            createInscription({
                user: user1._id,
                event: event._id,
                quantity: 1
            }),
            createInscription({
                user: user2._id,
                event: event._id,
                quantity: 1
            })
        ]);

        // Contar inscripciones exitosas
        const successfulResults = results.filter(
            result =>
                result.status === 'fulfilled' &&
                result.value &&
                !result.value.error
        );

        // Solo una reserva debe ser exitosa
        assert.equal(successfulResults.length, 1);

        // Verificar entradas reservadas
        const updatedEvent = await Event.findById(event._id);

        assert.equal(updatedEvent.reservedTickets, 1);

        // Verificar que solo existe una inscripción
        const count = await Inscription.countDocuments({
            event: event._id,
            status: { $ne: 'cancelled' }
        });

        assert.equal(count, 1);

        console.log('Reservas simultáneas controladas correctamente');
        console.log('Entradas reservadas: 1 de 1');

    } finally {
        if (connected) {
            try {
                if (event) {
                    await Inscription.deleteMany({
                        event: event._id
                    });

                    await Event.findByIdAndDelete(event._id);
                }

                if (user1) {
                    await User.findByIdAndDelete(user1._id);
                }

                if (user2) {
                    await User.findByIdAndDelete(user2._id);
                }
            } finally {
                await mongoose.disconnect();
            }
        }
    }
});
