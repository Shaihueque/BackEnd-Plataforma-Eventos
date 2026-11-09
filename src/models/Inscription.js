import mongoose from 'mongoose';

const inscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima de entradas es 1'],
            max: [4, 'La cantidad máxima de entradas por evento es 4'],
            validate: {
                validator: Number.isInteger,
                message: 'La cantidad de entradas debe ser un número entero'
            },
            default: 1
        },

        status: {
            type: String,
            enum: {
                values: ['pending', 'confirmed', 'cancelled'],
                message: 'El estado de la inscripción no es válido'
            },
            default: 'pending'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Un usuario solamente puede tener una inscripción por evento.
inscriptionSchema.index(
    { user: 1, event: 1 },
    { unique: true }
);

const Inscription = mongoose.model('Inscription', inscriptionSchema);

export default Inscription;