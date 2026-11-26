import * as usersRepository from '../repositories/users.repository.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { generateToken } from '../utils/jwt.js';
import {validateRegisterData, validateLoginData} from '../validations/users.validation.js';

// Registrar un nuevo usuario
export const registerUser = async (userData) => {
    // Validar y normalizar los datos recibidos
    const { firstName, lastName, email, password } =
        validateRegisterData(userData);

    // Verificar si el correo electrónico ya está registrado
    const existingUser = await usersRepository.getUserByEmail(email);

    if (existingUser) {
        throw new AppError('El email ya está registrado', 409);
    }

    // Generar el hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el usuario en MongoDB
    let newUser;

    try {
        newUser = await usersRepository.createUser({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'user'
        });
    } catch (error) {
        // Controlar el error de email duplicado de MongoDB
        if (error.code === 11000) {
            throw new AppError('El email ya está registrado', 409);
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

// Iniciar sesión de un usuario
export const loginUser = async (userData) => {
    // Validar y normalizar las credenciales recibidas
    const { email, password } = validateLoginData(userData);

    // Buscar el usuario en MongoDB
    const user = await usersRepository.getUserByEmail(email);

    // Verificar que el usuario exista
    if (!user) {
        throw new AppError('Credenciales inválidas', 401);
    }

    // Comparar la contraseña con el hash almacenado
    const isValidPassword = await comparePassword(
        password,
        user.password
    );

    // Rechazar una contraseña incorrecta
    if (!isValidPassword) {
        throw new AppError('Credenciales inválidas', 401);
    }

    // Preparar únicamente los datos necesarios para el JWT
    const userPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
    };

    // Generar y devolver el token de autenticación
    return generateToken(userPayload);
};