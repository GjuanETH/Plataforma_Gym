const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  clientId: { type: String, required: true },     // Quién lo hizo
  routineId: { type: String, required: true },    // De qué rutina
  exerciseName: { type: String, required: true }, // Qué ejercicio
  weightUsed: { type: Number, required: true },   // Cuánto cargó
  repsDone: { type: Number, required: true },     // Cuántas hizo
  date: { type: Date, default: Date.now },         // Cuándo
  photoUrl: { type: String, default: null }
});

module.exports = mongoose.model('Progress', ProgressSchema);