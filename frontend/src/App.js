import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Declaration from './components/Declaration';
import TestSelection from './components/TestSelection';
import ThresholdTest from './components/ThresholdTest';
import MaskFitTest from './components/MaskFitTest';
import PrivateRoute from './components/PrivateRoute';
import EndOfThresholdTest from './components/EndOfThresholdTest';
import threeMspecial from './components/maskwearing/3M1870Plus';
import threeMnormal from './components/maskwearing/3M8110s8210';
import airPlus from './components/maskwearing/AirPlus';
import Halyard from './components/maskwearing/Halyard';
import MaskFitTest1 from './components/maskwearing/Group1';
import MaskFitTest2 from './components/maskwearing/Group2';
import MaskFitTest3 from './components/maskwearing/Group3';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/declaration" element={<PrivateRoute><Declaration /></PrivateRoute>} />
        <Route path="/test-selection" element={<PrivateRoute><TestSelection /></PrivateRoute>} />
        <Route path="/threshold-test" element={<PrivateRoute><ThresholdTest /></PrivateRoute>} />
        <Route path="/mask-fit-test" element={<PrivateRoute><MaskFitTest /></PrivateRoute>} />
        <Route path="/end-of-threshold-test" element={<PrivateRoute><EndOfThresholdTest /></PrivateRoute>} />
        <Route path="/mask-wearing/3m-1870-plus" element={<PrivateRoute><threeMspecial /></PrivateRoute>} />
        <Route path="/mask-wearing/3m-8110s-8210" element={<PrivateRoute><threeMnormal /></PrivateRoute>} />
        <Route path="/mask-wearing/air-plus" element={<PrivateRoute><airPlus /></PrivateRoute>} />
        <Route path="/mask-wearing/halyard" element={<PrivateRoute><Halyard /></PrivateRoute>} />
        <Route path="/mask-fit-test-1/group-1" element={<PrivateRoute><MaskFitTest1 /></PrivateRoute>} />
        <Route path="/mask-fit-test-1/group-2" element={<PrivateRoute><MaskFitTest2 /></PrivateRoute>} />
        <Route path="/mask-fit-test-1/group-3" element={<PrivateRoute><MaskFitTest3 /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;