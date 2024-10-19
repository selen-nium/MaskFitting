import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Declaration.css'; // Import the CSS file

function Declaration() {
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: '',
    question6: '',
  });
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setError('User not logged in. Please log in first.');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/submit-declaration', {
        username,
        ...answers
      });
      if (response.data.success) {
        navigate('/test-selection');
      } else {
        setError(response.data.message || 'You are not eligible to proceed.');
      }
    } catch (error) {
      console.error('Declaration submission error:', error.response?.data || error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const questions = [
    "Do you have fever, cough or flu?",
    "Did you have any meal today?",
    "Did you smoke today?",
    "Are you pregnant/asthmatic?",
    "Do you have spinal injuries?",
    "Have you shaven?"
  ];

  if (!username) {
    return <div className="login-message">Please log in to access this page.</div>;
  }

  return (
    <div className="declaration-container">
      <h2>Health Declaration</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index} className="question-container">
            <p className="question-text">{question}</p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name={`question${index + 1}`}
                  value="yes"
                  checked={answers[`question${index + 1}`] === 'yes'}
                  onChange={handleChange}
                  required
                />
                <span className="custom-radio"></span>
                <span>Yes</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`question${index + 1}`}
                  value="no"
                  checked={answers[`question${index + 1}`] === 'no'}
                  onChange={handleChange}
                  required
                />
                <span className="custom-radio"></span>
                <span>No</span>
              </label>
            </div>
          </div>
        ))}
        <button type="submit">
          Submit
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Declaration;