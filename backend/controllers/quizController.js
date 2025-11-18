const { Quiz, User, QuizResult, QuizProgress,QuizQuestion} = require('../models');

// ---------------------- QUIZ PROGRESS ----------------------

exports.checkQuizTaken = async (req, res) => {
  const { answers, elapsedTime } = req.body;

  try {
    const quiz = await Quiz.findOne({ where: { quiz_id: req.params.quiz_id } });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    let quizProgress = await QuizProgress.findOne({
      where: { quiz_id: req.params.quiz_id, user_id: req.user.id },
    });

    if (!quizProgress) {
      quizProgress = await QuizProgress.create({
        quiz_id: req.params.quiz_id,
        user_id: req.user.id,
        answers,
        elapsedTime,
      });
    } else {
      quizProgress.answers = answers;
      quizProgress.elapsedTime = elapsedTime;
    }

    if (elapsedTime >= quiz.timeLimit * 60) {
      quizProgress.completed = true;

      let score = 0;
      const answersWithCorrectness = quizProgress.answers.map((answer) => {
        const question = Array.isArray(quiz.questions)
          ? quiz.questions.find((q) => q.question_id === answer.question_id)
          : JSON.parse(quiz.questions).find((q) => q.question_id === answer.question_id);

        const isCorrect = question?.correctAnswer === answer.selectedOption;
        if (isCorrect) score++;
        return { ...answer, isCorrect };
      });

      const quizResultExists = await QuizResult.findOne({
        where: { quiz_id: req.params.quiz_id, user_id: req.user.id },
      });

      if (quizResultExists) {
        return res.status(400).json({ msg: 'Quiz already taken' });
      }

      if (!quiz.takenBy.includes(req.user.id)) {
        quiz.takenBy.push(req.user.id);
        await quiz.save();
      }

      await QuizResult.create({
        quiz_id: req.params.quiz_id,
        user_id: req.user.id,
        score,
        answers: answersWithCorrectness,
      });
    }

    await quizProgress.save();
    res.json({ msg: 'Quiz progress saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getQuizDetailsWithAnswers = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ where: { quiz_id: req.params.quiz_id } });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    let questions = [];
    try {
      questions = Array.isArray(quiz.questions)
        ? quiz.questions
        : JSON.parse(quiz.questions);
    } catch (err) {
      console.error('❌ Failed to parse quiz questions:', err);
      return res.status(500).json({ msg: 'Invalid quiz format' });
    }

    const result = await QuizResult.findOne({
      where: { quiz_id: req.params.quiz_id, user_id: req.user.id }
    });

    let selectedAnswers = [];
    try {
      selectedAnswers = result?.answers
        ? Array.isArray(result.answers)
          ? result.answers
          : JSON.parse(result.answers)
        : [];
    } catch (err) {
      console.error('❌ Failed to parse selectedAnswers:', err);
      selectedAnswers = [];
    }

    const questionsWithSelected = questions.map(q => {
      const selected = selectedAnswers.find(a => a.question_id === q.question_id);
      return {
        ...q,
        selectedOption: selected?.selectedOption || null
      };
    });

    res.json({
      quiz_id: quiz.quiz_id,
      title: quiz.title,
      questions: questionsWithSelected
    });
  } catch (err) {
    console.error('❌ Failed to fetch quiz details with answers:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------- QUIZ PROGRESS ----------------------

exports.getQuizProgress = async (req, res) => {
  try {
    const quizProgress = await QuizProgress.findOne({
      where: { quiz_id: req.params.quiz_id, user_id: req.user.id },
    });

    if (!quizProgress) {
      return res.status(404).json({ msg: 'Progress not found' });
    }

    res.json(quizProgress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------- RESULTS ----------------------

exports.getAllUserResult = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ where: { quiz_id: req.params.quiz_id } });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    if (quiz.createdBy !== req.user.id && !quiz.takenBy.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }

    const results = await QuizResult.findAll({
      where: { quiz_id: req.params.quiz_id },
      include: [{ model: User, attributes: ['username'] }],
    });

    const formatted = results.map((r) => ({
      username: r.User?.username || 'Unknown',
      score: r.score,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------- QUIZ STATUS ----------------------

exports.getQuizStatsById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ where: { quiz_id: req.params.quiz_id } });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    let status = 'Not taken';
    const quizProgress = await QuizProgress.findOne({
      where: { quiz_id: req.params.quiz_id, user_id: req.user.id },
    });

    if (quizProgress?.completed) {
      status = 'Pending for Evaluation';
    } else if (quizProgress) {
      status = 'In progress';
    }

    if (quiz.takenBy.includes(req.user.id)) {
      status = 'Taken';
    }

    res.json({ status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ---------------------- QUIZ MANAGEMENT ----------------------

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      where: { quiz_id: req.params.quiz_id, createdBy: req.user.id },
    });

    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    await QuizResult.destroy({ where: { quiz_id: req.params.quiz_id } });
    await QuizProgress.destroy({ where: { quiz_id: req.params.quiz_id } });
    await quiz.destroy();

    res.json({ msg: 'Quiz deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSingleQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      where: { quiz_id: req.params.quiz_id },
      include: [{ model: User, attributes: ['username'] }],
    });

    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    // Safely parse questions
    let questions = [];
    try {
      questions = Array.isArray(quiz.questions)
        ? quiz.questions
        : JSON.parse(quiz.questions);
    } catch (err) {
      console.error('❌ Failed to parse quiz questions:', err);
      questions = [];
    }

    const numberOfParticipants = Array.isArray(quiz.takenBy)
      ? quiz.takenBy.length
      : 0;

    res.json({
      quiz_id: quiz.quiz_id,
      title: quiz.title,
      description: quiz.description,
      createdBy: quiz.User?.username || 'Unknown',
      questions,
      timeLimit: quiz.timeLimit,
      lastUpdated: quiz.lastUpdated,
      numberOfParticipants,
    });
  } catch (err) {
    console.error('❌ Failed to fetch single quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


const { v4: uuidv4 } = require('uuid');

exports.generateQuiz = async (req, res) => {
  const { subject, count = 60 } = req.body;

  try {
    // Fetch all questions for the subject
    const questions = await QuizQuestion.findAll({ where: { subject } });

    if (questions.length === 0) {
      return res.status(404).json({ msg: 'No questions found for this subject' });
    }

    // Shuffle and select the desired number of questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // Format questions for frontend
    const formatted = selected.map((q) => ({
      question_id: q.id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));

    // Log the selected count for debugging
    console.log(`✅ Selected ${selected.length} questions for subject: ${subject}`);

    // Create and save the quiz
    const quiz_id = uuidv4();

    await Quiz.create({
      quiz_id,
      title: `${subject} Quiz`,
      description: `Auto-generated quiz for ${subject}`,
      questions: JSON.stringify(formatted), // ✅ Save formatted subset
      timeLimit: 30,
      createdBy: req.user.id,
      takenBy: []
    });

    // Return quiz ID to frontend
    res.status(201).json({ quiz_id });
  } catch (err) {
    console.error('❌ Failed to generate quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
