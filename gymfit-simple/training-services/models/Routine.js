const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  trainerId: { type: String, required: true }, // ID del entrenador que la creó
  clientId: { type: String, required: true },  // ID del cliente al que se asigna
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true }, // String por si es "12-15" o "Al fallo"
    weight: { type: String } // Opcional
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Routine', RoutineSchema);