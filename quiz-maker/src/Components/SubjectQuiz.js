import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SubjectQuiz.css';

const SubjectQuiz = () => {
  const { subject } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateQuiz = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/quizzes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ subject, count: 60 }) // ✅ limit to 60 questions
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Quiz generation failed');

      console.log('✅ Quiz ID:', data.quiz_id);
      setQuizId(data.quiz_id);

      const quizRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/quizzes/${data.quiz_id}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      const quizData = await quizRes.json();
      console.log('📦 Raw quizData.questions:', quizData.questions);

      let parsedQuestions = [];
      try {
        parsedQuestions = Array.isArray(quizData.questions)
          ? quizData.questions
          : typeof quizData.questions === 'string'
            ? JSON.parse(quizData.questions)
            : [];

        if (!Array.isArray(parsedQuestions)) throw new Error('Parsed questions is not an array');
      } catch (err) {
        console.error('❌ Failed to parse questions JSON:', err.message);
        parsedQuestions = [];
      }

      setQuestions(parsedQuestions);
    } catch (err) {
      console.error('❌ Failed to generate quiz:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submitted || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, questions]);

  const handleAnswer = (selected) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: selected }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;

    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    setFinalScore(score);

    const payload = {
      quiz_id: quizId,
      answers: questions.map((q, i) => ({
        questionId: q.question_id,
        selected: answers[i],
        correct: q.correctAnswer
      })),
      score
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/quizzes/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      setSubmitted(true);
    } catch (err) {
      console.error('❌ Failed to submit quiz:', err.message);
    }
  };

  if (submitted) {
    return (
      <div className="result-screen">
        <h2>Quiz Completed</h2>
        <p>You scored {finalScore} out of {questions.length}</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  if (!quizId) {
  return (
    <div className="start-screen">
      <h2>{subject} Quiz</h2>
      <button className="start-button" onClick={generateQuiz} disabled={loading}>
        {loading ? 'Generating...' : 'Start Quiz'}
      </button>
    </div>
  );
}

  if (questions.length === 0) {
    return <p>Loading questions for {subject}...</p>;
  }

  const current = questions[currentIndex];
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="quiz-screen">
      <h2>{subject} Quiz</h2>
      <p className="timer">Time Left: {minutes}:{seconds}</p>
      <p>Question {currentIndex + 1} of {questions.length}</p>
      <h3>{current.questionText}</h3>
      <div className="options">
        {current.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};


export default SubjectQuiz;
