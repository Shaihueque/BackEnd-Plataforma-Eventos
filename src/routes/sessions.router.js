import { Router } from 'express';
import {getSessions, registerUser, loginUser, currentUser, logoutUser} from '../controllers/sessions.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener la ruta de sesiones
router.get('/', getSessions);

// Registrar un nuevo usuario
router.post('/register', registerUser);

// Iniciar sesión de un usuario
router.post('/login', loginUser);

// Obtener los datos del usuario autenticado
router.get('/current', authMiddleware, currentUser);

// Cerrar la sesión del usuario
router.post('/logout', logoutUser);

export default router;