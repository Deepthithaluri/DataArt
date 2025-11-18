const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Question } = require('./models'); // Adjust path if needed

const filePath = path.join(__dirname, 'data', 'questions.csv');
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
      const inserted = await Question.bulkCreate(validQuestions);
console.log('✅ Inserted rows:', inserted.length);

      console.log(`✅ Imported ${questions.length} questions.`);
    } catch (err) {
      console.error('❌ Upload failed:', err.message);
    }
  });
