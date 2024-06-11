import React, { useState, useEffect } from 'react';

function getMonthName(monthIndex) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
}

function Diary() {
    const [journalEntries, setJournalEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [editMode, setEditMode] = useState({});
    const [editedContent, setEditedContent] = useState({});

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); 
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
        // Filter entries for the current month
        const filteredEntries = journalEntries.filter(entry => {
            const entryMonth = new Date(entry.created_at).getMonth();
            return entryMonth === currentMonth;
        });
        setFilteredEntries(filteredEntries);
    }, [currentMonth, journalEntries]);


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

    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        setSelectedDate(selectedDate);
        const date = new Date(selectedDate);
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
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
    
            // Update the journal entries after successful update
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
            // Handle error state or display error message to the user
        }
    };
    

    const handleCancelEdit = (entryId) => {
        // Cancel edit mode and reset edited content
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
    
            // Remove the deleted entry from the journal entries
            const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
            setJournalEntries(updatedEntries);
        } catch (error) {
            console.error('Error deleting entry:', error);
            // Handle error state or display error message to the user
        }
    };

    const handleNextMonth = () => {
        setCurrentMonth(prevMonth => {
            const nextMonth = prevMonth === 11 ? 0 : prevMonth + 1;
            const nextYear = prevMonth === 11 ? currentYear + 1 : currentYear;
            setCurrentYear(nextYear);
            return nextMonth;
        });
    };
    
    const handlePrevMonth = () => {
        setCurrentMonth(prevMonth => {
            const newPrevMonth = prevMonth === 0 ? 11 : prevMonth - 1;
            const prevYear = prevMonth === 0 ? currentYear - 1 : currentYear;
            setCurrentYear(prevYear);
            return newPrevMonth;
        });
    };

    // Handler for navigating to the current month
    const handleToday = () => {
        setCurrentMonth(new Date().getMonth()); // Set current month
        setSelectedDate(''); // Clear selected date
    };


    const [selectedYear, setSelectedYear] = useState(
        selectedDate
            ? new Date(selectedDate).getFullYear()
            : journalEntries.length > 0
            ? new Date(journalEntries[0].created_at).getFullYear()
            : new Date().getFullYear()
    );

    const reversedEntries = [...filteredEntries].reverse();

        return (
            <div>
                <h1>Diary</h1>
                <h3>{`${getMonthName(currentMonth)} ${currentYear}`}</h3>
                <div>
                    <button onClick={handlePrevMonth}>Previous Month</button>
                    <button onClick={handleNextMonth}>Next Month</button>
                    <button onClick={handleToday}>Today</button>
                </div>
                <div>
                    <label htmlFor="datePicker">Filter by Date:</label>
                    <input type="date" id="datePicker" value={selectedDate} onChange={handleDateChange} />
                </div>
                <br></br>
                <div className='diary-container'>
                    {reversedEntries.map(entry => (
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