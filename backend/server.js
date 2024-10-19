const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const serverPort = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SerialPort setup
const portPath = '/dev/cu.usbserial-A50285BI'; // Adjust this based on your system
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

// Mock user data (replace this with a database in a real application)
const users = [
  { username: 'ADMIN', password: 'password' }
];

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working' });
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
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

// Declaration route
app.post('/api/submit-declaration', (req, res) => {
    try {
      const { question1, question2, question3, question4, question5, question6 } = req.body;
      
      // Check if the user is eligible based on their answers
      if (
        question1 === 'no' &&
        question2 === 'no' &&
        question3 === 'no' &&
        question4 === 'no' &&
        question5 === 'no' &&
        question6 === 'yes'
      ) {
        res.json({ success: true, message: 'Declaration submitted successfully' });
      } else {
        res.status(403).json({ success: false, message: 'You are not eligible to proceed' });
      }
    } catch (error) {
      console.error('Error processing declaration:', error);
      res.status(500).json({ success: false, message: 'An error occurred on the server' });
    }
});

// Start the server
app.listen(serverPort, () => {
    console.log(`Server running at http://localhost:${serverPort}`);
});