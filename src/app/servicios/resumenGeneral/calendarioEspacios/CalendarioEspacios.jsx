'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import '../../../../styles/Servicios/ResumenGeneral/CalendarioEspacios/CalendarioEspacios.css';

const CalendarioEspacios = ({
    onDateSelect,
    onButtonClick, // Callback para manejar clicks de botones individuales
    initialDate = null,
    minDate = null,
    maxDate = null,
    currentMonth = null,
    currentYear = null,
    hideNavigation = false,
    buttonLabels = ['DISPONIBLE', 'OCUPADO', 'PERMISO/VAC'] // Labels personalizables para los tres botones
}) => {
    const [currentDate, setCurrentDate] = useState(() => {
        if (currentMonth !== null && currentYear !== null) {
            return new Date(currentYear, currentMonth, 1);
        }
        return new Date();
    });

    const [selectedDate, setSelectedDate] = useState(() => {
        if (initialDate) {
            const date = new Date(initialDate);
            return isNaN(date.getTime()) ? new Date() : date;
        }
        return new Date();
    });

    const [selectedButton, setSelectedButton] = useState(null); // Para trackear qué botón está seleccionado

    useEffect(() => {
        if (currentMonth !== null && currentYear !== null) {
            setCurrentDate(new Date(currentYear, currentMonth, 1));
        }
    }, [currentMonth, currentYear]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDay = useMemo(() => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    }, [year, month]);

    const formatDateToYYYYMMDD = useCallback((date) => {
        if (!date || isNaN(date.getTime())) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }, []);

    const isToday = useCallback((day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    }, [month, year]);

    const isSelected = useCallback((day) => {
        return (
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year
        );
    }, [selectedDate, month, year]);

    const isDateDisabled = useCallback((day) => {
        const date = new Date(year, month, day);
        return (minDate && date < minDate) || (maxDate && date > maxDate);
    }, [year, month, minDate, maxDate]);

    const handleButtonClick = useCallback((day, buttonIndex) => {
        if (isDateDisabled(day)) return;
        
        const date = new Date(year, month, day);
        const dateString = formatDateToYYYYMMDD(date);
        
        setSelectedDate(date);
        setSelectedButton({ day, buttonIndex, date: dateString });
        
        // Llamar ambos callbacks
        onDateSelect?.(dateString);
        onButtonClick?.(dateString, buttonIndex, buttonLabels[buttonIndex]);
    }, [year, month, isDateDisabled, formatDateToYYYYMMDD, onDateSelect, onButtonClick, buttonLabels]);

    const isButtonSelected = useCallback((day, buttonIndex) => {
        return selectedButton?.day === day && selectedButton?.buttonIndex === buttonIndex;
    }, [selectedButton]);

    const days = useMemo(() => {
        const allDays = [];

        for (let i = 0; i < startDay; i++) {
            allDays.push(<div key={`empty-${i}`} className="calendar-date-empty" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isTodayDate = isToday(day);
            const isSelectedDay = isSelected(day);
            const isDisabled = isDateDisabled(day);

            const dayContainerClasses = [
                'calendar-date-container',
                isTodayDate && 'calendar-date-container-today',
                isSelectedDay && 'calendar-date-container-selected',
                isDisabled && 'calendar-date-container-disabled'
            ].filter(Boolean).join(' ');

            allDays.push(
                <div key={`day-${day}`} className={dayContainerClasses}>
                    <div className="calendar-date-number">{day}</div>
                    <div className="calendar-date-buttons">
                        {buttonLabels.map((label, buttonIndex) => {
                            const isButtonSelectedForDay = isButtonSelected(day, buttonIndex);
                            const buttonClasses = [
                                'calendar-date-button',
                                `calendar-date-button-${buttonIndex}`,
                                isButtonSelectedForDay && 'calendar-date-button-selected',
                                isDisabled && 'calendar-date-button-disabled'
                            ].filter(Boolean).join(' ');

                            return (
                                <button
                                    key={`${day}-${buttonIndex}`}
                                    className={buttonClasses}
                                    onClick={() => handleButtonClick(day, buttonIndex)}
                                    disabled={isDisabled}
                                    aria-label={`${label} del ${day} de ${currentDate.toLocaleDateString('es-ES', { month: 'long' })} ${year}`}
                                    aria-pressed={isButtonSelectedForDay}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return allDays;
    }, [startDay, daysInMonth, isToday, isSelected, isDateDisabled, handleButtonClick, isButtonSelected, currentDate, year, buttonLabels]);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="three-button-calendar" role="application" aria-label="Calendario de selección de fechas">
            <div className="calendar-month-header">
                <h2 className={`calendar-month-title ${hideNavigation ? 'centered' : ''}`}>
                    {monthNames[month]} {year}
                </h2>
            </div>

            <div className="calendar-weekdays">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                    <div key={index} className="calendar-weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {days}
            </div>
        </div>
    );
};

export default CalendarioEspacios;