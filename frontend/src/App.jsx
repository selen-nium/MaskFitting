import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Declaration from './components/Declaration';
import TestSelection from './components/TestSelection';
import ThresholdTest from './components/ThresholdTest';
import MaskFitTest from './components/MaskFitTest';
import CreateAccount from './components/CreateAccount';
import EndOfThresholdTest from './components/EndOfThresholdTest';
import ThreeMSpecial from './components/maskwearing/3M1870Plus';
import ThreeMNormal from './components/maskwearing/3M8110s8210';
import AirPlus from './components/maskwearing/AirPlus';
import Halyard from './components/maskwearing/Halyard';
import MaskFitTest1 from './components/maskwearing/Group1';
import MaskFitTest2 from './components/maskwearing/Group2';
import MaskFitTest3 from './components/maskwearing/Group3';
import FailurePage from './components/maskwearing/FailurePage';
import EndScreen from './components/maskwearing/EndScreen';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/declaration" element={<Declaration />} />
        <Route path="/test-selection" element={<TestSelection />} />
        <Route path="/threshold-test" element={<ThresholdTest />} />
        <Route path="/mask-fit-test" element={<MaskFitTest />} />
        <Route path="/end-of-threshold-test" element={<EndOfThresholdTest />} />
        <Route path="/mask-wearing/3m-1870-plus" element={<ThreeMSpecial />} />
        <Route path="/mask-wearing/3m-8110s-8210" element={<ThreeMNormal />} />
        <Route path="/mask-wearing/air-plus" element={<AirPlus />} />
        <Route path="/mask-wearing/halyard" element={<Halyard />} />
        <Route path="/mask-fit-test-1/group-1" element={<MaskFitTest1 />} />
        <Route path="/mask-fit-test-1/group-2" element={<MaskFitTest2 />} />
        <Route path="/mask-fit-test-1/group-3" element={<MaskFitTest3 />} />
        <Route path="/failure" element={<FailurePage />} />
        <Route path="/end-screen" element={<EndScreen />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;