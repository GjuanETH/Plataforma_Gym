const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');

// Crear una nueva rutina
router.post('/', async (req, res) => {
  try {
    const { name, description, trainerId, clientId, exercises } = req.body;
    
    const newRoutine = await Routine.create({
      name,
      description,
      trainerId,
      clientId,
      exercises
    });

    res.status(201).json(newRoutine);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear rutina', error: err.message });
  }
});

// Obtener rutinas de un cliente específico
router.get('/client/:clientId', async (req, res) => {
  try {
    const routines = await Routine.find({ clientId: req.params.clientId });
    res.json(routines);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener rutinas' });
  }
});

module.exports = router;