import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

function LandingPage() {
  const [sessionId, setSessionId] = useState('');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const newSocket = io('http://192.168.2.26:4000');
    setSocket(newSocket);

    return () => newSocket.disconnect(); 
  }, []);

  const handleJoinSession = () => {
    if (sessionId.trim()) {
     
      socket.emit('joinSession', sessionId);
  
      
      socket.on('sessionError', (message) => {
        alert(message); 
      });
  
      
      socket.on('joinedSession', () => {
        navigate(`/vote/${sessionId}`);
      });
    } else {
      alert('Please enter a valid session ID');
    }
  };
  

  const handleCreateSessionRedirect = () => {
    navigate(`/create`); 
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #1976d2, #9c27b0)',
      }}
    >
      <Container
        maxWidth="sm"
        style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h4" style={{ fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
          Welcome to VoteHub
        </Typography>
        <TextField
          label="Enter Session ID"
          variant="outlined"
          fullWidth
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleJoinSession}
          style={{ marginRight: '10px', padding: '10px 20px', borderRadius: '5px' }}
        >
          Join Session
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateSessionRedirect}
          style={{ padding: '10px 20px', borderRadius: '5px' }}
        >
          Create New Session
        </Button>
      </Container>
    </div>
  );
}

export default LandingPage;
