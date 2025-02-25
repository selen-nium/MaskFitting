import React from 'react';
import { useLocation } from 'react-router-dom';

function EndOfThresholdTest() {
  const location = useLocation();
  const sprayCount = location.state?.sprayCount || 0;

  const getGroup = (count) => {
    if (count >= 1 && count <= 10) return 1;
    if (count >= 11 && count <= 20) return 2;
    if (count > 20) return 3;
    return 'Unknown';
  };

  const group = getGroup(sprayCount);

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

  const textStyle = {
    fontSize: '18px',
    marginBottom: '15px',
  };

  const resultStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: '30px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>End of Threshold Test</h2>
      <p style={textStyle}>Number of sprays: {sprayCount}</p>
      <p style={resultStyle}>You are in Group: {group}</p>
    </div>
  );
}

export default EndOfThresholdTest;