import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/submit-declaration', answers);
      if (response.data.success) {
        navigate('/test-selection'); 
      } else {
        setError(response.data.message || 'You are not eligible to proceed.');
      }
    } catch (error) {
      console.error('Declaration submission error:', error.response?.data || error);
      setError('An error occurred. Please try again.');
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

  return (
    <div>
      <h2>Health Declaration</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index}>
            <p>{question}</p>
            <label>
              <input
                type="radio"
                name={`question${index + 1}`}
                value="yes"
                checked={answers[`question${index + 1}`] === 'yes'}
                onChange={handleChange}
                required
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name={`question${index + 1}`}
                value="no"
                checked={answers[`question${index + 1}`] === 'no'}
                onChange={handleChange}
              /> No
            </label>
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Declaration;