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

  // ---- NUEVO: estado buscador empleados en modal ----
  const [empleadoSearchText, setEmpleadoSearchText] = useState('');
  const [empleadosFiltradosModal, setEmpleadosFiltradosModal] = useState([]);

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

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const disabled = overlayOn || saving || deleting;

  // Fallback para evitar lista vacía
  const fallbackStates = ['PROGRAMADA', 'COMPLETADA', 'CANCELADA', 'NO PRESTADO'];
  const statuses = (Array.isArray(serviceStates) && serviceStates.length) ? serviceStates : fallbackStates;

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
  // ---- NUEVO: ref para dropdown de empleados con buscador ----
  const empleadosRef = useRef(null);

  const breakOptions = Array.from({ length: 13 }, (_, i) => i * 5);

  // Helper para excluir ya asignados
  const excluirAsignados = (arr) =>
    (arr || []).filter(ed => !empleadosAsignados.some(a => a.document === ed.document));

  // Filtro local (nombre, apellido, documento)
  const filtrarEmpleadosModal = (valor) => {
    setEmpleadoSearchText(valor);
    const q = (valor || '').trim().toLowerCase();
    const base = excluirAsignados(empleadosDisponibles);
    if (!q) {
      setEmpleadosFiltradosModal(base);
      return;
    }
    setEmpleadosFiltradosModal(
      base.filter(ed => {
        const nombre = `${ed.name ?? ''} ${ed.surname ?? ''}`.toLowerCase();
        const doc = (ed.document ?? '').toString().toLowerCase();
        return nombre.includes(q) || doc.includes(q);
      })
    );
  };

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
      // Inicializa el listado visible del buscador
      setEmpleadosFiltradosModal(excluirAsignados(emps || []));
    }, 'Cargando datos…');
  }, [service]);

  // Cierre de dropdowns al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (startRef.current && !startRef.current.contains(e.target)) setStartTimeOpen(false);
      if (endRef.current && !endRef.current.contains(e.target)) setEndTimeOpen(false);
      if (stateRef.current && !stateRef.current.contains(e.target)) setStateOpen(false);
      if (breakRef.current && !breakRef.current.contains(e.target)) setBreakOpen(false);
      if (empleadosRef.current && !empleadosRef.current.contains(e.target)) setMostrarDropdownEmpleados(false);
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

  // Cuando se abre el dropdown de empleados, refresca la lista base y limpia texto
  useEffect(() => {
    if (mostrarDropdownEmpleados) {
      setEmpleadoSearchText('');
      setEmpleadosFiltradosModal(excluirAsignados(empleadosDisponibles));
    }
  }, [mostrarDropdownEmpleados, empleadosDisponibles, empleadosAsignados]);

  // Snapshot que se devuelve al calendario para pintar de inmediato
  const buildClientSnapshot = () => ({
    id: service.id,
    serviceDate: date,
    startHour,
    endHour,
    state: currentState,
    breakMinutes: Number.isFinite(breakMinutes) ? breakMinutes : 0,
    comments: comentarios,
    recurrenceType: service.recurrenceType,
    clientCompleteName: service.clientCompleteName,
    city: service.city,
    addressService: service.addressService,
    totalServiceHours: service.totalServiceHours,
    services: servicios.map(s => ({ idService: s.id, serviceDescription: s.description })),
    employees: empleadosAsignados.map(e => ({
      employeeDocument: e.document,
      employeeCompleteName: e.employeeCompleteName
    })),
  });

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
      onUpdate?.(buildClientSnapshot());
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
      onUpdate?.({ id: service.id, __deleted: true });
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

            {/* Empleados con BUSCADOR */}
            <div className="modal-chip-section">
              <label>Personal Asignado:</label>
              <div className="modal-chip-container" ref={empleadosRef}>
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
                    title="Agregar personal"
                  >
                    +
                  </button>
                </div>

                {mostrarDropdownEmpleados && !disabled && (
                  <div className="modal-asignacion-dropdown-chip">
                    {/* Input de búsqueda */}
                    <div className="dropdown" style={{ width: '100%', marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Buscar por nombre o documento…"
                        value={empleadoSearchText}
                        onChange={(e) => filtrarEmpleadosModal(e.target.value)}
                        autoFocus
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Resultados */}
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {empleadosFiltradosModal.length > 0 ? (
                        empleadosFiltradosModal.map((ed) => (
                          <button
                            key={ed.document}
                            onClick={() => {
                              setEmpleadosAsignados([
                                ...empleadosAsignados,
                                { document: ed.document, employeeCompleteName: `${ed.name} ${ed.surname}`.trim() },
                              ]);
                              setMostrarDropdownEmpleados(false);
                            }}
                          >
                            {ed.name} {ed.surname} — {ed.document}
                          </button>
                        ))
                      ) : (
                        <div style={{ padding: '8px 6px', color: '#666' }}>Sin resultados</div>
                      )}
                    </div>
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
