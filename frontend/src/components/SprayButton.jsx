import React, { useState } from 'react';
import { createAuthenticatedClient } from '../utils/authUtil';

function SprayButton({ onSprayComplete }) {
  const [spraying, setSpraying] = useState(false);
  const [error, setError] = useState('');
  const [sprayCount, setSprayCount] = useState(0); // Since we're not getting it from Arduino now

  const handleSpray = async () => {
    if (spraying) return;
    
    try {
      setError('');
      setSpraying(true);
      
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send spray request to activate the Arduino motor
      const response = await api.post('/api/spray');
      
      console.log('Spray response:', response.data);
      
      // Since we're not getting totalSprays from Arduino anymore,
      // we'll just increment our local counter
      const newCount = sprayCount + 1;
      setSprayCount(newCount);
      
      // Call the callback with the incremented count
      if (onSprayComplete) {
        onSprayComplete(newCount);
      }
      
      // Show spraying state for a moment to give feedback to the user
      setTimeout(() => {
        setSpraying(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error during spray:', error);
      setError(`Failed to activate spray: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      setSpraying(false);
    }
  };

  const handleStopSpray = async () => {
    try {
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send stop spray request to the Arduino
      await api.post('/api/stop-spray');
      setSpraying(false);
    } catch (error) {
      console.error('Error stopping spray:', error);
      setError(`Failed to stop spray: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="spray-button-container">
      {error && <p className="error">{error}</p>}
      {!spraying ? (
        <button
          onClick={handleSpray}
          className="button spray-button"
          disabled={spraying}
        >
          Spray
        </button>
      ) : (
        <button
          onClick={handleStopSpray}
          className="button stop-button"
        >
          Stop Spray
        </button>
      )}
      <p>Spray count: {sprayCount}</p>
    </div>
  );
}

export default SprayButton;