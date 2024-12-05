// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
  const { fullName, userName, password, role } = req.body;

  try {
    const userExists = await User.findOne({ userName });
    if (userExists) return res.status(400).json({ message: 'Username already exists' });

    const newUser = new User({ fullName, userName, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({ userName });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await user.isValidPassword(password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role,fullName:user.fullName }, "myjwtdecret", {
      expiresIn: "1d",
    });

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
