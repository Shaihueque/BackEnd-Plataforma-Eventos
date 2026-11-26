import { env } from './env.config.js';

// Nombre de la cookie de autenticación
export const AUTH_COOKIE_NAME = 'currentUser';

// Configuración base de la cookie de autenticación
export const authCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/'
};

// Configurar la expiración de la cookie según la del JWT
export const getAuthCookieOptions = (tokenPayload) => {
    return {
        ...authCookieOptions,
        expires: new Date(tokenPayload.exp * 1000)
    };
};