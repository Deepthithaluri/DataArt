const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const resultController = require('../controllers/resultController');

// Current user's result for a quiz
router.get('/:quiz_id', auth, resultController.getUserResult);

// All results for a quiz (creator or participant)
router.get('/all/:quiz_id', auth, resultController.getAllResultsForQuiz);


router.get('/results/user/:userId', async (req, res) => {
  try {
    const results = await QuizResult.findAll({
      where: { user_id: req.params.userId },
      include: [
        {
          model: Quiz,
          attributes: ['title', 'category', 'timeLimit']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(results);
  } catch (err) {
    console.error('❌ Failed to fetch user results:', err.message);
    res.status(500).json({ error: 'Could not retrieve results' });
  }
});

module.exports = router;
