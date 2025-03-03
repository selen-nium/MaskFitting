import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from '../../firebase';
import doctorsImage from '../../assets/images/doctor.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");
    setLoading(true);
    setError('');
    setVerificationSent(false);

    try {
      console.log("Attempting login with email:", email);
      
      // For development, use a simple approach first to test navigation
      if (process.env.NODE_ENV === 'development' && email === 'test@test.com' && password === 'test') {
        console.log("Using development test account");
        localStorage.setItem('username', 'Test User');
        localStorage.setItem('userId', 'test-user-id');
        localStorage.setItem('token', 'test-token');
        navigate('/Declaration');
        return;
      }

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        console.log("Email not verified");
        setError('Please verify your email before logging in. Check your inbox for a verification link.');
        
        // Option to resend verification email
        await sendEmailVerification(user);
        setVerificationSent(true);
        
        setLoading(false);
        return;
      }
      
      console.log("Login successful, user:", user.displayName);

      // Get ID token for API requests
      const token = await user.getIdToken();
      
      // Save user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.displayName || email);
      localStorage.setItem('userId', user.uid);
      
      console.log("Login successful, navigating to Declaration");
      navigate('/Declaration');
      
    } catch (error) {
      console.error('Login error details:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    console.log("Navigate to create account");
    navigate('/create-account');
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img src={doctorsImage} alt="Doctors" />
      </div>
      <div className="form-container">
        <h2>Welcome,</h2>
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="mb-2"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="mb-2"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {verificationSent && (
          <p className="success">Verification email has been resent. Please check your inbox.</p>
        )}
        <button
          onClick={handleCreateAccount}
          className="btn btn-secondary btn-block mt-2"
          disabled={loading}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;