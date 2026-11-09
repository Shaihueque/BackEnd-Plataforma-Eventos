import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },

        lastName: {
            type: String,
            required: [true, 'El apellido es obligatorio'],
            trim: true
        },

        email: {
            type: String,
            required: [true, 'El correo electrónico es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
            select: false
        },

        role: {
            type: String,
            enum: {
                values: ['admin', 'organizer', 'user'],
                message: 'El rol del usuario no es válido'
            },
            default: 'user'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const User = mongoose.model('User', userSchema);

export default User;