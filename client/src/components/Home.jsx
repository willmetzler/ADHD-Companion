import React, { useState } from 'react';

function Home() {
    const [mood, setMood] = useState(3); 
    const [journalText, setJournalText] = useState('');

    const handleMoodChange = (newMood) => {
        setMood(newMood);
    };

    const handleJournalTextChange = (event) => {
        setJournalText(event.target.value);
    };

    const handleMoodSubmit = () => {
        fetch('/api/mood-ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mood }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Mood rating submitted:', data);
            })
            .catch((error) => {
                console.error('Error submitting mood rating:', error);
            });
    };

    const handleJournalSubmit = () => {
        fetch('/api/journals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ journal_header: 'Daily Entry', journal_text }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Journal entry submitted:', data);
            })
            .catch((error) => {
                console.error('Error submitting journal entry:', error);
            });
    };

    return (
        <div className='home-container'>
            <div>
                <h1>Welcome!</h1>
            </div>
            <div className='mood-container'>
                <h2>How are you feeling today?</h2>
                <div className='mood-buttons'>
                    <button className={`mood-button ${mood === 1 ? 'selected' : ''}`} onClick={() => handleMoodChange(1)}>😔</button>
                    <button className={`mood-button ${mood === 2 ? 'selected' : ''}`} onClick={() => handleMoodChange(2)}>🙁</button>
                    <button className={`mood-button ${mood === 3 ? 'selected' : ''}`} onClick={() => handleMoodChange(3)}>😐</button>
                    <button className={`mood-button ${mood === 4 ? 'selected' : ''}`} onClick={() => handleMoodChange(4)}>🙂</button>
                    <button className={`mood-button ${mood === 5 ? 'selected' : ''}`} onClick={() => handleMoodChange(5)}>😁</button>
                </div>
                <br></br>
                <button onClick={handleMoodSubmit}>Submit</button>
            </div>
            <br></br>
            <br></br>
            <div className='journal-container'>
                <h2>Today's thoughts...</h2>
                <textarea
                    className='journal-text-field'
                    value={journalText}
                    onChange={handleJournalTextChange}
                    placeholder='Write your thoughts here...'
                ></textarea>
                <br></br>
                <br></br>
                <button onClick={handleJournalSubmit}>Submit</button>
            </div>
        </div>
    );
}

export default Home;

