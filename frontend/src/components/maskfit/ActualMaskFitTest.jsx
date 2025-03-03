import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { createAuthenticatedClient } from '../../utils/authUtil';

function ActualMaskFitTest() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);
  const [spraying, setSpraying] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [devMode, setDevMode] = useState(process.env.NODE_ENV === 'development');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get mask model and group from navigation state
  const { maskModel, group } = location.state || {};
  
  // Exercise procedure steps
  const exercises = [
    { name: "Normal Breathing", duration: 60, description: "Breathe normally for 60 seconds" },
    { name: "Deep Breathing", duration: 60, description: "Take deep breaths for 60 seconds" },
    { name: "Head Side to Side", duration: 60, description: "Turn head from side to side for 60 seconds" },
    { name: "Head Up and Down", duration: 60, description: "Tilt head up and down for 60 seconds" },
    { name: "Talking", duration: 60, description: "Read a passage out loud for 60 seconds" },
    { name: "Bending", duration: 60, description: "Bend at waist as if touching toes for 60 seconds" },
    { name: "Normal Breathing Again", duration: 60, description: "Breathe normally for 60 seconds" }
  ];
  
  // Initialize timer state
  const [timer, setTimer] = useState(exercises[0].duration);
  const [timerActive, setTimerActive] = useState(false);

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
    
    // Check if we have required data
    if (!maskModel || !group) {
      setError('Missing test information. Please restart the test.');
    }
    
    // Clean up subscription
    return () => unsubscribe();
  }, [navigate, maskModel, group]);

  // Handle exercise timer
  useEffect(() => {
    let interval = null;
    
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timerActive && timer === 0) {
      // Exercise is complete, move to next one
      handleNextExercise();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer]);

  // Start the exercise
  const startExercise = () => {
    setTimerActive(true);
  };

  // Pause the exercise
  const pauseExercise = () => {
    setTimerActive(false);
  };

  // Move to the next exercise
  const handleNextExercise = () => {
    setTimerActive(false);
    
    // Check if we've completed all exercises
    if (currentExercise >= exercises.length - 1) {
      // All exercises completed, test passed
      handleTestSuccess();
    } else {
      // Move to next exercise
      setCurrentExercise(prevExercise => prevExercise + 1);
      setExercisesCompleted(prevCompleted => prevCompleted + 1);
      setTimer(exercises[currentExercise + 1].duration);
    }
  };

  // Handle spray button
  const handleSpray = async () => {
    if (spraying) return;
    
    // In development mode, just simulate spray
    if (devMode) {
      setSpraying(true);
      setTimeout(() => {
        setSpraying(false);
      }, 2000);
      return;
    }
    
    try {
      setError('');
      setSpraying(true);
      
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send spray request
      const response = await api.post('/api/spray');
      
      console.log('Spray response:', response.data);
      
      // No need to track spray count here, just ensure it completed
      if (response.data.error) {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Error during spray:', error);
      setError('Failed to activate spray: ' + (error.message || 'Unknown error'));
    } finally {
      setSpraying(false);
    }
  };

  // Handle stop spray
  const handleStopSpray = async () => {
    // In development mode, do nothing
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

  // User smelled the solution, test failed
  const handleTestFailure = async () => {
    setTimerActive(false);
    setTestComplete(true);
    setTestPassed(false);
    
    try {
      // Lock the device in non-dev mode
      if (!devMode) {
        const api = await createAuthenticatedClient();
        await api.post('/api/lock');
      }
      
      // Update user document with test results
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          lastTestDate: serverTimestamp(),
          lastTestResult: 'failed',
          testGroup: group,
          // We don't update maskModel here since the test failed
        });
      }
    } catch (error) {
      console.error('Error recording test failure:', error);
      setError('Failed to save test results.');
    }
  };

  // User completed all exercises without detecting smell, test passed
  const handleTestSuccess = async () => {
    setTimerActive(false);
    setTestComplete(true);
    setTestPassed(true);
    
    try {
      // Lock the device in non-dev mode
      if (!devMode) {
        const api = await createAuthenticatedClient();
        await api.post('/api/lock');
      }
      
      // Update user document with successful test results
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          lastTestDate: serverTimestamp(),
          maskModel: maskModel,
          lastTestResult: 'passed',
          testGroup: group
        });
      }
    } catch (error) {
      console.error('Error recording test success:', error);
      setError('Failed to save test results.');
    }
  };

  // Navigate to results page
  const handleNavigateToResults = () => {
    navigate('/test-complete', { 
      state: { 
        passed: testPassed, 
        maskModel 
      } 
    });
  };

  // Toggle development mode
  const toggleDevMode = () => {
    setDevMode(!devMode);
  };

  if (loading) {
    return <div className="mask-fit-test-container loading">Loading...</div>;
  }

  if (!maskModel || !group) {
    return (
      <div className="mask-fit-test-container">
        <h2>Test Information Missing</h2>
        <p className="error">Required test information is missing. Please restart the test.</p>
        <button 
          onClick={() => navigate('/mask-fit-test')}
          className="btn btn-secondary"
        >
          Restart Test
        </button>
      </div>
    );
  }

  if (testComplete) {
    return (
      <div className="mask-fit-test-container">
        <h2>Mask Fit Test Complete</h2>
        
        <div className={`result-message ${testPassed ? 'success' : 'failure'}`}>
          <h3>{testPassed ? 'Congratulations! Test Passed' : 'Test Failed'}</h3>
          
          {testPassed ? (
            <p>You have successfully completed all exercises without detecting the test solution. 
               The {maskModel} mask fits you properly.</p>
          ) : (
            <p>You have detected the test solution, which means the {maskModel} mask does not provide 
               a proper seal. Please try again with a different mask model.</p>
          )}
        </div>
        
        <div className="text-center mt-3">
          <button 
            onClick={handleNavigateToResults}
            className="btn btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mask-fit-test-container">
      <h2>Mask Fit Test</h2>
      
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
      
      <div className="test-info">
        <p><strong>Mask Model:</strong> {maskModel}</p>
        <p><strong>Group:</strong> {group}</p>
        <p><strong>Exercises Completed:</strong> {exercisesCompleted} of {exercises.length}</p>
      </div>
      
      <div className="current-exercise">
        <h3>Current Exercise: {exercises[currentExercise].name}</h3>
        <p>{exercises[currentExercise].description}</p>
        
        <div className="timer">
          <p>Time Remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ 
                width: `${(timer / exercises[currentExercise].duration) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        <div className="exercise-controls">
          {!timerActive ? (
            <button 
              onClick={startExercise}
              className="btn btn-primary"
            >
              {exercisesCompleted === 0 ? 'Start Test' : 'Continue'}
            </button>
          ) : (
            <button 
              onClick={pauseExercise}
              className="btn btn-secondary"
            >
              Pause
            </button>
          )}
          
          {exercisesCompleted > 0 && (
            <button 
              onClick={handleNextExercise}
              className="btn btn-secondary"
              disabled={timerActive}
            >
              Skip to Next Exercise
            </button>
          )}
        </div>
      </div>
      
      <div className="spray-controls">
        <p className="instructions">
          Press the Spray button periodically during each exercise. If you detect any smell or taste, 
          press "I Smell/Taste Something" immediately which will indicate a failed test.
        </p>
        
        <div className="button-row">
          <button 
            onClick={handleSpray} 
            className="btn btn-primary spray-button"
            disabled={spraying || !timerActive}
          >
            {spraying ? 'Spraying...' : 'Spray'}
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
            onClick={handleTestFailure}
            className="btn btn-danger fail-button"
            disabled={!timerActive}
          >
            I Smell/Taste Something
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActualMaskFitTest;