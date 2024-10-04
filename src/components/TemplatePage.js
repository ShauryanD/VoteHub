import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';  // Retain your existing styling

// Import the image
import createSessionImage from './Images/test.png';  // Adjust path as per your folder structure

function TemplatePage() {
  const navigate = useNavigate();

  return (
    <div className="template-container">  {/* New container for main content */}
      <h1>Templates</h1>
      <div className="templates">
        <div className="template" onClick={() => navigate('/create')}>
          <img src={createSessionImage} alt="Create Session" style={{ width: '200px', height: 'auto' }} />  {/* Updated width */}
          <p>Create Session</p>
        </div>
        <div className="template" onClick={() => navigate('/join')}>
        <img src={createSessionImage} alt="Create Session" style={{ width: '200px', height: 'auto' }} />  {/* Updated width */}
        <p>Join Session</p>
        </div>
      </div>
    </div>
  );
}

export default TemplatePage;
