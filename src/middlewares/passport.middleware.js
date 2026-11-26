import passport from '../config/passport.config.js';
import { AppError } from '../utils/AppError.js';

// Ejecutar una estrategia de autenticación de Passport
export const passportAuthenticate = (strategy) => {
    return (req, res, next) => {
        passport.authenticate(
            strategy,
            { session: false },
            (error, user) => {
                // Propagar los errores al middleware global
                if (error) {
                    return next(error);
                }

                // Controlar los errores de autenticación
                if (!user) {
                    if (strategy === 'register') {
                        return next(
                            new AppError('Faltan campos obligatorios', 400)
                        );
                    }

                    if (strategy === 'login') {
                        return next(
                            new AppError('Credenciales inválidas', 401)
                        );
                    }

                    return next(
                        new AppError('No autenticado', 401)
                    );
                }

                // Asignar el usuario autenticado a la solicitud
                req.user = user;

                // Continuar hacia el controlador
                return next();
            }
        )(req, res, next);
    };
};