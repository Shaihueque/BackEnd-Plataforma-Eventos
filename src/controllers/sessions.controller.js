import * as usersService from '../services/users.service.js';
import { env } from '../config/env.config.js';

// Obtener la ruta de sesiones
export const getSessions = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Ruta de sesiones preparada'
    });
};

// Registrar un nuevo usuario
export const registerUser = async (req, res) => {
    // Obtener los datos enviados por el cliente
    const userData = req.body;

    // Registrar el usuario mediante el servicio
    const newUser = await usersService.registerUser(userData);

    // Devolver la respuesta
    res.status(201).json({
        status: 'success',
        payload: newUser
    });
};

// Iniciar sesión de un usuario
export const loginUser = async (req, res) => {
    // Obtener las credenciales enviadas por el cliente
    const userData = req.body;

    // Validar las credenciales y generar el JWT mediante el servicio
    const token = await usersService.loginUser(userData);

    // Guardar el JWT en una cookie de autenticación
    res.cookie('currentUser', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3600000,
        secure: env.NODE_ENV === 'production'
    });

    // Devolver la respuesta exitosa
    res.status(200).json({
        status: 'success',
        message: 'Login correcto'
    });
};

// Obtener los datos del usuario autenticado
export const currentUser = (req, res) => {
    // Obtener los datos previamente validados por el middleware
    const user = req.user;

    // Devolver únicamente la información pública del usuario
    res.status(200).json({
        status: 'success',
        payload: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    });
};

// Cerrar la sesión del usuario
export const logoutUser = (req, res) => {
    // Eliminar la cookie de autenticación
    res.clearCookie('currentUser', {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        path: '/'
    });

    // Confirmar el cierre de sesión
    res.status(200).json({
        status: 'success',
        message: 'Sesión cerrada'
    });
};