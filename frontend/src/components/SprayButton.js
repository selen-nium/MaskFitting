import { useState } from 'react';

const SprayButton = ({ onSprayComplete, disabled }) => {
    const [isSpraying, setIsSpraying] = useState(false);
    const [error, setError] = useState(null);
  
    const handleSpray = async () => {
      setIsSpraying(true);
      setError(null);
      try {
        console.log('Sending spray request...');
        const response = await fetch('http://localhost:5001/api/spray', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Received response:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Spray failed');
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        onSprayComplete(data.totalSprays);
      } catch (error) {
        console.error('Spray error:', error);
        setError(error.message);
      } finally {
        setIsSpraying(false);
      }
    };
  
    const handleStop = async () => {
      try {
        console.log('Sending stop request...');
        const response = await fetch('http://localhost:5001/api/stop-spray', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to stop spray');
        }
        
        console.log('Stop request successful');
      } catch (error) {
        console.error('Stop error:', error);
        setError(error.message);
      }
    };
  
    return (
      <div className="spray-controls">
        <button
          onClick={handleSpray}
          disabled={disabled || isSpraying}
          className={`button spray-button ${disabled || isSpraying ? 'disabled' : ''}`}
        >
          {isSpraying ? 'Spraying...' : 'Spray'}
        </button>
        {isSpraying && (
          <button
            onClick={handleStop}
            className="button stop-button"
          >
            Stop
          </button>
        )}
        {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </div>
    );
};

export default SprayButton;