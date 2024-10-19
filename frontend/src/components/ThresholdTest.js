import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
    setSprayCount(prevCount => prevCount + 3); // Increment by 3 for each successful spray
  };

  const completeTest = () => {
    navigate('/end-of-threshold-test', { state: { sprayCount } });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Threshold Test</h2>
      
      {/* Placeholder for video */}
      <div className="w-[640px] h-[360px] bg-gray-300 flex justify-center items-center mb-4">
        Video Placeholder
      </div>

      {testStarted && (
        <p className="text-lg font-semibold mb-4">Number of sprays: {sprayCount}</p>
      )}

      {!testStarted ? (
        <button 
          onClick={startTest}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Test
        </button>
      ) : (
        <div className="flex space-x-4">
          <SprayButton onSprayComplete={handleSprayComplete} />
          <button 
            onClick={completeTest}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Complete Test
          </button>
        </div>
      )}
    </div>
  );
}

export default ThresholdTest;