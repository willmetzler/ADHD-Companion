import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DayDetail() {
    const { date } = useParams();
    const [journalEntries, setJournalEntries] = useState([]);
    const [moodRating, setMoodRating] = useState(null);
    const [editMode, setEditMode] = useState({});
    const [editedContent, setEditedContent] = useState({});
    const [newJournalHeader, setNewJournalHeader] = useState('');
    const [newJournalText, setNewJournalText] = useState('');
    const [isAddingJournal, setIsAddingJournal] = useState(false); // State for toggling new journal entry inputs
    const [isEditingMood, setIsEditingMood] = useState(false); // State for editing mood rating
    const [newMoodRating, setNewMoodRating] = useState(null); // State for new mood rating

    useEffect(() => {
        const fetchJournalEntries = async () => {
            const response = await fetch('/api/journals');
            if (response.ok) {
                const data = await response.json();
                const filteredEntries = data.filter(entry => {
                    const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
                    return entryDate === date;
                });
                setJournalEntries(filteredEntries);
            }
        };

        const fetchMoodRating = async () => {
            const response = await fetch('/api/mood-ratings');
            if (response.ok) {
                const data = await response.json();
                const mood = data.filter(entry => {
                    const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
                    return entryDate === date;
                });
                setMoodRating(mood.length ? mood[mood.length - 1].mood : null);
                setNewMoodRating(mood.length ? mood[mood.length - 1].mood : null);
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
        const formattedDate = new Date(inputDate.replace(/-/g, '\/')).toLocaleDateString('en-US', options);
        return formattedDate;
    };

    const isFutureDate = (inputDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to midnight
        const givenDate = new Date(inputDate.replace(/-/g, '\/'));
        givenDate.setHours(0, 0, 0, 0); // Normalize input date to midnight
        return givenDate > today;
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

    const handleNewJournalSubmit = async () => {
        try {
            const response = await fetch('/api/journal-entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    journal_header: newJournalHeader,
                    journal_text: newJournalText,
                    created_at: date  // Set the created_at date to the selected date
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit new journal entry');
            }

            const newEntry = await response.json();
            setJournalEntries([...journalEntries, {
                id: newEntry.id,  // Assuming newEntry contains the id
                journal_header: newJournalHeader,
                journal_text: newJournalText,
                created_at: date
            }]);
            setNewJournalHeader('');
            setNewJournalText('');
            setIsAddingJournal(false); // Hide inputs after submission
        } catch (error) {
            console.error('Error submitting new journal entry:', error);
        }
    };

    const handleEditMood = () => {
        setIsEditingMood(true);
    };

    const handleSaveMood = async () => {
        if (isFutureDate(date)) {
            console.error('Cannot save mood rating for future dates');
            setIsEditingMood(false);
            return;
        }

        try {
            const response = await fetch('/api/mood-ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mood: newMoodRating,
                    created_at: date  // Ensure the created_at date is set correctly
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save mood rating');
            }

            setMoodRating(newMoodRating);
            setIsEditingMood(false);
        } catch (error) {
            console.error('Error saving mood rating:', error);
        }
    };

    const handleCancelMoodEdit = () => {
        setNewMoodRating(moodRating);
        setIsEditingMood(false);
    };

    return (
        <div>
            <h1>{formatDate(date)}</h1>
            <h2>
                Mood Rating: {moodRating ? `${moodRating}/5 ${getMoodEmoji(moodRating)}` : '(None)'}
                {!isFutureDate(date) && !isEditingMood && <button style={{scale:'150%', marginLeft:'2em'}} onClick={handleEditMood}>Edit Mood</button>}
            </h2>
            {isEditingMood && (
                <div>
                    <select style={{scale:'150%', marginLeft:'2em'}} value={newMoodRating} onChange={(e) => setNewMoodRating(Number(e.target.value))}>
                        <option value={1}>1 😔</option>
                        <option value={2}>2 🙁</option>
                        <option value={3}>3 😐</option>
                        <option value={4}>4 🙂</option>
                        <option value={5}>5 😁</option>
                    </select>
                    &nbsp;
                    <button style={{scale:'125%', marginLeft:'2em'}}  onClick={handleSaveMood}>Save</button>
                    &nbsp;
                    <button style={{scale:'125%', marginLeft:'2em'}} onClick={handleCancelMoodEdit}>Cancel</button>
                </div>
            )}
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
                                    <textarea style={{ height: '10em' }} value={editedContent[entry.id]?.journal_text || ''} onChange={e => handleTextChange(entry.id, e.target.value)} />
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
                    <p>Nothing to see here...</p>
                )}
                <br></br>
                {!isAddingJournal && (
                    <button style={{scale:'150%', marginLeft:'3em'}} onClick={() => setIsAddingJournal(true)}>Add New Journal Entry</button>
                )}
                {isAddingJournal && (
                    <div>
                        <input
                            type="text"
                            placeholder="Journal Header"
                            value={newJournalHeader}
                            className="large-placeholder"
                            onChange={(e) => setNewJournalHeader(e.target.value)}
                            style={{height:'1.5em', width:'15em' }}
                        />
                        <br></br>
                        <br></br>
                        <textarea
                            placeholder="Journal Text"
                            value={newJournalText}
                            className="large-placeholder"
                            onChange={(e) => setNewJournalText(e.target.value)}
                            style={{ height: '12em', width:'18em' }}
                        />
                        <br></br>
                        <br></br>
                        <button style={{scale:'150%', marginLeft:'1em'}} onClick={handleNewJournalSubmit}>Submit</button>
                        &nbsp; &nbsp; &nbsp;
                        <button style={{scale:'150%', marginLeft:'1em'}} onClick={() => setIsAddingJournal(false)}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DayDetail;