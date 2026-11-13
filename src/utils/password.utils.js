import bcrypt from 'bcrypt';

// Cantidad de rondas utilizadas para generar el hash
const SALT_ROUNDS = 10;

// Generar el hash de una contraseña
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

// Comparar una contraseña con un hash almacenado
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};