import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';  // Separate CSS for Sidebar or you can put styles in App.css

function Sidebar() {
  return (
    <div className="sidebar">
      <ul className="menu">
        <li><Link to="/">Templates</Link></li>
        <li><Link to="/create">Create Session</Link></li>
        <li><Link to="/join">Join Session</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
