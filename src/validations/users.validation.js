import { AppError } from '../utils/AppError.js';

// Expresión regular para validar el formato del correo electrónico
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Normalizar el correo electrónico
const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

// Verificar que un valor sea una cadena no vacía
const isNonEmptyString = (value) => {
    return typeof value === 'string' && value.trim().length > 0;
};

// Validar y normalizar los datos del registro
export const validateRegisterData = (userData) => {
    const { first_name, last_name, email, password } = userData ?? {};

    // Validar los campos obligatorios
    if (
        !isNonEmptyString(first_name) ||
        !isNonEmptyString(last_name) ||
        !isNonEmptyString(email) ||
        typeof password !== 'string' ||
        !password
    ) {
        throw new AppError('Faltan campos obligatorios', 400);
    }

    // Normalizar el correo electrónico
    const normalizedEmail = normalizeEmail(email);

    // Validar el formato del correo electrónico
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

    // Devolver los datos validados y normalizados
    return {
        firstName: first_name.trim(),
        lastName: last_name.trim(),
        email: normalizedEmail,
        password
    };
};

// Validar y normalizar las credenciales del inicio de sesión
export const validateLoginData = (userData) => {
    const { email, password } = userData ?? {};

    // Validar las credenciales recibidas
    if (
        !isNonEmptyString(email) ||
        typeof password !== 'string' ||
        !password
    ) {
        throw new AppError('Credenciales inválidas', 401);
    }

    // Devolver las credenciales validadas
    return {
        email: normalizeEmail(email),
        password
    };
};