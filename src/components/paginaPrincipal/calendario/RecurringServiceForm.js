import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Grid, FormControlLabel, Checkbox } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: 600,
  height: 'auto',
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function RecurringServiceForm({ open, onClose, onAddRecurringEvent }) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [person, setPerson] = useState('');
  const [client, setClient] = useState('');
  const [observations, setObservations] = useState('');
  const [recurringDays, setRecurringDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const handleRecurringDayChange = (event) => {
    const { name, checked } = event.target;
    setRecurringDays((prevRecurringDays) => ({
      ...prevRecurringDays,
      [name]: checked,
    }));
  };

  const handleAdd = () => {
    const events = [];
    const days = Object.keys(recurringDays).filter((day) => recurringDays[day]);
    days.forEach((day) => {
      events.push({
        title: title || '',
        start: `${startDate || ''}T${startTime || ''}`,
        end: `${endDate || ''}T${endTime || ''}`,
        extendedProps: {
          person: person || '',
          client: client || '',
          observations: observations || '',
          recurringDays: days,
        },
      });
    });
    onAddRecurringEvent(events);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Agregar Evento Recurrente
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={recurringDays.monday}
                  onChange={handleRecurringDayChange}
                  name="monday"
                />
              }
              label="Lunes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={recurringDays.tuesday}
                  onChange={handleRecurringDayChange}
                  name="tuesday"
                />
              }
              label="Martes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={recurringDays.wednesday}
                  onChange={handleRecurringDayChange}
                  name="wednesday"
                />
              }
              label="Miércoles"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={recurringDays.thursday}
                  onChange={handleRecurringDayChange}
                  name="thursday"
                />
              }
              label="Jueves"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={recurringDays.friday}
                  onChange={handleRecurringDayChange}
                  name="friday"
                />
              }
              label="Viernes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={recurringDays.saturday}
                  onChange={handleRecurringDayChange}
                  name="saturday"
                />
              }
              label="Sábado"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={recurringDays.sunday}
                  onChange={handleRecurringDayChange}
                  name="sunday"
                />
              }
              label="Domingo"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Persona Encargada"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
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
          Agregar Evento Recurrente
        </Button>
      </Box>
    </Modal>
  );
}

export default RecurringServiceForm;


