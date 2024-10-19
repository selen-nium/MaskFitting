import React from 'react';
import { useLocation } from 'react-router-dom';

function EndScreen() {
  const location = useLocation();
  const { maskModel } = location.state || {};

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Test Completed</h2>
      <p className="text-lg mb-4">Thanks for taking the test!</p>
      <p className="text-md">Your mask model: {maskModel}</p>
    </div>
  );
}

export default EndScreen;