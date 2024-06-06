import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for dateClick


function Calendar () {
    return(
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                weekends={false}
                events={[
                    { title: 'Event 1', date: '2024-06-07' },
                    { title: 'Event 2', date: '2024-06-10' },
        ]}
            dateClick={(arg) => {
                alert('Date clicked: ' + arg.dateStr);
            }}
            />
        </div>
    )
}

export default Calendar;