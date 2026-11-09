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

// Reservar entradas si existe capacidad suficiente
export const reserveTickets = async (eventId, quantity, session) => {
    return await Event.findOneAndUpdate(
        {
            _id: eventId,
            status: 'published',
            $expr: {
                $lte: [
                    {
                        $add: [
                            { $ifNull: ['$reservedTickets', 0] },
                            quantity
                        ]
                    },
                    '$capacity'
                ]
            }
        },
        {
            $inc: { reservedTickets: quantity }
        },
        {
            returnDocument: 'after',
            runValidators: true,
            session
        }
    );
};

// Liberar entradas reservadas de un evento
export const releaseTickets = async (eventId, quantity, session) => {
    return await Event.findOneAndUpdate(
        {
            _id: eventId,
            reservedTickets: { $gte: quantity }
        },
        {
            $inc: { reservedTickets: -quantity }
        },
        {
            returnDocument: 'after',
            runValidators: true,
            session
        }
    );
};