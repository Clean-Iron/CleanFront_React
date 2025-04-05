'use client';
import React, { useState, useMemo } from 'react';
import "../../../../styles/Servicios/InfoServicios/Calendario/Calendario.css";

/**
 * Componente Calendario para seleccionar fechas.
 * @param {Function} onDateSelect - Callback cuando se selecciona una fecha.
 */
const Calendario = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Número de días del mes actual
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Día de la semana del primer día del mes (ajustado a lunes = 0)
  const startDay = (() => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  })();

  /**
   * Verifica si el día es hoy
   */
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  /**
   * Verifica si el día es el seleccionado actualmente
   */
  const isSelected = (day) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  /**
   * Maneja la selección de un día del calendario
   */
  const handleDateClick = (day) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  /**
   * Genera los días del calendario, incluyendo los días vacíos iniciales
   */
  const days = useMemo(() => {
    const allDays = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startDay; i++) {
      allDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isTodayDate = isToday(day);
      const isSelectedDay = isSelected(day);

      allDays.push(
        <button
          key={`day-${day}`}
          className={`calendar-day ${isSelectedDay ? 'selected' : ''} 
                      ${isTodayDate ? 'today' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
        </button>
      );
    }

    return allDays;
  }, [year, month, selectedDate]);

  /**
   * Cambia el mes actual
   */
  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month + offset);
    setCurrentDate(newDate);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
          &lt;
        </button>
        <h2 className="month-title">
          {currentDate.toLocaleDateString('es-ES', { month: 'long' })} {year}
        </h2>
        <button className="month-nav-btn" onClick={() => changeMonth(1)}>
          &gt;
        </button>
      </div>

      <div className="weekdays-header">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
          <div key={index} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days}
      </div>
    </div>
  );
};

export default Calendario;