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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">End of Threshold Test</h2>
      <p className="text-lg mb-2">Number of sprays: {sprayCount}</p>
      <p className="text-lg font-semibold">You belong to Group {group}</p>
    </div>
  );
}

export default EndOfThresholdTest;