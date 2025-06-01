import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import Lottie from 'lottie-react';
import confettiAnimation from '../../animations/confetti.json'; // adjust path as needed

function TestComplete() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the test result data from navigation state
  const { passed, maskModel } = location.state || {};

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [navigate]);

  // If no result data is available
  if (passed === undefined) {
    return (
      <div className="test-complete-container">
        <h2>Test Information Missing</h2>
        <p>No test result information is available. Please restart the test.</p>
        <div className="text-center mt-3">
          <button 
            onClick={() => navigate('/mask-fit-test')}
            className="btn btn-primary"
          >
            Start New Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-complete-container">
      <h2>Test Complete</h2>

      {/* Show animation if passed */}
      {passed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <Lottie animationData={confettiAnimation} loop={false} />
        </div>
      )}


      <div className={`result-summary ${passed ? 'pass' : 'fail'}`}>
        <h3>{passed ? 'Congratulations!' : 'Test Failed'}</h3>

        {passed ? (
          <div>
            <p>You have successfully passed the mask fit test with the {maskModel} mask.</p>
            <p>This result has been recorded in your profile.</p>
            <p>Your fit test is valid for one year from today.</p>
          </div>
        ) : (
          <div>
            <p>Unfortunately, the {maskModel} mask does not provide a proper fit for you.</p>
            <p>Please try another mask model or consult with a healthcare professional.</p>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          onClick={() => navigate('/mask-fit-test')}
          className="btn btn-secondary"
        >
          Start New Test
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default TestComplete;
