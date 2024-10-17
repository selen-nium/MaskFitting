import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Declaration from './components/Declaration';
import TestSelection from './components/TestSelection';
import ThresholdTest from './components/ThresholdTest';
import MaskFitTest from './components/MaskFitTest';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/declaration" element={<PrivateRoute><Declaration /></PrivateRoute>} />
        <Route path="/test-selection" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
        <Route path="/threshold-test" element={<PrivateRoute><ThresholdTest /></PrivateRoute>} />
        <Route path="/mask-fit-test" element={<PrivateRoute><MaskFitTest /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;