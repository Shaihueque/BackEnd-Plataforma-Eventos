
import * as inscriptionsService from '../services/inscriptions.service.js';

// Obtener todas las inscripciones
export const getInscriptions = async (req, res) => {
    const inscriptions = await inscriptionsService.getAllInscriptions();

    return res.status(200).json({
        status: 'success',
        message: 'Inscripciones obtenidas correctamente',
        payload: inscriptions
    });
};

// Obtener una inscripción por ID
export const getInscriptionById = async (req, res) => {
    const { id } = req.params;

    const inscription = await inscriptionsService.getInscriptionById(id);

    if (!inscription) {
        const error = new Error(
            'La inscripción no existe o su identificador no es válido'
        );
        error.statusCode = 404;
        throw error;
    }

    return res.status(200).json({
        status: 'success',
        message: 'Inscripción obtenida correctamente',
        payload: inscription
    });
};

// Crear o reactivar una inscripción
export const createInscription = async (req, res) => {
    const inscription = await inscriptionsService.createInscription(req.body);

    return res.status(201).json({
        status: 'success',
        message: 'Inscripción creada o reactivada correctamente',
        payload: inscription
    });
};

// Cancelar una inscripción
export const cancelInscription = async (req, res) => {
    const { id } = req.params;

    const inscription = await inscriptionsService.cancelInscription(id);

    return res.status(200).json({
        status: 'success',
        message: 'Inscripción cancelada correctamente',
        payload: inscription
    });
};
