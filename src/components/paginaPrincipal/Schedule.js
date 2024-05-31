import { useState, React } from 'react';
import Calendar from 'react-calendar';
import { Grid, Typography, Box } from '@mui/material';
import '../styleSheets/CustomCalendar.css';
import 'react-calendar/dist/Calendar.css';

function Schedule() {
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);
    
    const handleWeekClick = (date) => {
        const startOfWeek = new Date(date);
        const endOfWeek = new Date(startOfWeek);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        setDateRange([startOfWeek, endOfWeek]);
    };

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const timeSlots = [];
    for (let i = 7; i < 19; i++) {
        timeSlots.push(`${i}:00`);
        timeSlots.push(`${i}:30`);
    }

    return (
        <Grid container spacing={2} direction="row">
            <Grid item style={{ marginLeft: 40, marginTop: 80 }}>
                <Calendar 
                    className={'react-calendar'} 
                    onClickDay={handleWeekClick}
                    value={dateRange}
                />
                <Typography variant="body1" style={{ marginTop: 10 }}>
                    Seleccionaste la semana del {dateRange[0].toLocaleDateString()} al {dateRange[1].toLocaleDateString()}
                </Typography>
            </Grid>
            <Grid item xs={7} style={{ marginTop: 80 }}>
                <Grid container>
                    <Grid item xs={1}>
                        <Box height="3rem" display="flex" alignItems="center" 
                        justifyContent="center" borderColor="grey.300"/>
                        {timeSlots.map((time, index) => (
                            <Box 
                                key={index} 
                                border={1} 
                                borderColor="grey.300" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                                height="3rem"
                            >
                                <Typography variant="body2">
                                    {time}
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                    {daysOfWeek.map((day, index) => (
                        <Grid item xs key={index}>
                            <Box 
                                border={1} 
                                borderColor="grey.300" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                                height="3rem"
                            >
                                <Typography variant="h6">{day}</Typography>
                            </Box>
                            {timeSlots.map((_, timeIndex) => (
                                <Box 
                                    key={timeIndex} 
                                    border={1} 
                                    borderColor="grey.300" 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                    height="3rem"
                                />
                            ))}
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
}

export default Schedule;








