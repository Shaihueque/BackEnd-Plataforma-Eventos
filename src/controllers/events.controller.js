import * as eventsService from '../services/events.service.js';

// Obtener todos los eventos
export const getEvents = async (req, res) => {
    try {
        const events = await eventsService.getAllEvents();

        return res.status(200).json({
            status: 'success',
            message: 'Eventos obtenidos correctamente',
            payload: events
        });

    } catch (error) {
        console.error('Error al obtener eventos:', error);

        return res.status(500).json({
            status: 'error',
            message: 'Error interno al obtener los eventos'
        });
    }
};