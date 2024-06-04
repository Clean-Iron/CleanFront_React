import React from 'react';
import { Popover, Typography } from '@mui/material';

function ServicePopover({ open, anchorEl, onClose, event }) {
  // Si el evento no está definido, no renderiza nada
  if (!event) {
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
        <Typography variant="h6">{event.title}</Typography>
        <Typography variant="body1">Fecha: {event.start}</Typography>
        <Typography variant="body1">Hora: {event.time}</Typography>
        <Typography variant="body1">Persona Encargada: {event.person}</Typography>
        <Typography variant="body1">Cliente: {event.client}</Typography>
        <Typography variant="body1">Observaciones: {event.observations}</Typography>
      </div>
    </Popover>
  );
}

export default ServicePopover;


