import React, { useState, useEffect } from 'react';

function Home() {
    const [mood, setMood] = useState(3); 
    const [journalHeader, setJournalHeader] = useState('');
    const [journalText, setJournalText] = useState('');

    const handleMoodChange = (newMood) => {
        setMood(newMood);
    };

    const handleJournalHeaderChange = (event) => {
        setJournalHeader(event.target.value);
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
            body: JSON.stringify({ journal_header: journalHeader, journal_text: journalText,}), 
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Journal entry submitted:', data);
                setJournalHeader('');
                setJournalText('');
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
                    <button style={{backgroundColor:'#e35337'}} className={`mood-button ${mood === 1 ? 'selected' : ''}`} onClick={() => handleMoodChange(1)}>😔</button>
                    <button style={{backgroundColor:'#ef9c0e'}} className={`mood-button ${mood === 2 ? 'selected' : ''}`} onClick={() => handleMoodChange(2)}>🙁</button>
                    <button style={{backgroundColor:'#ece13b'}} className={`mood-button ${mood === 3 ? 'selected' : ''}`} onClick={() => handleMoodChange(3)}>😐</button>
                    <button style={{backgroundColor:'#afe48e'}} className={`mood-button ${mood === 4 ? 'selected' : ''}`} onClick={() => handleMoodChange(4)}>🙂</button>
                    <button style={{backgroundColor:'#26e616'}} className={`mood-button ${mood === 5 ? 'selected' : ''}`} onClick={() => handleMoodChange(5)}>😁</button>
                </div>
                <br></br>
                <button style={{scale:'125%', marginLeft:'1em'}} onClick={handleMoodSubmit}>Submit</button>
            </div>
            <div className='journal-container'>
                <h2>Today's thoughts...</h2>
                <input
                    type='text'
                    value={journalHeader}
                    onChange={handleJournalHeaderChange}
                    placeholder='Journal Entry Header'
                    className="large-placeholder"
                    style={{height:'1.5em', width:'15em' }}
                />
                <br></br>
                <br></br>
                <textarea
                    className='journal-text-field'
                    value={journalText}
                    onChange={handleJournalTextChange}
                    placeholder='Write your thoughts here...'
                ></textarea>
                <br></br>
                <br></br>
                <button style={{scale:'125%', marginLeft:'1em'}} onClick={handleJournalSubmit}>Submit</button>
            </div>
            <div>
                <h2>Add a Task...</h2>
            </div>
        </div>
    );
}

export default Home;