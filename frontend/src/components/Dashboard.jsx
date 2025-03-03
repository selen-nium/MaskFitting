import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and fetch their data
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData({
              ...userDoc.data(),
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName
            });
          } else {
            setError('User profile not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const handleStartTest = () => {
    navigate('/Declaration');
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    // Handle Firestore timestamps
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle regular dates
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    
    return 'Invalid date';
  };
  
  // Calculate expiration date (1 year from last test)
  const calculateExpiryDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let testDate;
    if (timestamp.toDate) {
      testDate = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      testDate = timestamp;
    } else {
      return 'N/A';
    }
    
    const expiryDate = new Date(testDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    return expiryDate.toLocaleDateString();
  };
  
  // Check if fit test is still valid
  const isTestValid = (timestamp) => {
    if (!timestamp) return false;
    
    let testDate;
    if (timestamp.toDate) {
      testDate = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      testDate = timestamp;
    } else {
      return false;
    }
    
    const expiryDate = new Date(testDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    return new Date() < expiryDate;
  };

  if (loading) {
    return <div className="dashboard-container loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      
      {error && <p className="error">{error}</p>}
      
      {userData && (
        <div className="user-profile">
          <h3>Welcome, {userData.username || userData.displayName || 'User'}</h3>
          
          <div className="threshold-test-status">
            <h4>Threshold Test Status</h4>
            
            {userData.thresholdTestResult ? (
              <div>
                <p>
                  <strong>Last Test Date:</strong> {formatDate(userData.thresholdTestResult.timestamp)}
                </p>
                <p>
                  <strong>Spray Count:</strong> {userData.thresholdTestResult.sprayCount}
                </p>
                <p>
                  <strong>Group:</strong> {userData.thresholdTestResult.group}
                </p>
              </div>
            ) : (
              <p>You have not completed a threshold test yet.</p>
            )}
          </div>
          
          <div className="test-status">
            <h4>Mask Fit Test Status</h4>
            
            {userData.lastTestDate ? (
              <div>
                <p>
                  <strong>Last Test Date:</strong> {formatDate(userData.lastTestDate)}
                </p>
                <p>
                  <strong>Expires On:</strong> {calculateExpiryDate(userData.lastTestDate)}
                </p>
                <p>
                  <strong>Status:</strong> 
                  <span className={isTestValid(userData.lastTestDate) ? 'valid' : 'expired'}>
                    {isTestValid(userData.lastTestDate) ? 'Valid' : 'Expired'}
                  </span>
                </p>
                <p>
                  <strong>Fitted Mask Model:</strong> {userData.maskModel || 'None'}
                </p>
                <p>
                  <strong>Last Result:</strong> {userData.lastTestResult || 'N/A'}
                </p>
              </div>
            ) : (
              <p>You have not completed a mask fit test yet.</p>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/test-selection')}
              className="btn btn-primary"
            >
              Start Tests
            </button>
            
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;