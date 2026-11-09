
import mongoose from 'mongoose';

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
    ) {
        return {
            error: 'El identificador del usuario o del evento no es válido'
        };
    }

    // Validar la cantidad de entradas
    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 4
    ) {
        return {
            error: 'La cantidad de entradas debe ser un número entero entre 1 y 4'
        };
    }

    // Verificar que el usuario exista
    const existingUser = await usersRepository.getUserById(user);

    if (!existingUser) {
        return {
            error: 'El usuario no existe'
        };
    }

    // Verificar que el evento exista
    const existingEvent = await eventsRepository.getEventById(event);

    if (!existingEvent) {
        return {
            error: 'El evento no existe'
        };
    }

    // Verificar que el evento esté publicado
    if (existingEvent.status !== 'published') {
        return {
            error: 'El evento no está disponible para inscripciones'
        };
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
                result = {
                    error: 'El usuario ya tiene una inscripción activa para este evento'
                };
                return;
            }

            // Reservar entradas de forma atómica
            const updatedEvent = await eventsRepository.reserveTickets(
                event,
                quantity,
                session
            );

            if (!updatedEvent) {
                result = {
                    error: 'No hay suficientes entradas disponibles para este evento'
                };
                return;
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
        console.error('Error al crear la inscripción:', error);

        // Controlar inscripciones duplicadas
        if (error.code === 11000) {
            return {
                error: 'El usuario ya tiene una inscripción para este evento'
            };
        }

        return {
            error: 'Ocurrió un error al procesar la inscripción'
        };

    } finally {
        await session.endSession();
    }
};

// Cancelar una inscripción y liberar sus entradas
export const cancelInscription = async (id) => {

    // Validar el identificador
    if (!mongoose.isValidObjectId(id)) {
        return {
            error: 'El identificador de la inscripción no es válido'
        };
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
                result = {
                    error: 'La inscripción no existe'
                };
                return;
            }

            // Evitar cancelar una inscripción dos veces
            if (inscription.status === 'cancelled') {
                result = {
                    error: 'La inscripción ya se encuentra cancelada'
                };
                return;
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
        console.error('Error al cancelar la inscripción:', error);

        return {
            error: 'Ocurrió un error al cancelar la inscripción'
        };

    } finally {
        await session.endSession();
    }
};
