import React from 'react';
import { Popover, Typography } from '@mui/material';

function DayServicesPopover({ open, anchorEl, onClose, events }) {
  // Si los eventos no están definidos o están vacíos, no renderiza nada
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <div style={{ padding: '16px' }}>
        {events.map((event, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <Typography variant="h6">{event.title}</Typography>
            <Typography variant="body1">Fecha: {event.start}</Typography>
            <Typography variant="body1">Hora: {event.time}</Typography>
            <Typography variant="body1">Persona Encargada: {event.person}</Typography>
            <Typography variant="body1">Cliente: {event.client}</Typography>
            <Typography variant="body1">Observaciones: {event.observations}</Typography>
          </div>
        ))}
      </div>
    </Popover>
  );
}

export default DayServicesPopover;


