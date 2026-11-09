
import User from '../models/User.js';

// Obtener todos los usuarios
export const getAllUsers = async () => {
    return await User.find().lean();
};

// Obtener un usuario por su ID
export const getUserById = async (id) => {
    return await User.findById(id).lean();
};

// Obtener un usuario por su email
// Se incluye password porque tiene select: false en el modelo.
export const getUserByEmail = async (email) => {
    return await User.findOne({ email })
        .select('+password')
        .lean();
};

// Crear un usuario
export const createUser = async (userData) => {
    return await User.create(userData);
};

// Actualizar un usuario
export const updateUser = async (id, userData) => {
    return await User.findByIdAndUpdate(
        id,
        userData,
        {
            returnDocument: 'after',
            runValidators: true
        }
    );
};

// Eliminar un usuario
export const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};
