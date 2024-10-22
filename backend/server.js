require('dotenv').config();
const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const serverPort = 5001;
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());


// SerialPort setup
const portPath = '/dev/cu.usbserial-210'; // Adjust this based on your system
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

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure
  }
};
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true },
  maskModel: { type: String, default: '' },
  lastTestDate: { type: Date, default: null }
});

const User = mongoose.model('User', userSchema);

// Verification code storage (in-memory for demonstration)
// In a production environment, you'd want to use a more persistent and secure storage method
const verificationCodes = new Map();

// Routes
app.post('/api/send-verification', (req, res) => {
  const { mobileNumber } = req.body;
  // Generate a random 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the code (in a real app, you'd send an SMS here)
  verificationCodes.set(mobileNumber, verificationCode);
  
  console.log(`Verification code for ${mobileNumber}: ${verificationCode}`);
  
  res.json({ success: true, message: 'Verification code sent' });
});

app.post('/api/verify-code', (req, res) => {
  const { mobileNumber, verificationCode } = req.body;
  const storedCode = verificationCodes.get(mobileNumber);
  
  if (storedCode && storedCode === verificationCode) {
    verificationCodes.delete(mobileNumber); // Remove the code after successful verification
    res.json({ success: true, message: 'Code verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid verification code' });
  }
});

app.post('/api/create-account', async (req, res) => {
  const { mobileNumber, username, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { mobileNumber }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or mobile number already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      mobileNumber
    });
    await newUser.save();
    res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
  }
});


// Spray route
app.post('/api/spray', (req, res) => {
  serialPort.write('SPRAY\n', (err) => {
    if (err) {
      console.error('Error on write: ', err.message);
      return res.status(500).json({ error: 'Failed to initiate spray' });
    }
    console.log('Spray command sent');
  });

  parser.once('data', (data) => {
    console.log('Data received from Arduino:', data);
    if (data.trim() === 'DONE') {
      res.json({ message: 'Triple spray completed' });
    } else {
      res.status(500).json({ error: 'Unexpected response from Arduino' });
    }
  
  });
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
  }
});

app.post('/api/submit-declaration', async (req, res) => {
  const { username, question1, question2, question3, question4, question5, question6 } = req.body;
  
  try {
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
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
      user.lastTestDate = new Date();
      await user.save();

      res.json({ success: true, message: 'Declaration submitted successfully' });
    } else {
      res.status(403).json({ success: false, message: 'You are not eligible to proceed based on your answers' });
    }
  } catch (error) {
    console.error('Error processing declaration:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
  }
});
// Add lock control endpoints
app.post('/api/unlock', (req, res) => {
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

app.post('/api/lock', (req, res) => {
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

app.post('/api/update-mask-model', async (req, res) => {
  const { username, maskModel } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.maskModel = maskModel;
    await user.save();

    res.json({ success: true, message: 'Mask model updated successfully' });
  } catch (error) {
    console.error('Error updating mask model:', error);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});