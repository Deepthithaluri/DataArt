const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Sequelize = require('sequelize');
const path = require('path');

const { Quiz} = require('../models'); // ✅ This gives you the actual Sequelize models
const { QuizResult } = require('../models');
const QuizProgress = require('../models/QuizProgress');
const { Question, SubjectQuizResult } = require('../models'); // ✅ Include Question model
const authMiddleware = require('../middleware/auth'); // ✅ Protect sensitive routes

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes', details: err.message });
  }
});

// Get quiz by ID
router.get('/:quiz_id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ where: { quiz_id: req.params.quiz_id } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const questions = JSON.parse(quiz.questions);
    res.json({ quiz_id: quiz.quiz_id, questions });
  } catch (err) {
    console.error('❌ Failed to fetch quiz:', err);
    res.status(500).json({ error: 'Failed to fetch quiz', payload: err.message });
  }
});

// Create a new quiz (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { title, questions, timeLimit, category } = req.body;
  const createdBy = req.user.id;

  if (!title || !Array.isArray(questions) || questions.length === 0 || !timeLimit || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newQuiz = await Quiz.create({
      title,
      questions: JSON.stringify(questions),
      timeLimit,
      category,
      created_by: createdBy,
      taken_by: [],
    });

    res.status(201).json({ message: 'Quiz created successfully', quiz_id: newQuiz.quiz_id });
  } catch (err) {
    console.error('Quiz creation error:', err);
    res.status(500).json({ error: 'Failed to create quiz', details: err.message });
  }
});

// Submit quiz result (protected)
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { quiz_id, answers, score } = req.body;
    const user_id = req.user.id;

    if (!quiz_id || !Array.isArray(answers) || typeof score !== 'number') {
      return res.status(400).json({ message: 'Invalid submission data' });
    }

    const existingResult = await QuizResult.findOne({ where: { user_id, quiz_id } });
    if (existingResult) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    const result = await QuizResult.create({
      user_id,
      quiz_id,
      score,
      answers: JSON.stringify(answers),
    });

    const quiz = await Quiz.findByPk(quiz_id);
    let takenBy = quiz.taken_by || [];
    if (!Array.isArray(takenBy)) takenBy = [];

    if (!takenBy.includes(user_id)) {
      takenBy.push(user_id);
      await quiz.update({ taken_by: takenBy });
    }

    res.status(201).json({ message: 'Quiz submitted successfully', result });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Submission failed', details: err.message });
  }
});

// Generate subject-based quiz
router.get('/generate-quiz/:subject', async (req, res) => {
  const { subject } = req.params;
  try {
    const questions = await Question.findAll({
      where: { subject },
      order: Sequelize.literal('RAND()'),
      limit: 30
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// Submit subject-based quiz result
router.post('/submit-subject-quiz', async (req, res) => {
  const { userId, subject, responses } = req.body;

  try {
    let score = 0;
    for (const r of responses) {
      if (r.selected === r.correct) score++;
    }

    await SubjectQuizResult.create({
      userId,
      subject,
      responses: JSON.stringify(responses),
      score
    });

    res.json({ message: 'Responses saved', score });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save responses' });
  }
});

// Upload CSV to populate questions table
const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const questions = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      try {
        questions.push({
          subject: row.subject,
          topic: row.topic,
          questionText: row.questionText,
          options: JSON.parse(row.options),
          correctAnswer: row.correctAnswer,
        });
      } catch (err) {
        console.error('❌ Error parsing row:', row, err.message);
      }
    })
    .on('end', async () => {
      try {
        await Question.bulkCreate(questions, { validate: true });
        fs.unlinkSync(filePath);
        res.json({ message: `✅ Uploaded ${questions.length} questions.` });
      } catch (err) {
        res.status(500).json({ error: '❌ Upload failed: ' + err.message });
      }
    });
});

const quizController = require('../controllers/quizController');

router.get('/details/:quiz_id', authMiddleware, quizController.getQuizDetailsWithAnswers);

const { v4: uuidv4 } = require('uuid');


router.post('/generate', authMiddleware, async (req, res) => {
  const { subject } = req.body;
  const createdBy = req.user.id;

  try {
    const questions = await Question.findAll({ where: { subject } });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ msg: 'No questions found for this subject' });
    }

    const rawQuestions = questions.map(q => ({
      question_id: q.id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    const quiz = await Quiz.create({
      quiz_id: uuidv4(), // ✅ required unique string
      title: `${subject} Quiz`,
      description: `Auto-generated quiz for ${subject}`,
      questions: JSON.stringify(rawQuestions), // ✅ valid JSON
      timeLimit: 10,
      created_by: createdBy,
      takenBy: []
    });

    console.log("✅ Quiz created:", quiz.quiz_id);
    res.status(201).json({ quiz_id: quiz.quiz_id });
  } catch (err) {
    console.error("❌ Quiz creation failed:", err);
    res.status(500).json({ msg: 'Quiz creation failed', error: err.message });
  }
});

module.exports = router;
