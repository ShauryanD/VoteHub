// src/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
  },
});

let sessions = {}; 

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  
  socket.on('createSession', ({ sessionId, topic, options }) => {
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        topic,
        options: options,  
        votes: options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}), 
        voters: [] 
      };
      console.log(`Session ${sessionId} created with options: ${options}`);
    }
    socket.join(sessionId);
  });

  
  
socket.on('joinSession', (sessionId) => {
    if (sessions[sessionId]) {
      socket.join(sessionId);
     
      socket.emit('sessionOptions', sessions[sessionId].options);
      console.log(`User joined session: ${sessionId}, options: ${Object.keys(sessions[sessionId].options)}`);
    } else {
      socket.emit('sessionError', 'Session not found');
    }
  });
  

  // Handle vote submission
  socket.on('submitVote', ({ sessionId, vote }) => {
    if (sessions[sessionId]) {
      const session = sessions[sessionId];

      // Check if the user has already voted
      if (session.voters.includes(socket.id)) {
        socket.emit('voteError', 'You have already voted in this session');
        return;
      }

      // Count the vote
      if (session.votes[vote] !== undefined) {
        session.votes[vote] += 1;
        session.voters.push(socket.id); // Track the voter

        // Emit updated vote counts to everyone in the session
        io.to(sessionId).emit('updateVotes', session.votes);

        console.log(`Vote received for session ${sessionId}: ${vote}`);
        console.log(`Current votes for session ${sessionId}:`, session.votes);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
