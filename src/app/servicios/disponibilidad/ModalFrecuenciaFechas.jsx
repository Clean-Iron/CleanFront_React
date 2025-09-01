'use client';
import React, { useMemo, useState } from 'react';

/* Utilidades de fecha (sin libs) */
const toYmd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export default function ModalFrecuenciaFechas({
  show,
  onClose,
  recurrence = 'NINGUNA', // 'NINGUNA' | 'PUNTUAL' | 'FRECUENTE' | 'QUINCENAL' | 'MENSUAL' (no autogenera)
  baseDate,                // 'YYYY-MM-DD' (opcional)
  onConfirm,               // (dates: string[]) => void
}) {
  // Fecha base (hoy si no viene)
  const initial = baseDate || toYmd(new Date());

  // estado del date input
  const [date, setDate] = useState(initial);

  // Set con orden de inserción; iniciamos con la fecha del mismo día
  const [selected, setSelected] = useState(() => new Set([initial]));

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

  // Agrega SOLO la fecha seleccionada (sin series automáticas)
  const onPickDate = (value) => {
    setDate(value);
    setSelected(prev => new Set([...prev, value])); // dedup + respeta orden (la base va primero)
  };

  const removeDate = (d) => {
    const next = new Set(selected);
    next.delete(d);
    setSelected(next);
  };

  const clearAll = () => {
    // si limpias, y quieres volver a incluir la del mismo día automáticamente:
    const next = new Set([initial]);
    setSelected(next);
    setDate(initial);
  };

  if (!show) return null;

  // Mantener la del mismo día primero si sigue presente
  const ordered = (() => {
    const arr = Array.from(selected);
    // si la fecha base está, la aseguramos en primera posición
    if (arr.includes(initial)) {
      return [initial, ...arr.filter(d => d !== initial)];
    }
    return arr;
  })();

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Contenido */}
        <div className="modal-asignacion-form-grid">
          <div>
            <label>Selecciona fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => onPickDate(e.target.value)}
            />
          </div>

          <div className="modal-chip-section">
            <label>Fechas seleccionadas</label>
            <div className="modal-chip-container">
              <div className="chips">
                {ordered.length === 0 ? (
                  <div className="modal-asignacion-no-opciones">No hay fechas agregadas todavía.</div>
                ) : (
                  ordered.map(d => (
                    <div key={d} className="modal-chip">
                      {d}
                      <span className="modal-asignacion-remove-btn" onClick={() => removeDate(d)}>×</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="modal-asignacion-form-buttons modal-asignacion-full-width">
            <button onClick={onClose} className="modal-asignacion-btn-cancelar">Cerrar</button>
            <button type="button" onClick={clearAll} className="modal-asignacion-btn-cancelar">
              Restablecer al mismo día
            </button>
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
    </div>
  );
}
