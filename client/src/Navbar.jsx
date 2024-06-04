import { Link } from 'react-router-dom'

function Navbar () {
    return (
        <div>
            <Link className='navbar' to="/">Home</Link>
        </div>
    )
}

export default Navbar;