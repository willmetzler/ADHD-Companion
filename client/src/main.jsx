import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App.jsx';
import Home from './components/Home.jsx';
import Profile from './components/Profile.jsx';
import Calendar from './components/Calendar.jsx';
import Diary from './components/Diary.jsx';
import Medications from './components/Medications.jsx';
import Signup from './components/Signup.jsx';
import Login from './components/Login.jsx';
import Userpanel from './components/Userpanel.jsx';
import DayDetail from './components/DayDetail.jsx';
import Todo from './components/Todo.jsx';
import Sidenav from './components/Sidenav.jsx';
import './index.css';

import { createBrowserRouter, RouterProvider, Outlet, Route } from 'react-router-dom';

//ROUTES
const routes = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                path: 'home',
                element: <Home />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'calendar',
                element: <Calendar />
            },
            {
                path: 'diary',
                element: <Diary />
            },
            {
                path: 'medications',
                element: <Medications />
            },
            {
                path: 'todo',
                element: <Todo />
            },
            {
                path: 'signup',
                element: <Signup />
            },
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'userpanel',
                element: <Userpanel />
            },
            {
                path: 'day/:date',
                element: <DayDetail />
            }
        ]
    }
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router}>
            <Sidenav /> 
            <Outlet /> 
        </RouterProvider>
    </React.StrictMode>
);