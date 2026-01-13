'use client';

import React, { useMemo, useState } from 'react';
import ModalAsignacion from './ModalAsignacion';
import '@/styles/Servicios/Disponibilidad/EspaciosDisponibles.css';

// Reglas de “día copado”
const MAX_SERVICES_PER_DAY = 2;
const MAX_HOURS_PER_DAY = 8;

const BUSY_STATES = new Set(['PROGRAMADA', 'COMPLETADA']);

// Defaults para el modal
const DEFAULT_START = '06:00:00';
const DEFAULT_END = '18:00:00';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function buildISODate(year, month1, day) {
  return `${year}-${pad2(month1)}-${pad2(day)}`;
}

function safeNumber(n) {
  const x = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(x) ? x : null;
}

function calcHoursFromTimes(startHour, endHour, breakMinutes) {
  if (!startHour || !endHour) return null;
  const [sh, sm] = String(startHour).split(':').map(Number);
  const [eh, em] = String(endHour).split(':').map(Number);
  if (!Number.isFinite(sh) || !Number.isFinite(sm) || !Number.isFinite(eh) || !Number.isFinite(em))
    return null;

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (!(endMin > startMin)) return null;

  const br = safeNumber(breakMinutes) || 0;
  const mins = Math.max(0, endMin - startMin - br);
  return mins / 60;
}

function shortHM(hhmmss) {
  return hhmmss ? String(hhmmss).slice(0, 5) : '';
}

function getWeekIndex(dayOfMonth, weeksRanges) {
  for (let i = 0; i < (weeksRanges || []).length; i++) {
    const [a, b] = weeksRanges[i];
    if (dayOfMonth >= a && dayOfMonth <= b) return i; // 0-based
  }
  return null;
}

function buildDatesForWeek(year, month1, range) {
  const [d1, d2] = range;
  const out = [];
  for (let d = d1; d <= d2; d++) {
    out.push({ day: d, iso: buildISODate(year, month1, d), empty: false });
  }
  // Mantener 7 columnas cuando NO hay filtro por día
  while (out.length < 7) {
    out.push({ day: null, iso: `empty-${year}-${month1}-${d1}-${out.length}`, empty: true });
  }
  return out;
}

