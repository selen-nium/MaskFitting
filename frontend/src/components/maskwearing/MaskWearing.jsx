import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { createAuthenticatedClient } from '../../utils/authUtil';

function MaskWearing() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sprayStarted, setSprayStarted] = useState(false);
  const [sprayComplete, setSprayComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [devMode, setDevMode] = useState(process.env.NODE_ENV === 'development');
  
  const videoRef = useRef(null);
  const { maskType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get maskModel and group from the navigation state
  const { maskModel, group } = location.state || {};
  
  // Video sources for different mask types
  const videoSources = {
    '3m-8110s-8210': '/videos/3m-8110s-8210-instructions.mp4',
    '3m-1870-plus': '/videos/3m-1870-plus-instructions.mp4',
    'air-plus': '/videos/air-plus-instructions.mp4',
    'halyard': '/videos/halyard-instructions.mp4'
  };

  // Check authentication and setup video
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    
    // Check if we have the required data
    if (!maskModel || !group) {
      setError('Missing test information. Please restart the test.');
    }
    
    return () => unsubscribe();
  }, [navigate, maskModel, group]);

  // Handle video loading
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = () => {
        setLoading(false);
      };
      
      videoRef.current.onerror = () => {
        setError('Failed to load video. Please try again.');
        setLoading(false);
      };
    }
  }, [maskType]);
  
  
  // Proceed to actual mask fit test
  const handleContinue = () => {
    navigate('/actual-mask-fit-test', {
      state: {
        maskModel,
        group
      }
    });
  };

  // Toggle development mode
  const toggleDevMode = () => {
    setDevMode(!devMode);
  };

  if (!maskType || !videoSources[maskType]) {
    return (
      <div className="mask-wearing-container">
        <h2>Invalid Mask Type</h2>
        <p className="error">The selected mask type is not valid. Please restart the test.</p>
        <div className="text-center mt-3">
          <button 
            onClick={() => navigate('/mask-fit-test')}
            className="btn btn-secondary"
          >
            Restart Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mask-wearing-container">
      <h2>Mask Wearing Instructions</h2>
      
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
      
      <div className="video-container">
        {loading && <p>Loading video...</p>}
        
        <video
          ref={videoRef}
          src={videoSources[maskType]}
          controls
          width="100%"
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
      
      <div className="instructions">
        <p>Please follow the instructions in the video to properly wear your mask.</p>
        <p>Once you have your mask on properly, click the button below to start the test.</p>
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={handleContinue}
          className="btn btn-success"
        >
          Continue to Test
        </button>
        
        <button 
          onClick={() => navigate('/mask-fit-test')}
          className="btn btn-secondary"
          disabled={sprayStarted && !sprayComplete}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default MaskWearing;