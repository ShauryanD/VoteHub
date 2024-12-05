import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid } from '@mui/material';
import { io } from 'socket.io-client';


function ViewResultsPage() {
  const { sessionId } = useParams();  // Get session ID from the URL
  const [results, setResults] = useState({});  // Voting results

  useEffect(() => {
    const socket = io('http://localhost:4000');
    socket.emit('viewResults', sessionId);  // Emit event to get the results

    // Receive voting results from the server
    socket.on('sessionResults', (data) => {
      console.log("Session Results: ",data);
      setResults(data);
    });

    return () => {
      socket.disconnect();  // Clean up socket connection
    };
  }, [sessionId]);

  return (
    <Container>
      <Typography variant="h4">Voting Results for Session: {sessionId}</Typography>
      
      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        {Object.keys(results).map((option, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Typography variant="h6">{option}: {results[option]} votes</Typography>
          </Grid>
        ))}
      </Grid>
    </Container>
            
  );
}

export default ViewResultsPage;
