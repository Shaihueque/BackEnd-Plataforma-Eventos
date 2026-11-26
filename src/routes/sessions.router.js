import { Router } from 'express';

import {getSessions, registerUser, loginUser, currentUser, logoutUser} from '../controllers/sessions.controller.js';

import { passportAuthenticate } from '../middlewares/passport.middleware.js';

const router = Router();

// Obtener la ruta de sesiones
router.get('/', getSessions);

// Registrar un nuevo usuario mediante Passport
router.post('/register', passportAuthenticate('register'), registerUser);

// Iniciar sesión de un usuario mediante Passport
router.post('/login', passportAuthenticate('login'), loginUser);

// Obtener los datos del usuario autenticado mediante Passport JWT
router.get('/current', passportAuthenticate('current'), currentUser);

// Cerrar la sesión del usuario
router.post('/logout', logoutUser);

export default router;