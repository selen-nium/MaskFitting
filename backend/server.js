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
const portPath = '/dev/cu.usbserial-130'; // this is for selen's mac
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

// Update login-check endpoint to use Firebase Auth UID:
app.post('/api/login-check', authenticateUser, async (req, res) => {
  try {
    // Get user profile from Firestore using the Firebase Auth UID
    const userDoc = await usersCollection.doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    
    // Return user data (no need to remove password as it's not stored in Firestore anymore)
    const userData = userDoc.data();
    
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

// No other changes needed in your server.js as it already uses Firebase Auth tokens

app.post('/api/submit-declaration', authenticateUser, async (req, res) => {
  
  const userId = req.user.uid;
  const { question1, question2, question3, question4, question5, question6 } = req.body;
  
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
  
  if (!serialPort.isOpen) {
    console.error('Serial port is not open');
    return res.status(500).json({ error: 'Serial port is not connected' });
  }
  
  let dataBuffer = '';
  let responseTimeout;
  let responseReceived = false;
  
  // Function to handle Arduino data
  const handleArduinoData = (data) => {
    const dataStr = data.toString();
    console.log('Data from Arduino:', dataStr);
    dataBuffer += dataStr;
    
    // Look for a number pattern in the response (e.g., "Sprays: 3" or just "3")
    const sprayCountMatch = dataBuffer.match(/(?:Sprays?:?\s*)?(\d+)/i);
    
    if (sprayCountMatch) {
      const sprayCount = parseInt(sprayCountMatch[1]);
      console.log('Found spray count in Arduino response:', sprayCount);
      
      // Send the response with the spray count
      if (!responseReceived) {
        responseReceived = true;
        clearTimeout(responseTimeout);
        parser.removeListener('data', handleArduinoData);
        res.json({ totalSprays: sprayCount });
      }
    }
  };
  
  // Set timeout for Arduino response
  responseTimeout = setTimeout(() => {
    if (!responseReceived) {
      responseReceived = true;
      parser.removeListener('data', handleArduinoData);
      console.log('Timeout waiting for spray count, returning success anyway');
      res.json({ message: 'SPRAY command sent, but no count received' });
    }
  }, 10000); // 10 second timeout
  
  // Attach the data listener
  parser.on('data', handleArduinoData);
  
  // Send the spray command
  serialPort.write('SPRAY\n', (err) => {
    if (err) {
      console.error('Error on write: ', err.message);
      responseReceived = true;
      clearTimeout(responseTimeout);
      parser.removeListener('data', handleArduinoData);
      return res.status(500).json({ error: 'Failed to send SPRAY command' });
    }
    console.log('SPRAY command sent to Arduino');
    
    // We don't immediately return - we wait for the Arduino to respond with the count
  });
  
  // Clean up on response finish
  res.on('finish', () => {
    if (!responseReceived) {
      clearTimeout(responseTimeout);
      parser.removeListener('data', handleArduinoData);
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

app.post('/api/reset-spray', authenticateUser, (req, res) => {
  console.log('Reset spray endpoint hit');
  
  if (!serialPort.isOpen) {
    console.error('Serial port is not open');
    return res.status(500).json({ error: 'Serial port is not connected' });
  }
  
  // Send the RESET command to Arduino
  serialPort.write('RESET\n', (err) => {
    if (err) {
      console.error('Error on write: ', err.message);
      return res.status(500).json({ error: 'Failed to reset spray count' });
    }
    console.log('RESET command sent to Arduino');
    res.json({ message: 'Spray count reset successfully' });
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

// Add this to your server.js file

// List all available serial ports
app.get('/api/serial-ports', authenticateUser, async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json({ 
      ports: ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        vendorId: port.vendorId,
        productId: port.productId
      })),
      currentPort: portPath,
      isOpen: serialPort.isOpen
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test serial connection
app.post('/api/test-serial', authenticateUser, (req, res) => {
  if (!serialPort.isOpen) {
    return res.status(500).json({ error: 'Serial port is not open' });
  }
  
  let testTimeout;
  let responseReceived = false;
  
  // Function to clean up and send response
  const cleanup = (response) => {
    if (!responseReceived) {
      responseReceived = true;
      clearTimeout(testTimeout);
      parser.removeListener('data', handleTestResponse);
      res.json(response);
    }
  };
  
  // Handler for Arduino response
  const handleTestResponse = (data) => {
    console.log('Test response received:', data.toString());
    cleanup({ 
      success: true, 
      message: 'Arduino responded', 
      response: data.toString() 
    });
  };
  
  // Set up timeout
  testTimeout = setTimeout(() => {
    console.log('Serial test timeout reached');
    cleanup({ success: false, error: 'No response from Arduino' });
  }, 5000);
  
  // Attach listener
  parser.once('data', handleTestResponse);
  
  // Send a test command
  console.log('Sending test command to Arduino');
  serialPort.write('TEST\n', (err) => {
    if (err) {
      console.error('Error sending test command:', err);
      cleanup({ success: false, error: `Failed to send command: ${err.message}` });
    } else {
      console.log('Test command sent successfully');
      // Response will be handled by the listener
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});