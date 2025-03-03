import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import global styles
import './styles/styles.css';

// Import components
import Login from './components/authentification/Login';
import CreateAccount from './components/authentification/CreateAccount';
import Declaration from './components/authentification/Declaration'
import TestSelection from './components/TestSelection'
import ThresholdTest from './components/threshold/ThresholdTest'
import EndOfThresholdTest from './components/threshold/EndOfThresholdTest';
import MaskFitTest from './components/maskfit/MaskFitTest';
import MaskWearing from './components/maskwearing/MaskWearing';
import ActualMaskFitTest from './components/maskfit/ActualMaskFitTest';
import TestComplete from './components/maskfit/TestComplete';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          
          {/* Test Flow Routes */}
          <Route path="/declaration" element={<Declaration />} />
          <Route path="/test-selection" element={<TestSelection />} />
          
          {/* Threshold Test Routes */}
          <Route path="/threshold-test" element={<ThresholdTest />} />
          <Route path="/end-of-threshold-test" element={<EndOfThresholdTest />} />
          
          {/* Mask Fit Test Routes */}
          <Route path="/mask-fit-test" element={<MaskFitTest />} />
          <Route path="/mask-wearing/:maskType" element={<MaskWearing />} />
          <Route path="/actual-mask-fit-test" element={<ActualMaskFitTest />} />
          <Route path="/test-complete" element={<TestComplete />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Redirect to Dashboard by default */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* 404 - Redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;