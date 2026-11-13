import { Router } from 'express';

import {getInscriptions, getInscriptionById, createInscription, cancelInscription} from '../controllers/inscriptions.controller.js';

const router = Router();

// Obtener todas las inscripciones
router.get('/', getInscriptions);

// Obtener una inscripción por ID
router.get('/:id', getInscriptionById);

// Crear o reactivar una inscripción
router.post('/', createInscription);

// Cancelar una inscripción
router.patch('/:id/cancel', cancelInscription);

export default router;