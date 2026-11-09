import * as eventsDAO from '../dao/events.dao.js';

// Obtener todos los eventos
export const getAllEvents = async () => {
    return await eventsDAO.getAllEvents();
};

// Obtener un evento por su ID
export const getEventById = async (id) => {
    return await eventsDAO.getEventById(id);
};

// Crear un evento
export const createEvent = async (eventData) => {
    return await eventsDAO.createEvent(eventData);
};

// Actualizar un evento
export const updateEvent = async (id, eventData) => {
    return await eventsDAO.updateEvent(id, eventData);
};

// Eliminar un evento
export const deleteEvent = async (id) => {
    return await eventsDAO.deleteEvent(id);
};

// Reservar entradas de un evento
export const reserveTickets = async (eventId, quantity, session) => {
    return await eventsDAO.reserveTickets(eventId, quantity, session);
};

// Liberar entradas reservadas de un evento
export const releaseTickets = async (eventId, quantity, session) => {
    return await eventsDAO.releaseTickets(
        eventId,
        quantity,
        session
    );
};