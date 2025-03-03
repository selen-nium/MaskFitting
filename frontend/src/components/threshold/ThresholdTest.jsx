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
    
    // Clean up subscription and reset spray count when component unmounts
    return () => {
      unsubscribe();
      // Send RESET command when leaving the page
      if (!devMode) {
        resetSprayCount();
      }
    };
  }, [navigate, devMode]);

  // Function to reset spray count on Arduino
  const resetSprayCount = async () => {
    if (devMode) {
      console.log('DEV MODE: Simulating spray count reset');
      setSprayCount(0);
      return;
    }
    
    try {
      const api = await createAuthenticatedClient();
      console.log('Sending RESET command to Arduino...');
      await api.post('/api/reset-spray');
      console.log('Spray count reset successfully');
      setSprayCount(0);
    } catch (error) {
      console.error('Error resetting spray count:', error);
    }
  };

  // Start the test - no unlock, just start directly
  const startTest = () => {
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
      
      console.log('Sending spray request...');
      // Send spray request to activate the Arduino motor
      const response = await api.post('/api/spray');
      
      console.log('Spray response:', response.data);
      
      // Update spray count based on response from Arduino
      if (response.data.totalSprays !== undefined) {
        console.log('Setting spray count to:', response.data.totalSprays);
        setSprayCount(response.data.totalSprays);
      } else {
        // If no spray count received, increment manually
        console.log('No spray count in response, incrementing manually');
        setSprayCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error during spray:', error);
      setError('Failed to activate spray: ' + (error.message || 'Unknown error'));
      
      // Even if there's an error, increment spray count to allow tests to continue
      console.log('Error occurred, incrementing spray count manually');
      setSprayCount(prev => prev + 1);
    } finally {
      setSpraying(false);
    }
  };

  // Handle stopping the spray
  const handleStopSpray = async () => {
    // In development mode, no need to do anything for stop
    if (devMode) return;
    
    try {
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      console.log('Sending stop spray request...');
      // Send stop spray request
      await api.post('/api/stop-spray');
      
      console.log('Sending RESET command after stopping spray...');
      // Send RESET command after stopping
      await resetSprayCount();
    } catch (error) {
      console.error('Error stopping spray:', error);
    }
  };

  // Complete the test and save result
  const completeTest = async () => {
    try {
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
      
      // Send RESET command before navigating away
      console.log('Sending RESET command before completing test...');
      await resetSprayCount();
      
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
            Start Test
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