import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ThresholdTest() {
  const [testStarted, setTestStarted] = useState(false);
  const [sprayCount, setSprayCount] = useState(0);
  const navigate = useNavigate();

  const startTest = () => {
    setTestStarted(true);
  };

  const handleSpray = () => {
    setSprayCount(prevCount => prevCount + 1);
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
        <button onClick={startTest}>Start Test</button>
      ) : (
        <div className="flex space-x-4">
          <button onClick={handleSpray}>Spray</button>
          <button onClick={completeTest}>Complete Test</button>
        </div>
      )}
    </div>
  );
}

export default ThresholdTest;