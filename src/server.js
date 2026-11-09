import app from './app.js';
import { env } from './config/env.config.js';
import { connectDB } from './config/database.config.js';

const startServer = async () => {
    try {
        // Primero conectamos con MongoDB
        await connectDB();

        // Después iniciamos Express
        app.listen(env.PORT, () => {
            console.log(`Servidor activo en el puerto ${env.PORT}`);
            console.log(`Entorno: ${env.NODE_ENV}`);
        });

    } catch (error) {
        console.error('No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();