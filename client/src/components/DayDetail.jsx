import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DayDetail() {
    const { date } = useParams();
    const [journalEntries, setJournalEntries] = useState([]);
    const [moodRating, setMoodRating] = useState(null);

    useEffect(() => {
        console.log(`Selected date: ${date}`);

        const fetchJournalEntries = async () => {
            const response = await fetch('/api/journals');
            if (response.ok) {
                const data = await response.json();
                console.log('Journal Entries:', data);
                const filteredEntries = data.filter(entry => {
                    const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
                    return entryDate === date;
                });
                console.log('Filtered Journal Entries:', filteredEntries);
                setJournalEntries(filteredEntries);
            }
        };

        const fetchMoodRating = async () => {
            const response = await fetch('/api/mood-ratings');
            if (response.ok) {
                const data = await response.json();
                console.log('Mood Ratings:', data);
                const mood = data.filter(entry => {
                    const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
                    return entryDate === date;
                });
                console.log('Selected Mood:', mood[mood.length - 1]);
                setMoodRating(mood.length ? mood[mood.length - 1].mood : null);
            }
        };

        fetchJournalEntries();
        fetchMoodRating();
    }, [date]);

    const formatDate = (inputDate) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(inputDate.replace(/-/g,'\/')).toLocaleDateString('en-US', options);
        return formattedDate;
    };

    return (
        <div>
            <h1>Details for {formatDate(date)}</h1>
            <h2>Mood Rating: {moodRating ? moodRating : 'No mood rating available'}</h2>
            <h2>Journal Entries:</h2>
            {journalEntries.length > 0 ? (
                journalEntries.map(entry => (
                    <div key={entry.id}>
                        <h3>{entry.journal_header}</h3>
                        <p>{entry.journal_text}</p>
                    </div>
                ))
            ) : (
                <p>No journal entry available</p>
            )}
        </div>
    );
}

export default DayDetail;