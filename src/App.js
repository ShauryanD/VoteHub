import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import TemplatePage from './components/TemplatePage';
import CreateSessionPage from './components/CreateSessionPage';
import JoinSessionPage from './components/JoinSessionPage';
import VotingSessionPage from './components/VotingSessionPage';
import AddTemplate from './components/AddTemplate';
import Sidebar from './components/Sidebar';
import './App.css';
import { io } from 'socket.io-client';

import Results from './components/Results';
import SizebarChart from './components/SizebarChart';
import CreateProject from './components/CreateProject'
import axios from 'axios';
import SignUp from './components/authentication/Signup';
import SignIn from './components/authentication/Signin';
import {jwtDecode} from 'jwt-decode'; 
import AssignAdmin from './components/AssignAdmin';

const socket = io('http://localhost:4000');

function App() {
  const [templates, setTemplates] = useState([]);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null); // Retrieve token from localStorage
  const [userRole, setUserRole] = useState(null); // Track role (admin/user)
  const [userName, setUserName] = useState(''); // Track userName
  const [templateRefresh, settemplateRefresh] = useState(false);
  const [sessionState, setSessionState] = useState(true);
  const [activeSessions, setActiveSessions] = useState([]);

  // Decode the JWT token and set user information
  useEffect(() => {
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken);
        setUserName(decodedToken.fullName || ''); // Extract userName
        setUserRole(decodedToken.role || 'user'); // Extract role
      } catch (error) {
        console.error('Invalid token:', error);
        setAuthToken(null); // Remove invalid token
        localStorage.removeItem('authToken');
      }
    }
  }, [authToken]);

  // Fetch templates from the server
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/templates', {
          headers: { Authorization: `Bearer ${authToken}` }, // Attach token
        });
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    if (authToken) fetchTemplates();
  }, [authToken, templateRefresh]);

  // Fetch active sessions from the server
  useEffect(() => {
    const fetchUserSessions = async () => {
      try {
        console.log("Here")
        const response = await axios.get('http://localhost:4000/api/sessions/proj/user-sessions', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log(response.data)
        setActiveSessions(response.data);
      } catch (error) {
        console.error('Error fetching user sessions:', error);
      }
    };

    if (authToken) {
      fetchUserSessions();
    }
  }, [authToken,sessionState]);

  const createSession = (sessionData) => {
    // Emit the createSession event to the server with sessionData
    socket.emit('createSession', sessionData);

    // Listen for a confirmation from the server that the session has been created
    socket.once('sessionCreated', (createdSession) => {
      setActiveSessions((prevSessions) => [...prevSessions, createdSession]);
      console.log('Created Session:', createdSession);
    });
  };

  return (
    <Router>
      <div className="app-container">
        {!authToken ? (
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/signin"
              element={
                <SignIn
                  setAuthToken={(token) => {
                    localStorage.setItem('authToken', token); // Save token in localStorage
                    setAuthToken(token);
                  }}
                  setRole={setUserRole}
                />
              }
            />
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        ) : (
          <div style={{ display: 'flex', width: '100%' }}>
            <Sidebar
              userRole={userRole}
              userName={userName} // Pass userName to Sidebar
              setAuthToken={(token) => {
                localStorage.removeItem('authToken'); // Clear token on logout
                setAuthToken(null);
              }}
              activeSessions={activeSessions}
            />
            <div className="main-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <TemplatePage
                      templates={templates}
                      setTemplates={setTemplates}
                      authToken={authToken}
                    />
                  }
                />
                <Route
                  path="/create"
                  element={<CreateSessionPage createSession={createSession} authToken={authToken} />}
                />
                <Route path="/join" element={<JoinSessionPage activeSessions={activeSessions} />} />
                <Route path="/vote/:sessionId" element={<VotingSessionPage />} />
                
                
                {/* Admin-only routes */}
                {userRole === 'admin' && (
                  <>
                    <Route
                      path="/add"
                      element={<AddTemplate settemplateRefresh={settemplateRefresh} authToken={authToken} />}
                      />
                    <Route path="/assign-admin" element={<AssignAdmin authToken={authToken} userRole={userRole} />} />
                    <Route path="/create-project" element={<CreateProject authToken={authToken} />} />
                  </>
                )}
                <Route path="/resultview" element={<Results />} />
                <Route
              path="/result/:sessionId"
              element={<SizebarChart setSessionState={setSessionState} userRole={userRole} authToken={authToken} />}
            />

                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
