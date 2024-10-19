import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4 disabled:opacity-50"
    >
      {isSpraying ? 'Spraying...' : 'Spray'}
    </button>
  );
};

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

  const handleSprayComplete = () => {
    setSprayCount(prevCount => prevCount + 3); // Increment by 3 for each successful spray
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mask Fit Test: Group {group}</h2>
      <p className="mb-4">You are using mask model: {maskModel}</p>
      
      {/* Add specific content for each group */}
      {group === '2' && <p className="mb-4">Specific instructions for Group 2</p>}
      
      {!testStarted ? (
        <button 
          onClick={handleStartTest} 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Start Test
        </button>
      ) : (
        <div>
          <p className="text-lg font-semibold mb-4">Number of sprays: {sprayCount}</p>
          <div className="flex space-x-4 mb-4">
            <SprayButton onSprayComplete={handleSprayComplete} disabled={!testStarted} />
            <button 
              onClick={handlePauseTest} 
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Pause Test
            </button>
          </div>
          <button 
            onClick={handleCompleteTest}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Complete Test
          </button>
        </div>
      )}
    </div>
  );
}

export default MaskFitTest2;