import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar() {
    const [events, setEvents] = useState([]);
    const calendarRef = useRef(null);

    useEffect(() => {
        fetch('/api/mood-ratings')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch mood ratings');
                }
                return response.json();
            })
            .then(data => {
                const eventsData = data.map(entry => ({
                    start: new Date(entry.created_at).toISOString().split('T')[0], // Format the date as YYYY-MM-DD
                    mood: entry.mood, // Assuming mood is the mood rating value
                }));
                setEvents(eventsData);
            })
            .catch(error => {
                console.error('Error fetching mood ratings:', error);
            });
    }, []);
    
    useEffect(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            const eventSources = events.map(event => ({
                start: event.start,
                end: event.start, // End date same as start to create all-day event
                display: 'background',
                color: getBackgroundColor(event.mood), // Set background color based on mood rating
            }));
            api.removeAllEventSources(); // Clear existing event sources
            api.addEventSource(eventSources); // Add new event sources
        }
    }, [events]);
    

    const getBackgroundColor = moodRating => {
        // Define your logic to map mood ratings to background colors here
    
        // Example: Mapping mood ratings 1-5 to predefined colors
        switch (moodRating) {
            case 1:
                return '#e22a03'; // darkred
            case 2:
                return '#ee816a'; // pale red
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
    
    return (
        <div className="calendar-container">
            <FullCalendar
                ref={calendarRef} // Set the reference to FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="auto"
            />
        </div>
    );
}

export default Calendar;
