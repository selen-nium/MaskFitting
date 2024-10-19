import React from 'react';
import { useNavigate } from 'react-router-dom';

function TestSelection() {
  const navigate = useNavigate();

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

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Select Your Test</h2>
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