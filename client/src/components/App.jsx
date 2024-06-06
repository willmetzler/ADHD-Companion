import { Outlet, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Sidenav from './Sidenav';
import Userpanel from "./Userpanel";
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check if a user is already logged in
  useEffect(() => {
    fetch('/api/get-session')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('User not logged in');
        }
      })
      .then(user => {
        setCurrentUser(user);
        navigate('/home');
      })
      .catch(error => {
        // User not logged in
        setCurrentUser(null);
      });
  }, []);

  // Render different content based on whether a user is logged in or not
  return (
    <div className="app-container">
      {currentUser ? (
        <>
          <div className="sidebar">
            <Sidenav />
          </div>
          <div className="main-content">
            <Outlet context={{ currentUser, setCurrentUser }} />
          </div>
        </>
      ) : (
        <Userpanel setCurrentUser={setCurrentUser} />
      )}
    </div>
  );
}

export default App;

