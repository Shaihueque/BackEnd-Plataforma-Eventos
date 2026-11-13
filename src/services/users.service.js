import * as usersRepository from '../repositories/users.repository.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword } from '../utils/password.utils.js';

// Registrar un nuevo usuario
export const registerUser = async (userData) => {
    // Obtener los datos enviados desde el cliente
    const { first_name, last_name, email, password } = userData ?? {};

    // Validar los campos obligatorios
    if (typeof first_name !== 'string' || !first_name.trim() || typeof last_name !== 'string' || !last_name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
        throw new AppError(
            'Faltan campos obligatorios',
            400
        );
    }

    // Normalizar el correo electrónico
    const normalizedEmail = email.trim().toLowerCase();

    // Validar el formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
        throw new AppError(
            'El formato del correo electrónico no es válido',
            400
        );
    }

    // Validar la longitud mínima de la contraseña
    if (password.length < 8) {
        throw new AppError(
            'La contraseña debe tener al menos 8 caracteres',
            400
        );
    }

    // Verificar si el correo electrónico ya está registrado
    const existingUser = await usersRepository.getUserByEmail(
        normalizedEmail
    );

    if (existingUser) {
        throw new AppError(
            'El email ya está registrado',
            409
        );
    }

    // Generar el hash de la contraseña
    const hashedPassword = await hashPassword(password);

    /// Crear el usuario en MongoDB
    let newUser;

    try {
        newUser = await usersRepository.createUser({
            firstName: first_name.trim(),
            lastName: last_name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user'
        });
    } catch (error) {
        // Controlar el error de email duplicado de MongoDB
        if (error.code === 11000) {
            throw new AppError(
                'El email ya está registrado',
                409
            );
        }

        // Propagar cualquier otro error
        throw error;
    }

    // Devolver únicamente los datos públicos del usuario
    return {
        id: newUser._id.toString(),
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        email: newUser.email,
        role: newUser.role
    };
};