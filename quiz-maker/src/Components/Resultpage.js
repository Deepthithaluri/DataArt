import React, { useEffect, useState } from 'react';
import './ResultPage.css';
import { useNavigate, useParams } from 'react-router-dom';
import ResultStats from './ResultStats';
import { Typography, styled } from '@mui/material';
import UserScoresTable from './UserScorestable';
import PageLoader from './PageLoader';
import QuizReview from './QuizReview';

const ResultPage = () => {
  document.title = 'Result Analysis | ScoreMax';

  const [isstatsLoading, setIsStatsLoading] = useState(true);
  const [isScoresLoading, setIsScoresLoading] = useState(true);
  const [isMyScoreLoading, setIsMyScoreLoading] = useState(true);

  const { quiz_id } = useParams();
  const [quizStats, setQuizStats] = useState({});
  const [userScores, setUserScores] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [myResponses, setMyResponses] = useState([]);
  const navigate = useNavigate();

  const StyledTypography = styled(Typography)({
    marginBottom: '30px',
    fontFamily: 'Wittgenstein, serif',
    color: '#235',
    borderBottom: '2px solid #235',
    paddingBottom: '25px',
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      const pathURL = window.location.pathname.split('/').join('/').substring(1);
      localStorage.setItem('attemptedRoute', JSON.stringify({ pathURL }));
      return (window.location.href = '/login');
    }

    const fetchQuizStats = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/quizzes/stats/${quiz_id}`;
        const response = await fetch(url, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (!response.ok) throw new Error('Failed to fetch quiz statistics');
        const data = await response.json();
        setQuizStats(data);
        setIsStatsLoading(false);
      } catch (error) {
        console.error('Error fetching quiz statistics:', error);
        navigate('/404');
        setIsStatsLoading(false);
      }
    };

    const fetchUserScores = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/quizzes/scores/${quiz_id}`;
        const response = await fetch(url, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (!response.ok) throw new Error('Failed to fetch user scores');
        const data = await response.json();
        const sortedUsers = data.sort((a, b) => b.score - a.score);
        setUserScores(sortedUsers);
        setIsScoresLoading(false);
      } catch (error) {
        console.error('Error fetching user scores:', error);
        navigate('/404');
        setIsScoresLoading(false);
      }
    };

    const fetchMyScore = async () => {
      try {
        const url = `${process.env.REACT_APP_BACKEND_URL}/quizzes/results/${quiz_id}`;
        const response = await fetch(url, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (!response.ok) throw new Error('Failed to fetch user score');
        const data = await response.json();
        setMyScore(data.score);
        setMyResponses(data.responses || []);
        setIsMyScoreLoading(false);
      } catch (error) {
        console.error('Error fetching my score:', error);
        setIsMyScoreLoading(false);
      }
    };

    fetchQuizStats();
    fetchUserScores();
    fetchMyScore();
  }, [quiz_id]);

  return (
    <>
      {isstatsLoading && isScoresLoading && isMyScoreLoading && <PageLoader />}
      {!isstatsLoading && !isScoresLoading && !isMyScoreLoading && (
        <div className="result-page">
          <div className="stats-section">
            <StyledTypography variant="h4">Result Page</StyledTypography>
            <button
              className="gobackbtn"
              onClick={() => window.location.href = '/dashboard'}
              aria-label="Go back to dashboard"
            >
              &#8592; Back to Dashboard
            </button>

            <ResultStats data={quizStats} myScore={myScore} />
          </div>

          <div className="user-scores-section">
            <UserScoresTable users={userScores} />
          </div>

          {myResponses.length > 0 && (
            <div className="review-section">
              <StyledTypography variant="h5">Your Answer Review</StyledTypography>
              <QuizReview responses={myResponses} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ResultPage;
