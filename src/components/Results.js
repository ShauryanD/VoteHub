import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, TextField, Typography } from '@mui/material';

function Results() {
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (sessionId.trim()) {
      navigate(`/result/${sessionId}`);  // Redirect to the voting session page
    } else {
      alert('Please enter a valid session ID');
    }
  };

  return (
    <Container style={{ marginTop: '40px' }}>
      <Typography variant="h4" gutterBottom>Result for Session</Typography>
      <TextField
        label="Enter Session ID"
        variant="outlined"
        fullWidth
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleJoin}
      >
        Enter Session Id
      </Button>
    </Container>
  );
}

export default Results;
