import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy } from 'passport-jwt';

import * as usersService from '../services/users.service.js';

import { env } from './env.config.js';
import { AUTH_COOKIE_NAME } from './cookie.config.js';

// Configurar las estrategias de autenticación de Passport
export const initializePassport = () => {

    // Estrategia de registro (register)
    passport.use(
        'register',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            async (req, email, password, done) => {
                try {
                    // Registrar al usuario mediante el servicio
                    const newUser = await usersService.registerUser(req.body);

                    // Devolver los datos públicos del usuario registrado
                    return done(null, newUser);

                } catch (error) {
                    // Propagar el error al manejador correspondiente
                    return done(error);
                }
            }
        )
    );

    // Estrategia de inicio de sesión (login)
    passport.use(
        'login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            async (req, email, password, done) => {
                try {
                    // Validar las credenciales mediante el servicio
                    const user = await usersService.loginUser(req.body);

                    // Devolver los datos del usuario autenticado
                    return done(null, user);

                } catch (error) {
                    // Propagar el error al manejador correspondiente
                    return done(error);
                }
            }
        )
    );
    // Estrategia de autenticación mediante JWT (current)
    passport.use(
        'current',
        new JWTStrategy(
            {
                // Extraer el JWT desde la cookie de autenticación
                jwtFromRequest: (req) => {
                    return req.cookies?.[AUTH_COOKIE_NAME] || null;
                },

                // Configurar la clave secreta del JWT
                secretOrKey: env.JWT_SECRET,

                // Permitir únicamente el algoritmo de firma utilizado
                algorithms: ['HS256'],

                // Verificar la expiración del token
                ignoreExpiration: false
            },
            (payload, done) => {
                // Verificar que el token contenga datos válidos
                if (
                    typeof payload.id !== 'string' ||
                    !payload.id.trim() ||
                    typeof payload.email !== 'string' ||
                    !payload.email.trim() ||
                    !['admin', 'organizer', 'user'].includes(payload.role) ||
                    !Number.isFinite(payload.exp)
                ) {
                    return done(null, false);
                }

                // Devolver únicamente los datos públicos del usuario
                return done(null, {
                    id: payload.id,
                    email: payload.email,
                    role: payload.role
                });
            }
        )
    );
};

// Exportar la instancia de Passport
export default passport;