import React from 'react';
import { useNavigate } from 'react-router-dom';

function TestSelection() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Select Your Test</h2>
      <button onClick={() => navigate('/threshold-test')}>Threshold Test</button>
      <button onClick={() => navigate('/mask-fit-test')}>Mask Fit Test</button>
    </div>
  );
}

export default TestSelection;