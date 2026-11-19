import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

// Verificar la autenticación del usuario
export const authMiddleware = (req, res, next) => {
    // Obtener el JWT almacenado en la cookie
    const token = req.cookies?.currentUser;

    // Rechazar solicitudes sin cookie de autenticación
    if (!token) {
        return next(new AppError('No autenticado', 401));
    }

    try {
        // Verificar la firma y la expiración del JWT
        const payload = verifyToken(token);

        // Guardar únicamente los datos necesarios del usuario
        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role
        };

        // Permitir el acceso a la siguiente función
        next();
    } catch (error) {
        // Rechazar tokens inválidos o expirados
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'NotBeforeError'
        ) {
            return next(new AppError('No autenticado', 401));
        }

        // Propagar errores inesperados
        next(error);
    }
};