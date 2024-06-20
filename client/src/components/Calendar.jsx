import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPrescriptionBottle } from '@fortawesome/free-solid-svg-icons';

function Calendar() {
    const [events, setEvents] = useState({});
    const [journalEntries, setJournalEntries] = useState({});
    const [medications, setMedications] = useState({});
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const [yearView, setYearView] = useState(false); 
    const calendarRef = useRef(null);
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
                const medicationsData = data.reduce((acc, entry) => {
                    const date = new Date(entry.renew_date).toISOString().split('T')[0];
                    acc[date] = true;
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
            const eventSources = [];

            Object.keys(events).forEach(date => {
                eventSources.push({
                    start: date,
                    end: date,
                    display: 'background',
                    color: getBackgroundColor(events[date]),
                    extendedProps: {
                        hasJournalEntry: journalEntries[date] || false,
                        hasMedicationRenewal: medications[date] || false,
                    }
                });
            });

            Object.keys(journalEntries).forEach(date => {
                if (!events[date]) {
                    eventSources.push({
                        start: date,
                        end: date,
                        display: 'background',
                        color: '#c3d9e8',
                        extendedProps: {
                            hasJournalEntry: true,
                            hasMedicationRenewal: medications[date] || false,
                        }
                    });
                }
            });

            Object.keys(medications).forEach(date => {
                if (!events[date] && !journalEntries[date]) {
                    eventSources.push({
                        start: date,
                        end: date,
                        display: 'background',
                        color: '#c3d9e8',
                        extendedProps: {
                            hasJournalEntry: false,
                            hasMedicationRenewal: true,
                        }
                    });
                }
            });

            api.removeAllEventSources();
            api.addEventSource(eventSources);
        }
    }, [events, journalEntries, medications]);

    useEffect(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            if (yearView) {
                api.changeView('multiMonthYear');
            } else {
                api.changeView('dayGridMonth');
            }
        }
    }, [yearView]);

    const getBackgroundColor = moodRating => {
        switch (moodRating) {
            case 1:
                return '#e35337';
            case 2:
                return '#ef9c0e';
            case 3:
                return '#ece13b';
            case 4:
                return '#afe48e';
            case 5:
                return '#26e616';
            default:
                return '#c3d9e8';
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

    const toggleKeyVisibility = () => {
        setIsKeyVisible(!isKeyVisible);
    };

    const toggleYearView = () => {
        setYearView(!yearView);
    };

    return (
        <div className="calendar-container">
            <button onClick={toggleYearView}>{yearView ? 'Month View' : 'Year View'}</button>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin, multiMonthPlugin]}
                initialView="dayGridMonth" // Set initial view to month
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
                        <p style={{ marginLeft: '.5em' }}><FontAwesomeIcon icon={faPrescriptionBottle} /> Medication Renewal</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function renderEventContent(eventInfo) {
    const { hasJournalEntry, hasMedicationRenewal } = eventInfo.event.extendedProps;
    return (
        <>
            {hasJournalEntry && <FontAwesomeIcon icon={faPencil} />}
            {hasMedicationRenewal && <FontAwesomeIcon icon={faPrescriptionBottle} />}
            <div>{eventInfo.timeText}</div>
        </>
    );
}

export default Calendar;