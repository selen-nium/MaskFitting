import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

function TestSelection() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  };
  
  const headingStyle = {
    color: '#1a237e',
    fontSize: '32px',
    marginBottom: '30px',
  };
  
  const buttonStyle = {
    width: '100%',
    padding: '15px',
    backgroundColor: '#e6f2ff',
    color: '#1a237e',
    border: 'none',
    borderRadius: '5px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginBottom: '20px',
  };
  
  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#b3d9ff',
  };

  const descriptionStyle = {
    fontSize: '16px',
    color: '#555',
    marginBottom: '25px',
    textAlign: 'left',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Select Your Test</h2>
      
      <div style={descriptionStyle}>
        <p><strong>Threshold Test:</strong> Determines your sensitivity group. You must complete this test before taking the Mask Fit Test.</p>
        <p><strong>Mask Fit Test:</strong> Tests if a mask properly fits and protects you. Requires completing the Threshold Test first.</p>
      </div>
      
      <button
        onClick={() => navigate('/threshold-test')}
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
      >
        Threshold Test
      </button>
      
      <button
        onClick={() => navigate('/mask-fit-test')}
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.target.style, buttonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
      >
        Mask Fit Test
      </button>
    </div>
  );
}

export default TestSelection;