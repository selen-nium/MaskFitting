import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Group.css';

const SprayButton = ({ onSprayComplete, disabled }) => {
  const [isSpraying, setIsSpraying] = useState(false);

  const handleSpray = async () => {
    setIsSpraying(true);
    try {
      const response = await fetch('http://localhost:5001/api/spray', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Spray failed');
      }
      const data = await response.json();
      if (data.message === 'Triple spray completed') {
        onSprayComplete();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSpraying(false);
    }
  };

  return (
    <button
      onClick={handleSpray}
      disabled={disabled || isSpraying}
      className={`spray-button ${disabled || isSpraying ? 'disabled' : ''}`}
    >
      {isSpraying ? 'Spraying...' : 'Spray'}
    </button>
  );
};

function MaskFitTest3() {
  const navigate = useNavigate();
  const location = useLocation();
  const { group, maskModel } = location.state || {};
  const [testStarted, setTestStarted] = useState(false);
  const [sprayCount, setSprayCount] = useState(0);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handlePauseTest = () => {
    navigate('/failure', { state: { group, maskModel, sprayCount } });
  };

  const handleCompleteTest = () => {
    navigate('/end-screen', { state: { group, maskModel, sprayCount } });
  };

  const handleSprayComplete = () => {
    setSprayCount(prevCount => prevCount + 3); // Increment by 3 for each successful spray
  };

  return (
    <div className="mask-fit-test-container">
      <h2>Mask Fit Test: Group {group}</h2>
      <p>You are using mask model: {maskModel}</p>
      {group === '3' && <p>Place holder for specific instructions for Group 3</p>}
      {!testStarted ? (
        <div className="button-container">
          <button onClick={handleStartTest} className="start-button">
            Start Test
          </button>
        </div>
      ) : (
        <div>
          <p className="spray-count">Number of sprays: {sprayCount}</p>
          <div className="button-container">
            <SprayButton onSprayComplete={handleSprayComplete} disabled={!testStarted} />
            <button onClick={handlePauseTest} className="pause-button">
              Pause Test
            </button>
          </div>
          <div className="button-container">
            <button onClick={handleCompleteTest} className="complete-button">
              Complete Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaskFitTest3;