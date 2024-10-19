import React, { useState, useEffect } from 'react';
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
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setError('User not logged in. Please log in first.');
      // Optionally, redirect to login page
      // navigate('/login');
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
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Health Declaration</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index} className="mb-4">
            <p className="mb-2">{question}</p>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`question${index + 1}`}
                  value="yes"
                  checked={answers[`question${index + 1}`] === 'yes'}
                  onChange={handleChange}
                  required
                  className="form-radio"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`question${index + 1}`}
                  value="no"
                  checked={answers[`question${index + 1}`] === 'no'}
                  onChange={handleChange}
                  required
                  className="form-radio"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
        ))}
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        >
          Submit
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}

export default Declaration;