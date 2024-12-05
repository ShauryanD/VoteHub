import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Container, Typography, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

function AssignAdmin({ authToken, userRole }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/users', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log(response.data)
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [authToken, userRole]);

  const handleAssignAdmin = async () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:4000/api/users/${selectedUser}/assign-admin`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      Swal.fire({
        icon: 'success',
        title: 'Successfully assigned admin',
        showConfirmButton: false,
        timer: 1000,
      })
      setSelectedUser(''); // Reset selection
    } catch (error) {
      console.error('Error assigning admin role:', error);
      alert('Error assigning admin role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return <Typography variant="h5">You do not have permission to access this page.</Typography>;
  }

  return (
    <Container style={{ marginTop: '50px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Assign Admin Role
      </Typography>
      <FormControl style={{ width: '300px', marginBottom: '20px' }}>
        <InputLabel id="user-select-label">Select User</InputLabel>
        <Select
          labelId="user-select-label"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          {users.map((user) => (
            <MenuItem key={user._id} value={user._id}>
              {user.fullName} 
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAssignAdmin}
        disabled={loading}
      >
        {loading ? 'Assigning...' : 'Assign Admin'}
      </Button>
    </Container>
  );
}

export default AssignAdmin;
