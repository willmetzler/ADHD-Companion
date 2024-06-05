import { Outlet } from "react-router-dom";
import React from "react";
import Sidenav from './Sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

function App() {
  return (
    <div className="app-container">

      <div className="sidebar">
        <Sidenav />
      </div>

      <div className="main-content">
        <Outlet />
      </div>
      
    </div>
  )
}

export default App;
