import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


function threeMnormal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { group, maskModel } = location.state || {};

  const handleComplete = () => {
    navigate(`/mask-fit-test-1/group-${group}`, { state: { group, maskModel } });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mask Wearing: {maskModel}</h2>
      
      {/* Placeholder for video */}
      <div className="w-[640px] h-[360px] bg-gray-300 flex justify-center items-center mb-4">
        Video Placeholder for {maskModel}
      </div>

      <button onClick={handleComplete}>Completed</button>
    </div>
  );
}

export default threeMnormal;