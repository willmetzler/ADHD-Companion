import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';

function Calendar({ moodData }) {
    const [events, setEvents] = useState([]);
    const calendarRef = useRef(null);
    const [journalEntries, setJournalEntries] = useState({});
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
                    acc[date] = true; // Indicate that there is a journal entry for this date
                    return acc;
                }, {});
                setJournalEntries(journalEntriesData);
            })
            .catch(error => {
                console.error('Error fetching journal entries:', error);
            });
    }, []);

    useEffect(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const eventSources = Object.entries(events).map(([date, mood]) => ({
                start: date,
                end: date,
                display: 'background',
                color: getBackgroundColor(mood),
                extendedProps: { hasJournalEntry: journalEntries[date] }
            }));
            api.removeAllEventSources();
            api.addEventSource(eventSources);
        }
    }, [events, journalEntries]);

    const getBackgroundColor = moodRating => {
        switch (moodRating) {
            case 1:
                return '#e22a03'; // darkred
            case 2:
                return '#ef9c0e'; // orange
            case 3:
                return '#ece13b'; // yellow
            case 4:
                return '#afe48e'; // pale green
            case 5:
                return '#26e616'; // bright green
            default:
                return ''; // Return empty string for undefined mood ratings
        }
    };

    const handleDateClick = (info) => {
        const date = info.dateStr;
        console.log(date)
        if (date) {
            navigate(`/day/${date}`);
        } else {
            console.error('Date is not defined in the event');
        }
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
                <p>Key:</p>
                <div className='key-container'>
                    1<div id='key1'></div>
                    2<div id='key2'></div>
                    3<div id='key3'></div>
                    4<div id='key4'></div>
                    5<div id='key5'></div>
                </div>
            </div>
        </div>
    );
}

function renderEventContent(eventInfo) {
    const { hasJournalEntry } = eventInfo.event.extendedProps;
    return (
        <>
            {hasJournalEntry && <FontAwesomeIcon icon={faPencil} />}
            <div>{eventInfo.timeText}</div>
        </>
    );
}

export default Calendar;