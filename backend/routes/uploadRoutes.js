const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { uploadQuestions } = require('../controllers/uploadController');
const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/ping', (req, res) => {
  res.send('Upload route is alive');
});

router.post('/upload', authenticateToken, isAdmin, upload.single('file'), uploadQuestions);

module.exports = router;
