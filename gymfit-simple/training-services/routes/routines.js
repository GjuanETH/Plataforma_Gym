const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');

// 1. Crear una nueva rutina
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

// 2. Obtener rutinas de un cliente específico
router.get('/client/:clientId', async (req, res) => {
  try {
    const routines = await Routine.find({ clientId: req.params.clientId });
    res.json(routines);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener rutinas', error: err.message });
  }
});

// 3. ELIMINAR rutina por ID (ESTO ES LO QUE FALTABA)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca y elimina la rutina en la base de datos
    const deletedRoutine = await Routine.findByIdAndDelete(id);

    if (!deletedRoutine) {
      return res.status(404).json({ message: 'Rutina no encontrada o ya eliminada' });
    }

    res.status(200).json({ message: 'Rutina eliminada correctamente' });
  } catch (err) {
    console.error("Error al borrar:", err);
    res.status(500).json({ message: 'Error interno al eliminar rutina', error: err.message });
  }
});

module.exports = router;