
import Inscription from '../models/Inscription.js';

// Obtener todas las inscripciones
export const getAllInscriptions = async () => {
    return await Inscription.find().lean();
};

// Obtener una inscripción por su ID
export const getInscriptionById = async (id, session) => {
    return await Inscription.findById(id)
        .session(session)
        .lean();
};

// Buscar una inscripción de un usuario en un evento
export const getInscriptionByUserAndEvent = async (
    userId,
    eventId,
    session
) => {
    return await Inscription.findOne({
        user: userId,
        event: eventId
    })
        .session(session)
        .lean();
};

// Crear una inscripción dentro de una transacción
export const createInscription = async (inscriptionData, session) => {
    const inscriptions = await Inscription.create(
        [inscriptionData],
        { session }
    );

    return inscriptions[0];
};

// Actualizar una inscripción dentro de una transacción
export const updateInscription = async (id, inscriptionData, session) => {
    return await Inscription.findByIdAndUpdate(
        id,
        inscriptionData,
        {
            returnDocument: 'after',
            runValidators: true,
            session
        }
    );
};

// Eliminar una inscripción
export const deleteInscription = async (id) => {
    return await Inscription.findByIdAndDelete(id);
};

// Cancelar una inscripción únicamente si está activa
export const cancelInscription = async (id, session) => {
    return await Inscription.findOneAndUpdate(
        {
            _id: id,
            status: { $in: ['pending', 'confirmed'] }
        },
        {
            $set: { status: 'cancelled' }
        },
        {
            returnDocument: 'after',
            runValidators: true,
            session
        }
    );
};