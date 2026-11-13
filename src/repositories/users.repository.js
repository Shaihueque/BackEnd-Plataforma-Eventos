import * as usersDAO from '../dao/users.dao.js';

// Obtener todos los usuarios
export const getAllUsers = async () => {
    return await usersDAO.getAllUsers();
};

// Obtener un usuario por su ID
export const getUserById = async (id) => {
    return await usersDAO.getUserById(id);
};

// Obtener un usuario por su email
export const getUserByEmail = async (email) => {
    return await usersDAO.getUserByEmail(email);
};

// Crear un usuario
export const createUser = async (userData) => {
    return await usersDAO.createUser(userData);
};

// Actualizar un usuario
export const updateUser = async (id, userData) => {
    return await usersDAO.updateUser(id, userData);
};

// Eliminar un usuario
export const deleteUser = async (id) => {
    return await usersDAO.deleteUser(id);
};
