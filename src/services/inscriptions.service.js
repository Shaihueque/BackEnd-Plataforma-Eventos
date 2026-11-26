import { AppError } from '../utils/AppError.js';
import { executeTransaction } from '../utils/transaction.utils.js';

import {validateCreateInscriptionData, validateInscriptionId, isValidInscriptionId} from '../validations/inscriptions.validation.js';

import * as inscriptionsRepository from '../repositories/inscriptions.repository.js';
import * as eventsRepository from '../repositories/events.repository.js';
import * as usersRepository from '../repositories/users.repository.js';

// Obtener todas las inscripciones
export const getAllInscriptions = async () => {
    return await inscriptionsRepository.getAllInscriptions();
};

// Obtener una inscripción por su ID
export const getInscriptionById = async (id) => {

    // Comprobar que el identificador sea válido
    if (!isValidInscriptionId(id)) {
        return null;
    }

    return await inscriptionsRepository.getInscriptionById(id);
};

// Crear o reactivar una inscripción
export const createInscription = async (inscriptionData) => {

    // Validar los datos de entrada
    const { user, event, quantity } =
        validateCreateInscriptionData(inscriptionData);

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

    try {
        // Ejecutar las operaciones dentro de una transacción
        return await executeTransaction(async (session) => {

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
                const reactivatedInscription =
                    await inscriptionsRepository.updateInscription(
                        existingInscription._id,
                        {
                            quantity,
                            status: 'pending'
                        },
                        session
                    );

                if (!reactivatedInscription) {
                    throw new Error(
                        'No se pudo reactivar la inscripción'
                    );
                }

                return reactivatedInscription;
            }

            // Crear una nueva inscripción
            return await inscriptionsRepository.createInscription(
                {
                    user,
                    event,
                    quantity,
                    status: 'pending'
                },
                session
            );
        });

    } catch (error) {
        // Controlar inscripciones duplicadas en MongoDB
        if (error.code === 11000) {
            throw new AppError(
                'El usuario ya tiene una inscripción para este evento',
                409
            );
        }

        // Propagar el error original al middleware global
        throw error;
    }
};

// Cancelar una inscripción y liberar sus entradas
export const cancelInscription = async (id) => {

    // Validar el identificador
    validateInscriptionId(id);

    // Ejecutar las operaciones dentro de una transacción
    return await executeTransaction(async (session) => {

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

        // Devolver la inscripción cancelada
        return cancelledInscription;
    });
};