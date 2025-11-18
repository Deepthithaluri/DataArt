const express = require('express');
const router = express.Router();
const Formula = require('../models/Formula');

router.get('/', async (req, res) => {
  try {
    const formulas = await Formula.findAll();
    res.json(formulas);
  } catch (err) {
    console.error('Error fetching formulas:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
