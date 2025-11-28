const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress'); // Asumo que tienes un modelo Progress

// 1. Ruta POST para GUARDAR PROGRESO (logProgress)
router.post('/', async (req, res) => {
    try {
        // Validación rápida de datos requeridos
        const { clientId, exerciseName, weightUsed, repsDone, date } = req.body;
        if (!clientId || !exerciseName || !weightUsed) {
            console.error("⚠️ Datos de progreso incompletos");
            return res.status(400).json({ message: "Datos de progreso incompletos." });
        }

        const newLog = await Progress.create({
            clientId,
            exerciseName,
            weightUsed: Number(weightUsed),
            repsDone: Number(repsDone),
            date: date || new Date(),
            routineId: req.body.routineId, // Asegúrate de incluirlo si es necesario
            photoUrl: req.body.photoUrl || null
        });

        console.log("✅ Progreso guardado con éxito.");
        res.status(201).json(newLog);

    } catch (err) {
        console.error("❌ ERROR CRÍTICO GUARDANDO PROGRESO:", err);
        // Si hay un error de validación (ej. Mongoose), responde con 400
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message, error: err.errors });
        }
        res.status(500).json({ message: 'Error interno al guardar progreso.', error: err.message });
    }
});

// 2. Ruta GET para OBTENER HISTORIAL (getClientHistory)
router.get('/:clientId', async (req, res) => {
    try {
        // Nota: El frontend está llamando a /api/v1/training/progress/6929...
        // Aquí obtienes el historial para ese cliente
        const history = await Progress.find({ clientId: req.params.clientId })
            .sort({ date: -1 })
            .limit(100); // Limita el historial para no saturar
        
        res.json(history);
    } catch (err) {
        console.error("❌ Error obteniendo historial:", err);
        res.status(500).json({ message: 'Error al obtener historial.', error: err.message });
    }
});


module.exports = router;