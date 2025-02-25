import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase';

function CreateAccount() {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup invisible reCAPTCHA when component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }

    // Cleanup on component unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.error("Error clearing reCAPTCHA:", error);
        }
      }
    };
  }, []);

  const validateSingaporeNumber = (number) => {
    const regex = /^[89]\d{7}$/;
    return regex.test(number);
  };

  const handleSendVerificationCode = async () => {
    if (!validateSingaporeNumber(mobileNumber)) {
      setError('Please enter a valid Singapore mobile number (8 digits starting with 8 or 9)');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const fullNumber = `+65${mobileNumber}`;
      const appVerifier = window.recaptchaVerifier;
      
      // Send verification code via SMS
      const confirmation = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (error) {
      console.error("Error sending verification code:", error);
      setError('Failed to send verification code. Please try again.');
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible'
          });
        } catch (err) {
          console.error("Error resetting reCAPTCHA:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Confirm the verification code
      const result = await confirmationResult.confirm(verificationCode);
      
      // User is now signed in
      console.log("User successfully verified:", result.user);
      setStep(3);
    } catch (error) {
      console.error("Error verifying code:", error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!username || !password) {
      setError('Please provide both username and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Get the current user from the phone authentication
      const user = auth.currentUser;
      
      if (!user) {
        setError('Authentication error. Please try again.');
        return;
      }
      
      // Update the user profile with the username
      await updateProfile(user, {
        displayName: username
      });
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        mobileNumber: `+65${mobileNumber}`,
        password: password, // Note: In a production app, consider using a more secure approach
        maskModel: '',
        lastTestDate: null,
        createdAt: new Date()
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error("Error creating account:", error);
      setError('Failed to create account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container container-sm">
      <h2>Create Account</h2>
      
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
      
      {step === 1 && (
        <div>
          <p className="note">A verification code will be sent to your phone</p>
          <div className="phone-input">
            <span>+65</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Singapore Mobile Number"
              maxLength="8"
              disabled={loading}
            />
          </div>
          <button 
            className="btn-primary" 
            onClick={handleSendVerificationCode}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <p className="note">Enter the verification code sent to your phone</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Verification Code"
            disabled={loading}
          />
          <button 
            className="btn-primary" 
            onClick={handleVerifyCode}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      )}
      
      {step === 3 && (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
          />
          <button 
            className="btn-primary" 
            onClick={handleCreateAccount}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default CreateAccount;