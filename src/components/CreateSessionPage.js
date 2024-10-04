import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

function CreateSessionPage() {
  const [sessionId, setSessionId] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']);
  const [socket, setSocket] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (sessionId.trim() && question.trim() && options.every(opt => opt.trim())) {
      socket.emit('createSession', { sessionId, question, options });

      const link = `http://localhost:3000/vote/${sessionId}`;
      setGeneratedLink(link);
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <Container className="page-container">
      <Typography variant="h4" gutterBottom>Create a New Session</Typography>
      <TextField
        label="Session ID"
        variant="outlined"
        fullWidth
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <TextField
        label="Question (Description)"
        variant="outlined"
        fullWidth
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      {options.map((option, index) => (
        <TextField
          key={index}
          label={`Option ${index + 1}`}
          variant="outlined"
          fullWidth
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          style={{ marginBottom: '20px' }}
        />
      ))}
      <Button onClick={addOption} style={{ marginBottom: '20px' }}>
        Add Another Option
      </Button>
      <Button variant="contained" color="primary" onClick={handleSubmit} className="button button-primary">
        Create Session
      </Button>
      {generatedLink && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h6">Session Created!</Typography>
          <Typography>Share this link with others:</Typography>
          <a href={generatedLink}>{generatedLink}</a>
        </div>
      )}
    </Container>
  );
}

export default CreateSessionPage;
