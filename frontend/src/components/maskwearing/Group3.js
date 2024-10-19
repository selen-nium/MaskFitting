import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function MaskFitTest3() {
  const navigate = useNavigate();
  const location = useLocation();
  const { group, maskModel } = location.state || {};
  const [testStarted, setTestStarted] = useState(false);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handlePauseTest = () => {
    navigate('/failure', { state: { group, maskModel } });
  };

  const handleCompleteTest = () => {
    navigate('/end-screen', { state: { group, maskModel } });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mask Fit Test: Group {group}</h2>
      <p className="mb-4">You are using mask model: {maskModel}</p>
      
      {/* Add specific content for each group */}
      {group === '3' && <p className="mb-4">Specific instructions for Group 3</p>}
      
      {!testStarted ? (
        <button onClick={handleStartTest} className="mr-4">Start Test</button>
      ) : (
        <div>
          <button onClick={handlePauseTest} className="mr-4">Pause Test</button>
          <button onClick={handleCompleteTest}>Complete Test</button>
        </div>
      )}
    </div>
  );
}

export default MaskFitTest3;