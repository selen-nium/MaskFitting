import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ThresholdTest.css';
import AutoVideoRecorder from '../AudioVideoRecorder.js';

const SprayButton = ({ onSprayComplete }) => {
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
      disabled={isSpraying}
      className={`button spray-button ${isSpraying ? 'disabled' : ''}`}
    >
      {isSpraying ? 'Spraying...' : 'Spray'}
    </button>
  );
};

function ThresholdTest() {
  const [testStarted, setTestStarted] = useState(false);
  const [sprayCount, setSprayCount] = useState(0);
  const navigate = useNavigate();

  const startTest = () => {
    setTestStarted(true);
  };

  const handleSprayComplete = () => {
    setSprayCount(prevCount => prevCount + 3);
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