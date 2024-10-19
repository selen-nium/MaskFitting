import React from 'react';
import { useLocation } from 'react-router-dom';

function MaskFitTest3() {
  const location = useLocation();
  const { group, maskModel } = location.state || {};

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mask Fit Test 1: Group 3</h2>
      <p className="mb-4">You are using mask model: {maskModel}</p>
      
      {/* Add specific content for each group */}
      {group === '1' && <p>Specific instructions for Group 1</p>}
      {group === '2' && <p>Specific instructions for Group 2</p>}
      {group === '3' && <p>Specific instructions for Group 3</p>}
      
      {/* Add more components or logic as needed for the mask fit test */}
    </div>
  );
}

export default MaskFitTest3;