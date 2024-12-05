import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function SignIn({ setAuthToken, setRole }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:4000/api/auth/signin', {
        userName,
        password,
      });

      if (response && response.data) {
        const { token, role } = response.data;
        setAuthToken(token);
        setRole(role);

        // Store the token in localStorage for persistence
        localStorage.setItem('authToken', token);
        let targetPath = '/'; // Default for admins
        if (role === 'user') {
          targetPath = '/join'; // Redirect path for users
        }

        Swal.fire({
          icon: 'success',
          title: 'Sign In Successful!',
          showConfirmButton: false,
          timer: 1000,
        })
        navigate(targetPath);
        
      } else {
        throw new Error('Invalid response from the server.');
      }
    } catch (error) {
      console.error('Error signing in:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
        showConfirmButton: true,
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f4f4f9',
      }}
    >
      <form
        onSubmit={handleSignIn}
        style={{
          width: '400px',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign In</h2>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Username:
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            style={{
              width: '97%',
              padding: '8px',
              marginTop: '5px',
              marginBottom: '15px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '97%',
              padding: '8px',
              marginTop: '5px',
              marginBottom: '15px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
        <div
          style={{
            textAlign: 'center',
            marginTop: '15px',
          }}
        >
          <span>Don't have an account? </span>
          <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignIn;
