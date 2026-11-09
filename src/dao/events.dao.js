import Event from '../models/Event.js';

// Obtener todos los eventos
export const getAllEvents = async () => {
    return await Event.find().lean();
};

// Obtener un evento por su ID
export const getEventById = async (id) => {
    return await Event.findById(id).lean();
};

// Crear un evento
export const createEvent = async (eventData) => {
    return await Event.create(eventData);
};

// Actualizar un evento
export const updateEvent = async (id, eventData) => {
    return await Event.findByIdAndUpdate(
        id,
        eventData,
        {
            new: true,
            runValidators: true
        }
    );
};

// Eliminar un evento
export const deleteEvent = async (id) => {
    return await Event.findByIdAndDelete(id);
};