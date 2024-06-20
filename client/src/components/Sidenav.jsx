import React from 'react';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faCalendar, faBook, faPills, faCheck} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidenav() {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    const sideNavStyles = {
        backgroundColor: '#2596be',
        color: '#fff',
    };
    const iconStyle = {
        fontSize: '1.5em',
        color: '#fff' 
    };
    const textStyle = {
        color: '#fff'
    };

    const getDefaultSelected = () => {
        if (location.pathname.includes('/day/')) {
            return ''; // No highlight when on a DayDetail page
        }
        const path = location.pathname.replace('/', '');
        return path || 'home';
    };

    return (
        <SideNav
            style={sideNavStyles}
            onSelect={selected => {
                console.log(selected);
                navigate('/' + selected);
            }}
            defaultSelected={getDefaultSelected()} // Set default selected item dynamically
        >
            <SideNav.Toggle />
            <SideNav.Nav>
                <NavItem eventKey='home'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faHome} style={iconStyle} />
                    </NavIcon>
                    <NavText style={textStyle}>Home</NavText>
                </NavItem>
                <NavItem eventKey='calendar'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faCalendar} style={iconStyle} />
                    </NavIcon>
                    <NavText style={textStyle}>Calendar</NavText>
                </NavItem>
                <NavItem eventKey='diary'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faBook} style={iconStyle} />
                    </NavIcon>
                    <NavText style={textStyle}>Diary</NavText>
                </NavItem>
                <NavItem eventKey='medications'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faPills} style={iconStyle} />
                    </NavIcon>
                    <NavText style={textStyle}>Medications</NavText>
                </NavItem>
                <NavItem eventKey='todo'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faCheck} style={iconStyle} />
                    </NavIcon>
                    <NavText style={textStyle}>To-Do List</NavText>
                </NavItem>
                <NavItem eventKey='profile'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faUser} style={iconStyle} />
                    </NavIcon>
                    <NavText style={textStyle}>Profile</NavText>
                </NavItem>
            </SideNav.Nav>
        </SideNav>
    );
}

export default Sidenav;