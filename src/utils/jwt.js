import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';

// Generar un token JWT
export const generateToken = (user) => {
    // Incluir únicamente los datos necesarios del usuario
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    // Generar el token firmado
    return jwt.sign(payload, env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: env.JWT_EXPIRES_IN
    });
};

// Verificar un token JWT
export const verifyToken = (token) => {
    // Validar la firma y la expiración del token
    return jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256']
    });
};