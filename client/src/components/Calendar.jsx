import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function Calendar() {
    const [events, setEvents] = useState([]);
    const calendarRef = useRef(null);

    // Function to group mood ratings by date
    const groupByDate = (data) => {
        const groupedData = {};
        data.forEach(entry => {
            const date = new Date(entry.created_at).toISOString().split('T')[0];
            if (!groupedData[date] || entry.created_at > groupedData[date].created_at) {
                groupedData[date] = entry;
            }
        });
        return groupedData;
    };

    useEffect(() => {
        fetch('/api/mood-ratings')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch mood ratings');
                }
                return response.json();
            })
            .then(data => {
                const groupedData = groupByDate(data); // Group mood ratings by date
                console.log('Grouped mood ratings:', groupedData);
            
                // Process grouped data to create events with the most recent mood rating for each date
                const eventsData = Object.entries(groupedData).map(([date, mood]) => ({
                    title: '', // No need for a title
                    start: date, // Start date is the date itself
                    allDay: true, // Event spans all day
                    backgroundColor: getBackgroundColor(mood.mood), // Set background color based on most recent mood rating
                }));
                console.log('Processed events:', eventsData);
            
                setEvents(eventsData);
            })
            .catch(error => {
                console.error('Error fetching mood ratings:', error);
            });
    }, []);

    const getBackgroundColor = moodRating => {
        // Define your logic to map mood ratings to background colors here
    
        // Example: Mapping mood ratings 1-5 to predefined colors
        switch (moodRating) {
            case 1:
                return 'darkred';
            case 2:
                return 'lightcoral';
            case 3:
                return 'yellow';
            case 4:
                return 'lightgreen';
            case 5:
                return 'darkgreen';
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
                events={events}
                height="auto"
            />
        </div>
    );
}

export default Calendar;