const QuizResult = require('../models/QuizResult');
const Quiz = require('../models');
const User = require('../models/User');

// GET /api/results/:quiz_id — current user's result
exports.getUserResult = async (req, res) => {
  try {
    const result = await QuizResult.findOne({
      where: { quiz_id: req.params.quiz_id, user_id: req.user.id },
      attributes: ['score', 'answers'],
    });

    if (!result) return res.status(404).json({ msg: 'Result not found' });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/results/all/:quiz_id — all results (creator or taker only)
exports.getAllResultsForQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ where: { quiz_id: req.params.quiz_id } });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    // Only creator or participants can view
    const isCreator = quiz.createdBy === req.user.id;
    const isParticipant = Array.isArray(quiz.takenBy) && quiz.takenBy.includes(req.user.id);
    if (!isCreator && !isParticipant) {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }

    const results = await QuizResult.findAll({
      where: { quiz_id: req.params.quiz_id },
      include: [{ model: User, attributes: ['username'] }],
      order: [['score', 'DESC']],
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

// Utility for deletions (used by quiz delete flow)
exports.deleteResultsByQuiz = async (quiz_id) => {
  try {
    await QuizResult.destroy({ where: { quiz_id } });
  } catch (err) {
    console.error('Failed to delete quiz results:', err);
  }
};
