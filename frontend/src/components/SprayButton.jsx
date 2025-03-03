import React, { useState } from 'react';
import { createAuthenticatedClient } from '../utils/authUtil';

function SprayButton({ onSprayComplete }) {
  const [spraying, setSpraying] = useState(false);
  const [error, setError] = useState('');

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
      
      // Call the callback with the total sprays count
      if (response.data.totalSprays && onSprayComplete) {
        onSprayComplete(response.data.totalSprays);
      } else if (response.data.error) {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error during spray:', error);
      setError('Failed to activate spray');
    } finally {
      setSpraying(false);
    }
  };

  const handleStopSpray = async () => {
    try {
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send stop spray request to the Arduino
      await api.post('/api/stop-spray');
    } catch (error) {
      console.error('Error stopping spray:', error);
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
    </div>
  );
}

export default SprayButton;