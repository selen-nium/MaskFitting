import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.js';
import { createAuthenticatedClient } from '../../utils/authUtil.js';
import AutoVideoRecorder from '../AudioVideoRecorder.jsx';

function ThresholdTest() {
  const [testStarted, setTestStarted] = useState(false);
  const [sprayCount, setSprayCount] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [spraying, setSpraying] = useState(false);
  const [devMode, setDevMode] = useState(process.env.NODE_ENV === 'development');
  
  const navigate = useNavigate();

  // Check authentication when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  // Handle unlocking the device
  const handleUnlock = async () => {
    // In development mode, just simulate unlock
    if (devMode) {
      setIsUnlocked(true);
      return;
    }
    
    try {
      setError('');
      
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send unlock request
      const response = await api.post('/api/unlock');
      
      if (response.data.message === 'UNLOCKED') {
        setIsUnlocked(true);
      } else {
        setError('Failed to unlock device');
      }
    } catch (error) {
      console.error('Error unlocking device:', error);
      setError('Error communicating with the device');
    }
  };

  // Start the test
  const startTest = async () => {
    if (!isUnlocked) {
      await handleUnlock();
    }
    setTestStarted(true);
  };

  // Handle spray button press
  const handleSpray = async () => {
    if (spraying) return;
    
    // In development mode, just increment counter
    if (devMode) {
      setSprayCount(prev => prev + 1);
      return;
    }
    
    try {
      setError('');
      setSpraying(true);
      
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send spray request to activate the Arduino motor
      const response = await api.post('/api/spray');
      
      console.log('Spray response:', response.data);
      
      // Update spray count based on response from Arduino
      if (response.data.totalSprays) {
        setSprayCount(response.data.totalSprays);
      } else if (response.data.error) {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error during spray:', error);
      setError('Failed to activate spray: ' + (error.message || 'Unknown error'));
    } finally {
      setSpraying(false);
    }
  };

  // Handle stopping the spray
  const handleStopSpray = async () => {
    // In development mode, no need to do anything
    if (devMode) return;
    
    try {
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send stop spray request
      await api.post('/api/stop-spray');
    } catch (error) {
      console.error('Error stopping spray:', error);
    }
  };

  // Complete the test and save result
  const completeTest = async () => {
    try {
      // Lock the device (except in dev mode)
      if (!devMode) {
        const api = await createAuthenticatedClient();
        await api.post('/api/lock');
      }
      
      // Calculate group based on spray count
      let group = 0;
      if (sprayCount >= 1 && sprayCount <= 10) group = 1;
      else if (sprayCount >= 11 && sprayCount <= 20) group = 2;
      else if (sprayCount > 20) group = 3;
      
      // Save threshold test result to Firestore
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          thresholdTestResult: {
            sprayCount,
            group,
            timestamp: new Date()
          }
        });
      }
      
      // Navigate to results page
      navigate('/end-of-threshold-test', { state: { sprayCount } });
    } catch (error) {
      console.error('Error completing test:', error);
      setError('Failed to save test results');
    }
  };

  // Toggle development mode
  const toggleDevMode = () => {
    setDevMode(!devMode);
  };

  if (loading) {
    return <div className="threshold-test-container loading">Loading...</div>;
  }

  return (
    <div className="threshold-test-container">
      <h2>Threshold Test</h2>
      
      {error && <p className="error">{error}</p>}
      
      {/* Dev mode indicator */}
      <div className="dev-mode-controls">
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={devMode} 
            onChange={toggleDevMode}
            style={{ marginRight: '8px' }}
          />
          Development Mode {devMode ? '(ON)' : '(OFF)'}
        </label>
        {devMode && <p style={{ color: 'blue', margin: '5px 0 0' }}>Testing without hardware</p>}
      </div>
      
      <p>The recording will automatically start when this page loads and stop when you leave.</p>
      
      <AutoVideoRecorder />
      
      <div className="video-placeholder">
        Video Placeholder
      </div>
      
      {testStarted && (
        <p className="spray-count">Number of sprays: {sprayCount}</p>
      )}
      
      {!testStarted ? (
        <div className="button-container">
          <button 
            onClick={startTest} 
            className="btn btn-primary"
            disabled={loading}
          >
            {isUnlocked ? 'Start Test' : 'Unlock and Start Test'}
          </button>
        </div>
      ) : (
        <div className="button-container">
          <button 
            onClick={handleSpray} 
            className="btn btn-primary spray-button"
            disabled={spraying}
          >
            {spraying ? 'Spraying...' : (devMode ? 'Increment Spray Count' : 'Spray')}
          </button>
          
          {spraying && !devMode && (
            <button 
              onClick={handleStopSpray} 
              className="btn btn-danger stop-button"
            >
              Stop Spray
            </button>
          )}
          
          <button 
            onClick={completeTest} 
            className="btn btn-success complete-button"
            disabled={sprayCount === 0}
          >
            Complete Test
          </button>
        </div>
      )}
    </div>
  );
}

export default ThresholdTest;