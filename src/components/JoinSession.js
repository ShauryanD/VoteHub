import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

function JoinSession() {
  const [sessionId, setSessionId] = useState('');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize the socket connection when component mounts
    const newSocket = io('http://localhost:4000');  // Replace with your backend URL
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();  // Cleanup when component unmounts
    };
  }, []);

  // Handle the form submission
  const handleJoinSession = () => {
    if (sessionId.trim()) {
      // Emit the joinSession event
      socket.emit('joinSession', sessionId);

      // Listen for the session options from the server
      socket.on('sessionOptions', () => {
        // Navigate to the voting session page
        navigate(`/vote/${sessionId}`);
      });

      // Handle error if the session ID is invalid
      socket.on('sessionError', (message) => {
        alert(message);  // Display the error message
      });
    } else {
      alert('Please enter a valid session ID');
    }
  };

  return (
    <Container style={{ marginTop: '40px' }}>
      <Typography variant="h4" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Join Voting Session
      </Typography>

      {/* Input for session ID */}
      <TextField
        label="Enter Session ID"
        variant="outlined"
        fullWidth
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {/* Join Session Button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleJoinSession}
      >
        Join Session
      </Button>
    </Container>
  );
}

export default JoinSession;
