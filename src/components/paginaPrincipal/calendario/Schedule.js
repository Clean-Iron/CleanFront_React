import React, { useState } from 'react';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import FormService from './FormService';
import ServicePopover from './ServicePopover';
import DayServicesPopover from './DayServicesPopover';

function Schedule() {
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [events, setEvents] = useState([
    {
      title: 'Evento 1',
      start: '2024-06-01T10:00:00',
      end: '2024-06-01T11:00:00',
      extendedProps: {
        time: '10:00 AM - 11:00 AM',
        person: 'Juan Pérez',
        client: 'Cliente A',
        observations: 'Observación 1',
      }
    },
    {
      title: 'Evento 2',
      start: '2024-06-02T14:00:00',
      end: '2024-06-02T15:00:00',
      extendedProps: {
        time: '2:00 PM - 3:00 PM',
        person: 'Ana Gómez',
        client: 'Cliente B',
        observations: 'Observación 2',
      }
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dayPopoverAnchor, setDayPopoverAnchor] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  const handleAddEvent = (newEvent) => {
    setEvents([...events, newEvent]);
    setModalOpen(false);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      date: clickInfo.event.startStr,
      ...clickInfo.event.extendedProps,
    });
    setPopoverAnchor(clickInfo.el);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setSelectedEvent(null);
  };

  const handleMoreLinkClick = (clickInfo) => {
    if (clickInfo.allSegs && clickInfo.allSegs.length > 0) {
      const eventDetails = clickInfo.allSegs.map(seg => ({
        title: seg.eventRange.def.title,
        date: seg.eventRange.def.date,
        ...seg.eventRange.def.extendedProps,
      }));
      setDayEvents(eventDetails);
      setDayPopoverAnchor(clickInfo.dayEl);
    } else {
      setDayEvents([]);
      setDayPopoverAnchor(null);
    }
  };

  const handleDayPopoverClose = () => {
    setDayPopoverAnchor(null);
    setDayEvents([]);
  };

  return (
    <Container sx={{ marginTop: 9 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Calendario Interactivo
          </Typography>
          <Button color="inherit" onClick={() => setModalOpen(true)}>
            Agregar Evento
          </Button>
        </Toolbar>
      </AppBar>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarView}
        viewDidMount={(view) => {
          setCalendarView(view.view.type);
        }}
        viewWillUnmount={(view) => {
          setCalendarView(view.view.type);
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable
        selectable
        events={events}
        eventClick={handleEventClick}
        dayMaxEventRows={3} // Limitar el número de eventos visibles por día
        moreLinkClick={handleMoreLinkClick} // Personalizar el clic en "más" eventos
      />
      <FormService
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
      <ServicePopover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        event={selectedEvent}
      />
      <DayServicesPopover
        open={Boolean(dayPopoverAnchor)}
        anchorEl={dayPopoverAnchor}
        onClose={handleDayPopoverClose}
        events={dayEvents}
      />
    </Container>
  );
}

export default Schedule;




