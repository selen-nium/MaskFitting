import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';
import doctorsImage from '../../assets/images/doctor.png';

function CreateAccount() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // 2. Update display name
      await updateProfile(user, {
        displayName: formData.username
      });
      
      // 3. Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: formData.username,
        email: formData.email,
        createdAt: new Date(),
        emailVerified: false
      });

      // 4. Send verification email
      await sendEmailVerification(user);
      
      // 5. Show success message instead of redirecting
      setSuccess('Account created successfully! Please check your email to verify your account before logging in.');
      
      // Clear the form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Optional: redirect to a verification pending page instead of login
      // navigate('/verification-pending');
      
    } catch (error) {
      console.error("Error creating account:", error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak (minimum 6 characters)');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Error creating account: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-container">
      <div className="image-container">
        <img src={doctorsImage} alt="Doctors" />
      </div>
      <div className="form-container">
        <h2>Create Account</h2>
        {success ? (
          <div className="success-message">
            <p>{success}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-block mt-2"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
                className="mb-2"
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="mb-2"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="mb-2"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="mb-2"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
        {!success && (
          <button
            onClick={() => navigate('/login')}
            className="btn btn-secondary btn-block mt-2"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateAccount;