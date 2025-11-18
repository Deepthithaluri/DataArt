const express = require('express');
const router = express.Router();
const QuestionBank = require('../models/QuestionBank');

router.get('/', async (req, res) => {
  try {
    const questions = await QuestionBank.findAll();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

module.exports = router;
