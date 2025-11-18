const express = require('express');
const router = express.Router();
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const authenticate = require('../middleware/auth');
const defineQuestion = require('../models/Question');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Question = defineQuestion(sequelize, DataTypes);

// ✅ Multer setup for temporary file storage
const upload = multer({ dest: 'uploads/' });
const { uploadQuestions } = require('../controllers/uploadController');

router.post('/upload-csv', upload.single('file'), uploadQuestions);
// ✅ Upload route with auth and validation
router.post('/upload-csv', authenticate, upload.single('file'), async (req, res) => {
  // ✅ Optional: restrict to admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }

  try {
    const filePath = path.join(__dirname, '..', req.file.path);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });

    const validSubjects = ['Math', 'Physics', 'Chemistry', 'Biology'];
    const validDifficulties = ['Easy', 'Medium', 'Hard'];

    const validQuestions = [];
    const errors = [];

    for (const row of parsed.data) {
      try {
        // ✅ Validate and sanitize each row
        const options = JSON.parse(row.options);
        const questionText = row.questionText?.trim();
        const correctAnswer = row.correctAnswer?.trim();
        const subject = row.subject?.trim();
        const difficulty = row.difficulty?.trim();

        if (
          !questionText ||
          !Array.isArray(options) ||
          options.length !== 4 ||
          !options.includes(correctAnswer) ||
          !validSubjects.includes(subject) ||
          !validDifficulties.includes(difficulty)
        ) {
          throw new Error('Invalid row format');
        }

        validQuestions.push({
          questionText,
          options,
          correctAnswer,
          subject,
          difficulty
        });
      } catch (err) {
        errors.push({ row, error: err.message });
      }
    }

    // ✅ Bulk insert valid questions
    if (validQuestions.length > 0) {
      await Question.bulkCreate(validQuestions);
    }

    fs.unlinkSync(filePath); // ✅ Clean up temp file

    res.json({
      inserted: validQuestions.length,
      errors
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
});

module.exports = router;



