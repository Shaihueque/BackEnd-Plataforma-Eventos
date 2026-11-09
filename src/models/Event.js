import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'El título del evento es obligatorio'],
            trim: true
        },

        description: {
            type: String,
            required: [true, 'La descripción del evento es obligatoria'],
            trim: true
        },

        date: {
            type: Date,
            required: [true, 'La fecha del evento es obligatoria']
        },

        location: {
            type: String,
            required: [true, 'La ubicación del evento es obligatoria'],
            trim: true
        },

        capacity: {
            type: Number,
            required: [true, 'La capacidad del evento es obligatoria'],
            min: [1, 'La capacidad debe ser como mínimo 1'],
            validate: {
                validator: Number.isInteger,
                message: 'La capacidad debe ser un número entero'
            }
        },

        reservedTickets: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Las entradas reservadas no pueden ser negativas'],
            validate: {
                validator: Number.isInteger,
                message: 'La cantidad de entradas reservadas debe ser un número entero'
            }
        },

        category: {
            type: String,
            required: [true, 'La categoría del evento es obligatoria'],
            trim: true
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        status: {
            type: String,
            enum: {
                values: ['draft', 'published', 'cancelled'],
                message: 'El estado del evento no es válido'
            },
            default: 'draft'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;