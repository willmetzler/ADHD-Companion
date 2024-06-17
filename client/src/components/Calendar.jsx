import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faCapsules } from '@fortawesome/free-solid-svg-icons';

function Calendar() {
    const [events, setEvents] = useState({});
    const calendarRef = useRef(null);
    const [journalEntries, setJournalEntries] = useState({});
    const [medications, setMedications] = useState({});
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/mood-ratings')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch mood ratings');
                }
                return response.json();
            })
            .then(data => {
                const eventsData = data.reduce((acc, entry) => {
                    const date = new Date(entry.created_at).toISOString().split('T')[0];
                    acc[date] = entry.mood;
                    return acc;
                }, {});
                setEvents(eventsData);
            })
            .catch(error => {
                console.error('Error fetching mood ratings:', error);
            });
    }, []);

    useEffect(() => {
        fetch('/api/journals')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch journal entries');
                }
                return response.json();
            })
            .then(data => {
                const journalEntriesData = data.reduce((acc, entry) => {
                    const date = new Date(entry.created_at).toISOString().split('T')[0];
                    acc[date] = true;
                    return acc;
                }, {});
                setJournalEntries(journalEntriesData);
            })
            .catch(error => {
                console.error('Error fetching journal entries:', error);
            });
    }, []);

    useEffect(() => {
        fetch('/api/medications')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch medications');
                }
                return response.json();
            })
            .then(data => {
                console.log('Medications data:', data); // Logging fetched data
                const medicationsData = data.reduce((acc, entry) => {
                    const date = new Date(entry.renew_date).toISOString().split('T')[0];
                    acc[date] = true; // Indicate that there is a medication renewal for this date
                    return acc;
                }, {});
                setMedications(medicationsData);
            })
            .catch(error => {
                console.error('Error fetching medications:', error);
            });
    }, []);

    useEffect(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const daysInMonth = getDaysInMonth(new Date());
            const eventSources = daysInMonth.map(date => {
                const dateString = date.toISOString().split('T')[0];
                return {
                    start: dateString,
                    end: dateString,
                    display: 'background',
                    color: getBackgroundColor(events[dateString]),
                    extendedProps: {
                        hasJournalEntry: journalEntries[dateString] || false,
                        hasMedicationRenewal: medications[dateString] || false,
                    }
                };
            });

            console.log('Event sources before setting:', eventSources); // Detailed logging

            api.removeAllEventSources();
            api.addEventSource(eventSources);
        }
    }, [events, journalEntries, medications]);

    const getBackgroundColor = moodRating => {
        switch (moodRating) {
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
                return '#c3d9e8'; // matching background color of app
        }
    };

    const handleDateClick = (info) => {
        const date = info.dateStr;
        console.log(date);
        if (date) {
            navigate(`/day/${date}`);
        } else {
            console.error('Date is not defined in the event');
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const numDays = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 1; i <= numDays; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const toggleKeyVisibility = () => {
        setIsKeyVisible(!isKeyVisible);
    };

    return (
        <div className="calendar-container">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="auto"
                eventContent={renderEventContent}
                dateClick={handleDateClick}
            />
            <div>
                <br></br>
                <br></br>
                <button onClick={toggleKeyVisibility}>
                    {isKeyVisible ? 'Hide Key' : 'Show Key'}
                </button>
                <br></br>
                <br></br>
                {isKeyVisible && (
                    <div id='full-key'>
                        <div className='key-container'>
                            😔<div id='key1'></div>
                            🙁<div id='key2'></div>
                            😐<div id='key3'></div>
                            🙂<div id='key4'></div>
                            😁<div id='key5'></div>
                        </div>
                        <p style={{ marginLeft: '.5em' }}><FontAwesomeIcon icon={faPencil} /> Journal Entry</p>
                        <p style={{ marginLeft: '.5em' }}><FontAwesomeIcon icon={faCapsules} /> Medication Renewal</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function renderEventContent(eventInfo) {
    const { hasJournalEntry, hasMedicationRenewal } = eventInfo.event.extendedProps;
    console.log('Render event content:', hasJournalEntry, hasMedicationRenewal); // Add this line
    return (
        <>
            {hasJournalEntry && <FontAwesomeIcon icon={faPencil} />}
            {hasMedicationRenewal && <FontAwesomeIcon icon={faCapsules} />} {/* Display medication renewal icon */}
            <div>{eventInfo.timeText}</div>
        </>
    );
}

export default Calendar;
