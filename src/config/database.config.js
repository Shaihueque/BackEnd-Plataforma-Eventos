import mongoose from 'mongoose';
import { env } from './env.config.js';

// Función para conectar con MongoDB
export const connectDB = async () => {
    try {
        // Verificar que exista la URI de conexión
        if (!env.MONGO_URL) {
            throw new Error('La variable MONGO_URL no está definida');
        }

        // Establecer conexión con MongoDB
        await mongoose.connect(env.MONGO_URL);

        console.log('MongoDB conectado correctamente');
        console.log(`Base de datos: ${mongoose.connection.name}`);

        // Escuchar errores de conexión posteriores
        mongoose.connection.on('error', (error) => {
            console.error('Error en la conexión con MongoDB:', error);
        });

        // Detectar desconexiones
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB se ha desconectado');
        });

    } catch (error) {
        console.error('Error al conectar con MongoDB:', error.message);
        throw error;
    }
};