import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MaskFitTest.css';

function MaskFitTest() {
  const [group, setGroup] = useState('');
  const [maskModel, setMaskModel] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (group && maskModel) {
      let maskWearingPath;
      if (['3M8110S', '3M8210'].includes(maskModel)) {
        maskWearingPath = '/mask-wearing/3m-8110s-8210';
      } else if (maskModel === '3M1870+') {
        maskWearingPath = '/mask-wearing/3m-1870-plus';
      } else if (maskModel.startsWith('Air+')) {
        maskWearingPath = '/mask-wearing/air-plus';
      } else if (maskModel.startsWith('HALYARD')) {
        maskWearingPath = '/mask-wearing/halyard';
      }
      navigate(maskWearingPath, { state: { group, maskModel } });
    } else {
      alert('Please select both a group and a mask model.');
    }
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  return (
    <div className="mask-fit-container">
      <h2>Mask Fit Test</h2>
      <div className="form-group">
        <label htmlFor="group">Select Group:</label>
        <select
          id="group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="">Select...</option>
          <option value="1">Group 1</option>
          <option value="2">Group 2</option>
          <option value="3">Group 3</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="maskModel">Select Mask Model:</label>
        <select
          id="maskModel"
          value={maskModel}
          onChange={(e) => setMaskModel(e.target.value)}
        >
          <option value="">Select...</option>
          <option value="3M8110S">3M 8110S</option>
          <option value="3M8210">3M 8210</option>
          <option value="3M1870+">3M 1870+</option>
          <option value="Air+(M size)">Air+(M size)</option>
          <option value="Air+(L size)">Air+(L size)</option>
          <option value="HALYARD(Small)">HALYARD(Small)</option>
          <option value="HALYARD(Regular)">HALYARD(Regular)</option>
        </select>
      </div>
      {!isUnlocked ? (
        <button 
          onClick={handleUnlock}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Unlock to Continue
        </button>
      ) : (
        <button 
          onClick={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Continue
        </button>
      )}
    </div>
  );
}

export default MaskFitTest;