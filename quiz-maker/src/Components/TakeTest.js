import React from 'react';
import './TakeTest.css';
import { useNavigate } from 'react-router-dom';
import { Typography, styled } from "@mui/material";

const TakeTest = () => {
  const navigate = useNavigate();

  const StyledTypography = styled(Typography)({
    margin: "20px",
    marginBottom: "50px",
    fontFamily: "Wittgenstein, serif",
    color: "#235",
    borderBottom: "2px solid #235",
    paddingBottom: "25px",
  });

  return (
    <div>
      <StyledTypography variant="h4">Take a Test</StyledTypography>
      <div className="take-test">
        <div className="content-wrapper">
          <div className="form-section">
            {/* Subject-Based Quiz */}
            <div className="form-group">
              <label htmlFor="subject">Select a Subject:</label>
              <select
                id="subject"
                onChange={(e) => navigate(`/take-quiz/${e.target.value}`)}
                defaultValue=""
              >
                <option value="" disabled>Select Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Math">Math</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>

          <div className="instructions-section">
            <h3>How to Take a Quiz:</h3>
            <p>Select a subject from the dropdown to begin your quiz.</p>
            <p>Each quiz is curated by admins and updated regularly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
