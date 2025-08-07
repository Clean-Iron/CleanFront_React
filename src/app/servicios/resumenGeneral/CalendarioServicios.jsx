import React, { useState, useMemo, useCallback, useEffect } from 'react';
import '@/styles/Servicios/ResumenGeneral/CalendarioServicios.css';
import FormularioTarea from '../editarTarea/FormularioTarea';
import ModalAsignacion from '../disponibilidad/ModalAsignacion';
import { formatTo12h } from '@/lib/Utils'

const CalendarioServicios = ({
  employee,
  dataServicios = [],
  onDateSelect,
  onButtonClick,
  initialDate = null,
  minDate = null,
  maxDate = null,
  currentMonth = null,
  currentYear = null,
  hideNavigation = false,
  onServiceUpdate,
  buttonLabels = ['TURNO 1', 'TURNO 2']
}) => {
  // Estado del calendario
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

  // Estados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  // Estados para el modal de asignación
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignInfo, setAssignInfo] = useState({ date: '', shiftIndex: 0 });

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

    // Huecos antes del primer día
    for (let i = 0; i < startDay; i++) {
      allDays.push(<div key={`empty-${i}`} className="modern-date-empty" />);
    }

    // Cada día
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateString = formatDateToYYYYMMDD(dateObj);

      const serviciosDelDia = dataServicios.filter(s => s.serviceDate === dateString);
      const morningService = serviciosDelDia.find(s => s.startHour < '13:00:00');
      const afternoonService = serviciosDelDia.find(s => s.startHour >= '13:00:00');
      const orderedServices = [morningService, afternoonService];

      const totalHours = serviciosDelDia.reduce((sum, s) => sum + (s.totalServiceHours || 0), 0);
      const fullDay = totalHours >= 8;

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
            {orderedServices.map((servicio, index) => {
              const cellRecurrence = servicio
                ? servicio.recurrenceType
                : (fullDay && serviciosDelDia.length > 0)
                  ? serviciosDelDia[0].recurrenceType
                  : null;

              let bgColor = null;
              switch (cellRecurrence) {
                case 'PUNTUAL': bgColor = '#3B82F6'; break;
                case 'FRECUENTE': bgColor = '#10B981'; break;
                case 'QUINCENAL': bgColor = '#FBBF24'; break;
                case 'MENSUAL': bgColor = '#EF4444'; break;
              }

              let contenido = null;
              if (servicio) {
                contenido = (
                  <>
                    <div>{`${formatTo12h(servicio.startHour)} ${formatTo12h(servicio.endHour)}`}</div>
                    <div className="modern-btn-client">{servicio.clientCompleteName}</div>
                  </>
                );
              } else if (!fullDay) {
                contenido = buttonLabels[index];
              }

              const btnStyle = bgColor
                ? { backgroundColor: bgColor, color: '#FFFFFF' }
                : {};

              const btnClasses = [
                'modern-date-button',
                isButtonSelected(day, index) && 'modern-date-button-selected',
                isDisabled && 'modern-date-button-disabled'
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={`${day}-${index}`}
                  className={btnClasses}
                  style={btnStyle}
                  disabled={isDisabled}
                  aria-pressed={isButtonSelected(day, index)}
                  onClick={() => {
                    handleButtonClick(day, index);
                    // Si hay servicio, abrimos el modal pasando ese servicio
                    if (servicio) {
                      setSelectedService(servicio);
                      setModalOpen(true);
                    } else if (!fullDay) {
                      // Turno libre → abrimos ModalAsignacion
                      setAssignInfo({ date: dateString, shiftIndex: index });
                      setAssignModalOpen(true);
                    }
                  }}
                >
                  {contenido}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return allDays;
  }, [
    startDay, daysInMonth, isToday, isSelected, isDateDisabled,
    handleButtonClick, isButtonSelected, dataServicios,
    formatDateToYYYYMMDD, buttonLabels
  ]);

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
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName, i) => (
          <div key={i} className="modern-weekday">{dayName}</div>
        ))}
      </div>
      <div className="modern-calendar-grid">
        {days}
      </div>

      {/* Aquí renderizamos el modal cuando se abra */}
      {modalOpen && selectedService && (
        <FormularioTarea
          service={selectedService}
          onClose={() => {
            setModalOpen(false);
            setSelectedService(null);
          }}
          onUpdate={() => {
            setModalOpen(false);
            setSelectedService(null);
            onServiceUpdate?.();
          }}
        />
      )}
      {assignModalOpen && (
        <ModalAsignacion
          show={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          empleado={employee}
          date={assignInfo.date}
          startHour={assignInfo.shiftIndex === 0 ? '06:00' : '14:00'}
          endHour={assignInfo.shiftIndex === 0 ? '14:00' : '22:00'}
          city={employee?.city}
          onAssigned={() => {
            setAssignModalOpen(false);
            onServiceUpdate?.();
          }}
        />
      )}
    </div>
  );
};

export default CalendarioServicios;
