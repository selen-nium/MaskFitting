import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ThresholdTest.css';
import AutoVideoRecorder from '../AudioVideoRecorder.js';
import SprayButton from './SprayButton.js';

function ThresholdTest() {
  const [testStarted, setTestStarted] = useState(false);
  const [sprayCount, setSprayCount] = useState(0);
  const navigate = useNavigate();

  const startTest = () => {
    setTestStarted(true);
  };

  const handleSprayComplete = (totalSprays) => {
    setSprayCount(totalSprays);
  };

  const completeTest = () => {
    navigate('/end-of-threshold-test', { state: { sprayCount } });
  };

  return (
    <div className="threshold-test-container">
      <h2>Threshold Test</h2>
      <p>The recording will automatically start when this page loads and stop when you leave.</p>
      <AutoVideoRecorder />
      <div className="video-placeholder">
        Video Placeholder
      </div>
      {testStarted && (
        <p className="spray-count">Number of sprays: {sprayCount}</p>
      )}
      {!testStarted ? (
        <div className="button-container">
          <button onClick={startTest} className="button start-button">
            Start Test
          </button>
        </div>
      ) : (
        <div className="button-container">
          <SprayButton onSprayComplete={handleSprayComplete} />
          <button onClick={completeTest} className="button complete-button">
            Complete Test
          </button>
        </div>
      )}
    </div>
  );
}

export default ThresholdTest;