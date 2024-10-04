import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

function LandingPage() {
  const [sessionId, setSessionId] = useState('');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);
  
    return () => newSocket.disconnect();
  }, []);
  
  const handleJoinSession = () => {
    if (sessionId.trim()) {
      socket.emit('joinSession', sessionId);
  
      // No need for 'joinedSession', just listen for 'sessionOptions'
      socket.on('sessionOptions', () => {
        navigate(`/vote/${sessionId}`);
      });
  
      socket.on('sessionError', (message) => {
        alert(message);
      });
    } else {
      alert('Please enter a valid session ID');
    }
  };
  

  const handleCreateSessionRedirect = () => {
    navigate(`/create`);
  };

  return (
    <div className="page-container">
      <Typography variant="h4" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Welcome to VoteHub
      </Typography>
      <TextField
        label="Enter Session ID"
        variant="outlined"
        fullWidth
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Button variant="contained" color="primary" onClick={handleJoinSession} className="button button-primary">
        Join Session
      </Button>
      <Button variant="contained" color="secondary" onClick={handleCreateSessionRedirect} className="button button-secondary">
        Create New Session
      </Button>
    </div>
  );
}

export default LandingPage;
