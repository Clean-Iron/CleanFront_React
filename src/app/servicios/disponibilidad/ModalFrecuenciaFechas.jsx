'use client';

import React, { useMemo, useState, useCallback } from 'react';
import '@/styles/servicios/disponibilidad/ModalFrecuenciaFechas.css';

const toYmd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

const fromYmd = (ymd) => {
  const [Y, M, D] = String(ymd).split('-').map(Number);
  return new Date(Y, (M || 1) - 1, D || 1);
};

const pad2 = (n) => String(n).padStart(2, '0');

const buildYmd = (year, month0, day) => {
  const d = new Date(year, month0, day);
  return toYmd(d);
};

const monthNamesES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const weekDaysES = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

/** Construye una grilla 6x7 (42 celdas) con días del mes + “overflow” del mes anterior/siguiente */
function buildMonthGrid(year, month0) {
  const first = new Date(year, month0, 1);
  const firstDow = first.getDay(); // 0 Domingo
  const gridStart = new Date(year, month0, 1 - firstDow); // domingo anterior (o el mismo)
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);

    const ymd = toYmd(d);
    cells.push({
      ymd,
      year: d.getFullYear(),
      month0: d.getMonth(),
      day: d.getDate(),
      inMonth: d.getMonth() === month0,
      isToday: ymd === toYmd(new Date()),
    });
  }

  return cells;
}

function clampMonthYear(year, month0) {
  let y = year;
  let m = month0;
  while (m < 0) { m += 12; y -= 1; }
  while (m > 11) { m -= 12; y += 1; }
  return { year: y, month0: m };
}

export default function ModalFrecuenciaFechas({
  show,
  onClose,
  recurrence = 'NINGUNA', // 'NINGUNA' | 'PUNTUAL' | 'FRECUENTE' | 'QUINCENAL' | 'MENSUAL'
  baseDate,                // 'YYYY-MM-DD' (opcional)
  onConfirm,               // (dates: string[]) => void
}) {
  const initial = baseDate || toYmd(new Date());

  // Cursor del calendario (mes visible)
  const initialDateObj = useMemo(() => fromYmd(initial), [initial]);
  const [cursor, setCursor] = useState(() => ({
    year: initialDateObj.getFullYear(),
    month0: initialDateObj.getMonth(),
  }));

  // Fechas seleccionadas (orden de inserción)
  const [selectedDates, setSelectedDates] = useState(() => [initial]);

  const title = useMemo(() => {
    const map = {
      NINGUNA: 'Sin frecuencia',
      PUNTUAL: 'Puntual',
      FRECUENTE: 'Frecuente',
      QUINCENAL: 'Quincenal',
      MENSUAL: 'Mensual',
    };
    return map[recurrence] || 'Fechas';
  }, [recurrence]);

  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const ordered = useMemo(() => {
    if (selectedSet.has(initial)) {
      return [initial, ...selectedDates.filter((d) => d !== initial)];
    }
    return selectedDates;
  }, [selectedDates, selectedSet, initial]);

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month0), [cursor.year, cursor.month0]);

  const goPrevMonth = () => {
    setCursor((c) => clampMonthYear(c.year, c.month0 - 1));
  };

  const goNextMonth = () => {
    setCursor((c) => clampMonthYear(c.year, c.month0 + 1));
  };

  const goToday = () => {
    const t = new Date();
    setCursor({ year: t.getFullYear(), month0: t.getMonth() });
    const ymd = toYmd(t);
    setSelectedDates((prev) => (prev.includes(ymd) ? prev : [...prev, ymd]));
  };

  const toggleDate = useCallback((ymd, cellYear, cellMonth0) => {
    // si clickeas un día “gris” de otro mes, navegamos a ese mes
    if (typeof cellYear === 'number' && typeof cellMonth0 === 'number') {
      if (cellYear !== cursor.year || cellMonth0 !== cursor.month0) {
        setCursor({ year: cellYear, month0: cellMonth0 });
      }
    }

    setSelectedDates((prev) => {
      const exists = prev.includes(ymd);
      if (exists) {
        // permitir quitar cualquiera, incluso la base (si la quitas, simplemente no quedará primera)
        return prev.filter((d) => d !== ymd);
      }
      return [...prev, ymd];
    });
  }, [cursor.year, cursor.month0]);

  const removeDate = (d) => {
    setSelectedDates((prev) => prev.filter((x) => x !== d));
  };

  const clearAll = () => {
    setSelectedDates([initial]);
    setCursor({
      year: initialDateObj.getFullYear(),
      month0: initialDateObj.getMonth(),
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Encabezado opcional */}
        <div className="mff-header">
          <div className="mff-title">{title}</div>
          <div className="mff-subtitle">Selecciona varias fechas (clic para agregar/quitar).</div>
        </div>

        <div className="modal-asignacion-form-grid">
          {/* CALENDARIO MULTI */}
          <div className="mff-cal">
            <div className="mff-cal-top">
              <div className="mff-month">
                {monthNamesES[cursor.month0]} de {cursor.year}
              </div>

              <div className="mff-nav">
                <button type="button" className="mff-nav-btn" onClick={goPrevMonth} aria-label="Mes anterior">
                  ‹
                </button>
                <button type="button" className="mff-nav-btn" onClick={goNextMonth} aria-label="Mes siguiente">
                  ›
                </button>
              </div>
            </div>

            <div className="mff-weekdays">
              {weekDaysES.map((wd) => (
                <div key={wd} className="mff-weekday">{wd}</div>
              ))}
            </div>

            <div className="mff-grid" role="grid" aria-label="Calendario">
              {grid.map((cell) => {
                const isSelected = selectedSet.has(cell.ymd);

                return (
                  <button
                    key={cell.ymd}
                    type="button"
                    className={[
                      'mff-day',
                      cell.inMonth ? '' : 'mff-day--muted',
                      isSelected ? 'mff-day--selected' : '',
                      cell.isToday ? 'mff-day--today' : '',
                    ].join(' ').trim()}
                    onClick={() => toggleDate(cell.ymd, cell.year, cell.month0)}
                    title={cell.ymd}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="mff-cal-footer">
              <button type="button" className="mff-link" onClick={clearAll}>
                Restablecer al mismo día
              </button>
              <button type="button" className="mff-link" onClick={goToday}>
                Hoy
              </button>
            </div>
          </div>

          {/* Chips */}
          <div className="modal-chip-section">
            <label>Fechas seleccionadas</label>
            <div className="modal-chip-container">
              <div className="chips">
                {ordered.length === 0 ? (
                  <div className="modal-asignacion-no-opciones">No hay fechas agregadas todavía.</div>
                ) : (
                  ordered.map((d) => (
                    <div key={d} className="modal-chip">
                      {d}
                      <span className="modal-asignacion-remove-btn" onClick={() => removeDate(d)}>×</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="modal-asignacion-form-buttons">
          <button onClick={onClose} className="modal-asignacion-btn-cancelar">Cerrar</button>
          <button
            type="button"
            className="modal-asignacion-btn-confirmar"
            onClick={() => onConfirm?.(ordered)}
            disabled={ordered.length === 0}
            title={ordered.length === 0 ? 'Agrega al menos una fecha' : ''}
          >
            Usar {ordered.length} fecha(s)
          </button>
        </div>
      </div>
    </div>
  );
}
