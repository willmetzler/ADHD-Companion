import { Outlet } from "react-router-dom";
import React, {useState, useEffect} from "react";
import Sidenav from './Sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

function App() {

  const [currentUser, setCurrentUser] = useState(null);

  return (
    <div className="app-container">

      <div className="sidebar">
        <Sidenav />
      </div>

      <div className="main-content">
        <Outlet context={{currentUser, setCurrentUser}}/>
      </div>

    </div>
  )
}

export default App;
