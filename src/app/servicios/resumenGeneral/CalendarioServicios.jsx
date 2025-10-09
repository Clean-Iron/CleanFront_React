'use client';
import React, { useState, useMemo, useCallback } from 'react';
import FormularioTarea from '../editarTarea/FormularioTarea';
import ModalAsignacion from '../disponibilidad/ModalAsignacion';
import { formatTo12h } from '@/lib/Utils';
import '@/styles/Servicios/ResumenGeneral/CalendarioServicios.css';

const T1_END = '14:00:00';

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const toMin = (hhmmss = '00:00:00') => {
  const [h = 0, m = 0] = (hhmmss || '0:0:0').split(':').map(Number);
  return h * 60 + m;
};
const diffHours = (start, end) => Math.max(0, (toMin(end) - toMin(start)) / 60);
const norm = (t = '') => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().trim();

// Motivo ND
const getNoDispReason = (s) => {
  const txt = norm(s?.clientCompleteName || '');
  if (txt.includes('INCAPACIDAD')) return 'INCAPACIDAD';
  if (txt.includes('DESCONTAR')) return txt;
  if (txt.includes('NO DISPONIBLE')) return 'NO DISPONIBLE';
  return null;
};
const isNoDisponible = (s) => !!getNoDispReason(s);

const CalendarioServicios = ({
  employee,
  dataServicios = [],
  currentMonth = null,
  currentYear = null,
  onServiceUpdate,
  buttonLabels = ['TURNO 1', 'TURNO 2'],
  minDate = null,
  maxDate = null,
}) => {
  // Constantes precomputadas
  const now = useMemo(() => new Date(), []);
  const year = currentYear ?? now.getFullYear();
  const month = currentMonth ?? now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const t1EndMin = useMemo(() => toMin(T1_END), []);
  const todayKey = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
  }, []);

  // Indexa servicios por fecha una sola vez
  const servicesByDate = useMemo(() => {
    const map = new Map();
    for (const s of dataServicios) {
      const k = s.serviceDate;
      if (!k) continue;
      const arr = map.get(k);
      if (arr) arr.push(s);
      else map.set(k, [s]);
    }
    return map;
  }, [dataServicios]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignInfo, setAssignInfo] = useState({ date: '', shiftIndex: 0 });

  const startDay = useMemo(() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // Lunes=0
  }, [year, month]);

  const formatDateToYYYYMMDD = useCallback((y, m, d) => {
    // m = 0-based month
    return `${y}-${pad2(m + 1)}-${pad2(d)}`;
  }, []);

  const isToday = useCallback(
    (y, m, d) => todayKey === formatDateToYYYYMMDD(y, m, d),
    [todayKey, formatDateToYYYYMMDD]
  );

  const isDateDisabled = useCallback(
    (y, m, d) => {
      if (!minDate && !maxDate) return false;
      const date = new Date(y, m, d);
      return (minDate && date < minDate) || (maxDate && date > maxDate);
    },
    [minDate, maxDate]
  );

  const days = useMemo(() => {
    const all = [];

    // espacios vacíos antes del 1
    for (let i = 0; i < startDay; i++) {
      all.push(<div key={`empty-${i}`} className="modern-date-empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateToYYYYMMDD(year, month, day);
      const serviciosDelDia = servicesByDate.get(dateString) || [];

      // Clasificación en un solo recorrido
      const morningOnly = [];
      const afternoonOnly = [];
      const crossing = [];
      let horasReales = 0;

      for (const s of serviciosDelDia) {
        const st = s.startHour || '00:00:00';
        const en = s.endHour || '00:00:00';

        if (!isNoDisponible(s)) {
          horasReales += (s.totalServiceHours ?? diffHours(st, en));
        }

        if (en <= T1_END) morningOnly.push(s);
        else if (st >= T1_END) afternoonOnly.push(s);
        else crossing.push(s);
      }

      // Slots [T1, T2]
      const slots = [null, null];

      if (afternoonOnly.length) slots[1] = afternoonOnly[0];
      if (morningOnly.length && !slots[0]) slots[0] = morningOnly[0];

      for (const s of crossing) {
        const mid = (toMin(s.startHour) + toMin(s.endHour)) / 2;
        const preferT2 = mid >= t1EndMin;
        if (preferT2) {
          if (slots[1] == null) slots[1] = s;
          else if (slots[0] == null) slots[0] = s;
        } else {
          if (slots[0] == null) slots[0] = s;
          else if (slots[1] == null) slots[1] = s;
        }
      }

      let fullDay = horasReales >= 8;

      const noDispLargo = serviciosDelDia.find(
        s => isNoDisponible(s) && (s.totalServiceHours ?? diffHours(s.startHour, s.endHour)) >= 8
      );
      const hayServicioReal = horasReales > 0;
      const aplicarBloqueoPorNoDisp = !!noDispLargo && !hayServicioReal;

      const serviceLargo = serviciosDelDia.find(
        s => !isNoDisponible(s) && (s.totalServiceHours ?? diffHours(s.startHour, s.endHour)) >= 8
      );

      if (aplicarBloqueoPorNoDisp || serviceLargo) {
        fullDay = true;
        const bloque = aplicarBloqueoPorNoDisp ? noDispLargo : serviceLargo;
        slots[0] = bloque;
        slots[1] = bloque;
      }

      const containerClasses = [
        'modern-date-container',
        isToday(year, month, day) && 'modern-date-container-today',
        isDateDisabled(year, month, day) && 'modern-date-container-disabled',
      ]
        .filter(Boolean)
        .join(' ');

      all.push(
        <div key={`day-${day}`} className={containerClasses}>
          <div className="modern-date-number">{day}</div>
          <div className="modern-date-buttons">
            {[0, 1].map((idx) => {
              const servicio = slots[idx];

              const esBloqueoTotal =
                (aplicarBloqueoPorNoDisp || !!serviceLargo) &&
                servicio &&
                (servicio === (aplicarBloqueoPorNoDisp ? noDispLargo : serviceLargo));
              const esSegundoSilencioso = esBloqueoTotal && idx === 1;

              let bgStyle = undefined;
              if (servicio) {
                // 👉 Regla nueva: NO_PRESTADO en morado (prioridad más alta)
                if (servicio.state === 'NO_PRESTADO') {
                  bgStyle = { backgroundColor: '#7C3AED', color: '#fff' }; // morado
                } else if (isNoDisponible(servicio)) {
                  // ND / INCAPACIDAD en rojo
                  bgStyle = { backgroundColor: '#DC2626', color: '#fff' };
                } else {
                  // Resto según recurrenceType
                  const mapColor = {
                    PUNTUAL: '#3B82F6',
                    FRECUENTE: '#10B981',
                    QUINCENAL: '#FBBF24',
                    MENSUAL: '#8B5CF6',
                  };
                  const c = mapColor[servicio.recurrenceType] || '#10B981';
                  bgStyle = { backgroundColor: c, color: '#fff' };
                }
              }

              let content = null;
              if (servicio) {
                if (!esSegundoSilencioso) {
                  const reason = getNoDispReason(servicio);
                  content = reason ? (
                    <div className="modern-btn-client" style={{ lineHeight: 1.1 }}>
                      {reason}
                    </div>
                  ) : (
                    <>
                      <div>{`${formatTo12h(servicio.startHour)} ${formatTo12h(
                        servicio.endHour
                      )}`}</div>
                      <div className="modern-btn-client">{servicio.clientCompleteName}</div>
                    </>
                  );
                }
              } else if (!fullDay) {
                content = buttonLabels[idx];
              }

              const disabled =
                isDateDisabled(year, month, day) || (esBloqueoTotal && !servicio) || esSegundoSilencioso;

              return (
                <button
                  key={`${day}-${idx}`}
                  className={[
                    'modern-date-button',
                    disabled && 'modern-date-button-disabled',
                    esSegundoSilencioso && 'modern-date-button-muted',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={bgStyle}
                  disabled={disabled}
                  aria-hidden={esSegundoSilencioso ? 'true' : undefined}
                  onClick={() => {
                    if (servicio && !esSegundoSilencioso) {
                      setSelectedService(servicio);
                      setModalOpen(true);
                    } else if (!fullDay) {
                      setAssignInfo({ date: dateString, shiftIndex: idx });
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
  }, [
    startDay,
    daysInMonth,
    year,
    month,
    servicesByDate,
    t1EndMin,
    isDateDisabled,
    isToday,
    buttonLabels,
  ]);

  const monthNames = useMemo(
    () => ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    []
  );

  return (
    <div className="modern-calendar" role="application" aria-label="Calendario de selección de fechas">
      <div className="modern-month-header">
        <h2 className="modern-month-title centered">{monthNames[month]} {year}</h2>
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