import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

function EndOfThresholdTest() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sprayCount, setSprayCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize spray count from location state
  useEffect(() => {
    if (location.state?.sprayCount) {
      setSprayCount(location.state.sprayCount);
    }
  }, [location.state]);
  
  // Determine group based on spray count
  const getGroup = (count) => {
    if (count >= 1 && count <= 10) return 1;
    if (count >= 11 && count <= 20) return 2;
    if (count > 20) return 3;
    return 'Unknown';
  };
  
  const group = getGroup(sprayCount);

  // Check authentication and load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if we have spray count data, if not try to load from Firestore
        if (!location.state?.sprayCount) {
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            const userData = userDoc.data();
            
            if (userData?.thresholdTestResult?.sprayCount) {
              // Use the spray count from Firestore if not in location state
              setSprayCount(userData.thresholdTestResult.sprayCount);
            }
          } catch (error) {
            console.error('Error loading threshold test data:', error);
          }
        }
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return <div className="end-threshold-container loading">Loading...</div>;
  }

  return (
    <div className="end-threshold-container">
      <h2 className="end-threshold-heading">End of Threshold Test</h2>
      
      <p className="threshold-text">Number of sprays: {sprayCount}</p>
      
      <p className="threshold-result">You are in Group: {group}</p>
      
      <p className="threshold-text">
        This result has been saved to your profile. You can now proceed to the Mask Fit Test.
      </p>
      
      <div className="action-buttons">
        <button
          onClick={() => navigate('/mask-fit-test')}
          className="btn btn-primary"
        >
          Continue to Mask Fit Test
        </button>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default EndOfThresholdTest;