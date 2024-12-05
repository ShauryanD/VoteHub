import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Typography, Grid } from '@mui/material';
import { io } from 'socket.io-client';
function getOrSetUUID() {
  const existingUUID = document.cookie.split('; ').find(row => row.startsWith('uuid='));
  if (existingUUID) {
    return existingUUID.split('=')[1];
  } else {
    const uuid = crypto.randomUUID();
    document.cookie = `uuid=${uuid}; max-age=${60 * 60 * 24 * 365}; path=/`;  // Cookie expires in 1 year
    return uuid;
  }
}
function VotingSessionPage() {
  const { sessionId } = useParams();  // Get the session ID from the URL
  const [questions, setQuestions] = useState([]);  // Array of questions and options
  const [selectedOptions, setSelectedOptions] = useState({});  // Track selected option for each question
  const [submitted, setSubmitted] = useState(false);
  const [socket, setSocket] = useState(null);
  const userUUID = getOrSetUUID();

  useEffect(() => {
    const newSocket = io('http://localhost:4000');  // Connect to the backend
    setSocket(newSocket);
    console.log("session ID: ",typeof(sessionId))
    // Emit the joinSession event to the backend with the session ID
    newSocket.emit('joinSession', sessionId);

    // Listen for session details from the backend
    newSocket.on('sessionDetails', (data) => {
      console.log('Received session details:', data);  // Debugging log
      setQuestions(data.questions);  // Set all questions
    });

    // Listen for real-time updates to votes
    newSocket.on('updateVotes', (updatedSession) => {
      setQuestions(updatedSession.questions);  // Update the questions with the latest votes
    });
    newSocket.on('voteError', (errorMessage) => {
      alert(errorMessage);  // Display error message to the user
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  const handleOptionSelect = (questionIndex, optionText) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionIndex]: optionText,
    }));
  };

  const handleVoteSubmit = () => {
    if (socket && Object.keys(selectedOptions).length === questions.length) {
      // Create a single payload with all selected options
      const votes = Object.entries(selectedOptions).map(([questionIndex, optionText]) => ({
        questionIndex: Number(questionIndex),
        optionText,
      }));
  
      // Emit a single submitVote event with all votes included
      socket.emit('submitVote', { sessionId, votes, userUUID });
  
      setSubmitted(true);  // Mark vote as submitted
    }
  };

  return (
    <Container>
      <Typography variant="h4">Voting Session: {sessionId}</Typography>

      {questions.map((question, questionIndex) => (
        <div key={questionIndex} style={{ marginBottom: '20px' }}>
          <Typography variant="h5" style={{ marginBottom: '10px' }}>{question.questionText}</Typography>

          <Grid container spacing={2}>
            {question.options.map((option, optionIndex) => (
              <Grid item xs={12} sm={6} key={optionIndex}>
                <Button
                  variant={selectedOptions[questionIndex] === option.text ? 'contained' : 'outlined'}
                  onClick={() => handleOptionSelect(questionIndex, option.text)}
                  fullWidth
                  disabled={submitted}  // Disable selection after submitting vote
                >
                  {option.text} 
                </Button>
              </Grid>
            ))}
          </Grid>
        </div>
      ))}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleVoteSubmit}
        disabled={submitted || Object.keys(selectedOptions).length !== questions.length}  // Disable if vote is submitted or not all options selected
        style={{ marginTop: '20px' }}
      >
        {submitted ? 'Vote Submitted' : 'Submit Vote'}
      </Button>
    </Container>
  );
}

export default VotingSessionPage;
