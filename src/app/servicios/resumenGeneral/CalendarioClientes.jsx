'use client';
import React, { useMemo, useCallback } from 'react';
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

const labelDeEmpleados = (s) => {
  const arr = Array.isArray(s?.employees) ? s.employees : [];
  if (arr.length) {
    return arr
      .map(
        (e) =>
          e.employeeCompleteName ||
          `${e.employeeName || ''} ${e.employeeSurname || ''}`.trim()
      )
      .filter(Boolean)
      .join(', ');
  }
  return (
    s?.employeeCompleteName ||
    `${s?.employeeName || ''} ${s?.employeeSurname || ''}`.trim() ||
    ''
  );
};

// lunes=0..domingo=6
const mondayFirstDow = (y, m, d) => (new Date(y, m, d).getDay() + 6) % 7;

const getWeeksOfMonth = (year, month) => {
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
};

/* -----------------------------
   FUSIÓN DE SERVICIOS IGUALES
   ----------------------------- */
const extractAddress = (s) =>
  norm(
    s.addressService ||
      s.addressResidence ||
      s.clientAddressResidence ||
      s.address ||
      s.clientAddress ||
      ''
  );

const extractClientKey = (s) =>
  (s.clientDocument || s.clientId || norm(s.clientCompleteName || s.clientName || ''));

const extractCityNorm = (s) => norm(s.city || s.clientCity || '');

const uniqueEmployees = (services) => {
  const seen = new Set();
  const out = [];
  for (const s of services) {
    const arr = Array.isArray(s.employees) ? s.employees : [];
    for (const e of arr) {
      const doc = (e.employeeDocument ?? e.document ?? '').toString().trim();
      const key = doc || `${e.employeeName || ''}-${e.employeeSurname || ''}`;
      if (!key) continue;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({
          employeeDocument: doc || undefined,
          employeeName: e.employeeName,
          employeeSurname: e.employeeSurname,
          employeeCompleteName:
            e.employeeCompleteName ||
            `${e.employeeName || ''} ${e.employeeSurname || ''}`.trim(),
          state: e.state,
        });
      }
    }
  }
  return out;
};

const mergeSameSlotServicesByDate = (dataServicios) => {
  const byDate = new Map();

  for (const s of dataServicios || []) {
    const date = s.serviceDate;
    if (!date) continue;

    if (!byDate.has(date)) byDate.set(date, new Map());
    const perDate = byDate.get(date);

    const key = `${extractClientKey(s)}|${extractAddress(s)}|${s.startHour || ''}|${s.endHour || ''}`;

    if (!perDate.has(key)) {
      perDate.set(key, { base: { ...s }, items: [s] });
    } else {
      perDate.get(key).items.push(s);
    }
  }

  // construir resultado por fecha
  const result = new Map();
  for (const [date, groupMap] of byDate.entries()) {
    const arr = [];
    for (const { base, items } of groupMap.values()) {
      const employees = uniqueEmployees(items);
      arr.push({
        ...base,
        employees,
        cityNormalized: extractCityNorm(base),
      });
    }
    result.set(date, arr);
  }
  return result;
};

