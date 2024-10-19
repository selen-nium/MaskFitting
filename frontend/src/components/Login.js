import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file
import doctorsImage from './images/doctor.png'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/login', { username, password });
      console.log('Login response:', response.data);
      if (response.data.success) {
        localStorage.setItem('username', username);
        console.log('Username stored in localStorage:', username);
        navigate('/declaration');
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleCreateAccount = () => {
    navigate('/create-account');
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img src={doctorsImage} alt="Doctors" />
      </div>
      <div className="form-container">
        <h2>Welcome</h2>
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
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
        <button onClick={handleCreateAccount} style={{marginTop: '10px'}}>
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;