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

  // Create session
  socket.on('createSession', ({ sessionId, question, options }) => {  // Consistent naming 'question'
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        question,  // Use 'question' instead of 'topic'
        options: options,  
        votes: options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
        voters: [] 
      };
      console.log(`Session ${sessionId} created with options: ${options}`);
    }
    socket.join(sessionId);
  });

  // Join session
  socket.on('joinSession', (sessionId) => {
    if (sessions[sessionId]) {
      socket.join(sessionId);
      socket.emit('sessionOptions', sessions[sessionId].options);
      console.log(`User joined session: ${sessionId}, options: ${sessions[sessionId].options}`);
    } else {
      socket.emit('sessionError', 'Session not found');
    }
  });

  // Submit vote
  socket.on('submitVote', ({ sessionId, vote }) => {
    if (sessions[sessionId]) {
      const session = sessions[sessionId];

      if (session.voters.includes(socket.id)) {
        socket.emit('voteError', 'You have already voted in this session');
        return;
      }

      if (session.votes[vote] !== undefined) {
        session.votes[vote] += 1;
        session.voters.push(socket.id);
        io.to(sessionId).emit('updateVotes', session.votes);
        console.log(`Vote received for session ${sessionId}: ${vote}`);
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
