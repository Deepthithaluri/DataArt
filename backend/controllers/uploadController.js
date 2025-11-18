/*   const fs = require('fs');
const Papa = require('papaparse');
const { Question } = require('../models');

exports.uploadQuestions = async (req, res) => {
  try {
    // ✅ Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // ✅ Read CSV file
    const csvData = fs.readFileSync(req.file.path, 'utf8');

    // ✅ Parse CSV
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    const rows = parsed.data;
    const errors = [];
    const validQuestions = [];

    // ✅ Validate and format each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const options = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;

        if (!row.questionText || !options || !row.correctAnswer || !row.subject) {
          throw new Error('Missing required fields');
        }

        validQuestions.push({
          questionText: row.questionText,
          options,
          correctAnswer: row.correctAnswer,
          subject: row.subject,
          topic: row.topic || null,
          quiz_id: row.quiz_id ? parseInt(row.quiz_id) : null
        });
      } catch (err) {
        errors.push({ row, error: err.message });
      }
    }

    // ✅ Insert valid questions
    await Question.bulkCreate(validQuestions);

    res.status(201).json({
      msg: 'Upload complete',
      inserted: validQuestions.length,
      errors
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
};*/

/*
const fs = require('fs');
const Papa = require('papaparse');
const { Question } = require('../models');

exports.uploadQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const csvData = fs.readFileSync(req.file.path, 'utf8');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    const rows = parsed.data;
    const validQuestions = [];

    for (const row of rows) {
      try {
        const options = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;

        validQuestions.push({
          questionText: row.questionText,
          options,
          correctAnswer: row.correctAnswer,
          subject: row.subject,
          topic: row.topic || null,
          quiz_id: row.quiz_id ? parseInt(row.quiz_id) : null
        });
      } catch (err) {
        console.error('Row error:', err.message);
        console.log('Headers:', req.headers);
console.log('File:', req.file);

      }
    }

    await Question.bulkCreate(validQuestions);
    res.status(201).json({ msg: 'Upload successful', count: validQuestions.length });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
};  */

const fs = require('fs');
const Papa = require('papaparse');
const { Question } = require('../models');

exports.uploadQuestions = async (req, res) => {
  console.log('✅ uploadQuestions triggered');
  console.log('📄 File received:', req.file?.originalname);

  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const csvData = fs.readFileSync(req.file.path, 'utf8');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    const rows = parsed.data;
    const validQuestions = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const questionText = row.questionText || row.questionT;
        const correctAnswer = row.correctAnswer || row.correctAns;
        const subject = row.subject?.trim();
        const topic = row.topic?.trim() || null;

        let options;
        if (row.options) {
          options = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
        } else {
          options = [row.option1, row.option2, row.option3, row.option4];
        }

        if (!questionText || !correctAnswer || !subject || !Array.isArray(options) || options.length !== 4) {
          throw new Error('Missing or invalid fields');
        }

        console.log('Row:', row);
console.log('Parsed options:', options);
console.log('Validation:', {
  questionText,
  correctAnswer,
  subject,
  optionsValid: Array.isArray(options) && options.length === 4
});

        validQuestions.push({
          questionText,
          options,
          correctAnswer,
          subject,
          topic,
          quiz_id: row.quiz_id ? parseInt(row.quiz_id) : null
        });

      } catch (err) {
        errors.push({ rowIndex: i + 1, error: err.message, row });
      }
    }

    console.log('✅ Parsed rows:', rows.length);
    console.log('✅ Valid questions:', validQuestions.length);
    if (errors.length > 0) {
      console.warn('⚠️ Skipped rows:', errors.map(e => e.rowIndex).join(', '));
    }

    const inserted = await Question.bulkCreate(validQuestions);
    console.log('✅ Inserted rows:', inserted.length);

    res.status(201).json({
      msg: 'Upload complete',
      inserted: inserted.length,
      skipped: errors.length,
      errors
    });

  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
};
