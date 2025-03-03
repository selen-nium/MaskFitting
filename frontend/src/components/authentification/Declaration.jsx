import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { createAuthenticatedClient, handleApiError } from '../../utils/authUtil';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        navigate('/login');
      }
    });
    
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('You must be logged in to submit this form.');
      navigate('/login');
      return;
    }
    
    try {
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Submit declaration
      const response = await api.post('/submit-declaration', answers);
      
      if (response.data.success) {
        navigate('/test-selection');
      } else {
        setError(response.data.message || 'You are not eligible to proceed.');
      }
    } catch (error) {
      setError(handleApiError(error, navigate));
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

  if (loading) {
    return <div className="declaration-container loading">Loading...</div>;
  }

  if (!user) {
    return <div className="login-message">Please log in to access this page.</div>;
  }

  return (
    <div className="declaration-container">
      <h2 className="text-center">Health Declaration</h2>
      
      {error && <p className="error text-center">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={index} className="question-container">
            <p className="question-text">{question}</p>
            <div className="radio-group" style={{ justifyContent: 'center' }}>
              <label className="radio-option">
                <input
                  type="radio"
                  name={`question${index + 1}`}
                  value="yes"
                  checked={answers[`question${index + 1}`] === 'yes'}
                  onChange={handleChange}
                  required
                  style={{ marginRight: '5px' }}
                />
                <span>Yes</span>
              </label>
              <label className="radio-option" style={{ marginLeft: '30px' }}>
                <input
                  type="radio"
                  name={`question${index + 1}`}
                  value="no"
                  checked={answers[`question${index + 1}`] === 'no'}
                  onChange={handleChange}
                  required
                  style={{ marginRight: '5px' }}
                />
                <span>No</span>
              </label>
            </div>
          </div>
        ))}
        
        <div className="text-center mt-3">
          <button type="submit" className="btn btn-primary btn-block">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Declaration;