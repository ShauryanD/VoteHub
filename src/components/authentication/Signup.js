import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function SignUp() {
  const [userName, setUserName] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:4000/api/auth/signup', {
        userName,
        fullName,
        password
      });

      Swal.fire({
        icon: 'success',
        title: 'Sign Up Successful!',
        showConfirmButton: false,
        timer: 1000,
      }).then(() => {
        navigate('/signin'); // Redirect to homepage
      });
    } catch (error) {
      console.error('Error signing up:', error.response?.data?.message || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Sign Up Failed',
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
        width:'100vw',
        backgroundColor: '#f4f4f9',
      }}
    >
      <form
        onSubmit={handleSignUp}
        style={{
          width: '400px',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign Up</h2>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Full Name:
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
          Sign Up
        </button>
        <div
          style={{
            textAlign: 'center',
            marginTop: '15px',
          }}
        >
          <span>Don't have an account? </span>
          <Link to="/signin" style={{ color: '#007bff', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
