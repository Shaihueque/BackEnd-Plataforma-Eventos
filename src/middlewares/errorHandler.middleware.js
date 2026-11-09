// Middleware centralizado para manejar errores
export const errorHandler = (err, req, res, next) => {
    console.error('Error en la aplicación:', err);

    const statusCode =
        err.statusCode >= 400 && err.statusCode < 600
            ? err.statusCode
            : 500;

    return res.status(statusCode).json({
        status: 'error',
        message: statusCode === 500
            ? 'Ocurrió un error interno en el servidor'
            : err.message
    });
};