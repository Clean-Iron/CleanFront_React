import React, { useState, useEffect, useCallback } from 'react';
import { Container, AppBar, Toolbar, Typography, Button, List, ListItemButton, ListItemText, Grid, TextField } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import FormService from './FormService';
import ServicePopover from './ServicePopover';
import DayServicesPopover from './DayServicesPopover';

const employees = [
  'Todos',
  'Juan Pérez',
  'Ana Gómez',
  'Carlos Sánchez',
  'María López',
];

const locations = [
  'Todos',
  'Oficina Principal',
  'Sucursal Norte',
  'Sucursal Sur',
];

const locationColors = {
  'Oficina Principal': '#ff9f89', // color para Oficina Principal
  'Sucursal Norte': '#a8dadc', // color para Sucursal Norte
  'Sucursal Sur': '#457b9d', // color para Sucursal Sur
};

function Schedule() {
  const [events, setEvents] = useState([
    {
      title: 'Evento 1',
      start: '2024-06-17T10:00:00',
      end: '2024-06-17T11:00:00',
      extendedProps: {
        time: '10:00 AM - 11:00 AM',
        person: 'Juan Pérez',
        client: 'Cliente A',
        observations: 'Observación 1',
        location: 'Oficina Principal',
      },
      color: locationColors['Oficina Principal'],
    },
    {
      title: 'Evento 2',
      start: '2024-06-18T14:00:00',
      end: '2024-06-18T15:00:00',
      extendedProps: {
        time: '2:00 PM - 3:00 PM',
        person: 'Ana Gómez',
        client: 'Cliente B',
        observations: 'Observación 2',
        location: 'Sucursal Norte',
      },
      color: locationColors['Sucursal Norte'],
    },
    // Otros eventos
  ]);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [selectedEmployee, setSelectedEmployee] = useState('Todos');
  const [selectedLocation, setSelectedLocation] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dayPopoverAnchor, setDayPopoverAnchor] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  const filterEvents = useCallback(() => {
    let newFilteredEvents = events;

    if (selectedEmployee !== 'Todos') {
      newFilteredEvents = newFilteredEvents.filter(event => event.extendedProps.person === selectedEmployee);
    }

    if (selectedLocation !== 'Todos') {
      newFilteredEvents = newFilteredEvents.filter(event => event.extendedProps.location === selectedLocation);
    }

    setFilteredEvents(newFilteredEvents);
  }, [events, selectedEmployee, selectedLocation]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const handleAddEvent = (newEvent) => {
    const eventWithColor = {
      ...newEvent,
      color: locationColors[newEvent.extendedProps.location],
    };
    setEvents([...events, eventWithColor]);
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

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
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
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="h6">Empleados</Typography>
          <List>
            {employees.map((employee) => (
              <ListItemButton key={employee} onClick={() => handleEmployeeClick(employee)}>
                <ListItemText primary={employee} />
              </ListItemButton>
            ))}
          </List>
          <Typography variant="h6" sx={{ marginTop: 2 }}>Lugares</Typography>
          <TextField
            select
            fullWidth
            value={selectedLocation}
            onChange={handleLocationChange}
            SelectProps={{
              native: true,
            }}
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="h6">Calendario de {selectedEmployee}</Typography>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={'timeGridWeek'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            editable
            selectable
            events={filteredEvents}
            eventClick={handleEventClick}
            dayMaxEventRows={3}
            moreLinkClick={handleMoreLinkClick}
          />
        </Grid>
      </Grid>
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











