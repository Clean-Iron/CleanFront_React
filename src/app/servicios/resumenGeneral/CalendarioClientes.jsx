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

// --- EmployeeDto helpers (tu DTO usa employeeDocument/employeeName/employeeSurname/employeeCompleteName) ---
const empDoc = (e) => (e?.employeeDocument ?? '').toString().trim();
const empFull = (e) =>
  (e?.employeeCompleteName || '').toString().trim() ||
  `${(e?.employeeName || '').toString().trim()} ${(e?.employeeSurname || '').toString().trim()}`.trim();

const employeesFromService = (s) => {
  const arr = Array.isArray(s?.employees) ? s.employees : [];
  if (arr.length) return arr;

  // fallback por si llega 1 empleado “suelto” (compatibilidad)
  const full =
    (s?.employeeCompleteName || '').toString().trim() ||
    `${(s?.employeeName || '').toString().trim()} ${(s?.employeeSurname || '').toString().trim()}`.trim();

  if (!full) return [];
  return [
    {
      employeeDocument: (s?.employeeDocument ?? '').toString().trim(),
      employeeName: (s?.employeeName ?? '').toString().trim(),
      employeeSurname: (s?.employeeSurname ?? '').toString().trim(),
      employeeCompleteName: full,
    },
  ];
};

const labelDeEmpleados = (s) => {
  const arr = employeesFromService(s);
  const names = arr.map(empFull).filter(Boolean);
  return names.join(', ');
};

// dedupe empleados dentro de un slot (por documento o por nombre)
const uniqueEmployees = (services) => {
  const seen = new Set();
  const out = [];

  for (const s of services) {
    const emps = employeesFromService(s);
    for (const e of emps) {
      const doc = empDoc(e);
      const full = empFull(e);
      const key = doc || full;
      if (!key || seen.has(key)) continue;

      seen.add(key);
      out.push({
        employeeDocument: doc || undefined,
        employeeName: e?.employeeName,
        employeeSurname: e?.employeeSurname,
        employeeCompleteName: full,
      });
    }
  }

  return out;
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
   FUSIÓN POR FECHA (solo si start/end iguales)
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
  s.clientDocument || s.clientId || norm(s.clientCompleteName || s.clientName || '');

const extractCityNorm = (s) => norm(s.city || s.clientCity || '');

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

  const result = new Map();
  for (const [date, groupMap] of byDate.entries()) {
    const arr = [];
    for (const { base, items } of groupMap.values()) {
      // si llegan items repetidos, aquí consolidamos empleados
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

  const todayKey = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
  }, []);

  const calendarCityNormalized = norm(calendarCity);

  // servicios fusionados por fecha (solo cuando start/end coinciden)
  const servicesByDate = useMemo(
    () => mergeSameSlotServicesByDate(dataServicios),
    [dataServicios]
  );

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
    const singleServicio = isSingleServiceDay ? serviciosDelDia[0] : null;

    // separar por franja
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

    // Slot por turno como LISTA de servicios (permite hora -> nombres, hora -> nombres)
    let slot0 = [];
    let slot1 = [];

    const keyOf = (s) =>
      s?.id ?? `${s?.serviceDate}|${s?.startHour}|${s?.endHour}|${extractAddress(s)}`;

    const pushUnique = (arr, s) => {
      const k = keyOf(s);
      if (arr.some((x) => keyOf(x) === k)) return;
      arr.push(s);
    };

    if (!isSingleServiceDay) {
      if (aplicarBloqueoPorNoDisp) {
        slot0 = [noDispLargo];
        slot1 = [noDispLargo];
      } else {
        for (const s of morningOnly) pushUnique(slot0, s);
        for (const s of afternoonOnly) pushUnique(slot1, s);

        for (const s of crossing) {
          const mid = (toMin(s.startHour) + toMin(s.endHour)) / 2;
          if (mid >= toMin(T1_END)) pushUnique(slot1, s);
          else pushUnique(slot0, s);
        }

        // largos: si hay 2, asegura 1 en cada turno
        if (largosReales.length >= 2) {
          pushUnique(slot0, largosReales[0]);
          pushUnique(slot1, largosReales[1]);
        } else if (largosReales.length === 1) {
          const lr = largosReales[0];
          const mid = (toMin(lr.startHour) + toMin(lr.endHour)) / 2;
          if (mid >= toMin(T1_END)) pushUnique(slot1, lr);
          else pushUnique(slot0, lr);

          // replica (mantiene lógica tipo “ocupa día”)
          if (slot0.length === 0 && slot1.length > 0) slot0 = [...slot1];
          if (slot1.length === 0 && slot0.length > 0) slot1 = [...slot0];
        }
      }
    }

    const containerClasses = [
      'modern-date-container',
      isToday(year, month, day) && 'modern-date-container-today',
      isDateDisabled(year, month, day) && 'modern-date-container-disabled',
    ]
      .filter(Boolean)
      .join(' ');

    // render por slot: Hora arriba y Nombres debajo, repetido por cada servicio
    const renderBtnSlot = (servicesList, idx, fullWidth = false) => {
      const list = Array.isArray(servicesList)
        ? servicesList
        : servicesList
        ? [servicesList]
        : [];

      const hasAny = list.length > 0;

      // estilo del botón: toma el primero como referencia
      let bgStyle;
      if (hasAny) {
        const servicio = list[0];
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

      if (!hasAny) {
        content = buttonLabels[idx] ?? ['TURNO 1', 'TURNO 2'][idx];
      } else {
        const ordered = [...list].sort((a, b) => toMin(a.startHour) - toMin(b.startHour));

        content = (
          <div style={{ width: '100%', textAlign: 'left', lineHeight: 1.15 }}>
            {ordered.map((s, i) => {
              const reason = getNoDispReason(s);
              const horas = `${formatTo12h(s.startHour)} - ${formatTo12h(s.endHour)}`;
              const empleados = labelDeEmpleados(s) || 'No disponible';

              return (
                <div
                  key={`${s.id ?? `${i}-${s.startHour}-${s.endHour}`}`}
                  style={{ marginBottom: i === ordered.length - 1 ? 0 : 10 }}
                >
                  {/* Hora arriba */}
                  {!reason && (
                    <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {horas}
                    </div>
                  )}

                  {/* Nombres debajo */}
                  <div
                    className="modern-btn-client"
                    style={{
                      whiteSpace: 'normal',
                      marginTop: reason ? 0 : 4,
                    }}
                  >
                    {empleados}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      const disabled = true || isDateDisabled(year, month, day);

      return (
        <button
          key={`${day}-${idx}`}
          className={[
            'modern-date-button',
            disabled && 'modern-date-button-disabled',
            fullWidth && 'modern-date-button-full',
          ]
            .filter(Boolean)
            .join(' ')}
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
          {isSingleServiceDay ? (
            renderBtnSlot([singleServicio], 0, true)
          ) : (
            <>
              {renderBtnSlot(slot0, 0, false)}
              {renderBtnSlot(slot1, 1, false)}
            </>
          )}
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