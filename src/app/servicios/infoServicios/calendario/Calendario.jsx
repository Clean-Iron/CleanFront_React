'use client';
import React, { useState, useMemo, useCallback } from 'react';
import "../../../../styles/Servicios/InfoServicios/Calendario/Calendario.css";

/**
 * Componente Calendario para seleccionar fechas.
 * @param {Function} onDateSelect - Callback cuando se selecciona una fecha (recibe string yyyy-mm-dd).
 * @param {string} initialDate - Fecha inicial en formato yyyy-mm-dd (opcional).
 * @param {Date} minDate - Fecha mínima seleccionable (opcional).
 * @param {Date} maxDate - Fecha máxima seleccionable (opcional).
 */
const Calendario = ({ 
  onDateSelect, 
  initialDate = null, 
  minDate = null, 
  maxDate = null 
}) => {
  // Inicializar fechas
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Número de días del mes actual
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Día de la semana del primer día del mes (ajustado a lunes = 0)
  const startDay = useMemo(() => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [year, month]);

  /**
   * Formatea una fecha al formato yyyy-mm-dd
   */
  const formatDateToYYYYMMDD = useCallback((date) => {
    if (!date || isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  /**
   * Verifica si el día es hoy
   */
  const isToday = useCallback((day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }, [month, year]);

  /**
   * Verifica si el día es el seleccionado actualmente
   */
  const isSelected = useCallback((day) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  }, [selectedDate, month, year]);

  /**
   * Verifica si una fecha está deshabilitada
   */
  const isDateDisabled = useCallback((day) => {
    const date = new Date(year, month, day);
    
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return false;
  }, [year, month, minDate, maxDate]);

  /**
   * Maneja la selección de un día del calendario
   */
  const handleDateClick = useCallback((day) => {
    if (isDateDisabled(day)) return;
    
    const date = new Date(year, month, day);
    setSelectedDate(date);
    
    const formattedDate = formatDateToYYYYMMDD(date);
    onDateSelect?.(formattedDate);
  }, [year, month, isDateDisabled, formatDateToYYYYMMDD, onDateSelect]);

  /**
   * Genera los días del calendario, incluyendo los días vacíos iniciales
   */
  const days = useMemo(() => {
    const allDays = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startDay; i++) {
      allDays.push(
        <div key={`empty-${i}`} className="calendar-day empty" />
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isTodayDate = isToday(day);
      const isSelectedDay = isSelected(day);
      const isDisabled = isDateDisabled(day);

      const dayClasses = [
        'calendar-day',
        isSelectedDay && 'selected',
        isTodayDate && 'today',
        isDisabled && 'disabled'
      ].filter(Boolean).join(' ');

      allDays.push(
        <button
          key={`day-${day}`}
          className={dayClasses}
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          aria-label={`Seleccionar ${day} de ${currentDate.toLocaleDateString('es-ES', { month: 'long' })} ${year}`}
          aria-pressed={isSelectedDay}
        >
          <span className="day-number">{day}</span>
        </button>
      );
    }

    return allDays;
  }, [
    startDay,
    daysInMonth,
    isToday,
    isSelected,
    isDateDisabled,
    handleDateClick,
    currentDate,
    year
  ]);

  /**
   * Cambia el mes actual
   */
  const changeMonth = useCallback((offset) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + offset);
      return newDate;
    });
  }, []);

  // Nombres de los meses para mostrar
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="calendar-container" role="application" aria-label="Calendario de selección de fechas">
      <div className="calendar-header">
        <button 
          className="month-nav-btn" 
          onClick={() => changeMonth(-1)}
          aria-label="Mes anterior"
          type="button"
        >
          &#8249;
        </button>
        
        <div className="month-year-container">
          <h2 className="month-title">
            {monthNames[month]} {year}
          </h2>
        </div>
        
        <button 
          className="month-nav-btn" 
          onClick={() => changeMonth(1)}
          aria-label="Mes siguiente"
          type="button"
        >
          &#8250;
        </button>
      </div>

      <div className="weekdays-header" role="row">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
          <div key={index} className="weekday" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid" role="grid">
        {days}
      </div>
    </div>
  );
};

export default Calendario;