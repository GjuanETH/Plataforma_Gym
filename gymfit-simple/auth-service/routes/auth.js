const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generar JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    user = await User.create({ firstName, lastName, email, password, role });

    res.status(201).json({
      token: generateToken(user._id, user.role),
      userId: user._id,
      role: user.role,
      message: 'Usuario registrado exitosamente'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// @route   POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      token: generateToken(user._id, user.role),
      userId: user._id,
      role: user.role,
      message: 'Login exitoso'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;