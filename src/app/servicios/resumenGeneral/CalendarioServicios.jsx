'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FormularioTarea from '../editarTarea/FormularioTarea';
import ModalAsignacion from '../disponibilidad/ModalAsignacion';
import { formatTo12h } from '@/lib/Utils';
import '@/styles/Servicios/ResumenGeneral/CalendarioServicios.css';

const T1_END = '14:00:00';

// utils
const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const toMin = (hhmmss = '00:00:00') => {
  const [h = 0, m = 0] = (hhmmss || '0:0:0').split(':').map(Number);
  return h * 60 + m;
};
const diffHours = (start, end) => Math.max(0, (toMin(end) - toMin(start)) / 60);
const norm = (t = '') => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().trim();

const getNoDispReason = (s) => {
  const txt = norm(s?.clientCompleteName || '');
  if (txt.includes('INCAPACIDAD')) return 'INCAPACIDAD';
  if (txt.includes('DESCONTAR')) return txt;
  if (txt.includes('NO DISPONIBLE')) return 'NO DISPONIBLE';
  if (txt.includes('CITAS MEDICAS')) return 'CITAS MEDICAS';
  return null;
};
const isNoDisponible = (s) => !!getNoDispReason(s);

// semanas del mes (Lun = 0 .. Dom = 6)
function getWeeksOfMonth(year, month /*0-based*/) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let d = 1;
  while (d <= lastDay) {
    const date = new Date(year, month, d);
    const dow = (date.getDay() + 6) % 7;
    const start = Math.max(1, d - dow);
    let end = start;
    while (end <= lastDay) {
      const ed = new Date(year, month, end);
      if (ed.getDay() === 0 || end === lastDay) break;
      end++;
    }
    weeks.push([start, end]);
    d = end + 1;
  }
  return weeks;
}

const mondayFirstDow = (y, m, d) => (new Date(y, m, d).getDay() + 6) % 7;

