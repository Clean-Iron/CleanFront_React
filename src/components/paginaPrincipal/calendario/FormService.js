import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Grid } from '@mui/material';
import RecurringServiceForm from './RecurringServiceForm';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw', // Ajusta el ancho del modal para ocupar el 90% del viewport width
  maxWidth: 600, // Ancho máximo del modal
  height: 'auto', // Altura automática para ajustarse al contenido
  maxHeight: '90vh', // Altura máxima del modal para ocupar el 90% del viewport height
  overflowY: 'auto', // Habilita el scroll vertical si el contenido es demasiado alto
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function FormService({ open, onClose, onAddEvent }) {
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [person, setPerson] = useState('');
  const [client, setClient] = useState('');
  const [observations, setObservations] = useState('');

  const handleAddRecurringEvent = (recurringEvents) => {
    onAddEvent(recurringEvents);
    setRecurringOpen(false);
  };

  const handleAdd = () => {
    const start = `${date}T${startTime}`;
    const end = `${date}T${endTime}`;
    const time = `${startTime} - ${endTime}`;

    onAddEvent({
      title,
      start,
      end,
      extendedProps: {
        time,
        person,
        client,
        observations,
      },
    });

    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setPerson('');
    setClient('');
    setObservations('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Agregar Evento
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Hora de Inicio"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Hora de Fin"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Persona Encargada"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Cliente"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Observaciones"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              margin="normal"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleAdd}
          sx={{ mt: 2 }}
        >
          Agregar
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          onClick={() => setRecurringOpen(true)}
          sx={{ mt: 2 }}
        >
          Agregar Evento Recurrente
        </Button>
        <RecurringServiceForm
          open={recurringOpen}
          onClose={() => setRecurringOpen(false)}
          onAddRecurringEvent={handleAddRecurringEvent}
        />
      </Box>
    </Modal>
  );
}

export default FormService;






