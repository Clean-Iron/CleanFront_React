'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  obtenerServicios,
  buscarEmpleados,
  actualizarServicio,
  eliminarServicio,
} from '@/lib/Logic.js';
import { useTimeOptions, useServiceStates, useLoadingOverlay } from '@/lib/Hooks';
import { formatTo12h } from '@/lib/Utils';

const FormularioTarea = ({ service, onClose, onUpdate }) => {
  const [date, setDate] = useState(service.serviceDate);
  const [servicios, setServicios] = useState([]);
  const [empleadosAsignados, setEmpleadosAsignados] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
  const [comentarios, setComentarios] = useState('');
  const [startHour, setStartHour] = useState(service.startHour || '');
  const [endHour, setEndHour] = useState(service.endHour || '');
  const [currentState, setCurrentState] = useState(service.state || '');
  const [breakMinutes, setBreakMinutes] = useState(
    Number.isFinite(service.breakMinutes) ? service.breakMinutes : 0
  );

  const timeOptions = useTimeOptions({ startHour: 0, endHour: 24, stepMinutes: 30 });
  const { serviceStates, isLoading: isLoadingStates, isError: isErrorStates } = useServiceStates();

  // Overlay global reutilizable
  const { isLoading: overlayOn, withLoading, OverlayPortal } = useLoadingOverlay('Procesando…');

  // Flags SOLO para pintar el texto de botones en acciones
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const disabled = overlayOn || saving || deleting;

  const fallbackStates = ['PROGRAMADA', 'COMPLETADA', 'CANCELADA', 'NO_PRESTADO'];
  const statuses = serviceStates && serviceStates.length > 0 ? serviceStates : fallbackStates;

  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);
  const [mostrarDropdownServicios, setMostrarDropdownServicios] = useState(false);
  const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false);

  const startRef = useRef(null);
  const endRef = useRef(null);
  const stateRef = useRef(null);
  const breakRef = useRef(null);

  const breakOptions = Array.from({ length: 13 }, (_, i) => i * 5);

  // Inicialización + carga de catálogos (usa overlay pero NO cambia textos de botones)
  useEffect(() => {
    if (service.services) {
      setServicios(service.services.map((s) => ({ id: s.idService, description: s.serviceDescription })));
    } else {
      setServicios([]);
    }

    if (service.employees) {
      setEmpleadosAsignados(
        service.employees.map((e) => ({
          document: e.employeeDocument,
          employeeCompleteName: e.employeeCompleteName,
        }))
      );
    } else {
      setEmpleadosAsignados([]);
    }

    setComentarios(service.comments || '');

    withLoading(async () => {
      const [emps, servs] = await Promise.all([
        buscarEmpleados().catch(() => []),
        obtenerServicios().catch(() => []),
      ]);
      setEmpleadosDisponibles(emps || []);
      setServiciosDisponibles(servs || []);
    }, 'Cargando datos…');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  useEffect(() => {
    const handler = (e) => {
      if (startRef.current && !startRef.current.contains(e.target)) setStartTimeOpen(false);
      if (endRef.current && !endRef.current.contains(e.target)) setEndTimeOpen(false);
      if (stateRef.current && !stateRef.current.contains(e.target)) setStateOpen(false);
      if (breakRef.current && !breakRef.current.contains(e.target)) setBreakOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isLoadingStates && !isErrorStates) {
      if (!currentState || !statuses.includes(currentState)) {
        setCurrentState(statuses[0] || '');
      }
    }
  }, [isLoadingStates, isErrorStates, statuses, currentState]);

  const handleGuardar = async () => {
    if (!currentState || !statuses.includes(currentState)) {
      alert('Selecciona un estado válido.');
      return;
    }

    const datos = {
      ...service,
      date,
      startHour,
      endHour,
      state: currentState,
      breakMinutes: Number.isFinite(breakMinutes) ? breakMinutes : 0,
      employeeDocuments: empleadosAsignados.map((e) => e.document),
      idServices: servicios.map((s) => s.id),
      comments: comentarios,
    };

    setSaving(true);
    try {
      await withLoading(() => actualizarServicio(service.id, datos), 'Guardando cambios…');
      onUpdate?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Eliminar este servicio?')) return;
    setDeleting(true);
    try {
      await withLoading(() => eliminarServicio(service.id), 'Eliminando servicio…');
      onUpdate?.();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {OverlayPortal}

      <div className="modal-overlay" onClick={!disabled ? onClose : undefined}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()} aria-busy={overlayOn}>
          {/* Cabecera superior */}
          <div className="modal-datos-superiores">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={disabled} />

            {/* Hora Inicio */}
            <div>
              <span>Hora Inicio</span>
              <div className="dropdown" ref={startRef}>
                <button
                  type="button"
                  className={`dropdown-trigger ${startTimeOpen ? 'open' : ''}`}
                  onClick={() => !disabled && setStartTimeOpen((o) => !o)}
                  disabled={disabled}
                >
                  <span>{formatTo12h(startHour) || 'Hora inicio'}</span>
                  <span className="arrow">▼</span>
                </button>
                {startTimeOpen && !disabled && (
                  <div className="dropdown-content">
                    {timeOptions.map(({ value, label }) => (
                      <button key={value} onClick={() => { setStartHour(value); setStartTimeOpen(false); }}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hora Fin */}
            <div>
              <span>Hora Fin</span>
              <div className="dropdown" ref={endRef}>
                <button
                  type="button"
                  className={`dropdown-trigger ${endTimeOpen ? 'open' : ''}`}
                  onClick={() => !disabled && setEndTimeOpen((o) => !o)}
                  disabled={disabled}
                >
                  <span>{formatTo12h(endHour) || 'Hora fin'}</span>
                  <span className="arrow">▼</span>
                </button>
                {endTimeOpen && !disabled && (
                  <div className="dropdown-content">
                    {timeOptions.map(({ value, label }) => (
                      <button key={value} onClick={() => { setEndHour(value); setEndTimeOpen(false); }}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Descanso */}
            <div>
              <span>Descanso</span>
              <div className="dropdown" ref={breakRef}>
                <button
                  type="button"
                  className={`dropdown-trigger ${breakOpen ? 'open' : ''}`}
                  onClick={() => !disabled && setBreakOpen((o) => !o)}
                  title="Tiempo de descanso que se descontará del total de horas"
                  disabled={disabled}
                >
                  <span>{`${breakMinutes} min`}</span>
                  <span className="arrow">▼</span>
                </button>
                {breakOpen && !disabled && (
                  <div className="dropdown-content">
                    {breakOptions.map((m) => (
                      <button key={m} onClick={() => { setBreakMinutes(m); setBreakOpen(false); }}
                        className={breakMinutes === m ? 'selected' : ''}>
                        {m} min
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <span>Estado</span>
              <div className="dropdown" ref={stateRef}>
                <button
                  type="button"
                  className={`dropdown-trigger ${stateOpen ? 'open' : ''}`}
                  onClick={() => !disabled && setStateOpen((o) => !o)}
                  disabled={disabled || isLoadingStates || isErrorStates}
                >
                  <span>{isLoadingStates ? 'Cargando...' : isErrorStates ? 'Error' : currentState || 'Estado'}</span>
                  <span className="arrow">▼</span>
                </button>
                {stateOpen && !disabled && (
                  <div className="dropdown-content">
                    {statuses.map((st) => (
                      <button key={st} onClick={() => { setCurrentState(st); setStateOpen(false); }}>
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formulario principal */}
          <div className="modal-asignacion-form-grid">
            <div>
              <label>Cliente</label>
              <input type="text" readOnly value={service.clientCompleteName || ''} />
            </div>
            <div>
              <label>Dirección</label>
              <input type="text" readOnly value={service.addressService || ''} />
            </div>

            {/* Servicios */}
            <div className="modal-chip-section">
              <label>Servicios:</label>
              <div className="modal-chip-container">
                <div className="chips">
                  {servicios.map((s) => (
                    <div className="modal-chip" key={s.id}>
                      {s.description}
                      <span
                        className="modal-asignacion-remove-btn"
                        onClick={() => !disabled && setServicios(servicios.filter((x) => x.id !== s.id))}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="modal-asignacion-add-servicio-btn"
                    onClick={() => !disabled && setMostrarDropdownServicios((v) => !v)}
                    disabled={disabled}
                  >
                    +
                  </button>
                </div>
                {mostrarDropdownServicios && !disabled && (
                  <div className="modal-asignacion-dropdown-chip">
                    {serviciosDisponibles
                      .filter((sd) => !servicios.find((s) => s.id === sd.id))
                      .map((sd) => (
                        <button
                          key={sd.id}
                          onClick={() => {
                            setServicios([...servicios, { id: sd.id, description: sd.description }]);
                            setMostrarDropdownServicios(false);
                          }}
                        >
                          {sd.description}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Empleados */}
            <div className="modal-chip-section">
              <label>Personal Asignado:</label>
              <div className="modal-chip-container">
                <div className="chips">
                  {empleadosAsignados.map((e) => (
                    <div className="modal-chip" key={e.document}>
                      {e.employeeCompleteName}
                      <span
                        className="modal-asignacion-remove-btn"
                        onClick={() =>
                          !disabled &&
                          setEmpleadosAsignados(empleadosAsignados.filter((x) => x.document !== e.document))
                        }
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="modal-asignacion-add-empleado-btn"
                    onClick={() => !disabled && setMostrarDropdownEmpleados((v) => !v)}
                    disabled={disabled}
                  >
                    +
                  </button>
                </div>
                {mostrarDropdownEmpleados && !disabled && (
                  <div className="modal-asignacion-dropdown-chip">
                    {empleadosDisponibles
                      .filter((ed) => !empleadosAsignados.some((a) => a.document === ed.document))
                      .map((ed) => (
                        <button
                          key={ed.document}
                          onClick={() => {
                            setEmpleadosAsignados([
                              ...empleadosAsignados,
                              { document: ed.document, employeeCompleteName: `${ed.name} ${ed.surname}` },
                            ]);
                            setMostrarDropdownEmpleados(false);
                          }}
                        >
                          {ed.name} {ed.surname}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label>Ciudad</label>
              <input type="text" readOnly value={service.city || ''} />
            </div>
            <div>
              <label>Comentarios</label>
              <textarea
                rows={3}
                className="modal-asignacion-textarea"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="modal-asignacion-form-buttons">
            <button className="modal-asignacion-btn-confirmar" onClick={handleGuardar} disabled={disabled}>
              {saving ? 'Guardando…' : 'Guardar Cambios'}
            </button>
            <button className="modal-asignacion-btn-eliminar" onClick={handleEliminar} disabled={disabled}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
            <button
              className="modal-asignacion-btn-cancelar"
              onClick={!disabled ? onClose : undefined}
              disabled={disabled}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormularioTarea;
