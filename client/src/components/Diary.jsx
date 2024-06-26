import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faAngleLeft, faPenToSquare, faTrashCan, faBars, faBan, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

function Diary() {
    const [journalEntries, setJournalEntries] = useState([]);
    const [editMode, setEditMode] = useState({});
    const [editedContent, setEditedContent] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null); 

    const [moodRatings, setMoodRatings] = useState({});
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [showMonthViewButton, setShowMonthViewButton] = useState(false);

    const [visibleEntries, setVisibleEntries] = useState({});

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

        fetch('/api/mood-ratings')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch mood ratings');
                }
            })
            .then(data => {
                const ratingsByDate = {};
                data.forEach(entry => {
                    const date = new Date(entry.created_at).toISOString().split('T')[0];
                    ratingsByDate[date] = entry.mood;
                });
                setMoodRatings(ratingsByDate);
            })
            .catch(error => {
                console.error('Error fetching mood ratings:', error);
            });
    }, []);

    useEffect(() => {
        if (selectedDate) {
            // Filter entries based on selected date
            const filteredEntries = journalEntries.filter(entry => {
                const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
                return entryDate === selectedDate;
            });
            // Sort filtered entries by date in descending order
            filteredEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setFilteredEntries(filteredEntries);
            setShowMonthViewButton(true); // Show "Month View" button
        } else {
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
            setShowMonthViewButton(false); // Hide "Month View" button
        }
    }, [journalEntries, currentMonth, selectedYear, selectedDate]);

    const getMonthName = (monthIndex) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthIndex];
    };

    const formatDateTime = (dateTimeString) => {
        const normalizedDateString = dateTimeString.replace(/-/g,'/');
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        return new Date(normalizedDateString).toLocaleDateString('en-US', options);
    };

    const getMoodColor = (date) => {
        const mood = moodRatings[date];
        switch (mood) {
            case 1:
                return '#e35337'; // darkred
            case 2:
                return '#ef9c0e'; // orange
            case 3:
                return '#ece13b'; // yellow
            case 4:
                return '#afe48e'; // pale green
            case 5:
                return '#26e616'; // bright green
            default:
                return 'white'; // White
        }
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
        const isConfirmed = window.confirm("Are you sure you want to delete this entry?");
        if (!isConfirmed) return;
    
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
    

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };
    
    const handleDatePickerClear = () => {
        setSelectedDate(null);
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
    
    const handleToggleMonthView = () => {
        if (selectedDate) {
            setSelectedDate(null); // Switch back to "Current Month" view
        } else {
            setShowMonthViewButton(false); // Hide "Month View" button
        }
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
        setSelectedDate(null); // Reset selectedDate to null to show monthly view
        setShowMonthViewButton(false); // Hide "Month View" button
    };

    const handleToggleEntryVisibility = (entryId) => {
        setVisibleEntries(prevState => ({
            ...prevState,
            [entryId]: !prevState[entryId]
        }));
    };

    return (
        <div>
            <h1>Diary: {selectedDate ? formatDateTime(selectedDate) : `${getMonthName(currentMonth)} ${selectedYear}`}</h1>
            <div className='diary-button-div'>
                {!selectedDate && (
                    <>
                        <button className='diary-buttons' onClick={handlePrevMonth}><FontAwesomeIcon icon={faAngleLeft} style={{ fontSize: '1em' }} /></button>
                        <button className='diary-buttons' disabled={currentMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()} onClick={handleToday}>Current Month</button>
                        <button className='diary-buttons' onClick={handleNextMonth}><FontAwesomeIcon icon={faAngleRight} style={{ fontSize: '1em' }} /></button>
                    </>
                )}
                {selectedDate && (
                    <button className='diary-buttons' onClick={handleToggleMonthView}>Month View</button>
                )}
            </div>
            <br />
            <label style={{marginLeft:'1.5em'}} htmlFor="datePicker">Select Date: </label>
            <input type="date" id="datePicker" value={selectedDate || ''} onChange={handleDateChange} />
            <br />
            <br />
            <div className='diary-container'>
                {filteredEntries.length > 0 ? (
                    filteredEntries.map(entry => (
                        <div className="diary-content" key={entry.id}>
                            <button 
                                className="toggle-button"
                                onClick={() => handleToggleEntryVisibility(entry.id)}
                            >
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                            {editMode[entry.id] ? (
                                <div>
                                    <input style={{marginBottom:'0.25em'}} type="text" value={editedContent[entry.id]?.header || ''} onChange={e => handleHeaderChange(entry.id, e.target.value)} />
                                    <textarea style={{height: '10em'}} value={editedContent[entry.id]?.text || ''} onChange={e => handleTextChange(entry.id, e.target.value)} />
                                    <br></br>
                                    <button style={{scale:'120%', marginLeft:'0.5em', marginTop:'0.25em'}} onClick={() => handleSaveEdit(entry.id)}><FontAwesomeIcon icon={faFloppyDisk} /></button>
                                    <button style={{scale:'120%', marginLeft:'1em'}} onClick={() => handleCancelEdit(entry.id)}><FontAwesomeIcon icon={faBan} /></button>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{marginTop:'1.5em'}}>{entry.journal_header}</h3>
                                    <p>{entry.journal_text}</p>
                                    <Link to={`/day/${new Date(entry.created_at).toISOString().split('T')[0]}`}>
                                        <p>{formatDateTime(entry.created_at)}</p>
                                    </Link>
                                    <button 
                                        className={`edit-button ${visibleEntries[entry.id] ? 'visible-button' : 'hidden-button'}`} 
                                        style={{ scale: '125%', marginLeft:'0.5em'}} 
                                        onClick={() => handleEdit(entry.id, entry)}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} />
                                    </button>
                                    <button 
                                        className={`delete-button ${visibleEntries[entry.id] ? 'visible-button' : 'hidden-button'}`} 
                                        style={{ scale: '125%', marginLeft:'1.25em', marginBottom:'0.25em'}} 
                                        onClick={() => handleDelete(entry.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </button>
                                </>
                            )}
                            <div className="diary-mood" style={{ backgroundColor: getMoodColor(new Date(entry.created_at).toISOString().split('T')[0]) }}></div>
                        </div>
                    ))
                ) : (
                    <p>Nothing to see here...</p>
                )}
            </div>
        </div>
    );
}

export default Diary;