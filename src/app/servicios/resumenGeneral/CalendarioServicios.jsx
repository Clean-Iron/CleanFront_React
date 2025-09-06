import React, { useState, useMemo, useCallback } from 'react';
import '@/styles/Servicios/ResumenGeneral/CalendarioServicios.css';
import FormularioTarea from '../editarTarea/FormularioTarea';
import ModalAsignacion from '../disponibilidad/ModalAsignacion';
import { formatTo12h } from '@/lib/Utils';

const CalendarioServicios = ({
  employee,
  dataServicios = [],
  currentMonth = null,
  currentYear = null,
  onServiceUpdate,
  buttonLabels = ['TURNO 1', 'TURNO 2'],
  // opcionales por si luego quieres deshabilitar rangos
  minDate = null,
  maxDate = null,
}) => {
  const now = useMemo(() => new Date(), []);
  const year = currentYear ?? now.getFullYear();
  const month = currentMonth ?? now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignInfo, setAssignInfo] = useState({ date: '', shiftIndex: 0 });

  const startDay = useMemo(() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // Lunes=0
  }, [year, month]);

  const formatDateToYYYYMMDD = useCallback((date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const isToday = useCallback((day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }, [month, year]);

  const isDateDisabled = useCallback((day) => {
    if (!minDate && !maxDate) return false;
    const date = new Date(year, month, day);
    return (minDate && date < minDate) || (maxDate && date > maxDate);
  }, [year, month, minDate, maxDate]);

  const days = useMemo(() => {
    const all = [];

    for (let i = 0; i < startDay; i++) {
      all.push(<div key={`empty-${i}`} className="modern-date-empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateString = formatDateToYYYYMMDD(dateObj);

      const serviciosDelDia = dataServicios.filter(s => s.serviceDate === dateString);
      const morningService = serviciosDelDia.find(s => s.startHour < '12:00:00');
      const afternoonService = serviciosDelDia.find(s => s.startHour >= '12:00:00');
      const orderedServices = [morningService, afternoonService];

      const totalHours = serviciosDelDia.reduce((sum, s) => sum + (s.totalServiceHours || 0), 0);
      const fullDay = totalHours >= 8;

      const containerClasses = [
        'modern-date-container',
        isToday(day) && 'modern-date-container-today',
        isDateDisabled(day) && 'modern-date-container-disabled',
      ].filter(Boolean).join(' ');

      all.push(
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

              const content = servicio
                ? (
                  <>
                    <div>{`${formatTo12h(servicio.startHour)} ${formatTo12h(servicio.endHour)}`}</div>
                    <div className="modern-btn-client">{servicio.clientCompleteName}</div>
                  </>
                )
                : (!fullDay ? buttonLabels[index] : null);

              const btnStyle = bgColor ? { backgroundColor: bgColor, color: '#fff' } : {};
              const btnClasses = [
                'modern-date-button',
                isDateDisabled(day) && 'modern-date-button-disabled',
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={`${day}-${index}`}
                  className={btnClasses}
                  style={btnStyle}
                  disabled={isDateDisabled(day)}
                  onClick={() => {
                    if (servicio) {
                      setSelectedService(servicio);
                      setModalOpen(true);
                    } else if (!fullDay) {
                      setAssignInfo({ date: dateString, shiftIndex: index });
                      setAssignModalOpen(true);
                    }
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    return all;
  }, [startDay, daysInMonth, year, month, dataServicios, isToday, isDateDisabled, formatDateToYYYYMMDD, buttonLabels]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="modern-calendar" role="application" aria-label="Calendario de selección de fechas">
      <div className="modern-month-header">
        <h2 className="modern-month-title centered">
          {monthNames[month]} {year}
        </h2>
      </div>

      <div className="modern-weekdays">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((n, i) => (
          <div key={i} className="modern-weekday">{n}</div>
        ))}
      </div>

      <div className="modern-calendar-grid">{days}</div>

      {modalOpen && selectedService && (
        <FormularioTarea
          service={selectedService}
          onClose={() => { setModalOpen(false); setSelectedService(null); }}
          onUpdate={() => { setModalOpen(false); setSelectedService(null); onServiceUpdate?.(); }}
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
          onAssigned={() => { setAssignModalOpen(false); onServiceUpdate?.(); }}
        />
      )}
    </div>
  );
};

export default CalendarioServicios;