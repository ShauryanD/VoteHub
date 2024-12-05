import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Button, TextField, Typography,Box,IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


function JoinSessionPage({activeSessions}) {
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (sessionId.trim()) {
      navigate(`/vote/${sessionId}`);  // Redirect to the voting session page
    } else {
      alert('Please enter a valid session ID');
    }
  };
  const handleCopyToClipboard = (sessionId) => {
    navigator.clipboard.writeText(sessionId)
      .then(() => {
        alert('Session ID copied to clipboard!');
      })
      .catch(err => {
        alert('Failed to copy session ID: ', err);
      });
  };
  const handleClick=(id)=>{
    console.log("Here")
    navigate(`/vote/${id}`)
  }

  return (
    <>
    <Container style={{ marginTop: '40px' }}>
      <Typography variant="h4" gutterBottom>Join a Voting Session</Typography>
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
        Join Session
      </Button>
    </Container>
      <Box style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>
        Active Sessions
      </Typography>
    {activeSessions.map((session, index) => (
            <div  onClick={()=>handleClick(session.sessionId)}>
            <Box key={index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', marginTop:'10px' }}>
              
              <Typography variant="body1" style={{ display: 'flex', alignItems: 'center' }}>
                <strong>Session ID:</strong> {session.sessionId}
                <IconButton 
                  onClick={() => handleCopyToClipboard(session.sessionId)} 
                  style={{ marginLeft: '10px' }}
                  size="small"
                  color="primary"
                >
                  <ContentCopyIcon />
                </IconButton>
              </Typography>
              <Typography variant="body1">
                <strong>Project Name:</strong> {session.projectName}
              </Typography>
              {/* <Link
                  style={{ textDecoration: "none", color: "black" }}
                  to={`/vote/${session.sessionId}`}
                >
                  Go to vote page
                </Link> */}
            </Box>
            </div>
          ))}
      </Box>
        
    

    </>

  );
}

export default JoinSessionPage;
