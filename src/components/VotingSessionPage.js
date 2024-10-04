import React, { useState, useEffect } from 'react';
import { Container, Button, Typography, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

function VotingSessionPage() {
  const { sessionId } = useParams();  // Get session ID from the URL
  const [vote, setVote] = useState(null);
  const [results, setResults] = useState({});
  const [options, setOptions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    // Join the session
    newSocket.emit('joinSession', sessionId);

    // Receive options for voting
    newSocket.on('sessionOptions', (availableOptions) => {
      setOptions(availableOptions);  // Set the available options
    });

    // Handle session error
    newSocket.on('sessionError', (message) => {
      alert(message);
    });

    // Update votes
    newSocket.on('updateVotes', (updatedVotes) => {
      setResults(updatedVotes);
    });

    // Cleanup the socket connection on unmount
    return () => newSocket.disconnect();
  }, [sessionId]);

  // Handle vote selection
  const handleVote = (value) => {
    setVote(value);
  };

  // Submit vote
  const handleSubmit = () => {
    if (socket && vote !== null) {
      socket.emit('submitVote', { sessionId, vote });
      setSubmitted(true);
    } else {
      alert("Please select an option before submitting.");
    }
  };

  return (
    <Container className="page-container">
      <Typography variant="h4">{sessionId} Voting Session</Typography>
      <Typography variant="h6" style={{ marginBottom: '20px' }}>Vote for the best option below</Typography>
      
      {/* Show voting options */}
      <Grid container spacing={2} justifyContent="center">
        {options.length > 0 ? (
          options.map((option, index) => (
            <Grid item key={index}>
              <Button
                variant={vote === option ? 'contained' : 'outlined'}
                onClick={() => handleVote(option)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: vote === option ? '#1976d2' : '#fff',
                  color: vote === option ? '#fff' : '#1976d2',
                  borderColor: '#1976d2',
                  borderRadius: '5px',
                  pointerEvents: submitted ? 'none' : 'auto',
                  opacity: submitted ? 0.6 : 1,
                }}
                disabled={submitted}
              >
                {option}
              </Button>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" style={{ color: '#555' }}>No options available for voting.</Typography>
        )}
      </Grid>
      
      {/* Submit button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        style={{ marginTop: '20px', padding: '10px 20px' }}
        disabled={submitted}
      >
        {submitted ? 'Vote Submitted' : 'Submit Vote'}
      </Button>

      {/* Real-time results */}
      <Typography variant="h5" style={{ marginTop: '40px' }}>Real-Time Results</Typography>
      <div style={{ marginTop: '20px' }}>
        {Object.keys(results).length > 0 ? (
          Object.keys(results).map((key) => (
            <Typography key={key} variant="body1" style={{ color: '#333', marginBottom: '10px' }}>
              {key}: {results[key]} vote(s)
            </Typography>
          ))
        ) : (
          <Typography variant="body1" style={{ color: '#555' }}>No votes yet.</Typography>
        )}
      </div>
    </Container>
  );
}

export default VotingSessionPage;
