import React from 'react';
import { Card, Typography, Grid, Box } from '@mui/material';

export default function QuizReview({ responses }) {
  const total = responses.length;
  const correct = responses.filter(r => r.isCorrect).length;

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>Quiz Review</Typography>
      <Typography variant="h6" sx={{ marginBottom: '20px' }}>
        Score: {correct} / {total}
      </Typography>

      <Grid container spacing={2}>
        {responses.map((res, index) => (
          <Grid item xs={12} key={res.question_id}>
            <Card sx={{ padding: '15px', backgroundColor: res.isCorrect ? '#e0ffe0' : '#ffe0e0' }}>
              <Typography variant="h6">Question {index + 1}</Typography>
              <Typography sx={{ marginBottom: '10px' }}>{res.questionText}</Typography>

              <Box component="ul" sx={{ listStyle: 'none', paddingLeft: 0 }}>
                {res.options.map((option, i) => {
                  const isSelected = option === res.selectedOption;
                  const isCorrect = option === res.correctAnswer;

                  return (
                    <Box
                      key={i}
                      component="li"
                      sx={{
                        padding: '8px',
                        marginBottom: '5px',
                        borderRadius: '5px',
                        backgroundColor: isSelected ? '#fff3cd' : '#f5f5f5',
                        border: isCorrect ? '2px solid green' : '1px solid #ccc',
                        fontWeight: isSelected ? 'bold' : 'normal',
                      }}
                    >
                      {option}
                      {isSelected && <span> ✅ Selected</span>}
                      {isCorrect && <span> ✔️ Correct</span>}
                    </Box>
                  );
                })}
              </Box>

              <Typography sx={{ fontWeight: 'bold', color: res.isCorrect ? 'green' : 'red' }}>
                {res.isCorrect ? 'Correct ✅' : 'Incorrect ❌'}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
