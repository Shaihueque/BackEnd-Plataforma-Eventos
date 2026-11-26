import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

// Validar los datos para crear o reactivar una inscripción
export const validateCreateInscriptionData = (inscriptionData) => {
    const { user, event, quantity = 1 } = inscriptionData ?? {};

    // Validar los identificadores del usuario y del evento
    if (
        !mongoose.isValidObjectId(user) ||
        !mongoose.isValidObjectId(event)
    ) {
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
    ) {
        throw new AppError(
            'La cantidad de entradas debe ser un número entero entre 1 y 4',
            400
        );
    }

    // Devolver los datos validados
    return {
        user,
        event,
        quantity
    };
};

// Comprobar si el identificador de una inscripción es válido
export const isValidInscriptionId = (id) => {
    return mongoose.isValidObjectId(id);
};

// Validar el identificador de una inscripción
export const validateInscriptionId = (id) => {
    if (!isValidInscriptionId(id)) {
        throw new AppError(
            'El identificador de la inscripción no es válido',
            400
        );
    }

    return id;
};