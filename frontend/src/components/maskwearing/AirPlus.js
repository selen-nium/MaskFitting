import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './maskwearing.css';
import AutoVideoRecorder from '../../AudioVideoRecorder.js';

function AirPlus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { group, maskModel } = location.state || {};

  const handleComplete = () => {
    navigate(`/mask-fit-test-1/group-${group}`, { state: { group, maskModel } });
  };

  return (
    <div className="mask-wearing-container">
      <h2>Wearing: {maskModel}</h2>
      <p>The recording will automatically start when this page loads and stop when you leave.</p>
      <AutoVideoRecorder />
      {/* Placeholder for video */}
      <div className="video-placeholder">
        Video Placeholder for Air+
      </div>
      <button onClick={handleComplete}>Completed</button>
    </div>
  );
}

export default AirPlus;