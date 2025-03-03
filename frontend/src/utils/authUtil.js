// src/utils/authUtils.js
import axios from 'axios';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5001';

/**
 * Creates an authenticated API client
 */
export const createAuthenticatedClient = async () => {
  const token = await auth.currentUser?.getIdToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

/**
 * Checks if a user is logged in and returns user data
 */
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Logs out the current user and clears localStorage
 */
export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

/**
 * Checks if the token needs refreshing and refreshes it
 */
export const refreshTokenIfNeeded = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const token = await user.getIdToken(true);
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Handles API errors, with special handling for auth errors
 */
export const handleApiError = (error, navigate) => {
  if (error.response?.status === 401) {
    // Token invalid or expired
    localStorage.removeItem('token');
    navigate('/login', { 
      state: { message: 'Your session has expired. Please log in again.' }
    });
    return 'Authentication error. Please log in again.';
  }
  
  return error.response?.data?.message || 'An error occurred. Please try again.';
};