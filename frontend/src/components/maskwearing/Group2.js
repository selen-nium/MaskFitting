import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SprayButton from '../SprayButton';
import './Group.css';

function MaskFitTest2() {
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

  const handleSprayComplete = (totalSprays) => {
    setSprayCount(totalSprays);
  };

  return (
    <div className="mask-fit-test-container">
      <h2>Mask Fit Test: Group {group}</h2>
      <p>You are using mask model: {maskModel}</p>
      {group === '2' && <p>Place holder for specific instructions for Group 2</p>}
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

export default MaskFitTest2;