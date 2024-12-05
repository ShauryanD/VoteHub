import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Sidebar.css'; // Assuming you have Sidebar styling here

function Sidebar({ userRole, userName, setAuthToken, activeSessions }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      icon: "success",
      text: "Logged Out Successfully",
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear the JWT token and navigate to sign-in page
        setAuthToken(null);

        localStorage.removeItem('authToken');
        navigate('/signin');
      }
    });
  };

  return (
    <div className="sidebar">
      <ul className="menu">
        {userRole === 'admin' && (
          <>
            <Link to="/"><li>Templates</li></Link>
            <Link to="/add"><li>Add New Template</li></Link>
            <Link to="/create-project"><li>Create Project</li></Link>
            <Link to="/assign-admin"><li>Assign Admin</li></Link>
          </>
        )}
        <Link to="/resultview"><li>View Result</li></Link>
        <Link to="/join"><li>Join Session</li></Link>
        {/* {userRole === 'admin' && <Link to="/admin"><li>Admin Panel</li></Link>} */}
        <li onClick={handleLogout} style={{ cursor: 'pointer', color: 'white' }}>
          Logout
        </li>
      </ul>
      <div style={{ margin: "15px", padding: "10px" }}>
        {/* About the user section */}
        <div style={{ marginBottom: "30px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "20px", fontWeight: 300 }}>About the User</div>
          <div>Name: {userName}</div>

        </div>

        {/* Active Sessions section */}
        {/* <div style={{ marginBottom: "30px" }}>
          <div style={{ fontSize: "15px" }}>Active Sessions:</div>
          {activeSessions?.length > 0 ? (
            activeSessions.map((session) => (
              <div key={session.sessionId} style={{ margin: "5px 0" }}>
                <Link
                  style={{ textDecoration: "none", color: "white" }}
                  to={`/vote/${session.sessionId}`}
                >
                  {session.sessionId}
                </Link>
              </div>
            ))
          ) : (
            <p style={{ opacity: "50%" }}>No active sessions</p>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default Sidebar;
