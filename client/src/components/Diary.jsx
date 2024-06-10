import React, { useState, useEffect } from 'react';

function Diary() {
    const [journalEntries, setJournalEntries] = useState([]);

    useEffect(() => {
        fetch('/api/journals')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch journal entries');
                }
            })
            .then(data => {
                setJournalEntries(data);
            })
            .catch(error => {
                console.error('Error fetching journal entries:', error);
            });
    }, []);

    const formatDateTime = (dateTimeString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use user's time zone
        };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dateTimeString));
    };
    

    return (
        <div>
            <h1>Diary</h1>
                <div className='diary-container'>
                    {journalEntries.map(entry => (
                        <div className="diary-content" key={entry.id}>
                            <h3>{entry.journal_header}</h3>
                            <p>{entry.journal_text}</p>
                            <p>Posted: {formatDateTime(entry.created_at)}</p>
                        </div>
                    ))}
                </div>
        </div>
    );
}

export default Diary;