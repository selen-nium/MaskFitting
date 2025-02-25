import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase'; 
import doctorsImage from '../assets/images/doctor.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");
    setLoading(true);
    setError('');
    
    try {
      console.log("Looking for user with username:", username);
      
      // For development, use a simple approach first to test navigation
      if (process.env.NODE_ENV === 'development' && username === 'test' && password === 'test') {
        console.log("Using development test account");
        localStorage.setItem('username', username);
        localStorage.setItem('userId', 'test-user-id');
        navigate('/Declaration');
        return;
      }

      // Find the user by username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      
      console.log("Executing Firestore query");
      const querySnapshot = await getDocs(q);
      console.log("Query completed, results:", querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log("No user found with this username");
        setError('Invalid username or password');
        setLoading(false);
        return;
      }

      // Get the user document
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("User data retrieved, checking password");

      // Check if password matches the one stored in Firestore
      if (userData.password !== password) {
        console.log("Password doesn't match");
        setError('Invalid username or password');
        setLoading(false);
        return;
      }

      console.log("Login successful, navigating to Declaration");
      // Password is correct, store user info
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userDoc.id);
      navigate('/Declaration');
      
    } catch (error) {
      console.error('Login error details:', error);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      setError('An error occurred during login. Please try again.');
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
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <button
          onClick={handleCreateAccount}
          className="btn-secondary"
          style={{marginTop: '10px'}}
          disabled={loading}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;