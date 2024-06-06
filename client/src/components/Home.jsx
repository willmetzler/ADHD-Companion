function Home () {
    return (
        <div className='home-container'>
            <div>
                <h1>Welcome!</h1>
            </div>
            <div className='mood-container'>
                <h2>How are you feeling today?</h2>
                <div className='mood-buttons'>
                    <button className="mood-button">😔</button>
                    <button className="mood-button">🙁</button>
                    <button className="mood-button">😐</button>
                    <button className="mood-button">🙂</button>
                    <button className="mood-button">😁</button>
                </div>
            </div>
            <div className='journal-container'>
                <h2>Todays thoughts...</h2>
                <textarea></textarea>
            </div>
            <div className="todo-container">
                <h2>Today's tasks...</h2>
                <input></input>
            </div>
        </div>
    )

}

export default Home;