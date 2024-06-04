import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faCalendar, faPills } from '@fortawesome/free-solid-svg-icons';

function Sidenav() {
    return (
        <SideNav
        onSelect={selected=> {
            console.log(selected)
        }}
        >
            <SideNav.Toggle />
            <SideNav.Nav defaultSelected='home'>
                <NavItem eventKey='home'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faHome} style={{ fontSize: '1.5em' }} />
                    </NavIcon>
                    <NavText>Home</NavText>
                </NavItem>
                <NavItem eventKey='profile'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faUser} style={{ fontSize: '1.5em' }} />
                    </NavIcon>
                    <NavText>Profile</NavText>
                </NavItem>
                <NavItem eventKey='calendar'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faCalendar} style={{ fontSize: '1.5em' }} />
                    </NavIcon>
                    <NavText>Calendar</NavText>
                </NavItem>
                <NavItem eventKey='medications'>
                    <NavIcon>
                        <FontAwesomeIcon icon={faPills} style={{ fontSize: '1.5em' }} />
                    </NavIcon>
                    <NavText>Medications</NavText>
                </NavItem>
            </SideNav.Nav>
        </SideNav>
    )
}

export default Sidenav;