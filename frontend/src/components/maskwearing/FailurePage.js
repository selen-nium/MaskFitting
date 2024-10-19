import React from 'react';
import { useLocation } from 'react-router-dom';

function FailurePage() {
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
    color: '#f44336', // Red color for failure indication
    fontSize: '32px',
    marginBottom: '30px',
  };

  const paragraphStyle = {
    fontSize: '18px',
    marginBottom: '20px',
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
      <h2 style={headingStyle}>Test Failed</h2>
      <p style={paragraphStyle}>Looks like the mask does not fit you well...</p>
      <p style={maskModelStyle}>Currently trying: mask model {maskModel}</p>
    </div>
  );
}

export default FailurePage;