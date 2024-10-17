import React, { useState } from 'react';

function MaskFitTest() {
  const [group, setGroup] = useState('');
  const [maskModel, setMaskModel] = useState('');

  return (
    <div>
      <h2>Mask Fit Test</h2>
      <div>
        <label htmlFor="group">Select Group:</label>
        <select id="group" value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">Select...</option>
          <option value="1">Group 1</option>
          <option value="2">Group 2</option>
          <option value="3">Group 3</option>
        </select>
      </div>
      <div>
        <label htmlFor="maskModel">Select Mask Model:</label>
        <select id="maskModel" value={maskModel} onChange={(e) => setMaskModel(e.target.value)}>
          <option value="">Select...</option>
          <option value="3M">3M</option>
          <option value="Air+">Air+</option>
          <option value="HALYARD">HALYARD</option>
        </select>
      </div>
    </div>
  );
}

export default MaskFitTest;