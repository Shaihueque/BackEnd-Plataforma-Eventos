
import * as inscriptionsDAO from '../dao/inscriptions.dao.js';

// Obtener todas las inscripciones
export const getAllInscriptions = async () => {
    return await inscriptionsDAO.getAllInscriptions();
};

// Obtener una inscripción por su ID
export const getInscriptionById = async (id, session) => {
    return await inscriptionsDAO.getInscriptionById(id, session);
};

// Buscar una inscripción de un usuario en un evento
export const getInscriptionByUserAndEvent = async (
    userId,
    eventId,
    session
) => {
    return await inscriptionsDAO.getInscriptionByUserAndEvent(
        userId,
        eventId,
        session
    );
};

// Crear una inscripción
export const createInscription = async (inscriptionData, session) => {
    return await inscriptionsDAO.createInscription(
        inscriptionData,
        session
    );
};

// Actualizar una inscripción
export const updateInscription = async (id, inscriptionData, session) => {
    return await inscriptionsDAO.updateInscription(
        id,
        inscriptionData,
        session
    );
};

// Eliminar una inscripción
export const deleteInscription = async (id) => {
    return await inscriptionsDAO.deleteInscription(id);
};

// Cancelar una inscripción activa
export const cancelInscription = async (id, session) => {
    return await inscriptionsDAO.cancelInscription(id, session);
};