const EspaciosDisponibles = ({ services = [], filters, loading = false, onAssigned }) => {
  const [showModal, setShowModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBusyServices, setSelectedBusyServices] = useState([]);

  const computed = useMemo(() => {
    const year = filters?.year;
    const month = filters?.month; // 1..12
    const weeksRanges = filters?.weeks || [];
    const selectedWeek = filters?.week; // 1..N o null
    const selectedDayISO = filters?.day || null;

    if (!year || !month || !weeksRanges.length) {
      return { weeksToRender: [], weekBlocks: {}, allEmployees: [], busyByDate: {}, selectedDayISO: null };
    }

    // Si NO hay semana pero sí hay día, inferimos la semana del día
    let weeksToRender;
    if (!selectedWeek && selectedDayISO) {
      const dayOfMonth = Number(String(selectedDayISO).slice(8, 10));
      const wkIdx0 = getWeekIndex(dayOfMonth, weeksRanges);
      weeksToRender = wkIdx0 === null ? [] : [wkIdx0 + 1];
    } else {
      weeksToRender = selectedWeek ? [selectedWeek] : weeksRanges.map((_, idx) => idx + 1);
    }

    // empleados del mes
    const empMap = new Map();
    for (const s of Array.isArray(services) ? services : []) {
      const emps = Array.isArray(s?.employees) ? s.employees : [];
      for (const e of emps) {
        const doc = e.employeeDocument || 'SIN_DOC';
        if (!empMap.has(doc)) {
          empMap.set(doc, {
            document: doc,
            name: e.employeeName || '',
            surname: e.employeeSurname || '',
            completeName:
              e.employeeCompleteName ||
              `${e.employeeName || ''} ${e.employeeSurname || ''}`.trim() ||
              doc,
          });
        }
      }
    }

    const allEmployees = Array.from(empMap.values()).sort((a, b) =>
      (a.completeName || '').localeCompare(b.completeName || '')
    );

    // busyByDate[dateISO][doc] = {count,totalHours,services[]}
    const busyByDate = {};

    for (const s of Array.isArray(services) ? services : []) {
      const dateISO = s?.serviceDate;
      if (!dateISO) continue;
      if (!BUSY_STATES.has(s?.state)) continue;

      const emps = Array.isArray(s?.employees) ? s.employees : [];
      if (!emps.length) continue;

      const rawTotal = safeNumber(s?.totalServiceHours);
      let hours = rawTotal && rawTotal > 0 ? rawTotal : null;

      if (hours === null) hours = calcHoursFromTimes(s?.startHour, s?.endHour, s?.breakMinutes);
      if (hours === null) hours = 0;

      const startTxt = shortHM(s?.startHour);
      const endTxt = shortHM(s?.endHour);

      const serviceView = {
        id: s?.id,
        startText: startTxt,
        endText: endTxt,
        hours,
        client: s?.clientCompleteName || s?.clientName || '',
        state: s?.state,
      };

      busyByDate[dateISO] ??= {};
      for (const e of emps) {
        const doc = e.employeeDocument || 'SIN_DOC';
        busyByDate[dateISO][doc] ??= { count: 0, totalHours: 0, services: [] };
        busyByDate[dateISO][doc].count += 1;
        busyByDate[dateISO][doc].totalHours += hours;
        busyByDate[dateISO][doc].services.push(serviceView);
      }
    }

    // weekBlocks
    const weekBlocks = {};
    for (const wk of weeksToRender) {
      const range = weeksRanges[wk - 1];
      let dates = range ? buildDatesForWeek(year, month, range) : [];

      // Si hay filtro por día: solo ese día (sin placeholders)
      if (selectedDayISO) {
        dates = dates.filter((d) => !d.empty && d.iso === selectedDayISO);
      }

      weekBlocks[wk] = { weekNumber: wk, range, dates };
    }

    return { weeksToRender, weekBlocks, allEmployees, busyByDate, selectedDayISO };
  }, [services, filters]);

  const resetModal = () => {
    setShowModal(false);
    setEmpleadoSeleccionado(null);
    setSelectedDate('');
    setSelectedBusyServices([]);
  };

  const hasFilters = !!(filters?.city && filters?.year && filters?.month);

  const isEmployeeAvailable = (busyStats) => {
    if (!busyStats) return true;
    const count = busyStats.count || 0;
    const total = busyStats.totalHours || 0;

    if (count >= MAX_SERVICES_PER_DAY) return false;
    if (total >= MAX_HOURS_PER_DAY) return false;
    if ((busyStats.services || []).some((s) => (s.hours || 0) >= MAX_HOURS_PER_DAY)) return false;

    return true;
  };

  return (
    <div className="disp-weekly-root">
      <div className="disp-weekly-panel">
        {!hasFilters ? (
          <div className="disp-empty-state disp-empty-state--strong">
            <p>Realiza una búsqueda para ver la disponibilidad.</p>
          </div>
        ) : loading ? (
          <div className="disp-empty-state disp-empty-state--strong">
            <div className="disp-empty-inner">
              <span className="disp-spinner" aria-hidden="true" />
              <p>Cargando disponibilidad…</p>
            </div>
          </div>
        ) : computed.weeksToRender.length === 0 ? (
          <div className="disp-empty-state disp-empty-state--strong">
            <p>No hay semanas para mostrar.</p>
          </div>
        ) : (
          computed.weeksToRender.map((wk) => {
            const block = computed.weekBlocks[wk];
            const range = block?.range;
            const singleDay = !!computed.selectedDayISO;

            return (
              <div className={`disp-week-grid ${singleDay ? 'disp-week-grid--single' : ''}`} key={wk}>
                <div className="disp-week-header">
                  Semana {wk} {range ? `(${range[0]}–${range[1]})` : ''}
                </div>

                {block.dates.length === 0 ? (
                  <div className="disp-day-col">
                    <div className="disp-day-header">{computed.selectedDayISO || 'Día'}</div>
                    <div className="disp-day-note">No hay datos para ese día.</div>
                  </div>
                ) : (
                  block.dates.map((d) => {
                    if (!singleDay && d.empty) {
                      return <div className="disp-day-col disp-day-col--empty" key={d.iso} />;
                    }

                    const dayBusy = computed.busyByDate[d.iso] || {};

                    const employeesForDay = computed.allEmployees
                      .map((emp) => {
                        const busy = dayBusy[emp.document];
                        const available = isEmployeeAvailable(busy);
                        return { emp, busy, available };
                      })
                      .filter((x) => x.available) // ✅ no mostrar copados
                      .sort((a, b) => (a.emp.completeName || '').localeCompare(b.emp.completeName || ''));

                    return (
                      <div className="disp-day-col" key={d.iso}>
                        <div className="disp-day-header">{d.iso}</div>

                        {employeesForDay.length === 0 ? (
                          <div className="disp-day-note">Sin espacios disponibles.</div>
                        ) : (
                          employeesForDay.map(({ emp, busy }) => {
                            const count = busy?.count || 0;
                            const total = busy?.totalHours || 0;

                            return (
                              <div className="disp-emp-card" key={`${d.iso}-${emp.document}`}>
                                <div className="disp-emp-info">
                                  <div className="disp-emp-top">
                                    <h4 className="disp-emp-name">{emp.completeName || emp.document}</h4>

                                    <span className="disp-status disp-status--ok">
                                      {count > 0
                                        ? `Ocupado parcial (${count} / ${total.toFixed(1)}h)`
                                        : 'Disponible'}
                                    </span>
                                  </div>

                                  <p className="disp-emp-doc">Documento: {emp.document}</p>

                                  {busy?.services?.length ? (
                                    <div className="disp-services">
                                      {busy.services
                                        .slice()
                                        .sort((a, b) => (a.startText || '').localeCompare(b.startText || ''))
                                        .map((s, idx) => (
                                          <button
                                            key={`${s.id || 'svc'}-${idx}`}
                                            type="button"
                                            className="disp-service-row disp-service-row--busy"
                                            disabled
                                          >
                                            {s.startText && s.endText ? `${s.startText}–${s.endText}` : 'Horario'}
                                            {Number.isFinite(s.hours) ? ` • ${s.hours.toFixed(1)}h` : ''}
                                            {s.client ? ` • ${s.client}` : ''}
                                          </button>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="disp-services disp-services--empty">
                                      <div className="disp-service-row disp-service-row--empty">
                                        Sin servicios registrados hoy
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <button
                                  className="disp-assign-btn"
                                  onClick={() => {
                                    setEmpleadoSeleccionado(emp);
                                    setSelectedDate(d.iso);
                                    setSelectedBusyServices(busy?.services || []);
                                    setShowModal(true);
                                  }}
                                >
                                  Asignar
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })
        )}
      </div>

      {showModal && empleadoSeleccionado && selectedDate && (
        <ModalAsignacion
          show={showModal}
          onClose={resetModal}
          empleado={empleadoSeleccionado}
          date={selectedDate}
          startHour={DEFAULT_START}
          endHour={DEFAULT_END}
          busyServices={selectedBusyServices}
          onAssigned={() => {
            resetModal();
            onAssigned?.();
          }}
        />
      )}
    </div>
  );
};

export default EspaciosDisponibles;
