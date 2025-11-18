import React, { useEffect, useState } from 'react';
import './MyResults.css';
import { Typography, styled } from '@mui/material';
import { Icon } from '@iconify-icon/react';
import PageLoader from './PageLoader';
import { useNavigate } from 'react-router-dom';

const MyResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const StyledTypography = styled(Typography)({
    marginBottom: '30px',
    fontFamily: "Wittgenstein, serif",
    color: '#235',
    borderBottom: '2px solid #235',
    paddingBottom: '25px',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchResults = async () => {
      try {
        const url = process.env.REACT_APP_BACKEND_URL + "/quizzes/taken";
        console.log("Fetching from:", url);
        const response = await fetch(url, {
          headers: {
            "x-auth-token": token
          }
        });
        const data = await response.json();
        console.log("Fetched results:", data);

        // Ensure results is always an array
        const safeResults = Array.isArray(data) ? data : data.results || [];
        setResults(safeResults);
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

  return (
    <>
      {loading && <PageLoader />}
      {!loading && (
        <div className="quiz-results-container">
          <StyledTypography variant="h4">My Results</StyledTypography>
          <div className="quiz-results">
            {Array.isArray(results) && results.length > 0 ? (
              results.map((quizResult) => (
                <div key={quizResult.quiz_id} className="quiz-result-card">
                  <div className="card-content">
                    <div className="card-title">{quizResult.title}</div>
                    <div className="card-text">Total Questions: {quizResult.numQuestions}</div>
                    <div className="card-text score-text">Score: {quizResult.quizScore}/{quizResult.numQuestions}</div>
                    <button
                      className="stats-button"
                      onClick={() => window.location.href = `/result/${quizResult.quiz_id}`}
                    >
                      Stats &nbsp;<span><Icon icon="arcticons:spotistats" /></span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No results found.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyResults;
