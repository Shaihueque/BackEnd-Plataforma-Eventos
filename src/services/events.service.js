
import * as eventsRepository from '../repositories/events.repository.js';
import mongoose from 'mongoose';

// Obtener todos los eventos
export const getAllEvents = async () => {
    return await eventsRepository.getAllEvents();
};

// Obtener un evento por su ID
export const getEventById = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return await eventsRepository.getEventById(id);
};

// Crear un evento
export const createEvent = async (eventData) => {
    return await eventsRepository.createEvent(eventData);
};

// Actualizar un evento
export const updateEvent = async (id, eventData) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return await eventsRepository.updateEvent(id, eventData);
};

// Eliminar un evento
export const deleteEvent = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return await eventsRepository.deleteEvent(id);
};
