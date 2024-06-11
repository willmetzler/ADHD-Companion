import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

function Diary() {
    const [journalEntries, setJournalEntries] = useState([]);
    const [editMode, setEditMode] = useState({});
    const [editedContent, setEditedContent] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [filteredEntries, setFilteredEntries] = useState([]);

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

    useEffect(() => {
        // Filter entries based on selected month and year
        const filteredEntries = journalEntries.filter(entry => {
            const entryDate = new Date(entry.created_at);
            const entryYear = entryDate.getFullYear();
            const entryMonth = entryDate.getMonth();
            return entryYear === selectedYear && entryMonth === currentMonth;
        });
        // Sort filtered entries by date in descending order
        filteredEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setFilteredEntries(filteredEntries);
    }, [journalEntries, currentMonth, selectedYear]);

    const getMonthName = (monthIndex) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    };

    const formatDateTime = (dateTimeString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dateTimeString));
    };
    

    const handleEdit = (entryId, entry) => {
        setEditMode(prevState => ({
            ...prevState,
            [entryId]: true
        }));
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                header: entry.journal_header,
                text: entry.journal_text
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
                    journal_header: editedContent[entryId].header,
                    journal_text: editedContent[entryId].text
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to save edited entry');
            }
    
            const updatedEntries = [...journalEntries];
            const updatedEntryIndex = updatedEntries.findIndex(entry => entry.id === entryId);
            if (updatedEntryIndex !== -1) {
                updatedEntries[updatedEntryIndex].journal_header = editedContent[entryId].header;
                updatedEntries[updatedEntryIndex].journal_text = editedContent[entryId].text;
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
                header: value
            }
        }));
    };

    const handleTextChange = (entryId, value) => {
        setEditedContent(prevState => ({
            ...prevState,
            [entryId]: {
                ...prevState[entryId],
                text: value
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

    const handleNextMonth = () => {
        setCurrentMonth(prevMonthIndex => {
            const nextMonth = prevMonthIndex === 11 ? 0 : prevMonthIndex + 1;
            const nextYear = prevMonthIndex === 11 ? selectedYear + 1 : selectedYear;
            setSelectedYear(nextYear);
            return nextMonth;
        });
    };
    
    const handlePrevMonth = () => {
        setCurrentMonth(prevMonthIndex => {
            const prevMonth = prevMonthIndex === 0 ? 11 : prevMonthIndex - 1;
            const prevYear = prevMonthIndex === 0 ? selectedYear - 1 : selectedYear;
            setSelectedYear(prevYear);
            return prevMonth;
        });
    };
    
    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
    };

    return (
        <div>
            <h1>Diary</h1>
            <h3>{`${getMonthName(currentMonth)} ${selectedYear}`}</h3>
            <div className='diary-button-div'>
                <button className='diary-buttons' onClick={handlePrevMonth}><FontAwesomeIcon icon={faAngleLeft} style={{ fontSize: '1em' }} /></button>
                <button className='diary-buttons' onClick={handleToday}>Current Month</button>
                <button className='diary-buttons' onClick={handleNextMonth}><FontAwesomeIcon icon={faAngleRight} style={{ fontSize: '1em' }} /></button>
            </div>
            <br />
            <div className='diary-container'>
                {filteredEntries.map(entry => (
                    <div className="diary-content" key={entry.id}>
                        {editMode[entry.id] ? (
                            <div>
                                <input type="text" value={editedContent[entry.id]?.header || ''} onChange={e => handleHeaderChange(entry.id, e.target.value)} />
                                <textarea style={{height: '10em'}} value={editedContent[entry.id]?.text || ''} onChange={e => handleTextChange(entry.id, e.target.value)} />
                                <button onClick={() => handleSaveEdit(entry.id)}>Save</button>
                                <button onClick={() => handleCancelEdit(entry.id)}>Cancel</button>
                            </div>
                        ) : (
                            <React.Fragment>
                                <h3>{entry.journal_header}</h3>
                                <p>{entry.journal_text}</p>
                                <p>Posted: {formatDateTime(entry.created_at)}</p>
                                <button onClick={() => handleEdit(entry.id, entry)}>Edit</button>
                                &nbsp; 
                                <button onClick={() => handleDelete(entry.id)}>Delete</button>
                            </React.Fragment>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Diary;