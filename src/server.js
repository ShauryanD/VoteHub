const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const Template = require('./models/Template');
const Session = require('./models/Session');  // Import the Session model
const Project = require('./models/Project');  // Import the Project model
const User = require('./models/User');  // Import the Session model
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const { authenticate, authorizeAdmin } = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Your frontend URL
    methods: ["GET", "POST"],
  },
});

// const mongoUri = process.env.MONGODB_URI;
// const mongoUri = "mongodb+srv://yashthegreat0708:nY21fDBwc1VDLQpJ@agile-project.yl3jh.mongodb.net/?retryWrites=true&w=majority&appName=Agile-Project";




// mongoose.connect(mongoUri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('Connected to MongoDB'))
//   .catch(error => console.error('MongoDB connection error:', error));

const mongoURI = "mongodb+srv://yashthegreat0708:nY21fDBwc1VDLQpJ@agile-project.yl3jh.mongodb.net/?retryWrites=true&w=majority&appName=Agile-Project";


mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Projects
app.use('/api/proj', projectRoutes);
// Authentication 

app.use('/api/auth', authRoutes);


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle creating a session
  socket.on('createSession', async ({ sessionId, questions,allowMultipleVotes,project }) => {
    try {
      // Check if the session already exists in the database
      let session = await Session.findOne({ sessionId });
      if (!session) {
        // Initialize a new session document
        session = new Session({
          sessionId,
          project,
          questions: questions.map((question) => ({
            questionText: question.questionText,
            options: question.options.map((option) => ({
              text: option,
              votes: 0  // Initialize votes for each option
            }))
          })),
          creator: socket.id,
          voters: [],
          allowMultipleVotes
        });
        await session.save();
        console.log(`Session ${sessionId} created and stored in MongoDB.`);
      }
      
      // Join the session room and notify client
      socket.join(sessionId);
      socket.emit('sessionCreated', session);
    } catch (error) {
      console.error('Error creating session:', error);
      socket.emit('sessionError', 'Error creating session');
    }
  });

  // Handle joining a session
  socket.on('joinSession', async (sessionId) => {
    try {
      const session = await Session.findOne({ sessionId });
      if (session) {
        socket.join(sessionId);
        socket.emit('sessionDetails', {
          sessionId: session.sessionId,
          project:session.project,
          questions: session.questions.map((question) => ({
            questionText: question.questionText,
            options: question.options.map(option => ({
              text: option.text,
              votes: option.votes
            }))
          })),
          creator: session.creator
        });
        console.log(`Session details sent for session ${sessionId}`);
      } else {
        socket.emit('sessionError', 'Session not found');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      socket.emit('sessionError', 'Error joining session');
    }
  });

  // Handle vote submission
  socket.on('submitVote', async ({ sessionId, votes, userUUID }) => {
    try {
      const session = await Session.findOne({ sessionId });

      if (!session) {
        socket.emit('voteError', 'Session not found');
        return;
      }

      if (!session.allowMultipleVotes && session.voters.includes(userUUID)) {
        socket.emit('voteError', 'You have already voted in this session');
        return;
      }

      // Update votes for each question and option
      votes.forEach(({ questionIndex, optionText }) => {
        const question = session.questions[questionIndex];
        if (question) {
          const option = question.options.find(opt => opt.text === optionText);
          if (option) {
            option.votes += 1;
          }
        }
      });

      // Add the user to the voters list and save the session
      if (!session.allowMultipleVotes) {
        session.voters.push(userUUID);
      }
      await session.save();

      io.to(sessionId).emit('updateVotes', session);
      
      console.log(`Votes recorded for session ${sessionId}`);
    } catch (error) {
      console.error('Error submitting vote:', error);
      socket.emit('voteError', 'Error submitting vote');
    }
  });

  // Handle fetching session results
  socket.on('getResults', async ({ sessionId }) => {
    try {
      const session = await Session.findOne({ sessionId });
      if (session) {
        console.log("Sending Session Results: ",session)
        socket.emit('sessionResults', { questions: session.questions,votesRevealed:session.votesRevealed });
      } else {
        socket.emit('sessionError', 'Session Ended');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      socket.emit('sessionError', 'Error fetching results');
    }
  });

  socket.on('endSession', async ({ sessionId }) => {
    try {
      // Find and delete the session from the database
      const session = await Session.findOneAndDelete({ sessionId });
  
      if (session) {
        // Broadcast to all users in the session that it has ended
        io.to(sessionId).emit('sessionEnded', { message: 'This session has ended and has been deleted.' });
        console.log(`Session ${sessionId} deleted and ended.`);
      } else {
        socket.emit('endSessionError', 'Session not found.');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      socket.emit('endSessionError', 'Error deleting session.');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.post('/api/templates/add-template',authenticate, async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    // Check if a template with the same title already exists
    let template = await Template.findOne({ title });

    if (template) {
      // If template exists, update it
      template.description = description;
      template.questions = questions;
      const updatedTemplate = await template.save();
      res.status(200).json({ message: 'Template updated successfully', template: updatedTemplate });
    } else {
      // If template does not exist, create a new one
      const newTemplate = new Template({ title, description, questions });
      const savedTemplate = await newTemplate.save();
      res.status(201).json({ message: 'Template created successfully', template: savedTemplate });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to get all templates
app.get('/api/templates',authenticate, async (req, res) => {
  try {
    const templates = await Template.find();  // Fetch all templates from MongoDB
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions',authenticate, async (req, res) => {
  try {
    const sessions = await Session.find();  // Fetch all sessions from MongoDB
    res.status(200).json(sessions);  // Send all sessions as JSON response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get a specific session by sessionId
app.get('/api/sessions/:sessionId',authenticate, async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await Session.findOne({ sessionId });
    if (session) {
      res.status(200).json(session);
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/proj/user-sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log(userId);

    // Get all projects associated with the user
    const projects = await Project.find({ members: userId }).select('_id');
    
    const projectIds = projects.map((project) => project._id);

    
    const sessions = await Session.find({ project: { $in: projectIds } })
      .populate('project', 'name')  
      .exec();

    
    const sessionData = sessions.map(session => ({
      sessionId: session.sessionId,
      projectName: session.project.name,  
    }));

    res.status(200).json(sessionData);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ message: 'Error fetching user sessions' });
  }
});


app.delete('/api/templates/:templateId',authenticate, async (req, res) => {
  try {
    const { templateId } = req.params;
    await Template.findByIdAndDelete(templateId);
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting template' });
  }
});

app.post('/api/sessions/revealVotes',authenticate,authorizeAdmin, async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Update the session to set votesRevealed to true
    const session = await Session.findOneAndUpdate(
      { sessionId },
      { votesRevealed: true },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Notify all users in the session
    res.status(200).json({ message: 'Votes revealed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


app.get('/api/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});
app.post('/api/users/:id/assign-admin', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'admin'; // Assign admin role
    await user.save();

    res.json({ message: 'User assigned as admin successfully' });
  } catch (error) {
    console.error('Error assigning admin role:', error);
    res.status(500).json({ message: 'Failed to assign admin role' });
  }
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
