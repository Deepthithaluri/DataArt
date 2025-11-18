import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Resultstats.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultStats = ({ data, myScore }) => {
  let { min, max, mean, median, lowerQuartile, upperQuartile } = data;

  // Format numeric values to 2 decimal places if valid
  const formatScore = (value) =>
    typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : 'N/A';

  min = formatScore(min);
  max = formatScore(max);
  mean = formatScore(mean);
  median = formatScore(median);
  lowerQuartile = formatScore(lowerQuartile);
  upperQuartile = formatScore(upperQuartile);
  myScore = formatScore(myScore);

  const chartData = {
    labels: ['Minimum', 'Maximum', 'Mean', 'Median', 'Q1', 'Q3', 'Your Score'],
    datasets: [
      {
        label: 'Statistics',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
        data: [min, max, mean, median, lowerQuartile, upperQuartile, myScore],
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="result-stats">
      <h2>Result Statistics</h2>
      <div className="stats-container">
        <Bar data={chartData} options={chartOptions} aria-label="Bar chart showing quiz statistics" />
        <div className="stats-details">
          <StatCard label="Minimum Score" value={min} />
          <StatCard label="Maximum Score" value={max} />
          <StatCard label="Mean Score" value={mean} />
          <StatCard label="Median Score" value={median} />
          <StatCard label="Lower Quartile (Q1)" value={lowerQuartile} />
          <StatCard label="Upper Quartile (Q3)" value={upperQuartile} />
          <StatCard label="Your Score" value={myScore} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="stat-card" aria-label={`${label}: ${value}`}>
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

export default ResultStats;
