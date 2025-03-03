import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { createAuthenticatedClient } from '../../utils/authUtil';

function MaskFitTest() {
  const [group, setGroup] = useState('');
  const [maskModel, setMaskModel] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [thresholdTestData, setThresholdTestData] = useState(null);
  const [devMode, setDevMode] = useState(process.env.NODE_ENV === 'development');
  
  const navigate = useNavigate();

  // Check authentication and load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Load user data including threshold test results
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.data();
          
          if (userData?.thresholdTestResult) {
            setThresholdTestData(userData.thresholdTestResult);
            setGroup(userData.thresholdTestResult.group.toString());
          } else {
            setError('You need to complete the Threshold Test first');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setError('Failed to load your test data');
        }
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  const handleUnlock = async () => {
    if (!user) {
      setError('You must be logged in to continue');
      navigate('/login');
      return;
    }

    if (!thresholdTestData && !devMode) {
      setError('You must complete the Threshold Test first');
      navigate('/test-selection');
      return;
    }

    // In development mode, just simulate unlock
    if (devMode) {
      setIsUnlocked(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get authenticated API client
      const api = await createAuthenticatedClient();
      
      // Send unlock request
      const response = await api.post('/api/unlock');
      
      if (response.data.message === 'UNLOCKED') {
        setIsUnlocked(true);
      } else {
        setError('Failed to unlock. Please try again.');
      }
    } catch (error) {
      console.error('Unlock error:', error);
      setError('Error unlocking device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to continue');
      navigate('/login');
      return;
    }

    if (!thresholdTestData && !devMode) {
      setError('You must complete the Threshold Test first');
      navigate('/test-selection');
      return;
    }

    if (!group || !maskModel) {
      setError('Please select both a group and a mask model.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Store the selected mask model in Firestore for this user
      await updateDoc(doc(db, "users", user.uid), {
        maskModel: maskModel
      });

      // In development mode, skip lock request
      if (!devMode) {
        // Get authenticated API client for lock request
        const api = await createAuthenticatedClient();
        
        // Send lock request
        await api.post('/api/lock');
      }

      // Get the navigation path based on mask model
      let maskWearingPath;
      if (['3M8110S', '3M8210'].includes(maskModel)) {
        maskWearingPath = '/mask-wearing/3m-8110s-8210';
      } else if (maskModel === '3M1870+') {
        maskWearingPath = '/mask-wearing/3m-1870-plus';
      } else if (maskModel.startsWith('Air+')) {
        maskWearingPath = '/mask-wearing/air-plus';
      } else if (maskModel.startsWith('HALYARD')) {
        maskWearingPath = '/mask-wearing/halyard';
      }

      // Navigate to the next page with state
      navigate(maskWearingPath, {
        state: {
          group,
          maskModel
        }
      });
    } catch (error) {
      console.error('Error during submission:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle development mode
  const toggleDevMode = () => {
    setDevMode(!devMode);
    if (!thresholdTestData && !group && devMode) {
      // Set a default group in dev mode if we don't have threshold data
      setGroup('2');
    }
  };

  if (loading) {
    return <div className="mask-fit-container loading">Loading...</div>;
  }
  
  if (!thresholdTestData && !devMode) {
    return (
      <div className="mask-fit-container">
        <h2>Threshold Test Required</h2>
        <p>You need to complete the Threshold Test before proceeding to the Mask Fit Test.</p>
        <button 
          onClick={() => navigate('/threshold-test')}
          className="btn btn-primary"
        >
          Go to Threshold Test
        </button>
      </div>
    );
  }

  return (
    <div className="mask-fit-container">
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
      
      <div className="form-group">
        <label htmlFor="group">Group (Based on Threshold Test):</label>
        <select
          id="group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          disabled={!devMode && thresholdTestData} // Only allow changes in dev mode
        >
          <option value="">Select...</option>
          <option value="1">Group 1</option>
          <option value="2">Group 2</option>
          <option value="3">Group 3</option>
        </select>
        {thresholdTestData && (
          <p className="note">Group determined by your Threshold Test result: {thresholdTestData.sprayCount} sprays</p>
        )}
        {devMode && !thresholdTestData && (
          <p className="note">Using development mode with simulated group</p>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="maskModel">Select Mask Model:</label>
        <select
          id="maskModel"
          value={maskModel}
          onChange={(e) => setMaskModel(e.target.value)}
          disabled={loading}
        >
          <option value="">Select...</option>
          <option value="3M8110S">3M 8110S</option>
          <option value="3M8210">3M 8210</option>
          <option value="3M1870+">3M 1870+</option>
          <option value="Air+(M size)">Air+(M size)</option>
          <option value="Air+(L size)">Air+(L size)</option>
          <option value="HALYARD(Small)">HALYARD(Small)</option>
          <option value="HALYARD(Regular)">HALYARD(Regular)</option>
        </select>
      </div>
      
      <div className="text-center mt-3">
        {!isUnlocked ? (
          <button
            onClick={handleUnlock}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : (devMode ? 'Simulate Unlock' : 'Unlock to Continue')}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}

export default MaskFitTest;