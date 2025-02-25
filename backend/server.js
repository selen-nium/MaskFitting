require('dotenv').config();
const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
// You need to download this JSON file from Firebase Console > Project Settings > Service accounts
const serviceAccount = require('./config/firebaseAdmin.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// SerialPort setup
const portPath = '/dev/cu.usbserial-110'; // this is for selen's mac
const serialPort = new SerialPort({ path: portPath, baudRate: 9600 }, (err) => {
  if (err) {
    return console.error('Error opening serial port:', err);
  }
  console.log('Serial port opened successfully');
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Root route
app.get('/', (req, res) => {
  res.send('Mask Fitting System API is running');
});

// Firebase Firestore database reference
const db = admin.firestore();
const usersCollection = db.collection('users');

// Authentication middleware to verify Firebase tokens
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

// Login endpoint is no longer needed as Firebase handles authentication directly
// But we'll keep a simple endpoint for backward compatibility or additional checks
app.post('/api/login-check', authenticateUser, async (req, res) => {
  try {
    // The user is already authenticated via the middleware
    // We can perform additional checks if needed
    const userDoc = await usersCollection.doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    
    // Return user data (excluding sensitive info)
    const userData = userDoc.data();
    delete userData.password; // Remove password if stored
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: userData
    });
  } catch (error) {
    console.error('Login check error:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
  }
});

app.post('/api/submit-declaration', authenticateUser, async (req, res) => {
  const { question1, question2, question3, question4, question5, question6 } = req.body;
  const userId = req.user.uid;
  
  try {
    // Check if the user exists
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the user is eligible based on their answers
    const isEligible = 
      question1 === 'no' &&
      question2 === 'no' &&
      question3 === 'no' &&
      question4 === 'no' &&
      question5 === 'no' &&
      question6 === 'yes';

    if (isEligible) {
      // Update the user's lastTestDate
      await usersCollection.doc(userId).update({
        lastTestDate: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true, message: 'Declaration submitted successfully' });
    } else {
      res.status(403).json({ success: false, message: 'You are not eligible to proceed based on your answers' });
    }
  } catch (error) {
    console.error('Error processing declaration:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
  }
});

// Spray routes
app.post('/api/spray', authenticateUser, (req, res) => {
  console.log('Spray endpoint hit');
  let dataBuffer = '';
  let responseReceived = false;
  let responseTimeout;

  // Calculate timeout: 5 sprays × (3000ms spray time + 3000ms return time) + 5000ms buffer
  const TIMEOUT_DURATION = (5 * 6000) + 5000; // 35 seconds total

  const sendResponse = (responseData) => {
    if (!responseReceived) {
      responseReceived = true;
      clearTimeout(responseTimeout);
      parser.removeListener('data', handleArduinoResponse);
      res.json(responseData);
    }
  };

  const handleArduinoResponse = (data) => {
    if (responseReceived) return;
    
    console.log('Raw data from Arduino:', data);
    dataBuffer += data.toString();
    console.log('Current buffer:', dataBuffer);

    // Check for spray count in the accumulated data
    const match = dataBuffer.match(/Total Sprays Completed: (\d+)/);
    if (match) {
      const sprayCount = parseInt(match[1]);
      console.log('Found spray count:', sprayCount);
      
      const wasStopped = dataBuffer.includes('Spraying stopped!');
      console.log('Was stopped:', wasStopped);

      sendResponse({ 
        message: wasStopped ? 'Spray stopped' : 'Spray completed',
        totalSprays: sprayCount
      });
    }
  };

  // Set up timeout handler
  responseTimeout = setTimeout(() => {
    console.log('Timeout reached. Current buffer:', dataBuffer);
    sendResponse({ error: 'Timeout waiting for Arduino response' });
  }, TIMEOUT_DURATION);

  // Attach the data listener before sending the command
  parser.on('data', handleArduinoResponse);

  // Send the spray command
  serialPort.write('SPRAY\n', (err) => {
    if (err) {
      console.error('Error on write: ', err.message);
      sendResponse({ error: 'Failed to initiate spray' });
    } else {
      console.log('Spray command sent to Arduino');
    }
  });

  // Clean up on response finish
  res.on('finish', () => {
    if (!responseReceived) {
      parser.removeListener('data', handleArduinoResponse);
      clearTimeout(responseTimeout);
    }
  });
});

app.post('/api/stop-spray', authenticateUser, (req, res) => {
  serialPort.write('STOP\n', (err) => {
    if (err) {
      console.error('Error on write: ', err.message);
      return res.status(500).json({ error: 'Failed to stop spray' });
    }
    console.log('Stop command sent');
    res.json({ message: 'Stop command sent successfully' });
  });
});

app.post('/api/update-mask-model', authenticateUser, async (req, res) => {
  const { maskModel } = req.body;
  const userId = req.user.uid;
  
  try {
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await usersCollection.doc(userId).update({ maskModel });

    res.json({ success: true, message: 'Mask model updated successfully' });
  } catch (error) {
    console.error('Error updating mask model:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
  }
});

// Add lock control endpoints
app.post('/api/unlock', authenticateUser, (req, res) => {
  serialPort.write('UNLOCK\n', (err) => {
    if (err) {
      console.error('Error on write: ', err.message);
      return res.status(500).json({ error: 'Failed to unlock' });
    }
    console.log('Unlock command sent');
  });

  parser.once('data', (data) => {
    console.log('Data received from Arduino:', data);
    if (data.trim() === 'UNLOCKED'){
      res.json({ message: 'UNLOCKED' });
    } else {
      res.status(500).json({ error: 'Unexpected response from Arduino' });
    }
  });
});

app.post('/api/lock', authenticateUser, (req, res) => {
  serialPort.write('LOCK\n', (err) => {
    if (err) {
      console.error('Error on write: ', err.message);
      return res.status(500).json({ error: 'Failed to lock' });
    }
    console.log('Lock command sent');
  });

  parser.once('data', (data) => {
    console.log('Data received from Arduino:', data);
    if (data.trim() === 'LOCKED') {
      res.json({ message: 'Successfully locked' });
    } else {
      res.status(500).json({ error: 'Unexpected response from Arduino' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});