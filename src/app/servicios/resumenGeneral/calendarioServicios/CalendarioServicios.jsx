
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import '../../../../styles/Servicios/ResumenGeneral/CalendarioServicios/CalendarioServicios.css';

const CalendarioServicios = ({
    dataServicios = [],
    onDateSelect,
    onButtonClick,
    initialDate = null,
    minDate = null,
    maxDate = null,
    currentMonth = null,
    currentYear = null,
    hideNavigation = false,
    buttonLabels = ['TURNO 1', 'TURNO 2']
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

    const [selectedButton, setSelectedButton] = useState(null);

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
        const dateObj = new Date(year, month, day);
        const dateString = formatDateToYYYYMMDD(dateObj);
        setSelectedDate(dateObj);
        setSelectedButton({ day, buttonIndex, date: dateString });
        onDateSelect?.(dateString);
        onButtonClick?.(dateString, buttonIndex, buttonLabels[buttonIndex]);
    }, [year, month, isDateDisabled, formatDateToYYYYMMDD, onDateSelect, onButtonClick, buttonLabels]);

    const isButtonSelected = useCallback((day, buttonIndex) => {
        return selectedButton?.day === day && selectedButton?.buttonIndex === buttonIndex;
    }, [selectedButton]);

    const days = useMemo(() => {
        const allDays = [];

        for (let i = 0; i < startDay; i++) {
            allDays.push(<div key={`empty-${i}`} className="modern-date-empty" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateString = formatDateToYYYYMMDD(dateObj);

            const serviciosDelDia = dataServicios.filter(s => s.serviceDate === dateString);
            const totalHours = serviciosDelDia.reduce((sum, s) => sum + (s.totalServiceHours || 0), 0);
            const fullDay = totalHours === 8;

            const isTodayDate = isToday(day);
            const isSelectedDay = isSelected(day);
            const isDisabled = isDateDisabled(day);

            const containerClasses = [
                'modern-date-container',
                isTodayDate && 'modern-date-container-today',
                isSelectedDay && 'modern-date-container-selected',
                isDisabled && 'modern-date-container-disabled'
            ].filter(Boolean).join(' ');

            allDays.push(
                <div key={`day-${day}`} className={containerClasses}>
                    <div className="modern-date-number">{day}</div>
                    <div className="modern-date-buttons">
                        {buttonLabels.map((label, buttonIndex) => {
                            const ocupado = serviciosDelDia[buttonIndex] !== undefined;
                            const red = fullDay || ocupado;
                            const btnStyle = red ? { backgroundColor: '#EF4444', color: '#FFFFFF' } : {};
                            const selectedBtn = isButtonSelected(day, buttonIndex);

                            const btnClasses = [
                                'modern-date-button',
                                selectedBtn && 'modern-date-button-selected',
                                isDisabled && 'modern-date-button-disabled'
                            ].filter(Boolean).join(' ');

                            return (
                                <button
                                    key={`${day}-${buttonIndex}`}
                                    className={btnClasses}
                                    style={btnStyle}
                                    onClick={() => handleButtonClick(day, buttonIndex)}
                                    disabled={isDisabled}
                                    aria-label={`${label} del ${day} de ${currentDate.toLocaleDateString('es-ES', { month: 'long' })} ${year}`}
                                    aria-pressed={selectedBtn}
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
    }, [startDay, daysInMonth, isToday, isSelected, isDateDisabled, handleButtonClick, isButtonSelected, dataServicios, formatDateToYYYYMMDD, buttonLabels, currentDate, year, month]);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="modern-calendar" role="application" aria-label="Calendario de selección de fechas">
            <div className="modern-month-header">
                <h2 className={`modern-month-title ${hideNavigation ? 'centered' : ''}`}>
                    {monthNames[month]} {year}
                </h2>
            </div>

            <div className="modern-weekdays">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                    <div key={index} className="modern-weekday">{day}</div>
                ))}
            </div>

            <div className="modern-calendar-grid">
                {days}
            </div>
        </div>
    );
};

export default CalendarioServicios;
