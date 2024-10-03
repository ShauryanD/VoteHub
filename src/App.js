import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateSessionPage from './components/CreateSessionPage';
import VotingSessionPage from './components/VotingSessionPage';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<CreateSessionPage />} />
        
        <Route path="/vote/:sessionId" element={<VotingSessionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
