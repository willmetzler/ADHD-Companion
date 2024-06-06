import Signup from "./Signup";
import Login from "./Login";

function Userpanel({ setCurrentUser }) { 
    return (
        <div>
            <Signup setCurrentUser={setCurrentUser} /> 
            <br></br>
            <br></br>
            <Login setCurrentUser={setCurrentUser} />
        </div>
    )
}

export default Userpanel;