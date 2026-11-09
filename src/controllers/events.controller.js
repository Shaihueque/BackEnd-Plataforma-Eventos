import * as eventsService from '../services/events.service.js';

// Obtener todos los eventos
export const getEvents = async (req, res) => {
    const events = await eventsService.getAllEvents();

    return res.status(200).json({
        status: 'success',
        message: 'Eventos obtenidos correctamente',
        payload: events
    });
};