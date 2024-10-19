import React from 'react';
import { useLocation } from 'react-router-dom';

function EndScreen() {
  const location = useLocation();
  const { maskModel } = location.state || {};

  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#1a237e',
    fontSize: '32px',
    marginBottom: '30px',
  };

  const paragraphStyle = {
    fontSize: '18px',
    marginBottom: '15px',
    color: '#333',
  };

  const maskModelStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: '20px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Test Completed</h2>
      <p style={paragraphStyle}>Thanks for taking the Mask Fit test!</p>
      <p style={maskModelStyle}>Your mask model: {maskModel}</p>
    </div>
  );
}

export default EndScreen;