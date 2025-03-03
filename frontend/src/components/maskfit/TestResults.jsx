import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { createAuthenticatedClient } from '../../utils/authUtil';

function TestResults() {
  const [testPassed, setTestPassed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get mask model and group from navigation state
  const { maskModel, group } = location.state || {};
  
  // Check authentication status when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
    });
    
    // Verify we have the required data
    if (!maskModel || !group) {
      setError('Missing test information. Please restart the test.');
    }
    
    // Clean up subscription
    return () => unsubscribe();
  }, [navigate, maskModel, group]);

  const handleTestResult = async (passed) => {
    if (!user) {
      setError('You must be logged in to record results');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    setTestPassed(passed);

    try {
      // Update user document with test results
      await updateDoc(doc(db, "users", user.uid), {
        lastTestDate: serverTimestamp(),
        maskModel: maskModel,
        lastTestResult: passed ? 'passed' : 'failed',
        testGroup: group
      });

      // Lock the device
      const api = await createAuthenticatedClient();
      await api.post('/api/lock');
      
      // Wait a moment before navigating to show the result
      setTimeout(() => {
        navigate('/test-complete', { 
          state: { 
            passed, 
            maskModel 
          } 
        });
      }, 1500);
      
    } catch (error) {
      console.error('Error saving test results:', error);
      setError('Failed to save test results. Please try again.');
      setLoading(false);
    }
  };

  if (!maskModel || !group) {
    return (
      <div className="test-results-container">
        <h2>Test Error</h2>
        <p className="error">Test information is missing. Please restart the test.</p>
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
    <div className="test-results-container">
      <h2>Mask Fit Test Results</h2>
      
      <div className="test-info">
        <p><strong>Mask Model:</strong> {maskModel}</p>
        <p><strong>Group:</strong> {group}</p>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      <div className="result-buttons">
        <p>Did the user pass the mask fit test?</p>
        
        <div className="button-group">
          <button
            onClick={() => handleTestResult(true)}
            disabled={loading}
            className="btn btn-success pass-button"
          >
            Pass
          </button>
          
          <button
            onClick={() => handleTestResult(false)}
            disabled={loading}
            className="btn btn-danger fail-button"
          >
            Fail
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          <p>Saving results...</p>
        </div>
      )}
      
      {testPassed !== null && !loading && (
        <div className={`result-message ${testPassed ? 'pass' : 'fail'}`}>
          <p>Test {testPassed ? 'Passed' : 'Failed'}</p>
        </div>
      )}
    </div>
  );
}

export default TestResults;