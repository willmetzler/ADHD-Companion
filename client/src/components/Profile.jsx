import {useOutletContext } from 'react-router-dom'

function Profile () {

    const{currentUser} =useOutletContext()
    const{setCurrentUser} =useOutletContext()

    function handleLogout() {
        setCurrentUser(null)
        fetch('/api/logout', { method: 'DELETE' })
    }

    return (
        <div>
            <h1>Profile</h1>
            <div>
                <h2>Account Details</h2>
                <div>
                    <h3>Username: {currentUser.username}</h3>
                    <h3>First Name: {currentUser.first_name}</h3>
                    <h3>Last Name: {currentUser.last_name}</h3>
                </div>
            </div>
            <div className='logout'>
                {currentUser && <button onClick={handleLogout}>Logout</button>}
            </div>
        </div>
    )

}

export default Profile;