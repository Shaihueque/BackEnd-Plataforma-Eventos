import { Router } from 'express';
import {getSessions, registerUser} from '../controllers/sessions.controller.js';

const router = Router();

// Obtener la ruta de sesiones
router.get('/', getSessions);

// Registrar un nuevo usuario
router.post('/register', registerUser);

export default router;