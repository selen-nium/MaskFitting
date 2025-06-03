import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { createAuthenticatedClient } from '../../utils/authUtil';
import './ActualMaskFitTest.css';

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
  const { maskModel, group } = location.state || {};
  
  // ─── Updated Exercise List with videoSrc ───
  const exercises = [
    {
      name: "Normal Breathing",
      duration: 60,
      description: "Breathe normally for 60 seconds",
      videoSrc: "/videos/normalBreathing.mp4",
    },
    {
      name: "Deep Breathing",
      duration: 60,
      description: "Take deep breaths for 60 seconds",
      videoSrc: "/videos/deepBreathing.mp4",
    },
    {
      name: "Head Side to Side",
      duration: 60,
      description: "Turn head from side to side for 60 seconds",
      videoSrc: "/videos/turnHead.mp4",
    },
    {
      name: "Head Up and Down",
      duration: 60,
      description: "Tilt head up and down for 60 seconds",
      videoSrc: "/videos/moveHeadUp.mp4",
    },
    {
      name: "Talking",
      duration: 60,
      description: "Read a passage out loud for 60 seconds",
      videoSrc: "/videos/count.mp4",
    },
    {
      name: "Bending",
      duration: 60,
      description: "Bend at waist as if touching toes for 60 seconds",
      videoSrc: "/videos/bend.mp4",
    },
    {
      name: "Normal Breathing Again",
      duration: 60,
      description: "Breathe normally for 60 seconds",
      videoSrc: "/videos/finalNormalBreathing.mp4",
    },
  ];
  
  const [timer, setTimer] = useState(exercises[0].duration);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    
    if (!maskModel || !group) {
      setError('Missing test information. Please restart the test.');
    }
    
    return () => {
      unsubscribe();
      if (!devMode) {
        resetSprayCount();
      }
    };
  }, [navigate, maskModel, group, devMode]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timerActive && timer === 0) {
      setTimerActive(false);
      handleNextExercise();
    } else if (!timerActive && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer]);

  const resetSprayCount = async () => {
    if (devMode) {
      console.log('DEV MODE: Simulating spray count reset');
      return;
    }
    try {
      const api = await createAuthenticatedClient();
      await api.post('/api/reset-spray');
    } catch (error) {
      console.error('Error resetting spray count:', error);
    }
  };

  const startExercise = () => {
    setTimerActive(true);
  };

  const pauseExercise = () => {
    setTimerActive(false);
  };

  const handleNextExercise = () => {
    setTimerActive(false);
    if (currentExercise >= exercises.length - 1) {
      handleTestSuccess();
    } else {
      setCurrentExercise(prev => prev + 1);
      setExercisesCompleted(prev => prev + 1);
      setTimer(exercises[currentExercise + 1].duration);
    }
  };

  const handleSpray = async () => {
    if (spraying) return;
    if (devMode) {
      setSpraying(true);
      setTimeout(() => setSpraying(false), 2000);
      return;
    }
    try {
      setError('');
      setSpraying(true);
      const api = await createAuthenticatedClient();
      const response = await api.post('/api/spray');
      if (response.data.error) throw new Error(response.data.error);
    } catch (err) {
      console.error(err);
      setError('Failed to activate spray: ' + (err.message || 'Unknown error'));
    } finally {
      setSpraying(false);
    }
  };

  const handleStopSpray = async () => {
    if (devMode) return;
    try {
      const api = await createAuthenticatedClient();
      await api.post('/api/stop-spray');
      await resetSprayCount();
    } catch (err) {
      console.error('Error stopping spray:', err);
    }
  };

  const handleTestFailure = async () => {
    setTimerActive(false);
    setTestComplete(true);
    setTestPassed(false);
    try {
      await resetSprayCount();
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          lastTestDate: serverTimestamp(),
          lastTestResult: 'failed',
          testGroup: group,
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save test results.');
    }
  };

  const handleTestSuccess = async () => {
    setTimerActive(false);
    setTestComplete(true);
    setTestPassed(true);
    try {
      await resetSprayCount();
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          lastTestDate: serverTimestamp(),
          maskModel: maskModel,
          lastTestResult: 'passed',
          testGroup: group
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save test results.');
    }
  };

  const handleNavigateToResults = () => {
    navigate('/test-complete', { 
      state: { passed: testPassed, maskModel } 
    });
  };

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
        <div className="text-center mt-3">
          <button 
            onClick={handleNavigateToResults}
            className="btn btn-primary"
          >
            See results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mask-fit-test-container">
      <h2>Mask Fit Test</h2>
      
      {error && <p className="error">{error}</p>}
      
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
        
        {/* ─── Video Player ─── */}
        <div className="exercise-video-wrapper">
          <video
            key={exercises[currentExercise].videoSrc}
            className="exercise-video"
            src={exercises[currentExercise].videoSrc}
            controls
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
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
          
          {exercisesCompleted >= 0 && (
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
