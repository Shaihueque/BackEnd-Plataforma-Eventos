import mongoose from 'mongoose';

// Ejecutar operaciones dentro de una transacción de MongoDB
export const executeTransaction = async (operation) => {

    // Iniciar una sesión de MongoDB
    const session = await mongoose.startSession();

    try {
        // Ejecutar la operación dentro de la transacción
        return await session.withTransaction(async () => {
            return await operation(session);
        });

    } finally {
        // Cerrar la sesión independientemente del resultado
        await session.endSession();
    }
};