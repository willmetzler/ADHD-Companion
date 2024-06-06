import { useState } from 'react'
import {useOutletContext} from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

function Login({setCurrentUser}) {

    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
    
        fetch('/api/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json' 
        },
        body: JSON.stringify({ user, password })
        }).then(res => {
        if (res.ok) {
            res.json().then(user => {
            setCurrentUser(user);
            navigate('/home'); 
            });
        } else {
            alert('Invalid username or password');
        }
        });
    }

    return (
    <div className="login-container">
        <form className='user-form' onSubmit={handleSubmit}>

            <h2>Log In</h2>

            <input type="text"
            onChange={e => setUser(e.target.value)}
            value={user}
            placeholder='Username'
            />
            <br></br>
            <br></br>
            <input type="password"
            onChange={e => setPassword(e.target.value)}
            value={password}
            placeholder='Password'
            />
            <br></br>
            <br></br>
            <input type="submit"
            value='Login'
            />

        </form>
    </div>
    )
}

export default Login;