const CalendarioServicios = ({
  employee,
  dataServicios = [],
  currentMonth = null,
  currentYear = null,
  onServiceUpdate,
  buttonLabels = ['TURNO 1', 'TURNO 2'],
  minDate = null,
  maxDate = null,
  visibleWeek = null,
}) => {
  const now = useMemo(() => new Date(), []);
  const year = currentYear ?? now.getFullYear();
  const month = currentMonth ?? now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const t1EndMin = useMemo(() => toMin(T1_END), []);
  const todayKey = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
  }, []);

  // estado local (optimista)
  const [localServicios, setLocalServicios] = useState(dataServicios);
  useEffect(() => {
    setLocalServicios(dataServicios);
  }, [dataServicios]);

  const servicesByDate = useMemo(() => {
    const map = new Map();
    for (const s of localServicios) {
      const k = s.serviceDate;
      if (!k) continue;
      const arr = map.get(k);
      if (arr) arr.push(s);
      else map.set(k, [s]);
    }
    return map;
  }, [localServicios]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignInfo, setAssignInfo] = useState({ date: '', shiftIndex: 0, dayUsage: null });

  const startDay = useMemo(() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
  }, [year, month]);

  const weeks = useMemo(() => getWeeksOfMonth(year, month), [year, month]);
  const activeWeekRange = useMemo(() => {
    if (!visibleWeek) return null;
    return weeks[visibleWeek - 1] || null;
  }, [weeks, visibleWeek]);

  const formatDateToYYYYMMDD = useCallback((y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`, []);
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

  const handleModalUpdate = useCallback(
    (snap) => {
      setModalOpen(false);
      setSelectedService(null);

      setLocalServicios((prev) => {
        if (snap?.__deleted) return prev.filter((s) => s.id !== snap.id);
        const i = prev.findIndex((s) => s.id === snap.id);
        if (i === -1) return [...prev, snap];
        const next = prev.slice();
        next[i] = { ...next[i], ...snap };
        return next;
      });

      onServiceUpdate?.();
    },
    [onServiceUpdate]
  );

  const makeDayCell = (day) => {
    const dateString = formatDateToYYYYMMDD(year, month, day);
    const serviciosDelDia = servicesByDate.get(dateString) || [];

    // clasificar por franja
    const morningOnly = [];
    const afternoonOnly = [];
    const crossing = [];
    let horasReales = 0;

    for (const s of serviciosDelDia) {
      const st = s.startHour || '00:00:00';
      const en = s.endHour || '00:00:00';

      if (!isNoDisponible(s)) {
        horasReales += s.totalServiceHours ?? diffHours(st, en);
      }

      if (en <= T1_END) morningOnly.push(s);
      else if (st >= T1_END) afternoonOnly.push(s);
      else crossing.push(s);
    }

    // detectar bloqueo/largo
    const noDispLargo = serviciosDelDia.find(
      (s) => isNoDisponible(s) && (s.totalServiceHours ?? diffHours(s.startHour, s.endHour)) >= 8
    );
    const hayServicioReal = horasReales > 0;
    const aplicarBloqueoPorNoDisp = !!noDispLargo && !hayServicioReal;

    const serviceLargo = serviciosDelDia.find(
      (s) => !isNoDisponible(s) && (s.totalServiceHours ?? diffHours(s.startHour, s.endHour)) >= 8
    );

    // preparar slots para render
    const slots = [null, null];
    if (aplicarBloqueoPorNoDisp || serviceLargo) {
      const bloque = aplicarBloqueoPorNoDisp ? noDispLargo : serviceLargo;
      slots[0] = bloque;
      slots[1] = bloque;
    } else {
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
    }

    // === CÁLCULO PARA EL TOPE (máx 3 categorías: mañana, tarde, full-day) ===
    const crossingMorning = crossing.filter((s) => {
      const mid = (toMin(s.startHour) + toMin(s.endHour)) / 2;
      return mid < t1EndMin;
    });
    const crossingAfternoon = crossing.filter((s) => {
      const mid = (toMin(s.startHour) + toMin(s.endHour)) / 2;
      return mid >= t1EndMin;
    });

    const hasMorning =
      morningOnly.length > 0 || crossingMorning.length > 0 || (!!slots[0] && !aplicarBloqueoPorNoDisp && !serviceLargo);
    const hasAfternoon =
      afternoonOnly.length > 0 || crossingAfternoon.length > 0 || (!!slots[1] && !aplicarBloqueoPorNoDisp && !serviceLargo);
    const hasFullDay = !!serviceLargo || aplicarBloqueoPorNoDisp; // considera bloqueo como “día completo”

    const dailyUsed = (hasMorning ? 1 : 0) + (hasAfternoon ? 1 : 0) + (hasFullDay ? 1 : 0);
    const maxHalfReached = !hasFullDay && hasMorning && hasAfternoon;
    const reachedDailyLimit = dailyUsed >= 3 || maxHalfReached;

    const containerClasses = [
      'modern-date-container',
      isToday(year, month, day) && 'modern-date-container-today',
      isDateDisabled(year, month, day) && 'modern-date-container-disabled',
    ]
      .filter(Boolean)
      .join(' ');

    // payload de uso diario para el modal
    const dayUsage = { hasMorning, hasAfternoon, hasFullDay, blockFullDay: aplicarBloqueoPorNoDisp };

    return (
      <div key={`day-${day}`} className={containerClasses}>
        <div className="modern-date-number">{day}</div>

        <div className="modern-date-buttons">
          {[0, 1].map((idx) => {
            const servicio = slots[idx];
            const esBloqueoTotal =
              (aplicarBloqueoPorNoDisp || !!serviceLargo) &&
              servicio &&
              servicio === (aplicarBloqueoPorNoDisp ? noDispLargo : serviceLargo);
            const esSegundoSilencioso = esBloqueoTotal && idx === 1;

            let bgStyle;
            if (servicio) {
              const stateNorm = (servicio.state || '').replace('_', ' ').trim().toUpperCase();
              if (stateNorm === 'NO PRESTADO') {
                bgStyle = { backgroundColor: '#ee27eeff', color: '#fff' };
              } else if (isNoDisponible(servicio)) {
                bgStyle = { backgroundColor: '#DC2626', color: '#fff' };
              } else {
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

            // contenido (AJUSTADO: hora arriba, datos debajo)
            let content = null;
            if (servicio) {
              if (!esSegundoSilencioso) {
                const reason = getNoDispReason(servicio);

                if (reason) {
                  // Si es “NO DISPONIBLE / INCAPACIDAD...”
                  content = (
                    <div style={{ lineHeight: 1.1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{reason}</div>
                      {(servicio.clientCompleteName || servicio.addressService) && (
                        <div className="modern-btn-client" style={{ whiteSpace: 'normal', marginTop: 4 }}>
                          {servicio.clientCompleteName || ''}
                          {servicio.addressService ? ` · ${servicio.addressService}` : ''}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  content = (
                    <div style={{ lineHeight: 1.15, textAlign: 'left' }}>
                      {/* Hora arriba */}
                      <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {`${formatTo12h(servicio.startHour)} - ${formatTo12h(servicio.endHour)}`}
                      </div>

                      {/* Datos debajo */}
                      <div className="modern-btn-client" style={{ whiteSpace: 'normal', marginTop: 4 }}>
                        {servicio.clientCompleteName || ''}
                        {servicio.addressService ? ` · ${servicio.addressService}` : ''}
                      </div>
                    </div>
                  );
                }
              }
            } else if (!(aplicarBloqueoPorNoDisp || serviceLargo)) {
              content = buttonLabels[idx];
            }

            // deshabilitado si: día inválido, bloqueo total, duplicado silencioso,
            // o bien si el turno ya está ocupado / se alcanzó el tope
            const disabled =
              isDateDisabled(year, month, day) ||
              (esBloqueoTotal && !servicio) ||
              esSegundoSilencioso ||
              (!servicio &&
                (reachedDailyLimit || (idx === 0 && hasMorning) || (idx === 1 && hasAfternoon)));

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
                  } else if (!(aplicarBloqueoPorNoDisp || serviceLargo)) {
                    setAssignInfo({ date: dateString, shiftIndex: idx, dayUsage });
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
  };

  const days = useMemo(() => {
    const cells = [];

    if (activeWeekRange) {
      const [d1, d2] = activeWeekRange;
      const offset = mondayFirstDow(year, month, d1);
      for (let i = 0; i < offset; i++) cells.push(<div key={`empty-w-${i}`} className="modern-date-empty" />);
      for (let d = d1; d <= d2; d++) cells.push(makeDayCell(d));
      return cells;
    }

    for (let i = 0; i < startDay; i++) cells.push(<div key={`empty-${i}`} className="modern-date-empty" />);
    for (let day = 1; day <= daysInMonth; day++) cells.push(makeDayCell(day));
    return cells;
  }, [activeWeekRange, startDay, daysInMonth, year, month, servicesByDate]);

  const monthNames = useMemo(
    () => ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    []
  );

  return (
    <div className="calendar-body">
      <div className="modern-calendar" role="application" aria-label="Calendario de selección de fechas">
        <div className="modern-month-header">
          <h2 className="modern-month-title centered">
            {monthNames[month]} {year}
            {activeWeekRange ? ` — Semana ${visibleWeek}` : ''}
          </h2>
        </div>

        <div className="modern-weekdays">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((n, i) => (
            <div key={i} className="modern-weekday">
              {n}
            </div>
          ))}
        </div>

        <div className="modern-calendar-grid">{days}</div>

        {modalOpen && selectedService && (
          <FormularioTarea
            service={selectedService}
            onClose={() => {
              setModalOpen(false);
              setSelectedService(null);
            }}
            onUpdate={handleModalUpdate}
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
            dayUsage={assignInfo.dayUsage}
            onAssigned={() => {
              setAssignModalOpen(false);
              onServiceUpdate?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarioServicios;