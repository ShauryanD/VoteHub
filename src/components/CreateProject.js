import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import Swal from 'sweetalert2';

function CreateProject({ authToken }) {
  const [projectName, setProjectName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [authToken]);

  const handleCreateProject = async () => {
    if (!projectName || selectedUsers.length === 0) {
      alert('Project name and at least one team member are required');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:4000/api/proj/projects',
        { name: projectName, members: selectedUsers },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Created Project',
        showConfirmButton: false,
        timer: 1000,
      })
      setProjectName('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project: ' + error.message);
    }
  };

  return (
    <Container style={{ marginTop: '50px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Create Project
      </Typography>

      <TextField
        label="Project Name"
        variant="outlined"
        fullWidth
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      <FormControl fullWidth style={{ marginBottom: '20px' }}>
        <InputLabel>Select Team Members</InputLabel>
        <Select
          multiple
          value={selectedUsers}
          onChange={(e) => setSelectedUsers(e.target.value)}
          renderValue={(selected) =>
            users
              .filter((user) => selected.includes(user._id))
              .map((user) => user.fullName)
              .join(', ')
          }
          label="Select Team Members"
        >
          {users.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.fullName} ({user.userName})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleCreateProject}>
        Create Project
      </Button>
    </Container>
  );
}

export default CreateProject;