const CalendarioClientes = ({
  dataServicios = [],
  currentMonth = null,
  currentYear = null,
  buttonLabels = ['TURNO 1', 'TURNO 2'],
  minDate = null,
  maxDate = null,
  visibleWeek = null,
  selectedClient = null,
  calendarCity = '',          
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

  const calendarCityNormalized = norm(calendarCity);

  // servicios fusionados por fecha
  const servicesByDate = useMemo(() => mergeSameSlotServicesByDate(dataServicios), [dataServicios]);

  const startDay = useMemo(() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // lunes=0
  }, [year, month]);

  const weeks = useMemo(() => getWeeksOfMonth(year, month), [year, month]);
  const activeWeekRange = useMemo(() => {
    if (!visibleWeek) return null;
    return weeks[visibleWeek - 1] || null;
  }, [weeks, visibleWeek]);

  const formatDateToYYYYMMDD = useCallback(
    (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`,
    []
  );

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

  const makeDayCell = (day) => {
    const dateString = formatDateToYYYYMMDD(year, month, day);

    // 1) servicios del día
    let serviciosDelDia = servicesByDate.get(dateString) || [];

    // 2) filtrar por ciudad seleccionada (si hay)
    if (calendarCityNormalized) {
      serviciosDelDia = serviciosDelDia.filter((s) => {
        const sCity = s.cityNormalized || extractCityNorm(s);
        return sCity === calendarCityNormalized;
      });
    }

    const isSingleServiceDay = serviciosDelDia.length === 1;
    let singleServicio = isSingleServiceDay ? serviciosDelDia[0] : null;

    // separar por franja si hay más de uno
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

    const largosReales = serviciosDelDia.filter(
      (s) => !isNoDisponible(s) && (s.totalServiceHours ?? diffHours(s.startHour, s.endHour)) >= 8
    );

    const noDispLargo = serviciosDelDia.find(
      (s) => isNoDisponible(s) && (s.totalServiceHours ?? diffHours(s.startHour, s.endHour)) >= 8
    );
    const hayServicioReal = horasReales > 0;
    const aplicarBloqueoPorNoDisp = !!noDispLargo && !hayServicioReal;

    const slots = [null, null];
    const place = (s, pref = null) => {
      if (pref === 0 && !slots[0]) { slots[0] = s; return true; }
      if (pref === 1 && !slots[1]) { slots[1] = s; return true; }
      if (!slots[0]) { slots[0] = s; return true; }
      if (!slots[1]) { slots[1] = s; return true; }
      return false;
    };

    if (!isSingleServiceDay) {
      if (aplicarBloqueoPorNoDisp) {
        slots[0] = noDispLargo;
        slots[1] = noDispLargo;
      } else {
        if (largosReales.length >= 2) {
          place(largosReales[0], 0);
          place(largosReales[1], 1);
        } else if (largosReales.length === 1) {
          const mid = (toMin(largosReales[0].startHour) + toMin(largosReales[0].endHour)) / 2;
          place(largosReales[0], mid >= toMin(T1_END) ? 1 : 0);
        }

        if (morningOnly.length) place(morningOnly[0], 0);
        if (afternoonOnly.length) place(afternoonOnly[0], 1);

        for (const s of crossing) {
          const mid = (toMin(s.startHour) + toMin(s.endHour)) / 2;
          const preferT2 = mid >= toMin(T1_END);
          if (preferT2) place(s, 1);
          else place(s, 0);
        }

        if (largosReales.length === 1 && (!slots[0] ^ !slots[1])) {
          if (!slots[0]) slots[0] = largosReales[0];
          if (!slots[1]) slots[1] = largosReales[0];
        }
      }
    }

    const containerClasses = [
      'modern-date-container',
      isToday(year, month, day) && 'modern-date-container-today',
      isDateDisabled(year, month, day) && 'modern-date-container-disabled',
    ].filter(Boolean).join(' ');

    const renderBtn = (servicio, idx, fullWidth = false) => {
      let bgStyle;
      if (servicio) {
        if (servicio.state === 'NO PRESTADO') {
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

      let content = null;
      if (servicio) {
        const reason = getNoDispReason(servicio);
        const empleados = labelDeEmpleados(servicio) || 'No disponible';
        if (reason) {
          content = <div className="modern-btn-client" style={{ lineHeight: 1.1 }}>{empleados}</div>;
        } else {
          const horas = `${formatTo12h(servicio.startHour)} - ${formatTo12h(servicio.endHour)}`;
          content = (
            <>
              <div>{horas}</div>
              <div className="modern-btn-client">{empleados}</div>
            </>
          );
        }
      } else {
        content = ['TURNO 1', 'TURNO 2'][idx];
      }

      const disabled = true || isDateDisabled(year, month, day);

      return (
        <button
          key={`${day}-${idx}`}
          className={[
            'modern-date-button',
            disabled && 'modern-date-button-disabled',
            fullWidth && 'modern-date-button-full'
          ].filter(Boolean).join(' ')}
          style={bgStyle}
          disabled={disabled}
        >
          {content}
        </button>
      );
    };

    return (
      <div key={`day-${day}`} className={containerClasses}>
        <div className="modern-date-number">{day}</div>

        <div className={`modern-date-buttons ${isSingleServiceDay ? 'one-col' : ''}`}>
          {isSingleServiceDay
            ? renderBtn(singleServicio, 0, true)  // ocupa todo el ancho
            : (
              <>
                {renderBtn(slots[0], 0, false)}
                {renderBtn(slots[1], 1, false)}
              </>
            )
          }
        </div>
      </div>
    );
  };

  const days = useMemo(() => {
    const cells = [];

    if (activeWeekRange) {
      const [d1, d2] = activeWeekRange;
      const offset = mondayFirstDow(year, month, d1);
      for (let i = 0; i < offset; i++) {
        cells.push(<div key={`empty-w-${i}`} className="modern-date-empty" />);
      }
      for (let d = d1; d <= d2; d++) cells.push(makeDayCell(d));
      return cells;
    }

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="modern-date-empty" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(makeDayCell(day));
    }
    return cells;
  }, [
    activeWeekRange,
    startDay,
    daysInMonth,
    year,
    month,
    servicesByDate,
    calendarCityNormalized,
  ]);

  const monthNames = useMemo(
    () => ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    []
  );

  const clientName =
    selectedClient?.name ||
    selectedClient?.clientName ||
    selectedClient?.clientCompleteName ||
    '';

  return (
    <div className="calendar-body">
      <div className="modern-calendar" role="application" aria-label="Calendario de servicios por cliente">
        <div className="modern-month-header">
          <h2 className="modern-month-title centered">
            {monthNames[month]} {year}
            {clientName ? ` · ${clientName}` : ''}
            {calendarCity ? ` · ${calendarCity}` : ''}
            {visibleWeek ? ` · Semana ${visibleWeek}` : ''}
          </h2>
        </div>

        <div className="modern-weekdays">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((n, i) => (
            <div key={i} className="modern-weekday">{n}</div>
          ))}
        </div>

        <div className="modern-calendar-grid">{days}</div>
      </div>
    </div>
  );
};

export default CalendarioClientes;