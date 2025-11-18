import React, { useState } from 'react';
//import './UploadQuestions.css';

const UploadQues = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/quiz/upload-csv`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setMessage(data.message || '✅ Upload successful!');
      setFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Questions (CSV)</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        aria-label="Select CSV file"
      />
      <button onClick={handleUpload} className="upload-button">
        Upload
      </button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default UploadQues;
