import React, {useState, useEffect} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';


function Calendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Fetch mood rating data from your backend API
        fetch('/api/mood-ratings')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch mood ratings');
                }
                return response.json();
            })
            .then(data => {
                // Transform mood rating data into FullCalendar event format
                const eventsData = data.map(entry => ({
                    title: '', // No need for a title
                    start: entry.created_at, // Assuming created_at is the date of the mood rating
                    mood: entry.mood, // Assuming mood is the mood rating value
                }));
                setEvents(eventsData);
            })
            .catch(error => {
                console.error('Error fetching mood ratings:', error);
            });
    }, []);

    const eventContent = ({ event, el }) => {
        // Customize event rendering based on mood rating
        const moodRating = event.extendedProps.mood;
        switch (moodRating) {
            case 1:
                el.style.backgroundColor = 'darkred';
                break;
            case 2:
                el.style.backgroundColor = 'lightcoral';
                break;
            case 3:
                el.style.backgroundColor = 'yellow';
                break;
            case 4:
                el.style.backgroundColor = 'lightgreen';
                break;
            case 5:
                el.style.backgroundColor = 'darkgreen';
                break;
            default:
                break;
        }
    };

    return (
        <div className="calendar-container">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                eventContent={eventContent}
                events={events}
                height= "auto"
            />
        </div>
    );
}

export default Calendar;