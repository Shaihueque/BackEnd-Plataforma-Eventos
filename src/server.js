import dotenv from 'dotenv';
import app from './app.js';

// Configuración de variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});