// Middleware para manejar rutas inexistentes
export const notFound = (req, res) => {
    return res.status(404).json({
        status: 'error',
        message: 'La ruta solicitada no existe'
    });
};