const eventSchema = {
    title: String,
    description: String,
    date: Date,
    location: String,
    capacity: Number,
    category: String,
    organizer: String,
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled'],
        default: 'draft'
    }
};

export default eventSchema;