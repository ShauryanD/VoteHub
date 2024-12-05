import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Button, Typography } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Swal from 'sweetalert2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SizebarChart = ({ setSessionState, userRole, authToken }) => {
  const navigate = useNavigate();
  let { sessionId } = useParams();  // Get the session ID from the URL
  const [results, setResults] = useState([]);  // Store results for each question
  const [isVotesRevealed, setIsVotesRevealed] = useState(false)
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);

  const handleEndSession = () => {
    socket.emit('endSession', { sessionId });
    setSessionState((prev) => !prev);
    setMessage('Session Ended')
  };

  useEffect(() => {
    const newSocket = io('http://localhost:4000');  // Connect to the backend
    setSocket(newSocket);
    console.log(sessionId)
    newSocket.emit('joinSession', sessionId);
    newSocket.emit('getResults', { sessionId });

    // Listen for initial session results from the server
    newSocket.on('sessionResults', (data) => {
      console.log("Session Results: ", data);
      console.log(data.votesRevealed)
      setIsVotesRevealed(data.votesRevealed)
      if (userRole === 'user' && !data.votesRevealed) {
        Swal.fire({
          icon: 'info',
          title: 'Votes Not Revealed',
          text: 'Votes are not yet revealed. Please wait for the admin to reveal them.',
          confirmButtonText: 'OK',
        });
        navigate('/join');
      }
      setResults(data.questions);  // Assume data.questions contains results for each question
    });

    // Listen for real-time updates to votes
    newSocket.on('updateVotes', (updatedSession) => {
      console.log("Updated Session Results: ", updatedSession);
      setIsVotesRevealed(updatedSession.votesRevealed)
      if (userRole === 'user' && !updatedSession.votesRevealed) {
        Swal.fire({
          icon: 'info',
          title: 'Votes Not Revealed',
          text: 'Votes are not yet revealed. Please wait for the admin to reveal them.',
          confirmButtonText: 'OK',
        });
        navigate('/join');
      }
      setResults(updatedSession.questions);  // Update questions with new vote counts
    });
    newSocket.on('sessionError', (message) => {
      setMessage(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  // Generate a random color for each option if a predefined palette is not used
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Function to generate chart data for each question
  const generateChartData = (question) => {
    const labels = question.options.map(option => option.text);
    const data = question.options.map(option => option.votes);

    const backgroundColors = question.options.map(() => getRandomColor());
    const borderColors = backgroundColors.map(color => color);

    return {
      labels,
      datasets: [
        {
          label: 'Number of Votes',
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const handleRevealVotes = async () => {
    try {
      await axios.post(
        'http://localhost:4000/api/sessions/revealVotes',
        { sessionId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setIsVotesRevealed(true); // Update local state for immediate feedback
    } catch (error) {
      console.error('Error revealing votes:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // if(userRole==='user' && !isVotesRevealed){
  //   alert("Votes are not yet revealed")
  //   navigate('/');
  // }

  return (
    <div>
      {message ? <h3>{message}</h3> :
        <>
          <h3>Results for Session ID - {sessionId}</h3>
          {results.length > 0 ? (
            results.map((question, index) => (
              <div key={index} style={{ marginBottom: '40px' }}>
                <Typography variant="h6">{question.questionText}</Typography>
                <Bar
                  data={generateChartData(question)}
                  options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: question.questionText } },
                  }}
                  style={{ maxWidth: '1000px', height: '900px', margin: '0 auto' }}
                />

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  {question.options.map((option, i) => (
                    <Typography key={i} variant="body2" style={{ margin: '0 10px' }}>
                      {option.text}: {option.votes} votes
                    </Typography>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>Loading results...</p>
          )}

          {userRole === 'admin' && (
            <>
              <Button onClick={handleEndSession} variant="outlined" color="error">
                End Session
              </Button>
              <Button onClick={handleRevealVotes} variant="outlined" color="success">
                Reveal Votes
              </Button>
            </>

          )}
        </>
      }

    </div>
  );
};

export default SizebarChart;
