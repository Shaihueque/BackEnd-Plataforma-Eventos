const userSchema = {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['admin', 'organizer', 'user'],
        default: 'user'
    }
};

export default userSchema;