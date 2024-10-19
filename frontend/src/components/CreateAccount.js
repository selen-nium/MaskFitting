import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      {step === 1 && (
        <div>
          <p className="mb-2 text-sm text-gray-600">Note: This is a simulated verification. No real SMS will be sent.</p>
          <div className="flex mb-2">
            <span className="p-2 bg-gray-100 border rounded-l">+65</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Singapore Mobile Number"
              className="flex-grow p-2 border rounded-r"
              maxLength="8"
            />
          </div>
          <button onClick={handleSendVerificationCode} className="w-full p-2 bg-blue-500 text-white rounded">
            Send Verification Code
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <p className="mb-2 text-sm text-gray-600">A verification code has been simulated. Check the console log.</p>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Verification Code"
            className="w-full p-2 mb-2 border rounded"
          />
          <button onClick={handleVerifyCode} className="w-full p-2 bg-blue-500 text-white rounded">
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
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-2 border rounded"
          />
          <button onClick={handleCreateAccount} className="w-full p-2 bg-green-500 text-white rounded">
            Create Account
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default CreateAccount;