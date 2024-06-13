import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DayDetail() {
    const { date } = useParams();
    const [journalEntries, setJournalEntries] = useState([]);
    const [moodRating, setMoodRating] = useState(null);
    const [editMode, setEditMode] = useState({});
    const [editedContent, setEditedContent] = useState({});

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

    const getMoodEmoji = (rating) => {
        switch (rating) {
            case 1:
                return '😔';
            case 2:
                return '🙁';
            case 3:
                return '😐';
            case 4:
                return '🙂';
            case 5:
                return '😁';
            default:
                return '';
        }
    };

    const formatDate = (inputDate) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(inputDate.replace(/-/g,'\/')).toLocaleDateString('en-US', options);
        return formattedDate;
    };

    const handleEdit = (entryId, entry) => {
        setEditMode(prevState => ({
            ...prevState,
            [entryId]: true
        }));
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                journal_header: entry.journal_header,
                journal_text: entry.journal_text
            }
        }));
    };

    const handleSaveEdit = async (entryId) => {
        try {
            const response = await fetch(`/api/journals/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    journal_header: editedContent[entryId].journal_header,
                    journal_text: editedContent[entryId].journal_text
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to save edited entry');
            }
    
            const updatedEntries = [...journalEntries];
            const updatedEntryIndex = updatedEntries.findIndex(entry => entry.id === entryId);
            if (updatedEntryIndex !== -1) {
                updatedEntries[updatedEntryIndex].journal_header = editedContent[entryId].journal_header;
                updatedEntries[updatedEntryIndex].journal_text = editedContent[entryId].journal_text;
                setJournalEntries(updatedEntries);
            }
    
            setEditMode(prevState => ({
                ...prevState,
                [entryId]: false
            }));
        } catch (error) {
            console.error('Error saving edited entry:', error);
        }
    };
    
    const handleCancelEdit = (entryId) => {
        setEditMode(prevState => ({
            ...prevState,
            [entryId]: false
        }));
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: null
        }));
    };

    const handleHeaderChange = (entryId, value) => {
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                ...prevState[entryId],
                journal_header: value
            }
        }));
    };

    const handleTextChange = (entryId, value) => {
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                ...prevState[entryId],
                journal_text: value
            }
        }));
    };

    const handleDelete = async (entryId) => {
        try {
            const response = await fetch(`/api/journals/${entryId}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete entry');
            }
    
            const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
            setJournalEntries(updatedEntries);
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    return (
        <div>
            <h1>{formatDate(date)}</h1>
            <h2>Mood Rating: {moodRating ? `${moodRating}/5 ${getMoodEmoji(moodRating)}` : 'No mood rating available'}</h2>
            <h2>Journal Entries:</h2>
            <div className='day-journal-container'>
            {journalEntries.length > 0 ? (
                journalEntries.map(entry => (
                    <div className='day-content' key={entry.id}>
                        {editMode[entry.id] ? (
                            <div>
                                <br></br>
                                <input type="text" value={editedContent[entry.id]?.journal_header || ''} onChange={e => handleHeaderChange(entry.id, e.target.value)} />
                                <br></br>
                                <br></br>
                                <textarea style={{height: '10em'}} value={editedContent[entry.id]?.journal_text || ''} onChange={e => handleTextChange(entry.id, e.target.value)} />
                                <br></br>
                                <br></br>
                                <button onClick={() => handleSaveEdit(entry.id)}>Save</button>
                                &nbsp; 
                                <button onClick={() => handleCancelEdit(entry.id)}>Cancel</button>
                            </div>
                        ) : (
                            <React.Fragment>
                                <h3>{entry.journal_header}</h3>
                                <p>{entry.journal_text}</p>
                                <button onClick={() => handleEdit(entry.id, entry)}>Edit</button>
                                &nbsp;
                                <button onClick={() => handleDelete(entry.id)}>Delete</button> 
                            </React.Fragment>
                        )}
                    </div>
                ))
            ) : (
                <p>No journal entry available</p>
            )}
            </div>
        </div>
    );
}

export default DayDetail;