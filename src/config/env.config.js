import 'dotenv/config';

// Configuración centralizada de las variables de entorno
export const env = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h'
};

// Validar las variables de entorno obligatorias
const requiredVariables = ['MONGO_URL', 'JWT_SECRET'];

for (const variable of requiredVariables) {
    if (!env[variable]?.trim()) {
        throw new Error(`La variable ${variable} no está definida`);
    }
}