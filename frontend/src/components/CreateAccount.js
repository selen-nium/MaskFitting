import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateAccount.css';

function CreateAccount() {
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      const fullNumber = `+65${mobileNumber}`;
      await axios.post('http://localhost:5001/api/send-verification', { mobileNumber: fullNumber });
      setStep(2);
      // In a real implementation, the verification code would be sent via SMS
      // For this simulation, we'll just log it to the console
      console.log('Simulated verification code:', Math.floor(100000 + Math.random() * 900000));
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const fullNumber = `+65${mobileNumber}`;
      const response = await axios.post('http://localhost:5001/api/verify-code', { mobileNumber: fullNumber, verificationCode });
      if (response.data.success) {
        setStep(3);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    }
  };

  const handleCreateAccount = async () => {
    try {
      const fullNumber = `+65${mobileNumber}`;
      const response = await axios.post('http://localhost:5001/api/create-account', { mobileNumber: fullNumber, username, password });
      if (response.data.success) {
        navigate('/login');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="create-account-container">
      <h2>Create Account</h2>
      {step === 1 && (
        <div>
          <p className="note">Note: This is a simulated verification. No real SMS will be sent.</p>
          <div className="phone-input">
            <span>+65</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Singapore Mobile Number"
              maxLength="8"
            />
          </div>
          <button onClick={handleSendVerificationCode}>
            Send Verification Code
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <p className="note">A verification code has been simulated. Check the console log.</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Verification Code"
          />
          <button onClick={handleVerifyCode}>
            Verify Code
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
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleCreateAccount}>
            Create Account
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default CreateAccount;