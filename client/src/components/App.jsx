import { Outlet } from 'react-router-dom'
import React from "react";
import Sidenav from './Sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

function App() {
  return (
    <div>
      <Sidenav/>
    </div>
  )
}

export default App;
