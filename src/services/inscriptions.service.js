
import mongoose from 'mongoose';

import { AppError } from '../utils/AppError.js';

import * as inscriptionsRepository from '../repositories/inscriptions.repository.js';
import * as eventsRepository from '../repositories/events.repository.js';
import * as usersRepository from '../repositories/users.repository.js';

// Obtener todas las inscripciones
export const getAllInscriptions = async () => {
    return await inscriptionsRepository.getAllInscriptions();
};

// Obtener una inscripción por su ID
export const getInscriptionById = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return await inscriptionsRepository.getInscriptionById(id);
};

// Crear o reactivar una inscripción
export const createInscription = async (inscriptionData) => {
    const { user, event, quantity = 1 } = inscriptionData;

    // Validar los identificadores
    if (
        !mongoose.isValidObjectId(user) ||
        !mongoose.isValidObjectId(event)
    ){
        throw new AppError(
            'El identificador del usuario o del evento no es válido',
            400
        );
    }

    // Validar la cantidad de entradas
    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 4
    ){
        throw new AppError(
            'La cantidad de entradas debe ser un número entero entre 1 y 4',
            400
        );
    }

    // Verificar que el usuario exista
    const existingUser = await usersRepository.getUserById(user);

    if (!existingUser) {
        throw new AppError(
            'El usuario no existe',
            404
        );
    }

    // Verificar que el evento exista
    const existingEvent = await eventsRepository.getEventById(event);

    if (!existingEvent) {
        throw new AppError(
            'El evento no existe',
            404
        );
    }

    // Verificar que el evento esté publicado
    if (existingEvent.status !== 'published') {
        throw new AppError(
            'El evento no está disponible para inscripciones',
            409
        );
    }

    // Iniciar una sesión de MongoDB
    const session = await mongoose.startSession();

    try {
        let result;

        // Ejecutar las operaciones dentro de una transacción
        await session.withTransaction(async () => {

            // Buscar si el usuario ya tiene una inscripción
            const existingInscription =
                await inscriptionsRepository.getInscriptionByUserAndEvent(
                    user,
                    event,
                    session
                );

            // Evitar inscripciones duplicadas
            if (
                existingInscription &&
                existingInscription.status !== 'cancelled'
            ) {
                throw new AppError(
                    'El usuario ya tiene una inscripción activa para este evento',
                    409
                );
            }

            // Reservar entradas de forma atómica
            const updatedEvent = await eventsRepository.reserveTickets(
                event,
                quantity,
                session
            );

            if (!updatedEvent) {
                throw new AppError(
                    'No hay suficientes entradas disponibles para este evento',
                    409
                );
            }

            // Reactivar una inscripción cancelada
            if (existingInscription) {
                result = await inscriptionsRepository.updateInscription(
                    existingInscription._id,
                    {
                        quantity,
                        status: 'pending'
                    },
                    session
                );

                if (!result) {
                    throw new Error(
                        'No se pudo reactivar la inscripción'
                    );
                }

                return;
            }

            // Crear una nueva inscripción
            result = await inscriptionsRepository.createInscription(
                {
                    user,
                    event,
                    quantity,
                    status: 'pending'
                },
                session
            );
        });

        return result;

    } catch (error) {
    // Propagar los errores controlados
        if (error instanceof AppError) {
            throw error;
        }

        // Controlar inscripciones duplicadas en MongoDB
        if (error.code === 11000) {
            throw new AppError(
                'El usuario ya tiene una inscripción para este evento',
                409
            );
        }

        // Registrar los errores inesperados
        console.error('Error al crear la inscripción:', error);

        // Propagar un error interno al middleware global
        throw new AppError(
            'Ocurrió un error al procesar la inscripción',
            500
        );

    } finally {
        await session.endSession();
    }
};

// Cancelar una inscripción y liberar sus entradas
export const cancelInscription = async (id) => {

    // Validar el identificador
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(
            'El identificador de la inscripción no es válido',
            400
        );
    }

    // Iniciar una sesión de MongoDB
    const session = await mongoose.startSession();

    try {
        let result;

        // Ejecutar las operaciones dentro de una transacción
        await session.withTransaction(async () => {

            // Buscar la inscripción
            const inscription =
                await inscriptionsRepository.getInscriptionById(
                    id,
                    session
                );

            if (!inscription) {
                throw new AppError(
                    'La inscripción no existe',
                    404
                );
            }

            // Evitar cancelar una inscripción dos veces
            if (inscription.status === 'cancelled') {
                throw new AppError(
                    'La inscripción ya se encuentra cancelada',
                    409
                );
            }

            // Cambiar el estado a cancelled
            const cancelledInscription =
                await inscriptionsRepository.cancelInscription(
                    id,
                    session
                );

            if (!cancelledInscription) {
                throw new Error(
                    'No se pudo cancelar la inscripción'
                );
            }

            // Liberar las entradas reservadas
            const updatedEvent = await eventsRepository.releaseTickets(
                inscription.event,
                inscription.quantity,
                session
            );

            if (!updatedEvent) {
                throw new Error(
                    'No se pudieron liberar las entradas reservadas'
                );
            }

            result = cancelledInscription;
        });

        return result;

    } catch (error) {
    // Propagar los errores controlados
        if (error instanceof AppError) {
            throw error;
        }

    // Registrar los errores inesperados
        console.error('Error al cancelar la inscripción:', error);

    // Propagar el error al middleware global
        throw new AppError(
            'Ocurrió un error al cancelar la inscripción',
            500
        );

    } finally {
        // Cerrar la sesión de MongoDB
        await session.endSession();
    }
};
