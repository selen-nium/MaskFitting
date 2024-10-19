import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is installed

function EndScreen() {
  const location = useLocation();
  const { maskModel } = location.state || {};
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    const updateMaskModel = async () => {
      try {
        const username = localStorage.getItem('username'); // Assuming username is stored in localStorage
        if (!username) {
          setUpdateStatus('Error: User not logged in');
          return;
        }

        const response = await axios.post('http://localhost:5001/api/update-mask-model', {
          username,
          maskModel
        });

        if (response.data.success) {
          setUpdateStatus('Mask model updated successfully');
        } else {
          setUpdateStatus('Failed to update mask model');
        }
      } catch (error) {
        console.error('Error updating mask model:', error);
        setUpdateStatus('An error occurred while updating mask model');
      }
    };

    updateMaskModel();
  }, [maskModel]);

  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#1a237e',
    fontSize: '32px',
    marginBottom: '30px',
  };

  const paragraphStyle = {
    fontSize: '18px',
    marginBottom: '15px',
    color: '#333',
  };

  const maskModelStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: '20px',
  };

  const updateStatusStyle = {
    fontSize: '16px',
    marginTop: '20px',
    color: updateStatus.includes('Error') ? '#f44336' : '#4caf50',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Test Completed</h2>
      <p style={paragraphStyle}>Thanks for taking the Mask Fit test!</p>
      <p style={maskModelStyle}>Your mask model: {maskModel}</p>
      {updateStatus && <p style={updateStatusStyle}>{updateStatus}</p>}
    </div>
  );
}

export default EndScreen;