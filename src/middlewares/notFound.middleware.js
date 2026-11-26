import { AppError } from '../utils/AppError.js';

// Middleware para manejar rutas inexistentes
export const notFound = (req, res, next) => {
    return next(new AppError('La ruta solicitada no existe', 404));
};