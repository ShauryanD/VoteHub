import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TemplatePage from './components/TemplatePage'; 
import LandingPage from './components/LandingPage';
import CreateSessionPage from './components/CreateSessionPage';
import VotingSessionPage from './components/VotingSessionPage';
import Sidebar from './components/Sidebar';  // Sidebar Component
import './App.css'; // This will work if App.css is inside src/

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />  {/* Sidebar on the left */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<TemplatePage />} />
            <Route path="/create" element={<CreateSessionPage />} />
            <Route path="/vote/:sessionId" element={<VotingSessionPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
