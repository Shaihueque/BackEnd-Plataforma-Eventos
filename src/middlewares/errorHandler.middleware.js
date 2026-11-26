// Middleware centralizado para manejar errores
export const errorHandler = (err, req, res, next) => {

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

    // Solicitudes con formato JSON inválido
    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'El formato JSON de la solicitud no es válido';
    }

    // Errores de validación de Mongoose
    if (err.name === 'ValidationError') {
        statusCode = 400;

        message = Object.values(err.errors)
            .map(error => {
                if (error.name === 'CastError') {
                    return 'Uno de los valores proporcionados no es válido';
                }

                return error.message;
            })
            .join(', ');
    }

    // Identificadores o valores inválidos de MongoDB
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'El identificador o valor proporcionado no es válido';
    }

    // Claves duplicadas en MongoDB
    if (err.code === 11000) {
        statusCode = 409;
        message = 'Ya existe un registro con esos datos';
    }

    // Registrar únicamente los errores internos del servidor
    if (statusCode >= 500) {
        console.error('Error interno en la aplicación:', err);
    }

    // Devolver una respuesta de error centralizada
    return res.status(statusCode).json({
        status: 'error',
        message: statusCode >= 500
            ? 'Ocurrió un error interno en el servidor'
            : message || 'Ocurrió un error al procesar la solicitud'
    });
};