import * as usersService from '../services/users.service.js';

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