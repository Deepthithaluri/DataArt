const express = require('express');
const router = express.Router();
const QuestionBank = require('../models/QuestionBank');

router.get('/', async (req, res) => {
  try {
    const questions = await QuestionBank.findAll();
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
