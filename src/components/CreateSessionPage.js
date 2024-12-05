import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Button,
  TextField,
  Typography,
  Grid,
  IconButton,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import axios from 'axios';

function CreateSessionPage({ createSession, authToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState(''); // Session ID input by user
  const [questions, setQuestions] = useState([]); // Questions from template
  const [newOption, setNewOption] = useState(''); // New option for a question
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false); // Track multiple votes setting
  const [projects, setProjects] = useState([]); // List of all projects
  const [selectedProject, setSelectedProject] = useState(''); // Selected project ID
  const [teamMembers, setTeamMembers] = useState([]); // Team members of selected project
  const [allUsers, setAllUsers] = useState([]); // All available users
  const [selectedUser, setSelectedUser] = useState(''); // User to add

  // Fetch all projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/proj/projects', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [authToken]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setAllUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [authToken]);

  // Fetch team members when a project is selected
  useEffect(() => {
    if (selectedProject) {
      const fetchTeamMembers = async () => {
        try {
          const response = await axios.get(`http://localhost:4000/api/proj/projects/${selectedProject}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          console.log(response.data.members)
          setTeamMembers(response.data.members || []);
        } catch (error) {
          console.error('Error fetching team members:', error);
        }
      };

      fetchTeamMembers();
    }
  }, [selectedProject, authToken]);

  // Prefill the questions with a template passed via location state
  const template = location.state?.template;
  useEffect(() => {
    if (template?.questions) {
      const initialQuestions = template.questions.map((question) => ({
        questionText: question.questionText,
        options: question.options.map((option) => option.text),
      }));
      setQuestions(initialQuestions);
    } else {
      setQuestions([]);
    }
  }, [template]);

  const handleAddOption = (index) => {
    if (newOption.trim()) {
      const updatedQuestions = [...questions];
      updatedQuestions[index].options.push(newOption);
      setQuestions(updatedQuestions);
      setNewOption('');
    }
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, index) => index !== optionIndex);
    setQuestions(updatedQuestions);
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(
        `http://localhost:4000/api/proj/projects/${selectedProject}/add-member`,
        { userId: selectedUser },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const updatedTeamMembers = [...teamMembers, allUsers.find((user) => user._id === selectedUser)];
      setTeamMembers(updatedTeamMembers);
      setSelectedUser('');
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.put(
        `http://localhost:4000/api/proj/projects/${selectedProject}/remove-member`,
        { userId: memberId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setTeamMembers(teamMembers.filter((member) => member._id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!selectedProject) {
      alert('Please select a project.');
      return;
    }

    const finalSessionId = sessionId || Date.now(); // Generate ID if not provided
    const joinLink = `http://localhost:3000/vote/${finalSessionId}`;

    const sessionData = {
      sessionId: finalSessionId,
      project: selectedProject,
      questions,
      allowMultipleVotes, // Include multiple votes setting
    };

    createSession(sessionData);

    Swal.fire({
      icon: 'success',
      title: 'Session Created!',
      html: `
        <p>Join Session Link:</p>
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
          <span>${joinLink}</span>
          <button id="copyLink" style="padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Copy Link
          </button>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'OK',
    }).then(() => {
      navigate('/');
    });
    document.addEventListener('click', (event) => {
      if (event.target && event.target.id === 'copyLink') {
        navigator.clipboard.writeText(joinLink).then(() => {
          Swal.fire({
            icon: 'success',
            text: 'Link copied to clipboard!',
            timer: 1000,
            showConfirmButton: false,
          });
        });
      }
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Create a New Voting Session
      </Typography>

      <TextField
        label="Session ID (optional)"
        variant="outlined"
        fullWidth
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {/* <Typography variant="h6" gutterBottom>
        Select Project
      </Typography> */}
      <FormControl style={{ width: '300px', marginBottom: '20px' }}>
      <InputLabel id="project">Select Project</InputLabel>
      <Select
        fullWidth
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        style={{ marginBottom: '20px' }}
        labelId='project'
        label='Select Project'
      >
        {projects.map((project) => (
          <MenuItem key={project._id} value={project._id}>
            {project.name}
          </MenuItem>
        ))}
      </Select>
      </FormControl>

      {teamMembers.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Team Members
          </Typography>
          <Grid container  style={{ marginBottom: '20px' }}>
            {teamMembers.map((member) => (
              <Grid item key={member._id} xs={12} sm={6} md={2} style={{
                width:"30px",
              }}>
                <Button variant="outlined" >
                  {member.fullName} 
                </Button>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleRemoveMember(member._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            ))}
          </Grid>
          
          
        </>
      )}
      {allUsers && selectedProject && (
            <>
            {/* <Typography variant="h6" gutterBottom>
        Add New Member
      </Typography> */}
      <FormControl style={{ display:"block", width: '500px', marginBottom: '20px' }}>
      <InputLabel id="member">Add new member</InputLabel>
      <Select
        fullWidth
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        style={{ marginBottom: '20px' }}
        labelId='member'
        label='Add new member'
      >
        {allUsers
          .filter((user) => !teamMembers.some((member) => member._id === user._id))
          .map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.fullName} ({user.userName})
            </MenuItem>
          ))}
      </Select>
      <Button  variant="outlined" color="primary" onClick={handleAddMember} style={{ marginBottom: '20px' }}>
        Add Member
      </Button>
      </FormControl>
            </>
          )}

      

      {questions.map((question, questionIndex) => (
        <div key={questionIndex} style={{ marginBottom: '20px' }}>
          <Typography variant="h6" gutterBottom>
            {question.questionText}
          </Typography>

          <Grid container spacing={2}>
            {question.options.map((option, optionIndex) => (
              <Grid item key={optionIndex} xs={12} sm={6} display="flex" alignItems="center">
                <Button variant="outlined" fullWidth disabled>
                  {option}
                </Button>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            ))}
          </Grid>

          <TextField
            label="Add Option"
            variant="outlined"
            fullWidth
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            style={{ marginTop: '10px', marginBottom: '10px' }}
          />
          <Button variant="outlined" color="primary" onClick={() => handleAddOption(questionIndex)}>
            Add Option
          </Button>
        </div>
      ))}

      {/* <FormControlLabel
        control={<Checkbox checked={allowMultipleVotes} onChange={(e) => setAllowMultipleVotes(e.target.checked)} />}
        label="Allow users to vote multiple times"
        style={{ marginTop: '20px' }}
      /> */}

      <Button variant="contained" color="primary" fullWidth onClick={handleFormSubmit} style={{ marginTop: '40px' }}>
        Create Session
      </Button>
    </Container>
  );
}

export default CreateSessionPage;
