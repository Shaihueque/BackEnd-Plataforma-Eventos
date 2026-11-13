// Middleware centralizado para manejar errores
export const errorHandler = (err, req, res, next) => {
    console.error('Error en la aplicación:', err);

    // Evitar responder nuevamente si ya se enviaron los encabezados
    if (res.headersSent) {
        return next(err);
    }

    // Determinar el código de estado HTTP
    let statusCode =
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode < 600
            ? err.statusCode
            : 500;

    let message = err.message;

    // Errores de validación de Mongoose
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(error => error.message)
            .join(', ');
    }

    // Identificadores inválidos de MongoDB
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'El identificador o valor proporcionado no es válido';
    }

    // Claves duplicadas en MongoDB
    if (err.code === 11000) {
        statusCode = 409;
        message = 'Ya existe un registro con esos datos';
    }

    return res.status(statusCode).json({
        status: 'error',
        message: statusCode === 500
            ? 'Ocurrió un error interno en el servidor'
            : message || 'Ocurrió un error al procesar la solicitud'
    });
};