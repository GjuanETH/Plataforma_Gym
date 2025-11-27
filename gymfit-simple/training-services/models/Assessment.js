const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    clientId: {
        type: String, // Guardamos el ID del cliente
        required: true
    },
    trainerId: {
        type: String, // Guardamos el ID del entrenador que hizo la valoración
        required: true
    },
    weight: {
        type: Number,
        default: 0
    },
    height: {
        type: Number,
        default: 0
    },
    bodyFat: {
        type: Number,
        default: 0
    },
    goal: {
        type: String,
        default: ''
    },
    dietType: {
        type: String,
        default: ''
    },
    observations: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', AssessmentSchema);