import React from 'react';
import { useLocation } from 'react-router-dom';

function FailurePage() {
  const location = useLocation();
  const { maskModel } = location.state || {};

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Test Failed</h2>
      <p className="text-lg mb-4">Looks like the mask does not fit you well...</p>
      <p className="text-md">Mask model: {maskModel}</p>
    </div>
  );
}

export default FailurePage;