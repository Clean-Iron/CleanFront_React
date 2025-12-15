'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  obtenerServicios,
  buscarClientes,
  asignarServicio,
  buscarEmpleados,
} from '@/lib/Logic.js';
import { useTimeOptions, useLoadingOverlay } from '@/lib/Hooks';
import { formatTo12h } from '@/lib/Utils';
import ModalFrecuenciaFechas from './ModalFrecuenciaFechas';

const RECURRENCES = ['NINGUNA', 'PUNTUAL', 'FRECUENTE', 'QUINCENAL', 'MENSUAL'];

// ------- helpers para validar el tope -------
const T1_END = '14:00';
const toMin = (hhmm = '00:00') => {
  const [h = 0, m = 0] = (hhmm || '0:0').split(':').map(Number);
  return h * 60 + m;
};
const T1_END_MIN = toMin(T1_END);

export default function ModalAsignacion({
  show,
  onClose,
  empleado,
  date,
  startHour: startHourProp,
  endHour: endHourProp,
  allEmployees,
  onAssigned,
  dayUsage = { hasMorning: false, hasAfternoon: false, hasFullDay: false, blockFullDay: false }, // ← NUEVO
}) {
  const recurrencyRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const breakRef = useRef(null);
  const clienteRef = useRef(null);
  const empleadosRef = useRef(null);
  const serviciosRef = useRef(null);

  const [startHour, setStartHour] = useState(startHourProp || '');
  const [endHour, setEndHour] = useState(endHourProp || '');
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [currentRecurrency, setCurrentRecurrency] = useState('NINGUNA');
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  const [stateOpen, setStateOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);

  // Empleados
  const [empleadosAdicionales, setEmpleadosAdicionales] = useState([]);
  const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false);

  const [baseEmployees, setBaseEmployees] = useState([]);
  const [empleadoSearchText, setEmpleadoSearchText] = useState('');
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  // Servicios
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [mostrarDropdownServicios, setMostrarDropdownServicios] = useState(false);

  // Clientes
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [clienteText, setClienteText] = useState('');
  const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false);

  const [comentarios, setComentarios] = useState('');

  const timeOptions = useTimeOptions({ startHour: 0, endHour: 24, stepMinutes: 30 });
  const labelFor = (value) =>
    timeOptions.find(opt => opt.value === value)?.label || (value ? formatTo12h(value) : '');

  const breakOptions = Array.from({ length: 13 }, (_, i) => i * 5);

  const { isLoading: assigning, withLoading, OverlayPortal } =
    useLoadingOverlay('Asignando servicio(s)...');

  useEffect(() => {
    if (!show) return;
    setStartHour(startHourProp || '');
    setEndHour(endHourProp || '');
    setBreakMinutes(0);
  }, [show, startHourProp, endHourProp]);

  // catálogos
  useEffect(() => {
    if (!show) return;

    obtenerServicios().then(setServiciosDisponibles).catch(() => setServiciosDisponibles([]));
    buscarClientes()
      .then((data) => {
        setClientes(data || []);
        setClientesFiltrados(data || []);
        setClienteSeleccionado(null);
        setDireccionSeleccionada(null);
        setClienteText('');
      })
      .catch(() => {
        setClientes([]); setClientesFiltrados([]);
      });

    (async () => {
      if (allEmployees?.length) setBaseEmployees(allEmployees);
      else {
        const emps = await buscarEmpleados().catch(() => []);
        setBaseEmployees(emps || []);
      }
    })();
  }, [show, allEmployees]);

  // cerrar dropdowns
  useEffect(() => {
    if (!show) return;
    const isInside = (ref, target) => ref?.current && ref.current.contains(target);
    const handleOutside = (e) => {
      const t = e.target;
      if (startTimeOpen && !isInside(startRef, t)) setStartTimeOpen(false);
      if (endTimeOpen   && !isInside(endRef, t))   setEndTimeOpen(false);
      if (breakOpen     && !isInside(breakRef, t)) setBreakOpen(false);
      if (stateOpen     && !isInside(recurrencyRef, t)) setStateOpen(false);
      if (mostrarDropdownClientes && !isInside(clienteRef, t)) setMostrarDropdownClientes(false);
      if (mostrarDropdownEmpleados && !isInside(empleadosRef, t)) setMostrarDropdownEmpleados(false);
      if (mostrarDropdownServicios && !isInside(serviciosRef, t)) setMostrarDropdownServicios(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [show, startTimeOpen, endTimeOpen, breakOpen, stateOpen, mostrarDropdownClientes, mostrarDropdownEmpleados, mostrarDropdownServicios]);

  // empleados: helpers
  const excluirSeleccionados = (arr) =>
    (arr || []).filter(e =>
      e.document !== empleado?.document &&
      !empleadosAdicionales.some(a => a.document === e.document)
    );

  const filtrarEmpleados = (valor) => {
    setEmpleadoSearchText(valor);
    setMostrarDropdownEmpleados(true);
    const q = (valor || '').trim().toLowerCase();
    const base = excluirSeleccionados(baseEmployees);
    if (!q) { setEmpleadosFiltrados(base); return; }
    setEmpleadosFiltrados(
      base.filter(ed => {
        const full = `${ed.name ?? ''} ${ed.surname ?? ''}`.toLowerCase();
        const doc = (ed.document ?? '').toString().toLowerCase();
        return full.includes(q) || doc.includes(q);
      })
    );
  };

  useEffect(() => {
    if (mostrarDropdownEmpleados) {
      setEmpleadoSearchText('');
      setEmpleadosFiltrados(excluirSeleccionados(baseEmployees));
    }
  }, [mostrarDropdownEmpleados, baseEmployees, empleadosAdicionales, empleado]);

  const handleAgregarEmpleado = (nuevo) => {
    setEmpleadosAdicionales(prev =>
      prev.some(e => e.document === nuevo.document) ? prev : [...prev, nuevo]
    );
    setMostrarDropdownEmpleados(false);
  };
  const handleEliminarEmpleado = (document) => {
    setEmpleadosAdicionales(prev => prev.filter(e => e.document !== document));
  };

  const handleAgregarServicio = (nuevo) => {
    setServicios(prev => prev.some(s => s.id === nuevo.id) ? prev : [...prev, nuevo]);
    setMostrarDropdownServicios(false);
  };
  const handleEliminarServicio = (id) => {
    setServicios(prev => prev.filter(s => s.id !== id));
  };

  // clientes
  const filtrarClientes = (valor) => {
    setClienteText(valor);
    setMostrarDropdownClientes(true);
    const q = valor.trim().toLowerCase();
    if (!q) { setClientesFiltrados(clientes); return; }
    setClientesFiltrados(
      clientes.filter(c => {
        const full = `${c.name ?? ''} ${c.surname ?? ''}`.toLowerCase();
        const doc = (c.document ?? '').toString().toLowerCase();
        const addrBlob = (c.addresses ?? [])
          .map(a => `${a.address ?? ''} ${a.city ?? ''}`.toLowerCase())
          .join(' | ');
        return full.includes(q) || doc.includes(q) || addrBlob.includes(q);
      })
    );
  };

  const handleSeleccionarCliente = (cliente, direccion) => {
    setClienteSeleccionado(cliente);
    setDireccionSeleccionada(direccion);
    setClienteText(
      `${cliente.name} ${cliente.surname} — ${direccion?.address ?? ''}${direccion?.city ? ` (${direccion.city})` : ''}`
    );
    setMostrarDropdownClientes(false);
  };

  const onClienteKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (clientesFiltrados.length > 0) {
        const c = clientesFiltrados[0];
        const addr = (c.addresses && c.addresses.length > 0) ? c.addresses[0] : null;
        handleSeleccionarCliente(c, addr);
      }
    } else if (e.key === 'Escape') {
      setMostrarDropdownClientes(false);
    }
  };

  const openDatesIfNeeded = (value) => {
    setCurrentRecurrency(value);
    if (value !== 'NINGUNA') setShowDatesModal(true);
    else setSelectedDates([]);
  };

  // ----------- VALIDACIÓN DEL TOPE EN EL MODAL -----------
  const calcCategory = () => {
    if (!startHour || !endHour) return null;
    const startM = toMin(startHour);
    const endM   = toMin(endHour);
    const realH  = Math.max(0, (endM - startM - breakMinutes) / 60);
    if (realH >= 8) return 'full';
    const mid = (startM + endM) / 2;
    return (mid >= T1_END_MIN) ? 'afternoon' : 'morning';
  };

  const handleAsignar = async () => {
    if (!clienteSeleccionado || servicios.length === 0) {
      alert('Seleccione un cliente y al menos un servicio'); return;
    }
    if (!startHour || !endHour) {
      alert('Seleccione la hora de inicio y la hora de fin'); return;
    }
    if (!direccionSeleccionada) {
      alert('Seleccione una dirección para el servicio'); return;
    }

    // bloqueo “NO DISPONIBLE” día completo
    if (dayUsage.blockFullDay) {
      alert('Este día está bloqueado por NO DISPONIBLE. No se pueden crear servicios.'); 
      return;
    }

    const cat = calcCategory(); // 'morning' | 'afternoon' | 'full'
    if (!cat) {
      alert('Horas inválidas.'); 
      return;
    }

    // 1 por turno y 1 full-day
    if (cat === 'morning' && dayUsage.hasMorning)   { alert('Ya existe un servicio en la mañana.');   return; }
    if (cat === 'afternoon' && dayUsage.hasAfternoon){ alert('Ya existe un servicio en la tarde.');    return; }
    if (cat === 'full' && dayUsage.hasFullDay)       { alert('Ya existe un servicio de día completo.'); return; }

    const used = (dayUsage.hasMorning?1:0) + (dayUsage.hasAfternoon?1:0) + (dayUsage.hasFullDay?1:0);
    const newUsed = used + 1; // vamos a crear una categoría nueva (ya validamos duplicados)

    if (newUsed > 3) {
      alert('Límite diario alcanzado. Solo se permiten 3 servicios por día (mañana, tarde y uno de día completo).');
      return;
    }

    const fechas = (selectedDates.length > 0) ? selectedDates : [date];
    const schedules = fechas.map((d) => ({
      client: clienteSeleccionado,
      serviceAddress: direccionSeleccionada,
      employees: [empleado, ...empleadosAdicionales],
      services: servicios,
      date: d,
      startHour,
      endHour,
      breakMinutes,
      comments: comentarios,
      state: 'PROGRAMADA',
      recurrenceType: currentRecurrency === 'NINGUNA' ? 'PUNTUAL' : currentRecurrency,
    }));

    try {
      await withLoading(() => asignarServicio(schedules), 'Asignando servicio(s)...');
    } catch (err) {
      console.error(err);
      alert('Error al asignar servicio(s)');
      return;
    }

    alert(`Servicio(s) asignado(s) correctamente (${schedules.length})`);
    onAssigned?.();
    onClose();
  };

  if (!show) return null;

  return (
    <>
      {OverlayPortal}
      <div className="modal-overlay">
        <div className="modal-container" aria-busy={assigning}>
          {/* Superiores */}
          <div className="modal-datos-superiores">
            <span>{date}</span>

            {/* Hora Inicio */}
            <div className="dropdown" ref={startRef}>
              <span>Hora Inicio</span>
              <button
                type="button"
                className={`dropdown-trigger ${startTimeOpen ? 'open' : ''}`}
                onClick={() => !assigning && setStartTimeOpen(o => !o)}
                disabled={assigning}
              >
                <span>{labelFor(startHour) || 'Hora inicio'}</span>
                <span className="arrow">▼</span>
              </button>
              {startTimeOpen && !assigning && (
                <div className="dropdown-content">
                  {timeOptions.map(({ value, label }) => (
                    <button key={value} onClick={() => { setStartHour(value); setStartTimeOpen(false); }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hora Fin */}
            <div className="dropdown" ref={endRef}>
              <span>Hora Fin</span>
              <button
                type="button"
                className={`dropdown-trigger ${endTimeOpen ? 'open' : ''}`}
                onClick={() => !assigning && setEndTimeOpen(o => !o)}
                disabled={assigning}
              >
                <span>{labelFor(endHour) || 'Hora fin'}</span>
                <span className="arrow">▼</span>
              </button>
              {endTimeOpen && !assigning && (
                <div className="dropdown-content">
                  {timeOptions.map(({ value, label }) => (
                    <button key={value} onClick={() => { setEndHour(value); setEndTimeOpen(false); }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Descanso */}
            <div className="dropdown" ref={breakRef}>
              <span>Descanso</span>
              <button
                type="button"
                className={`dropdown-trigger ${breakOpen ? 'open' : ''}`}
                onClick={() => !assigning && setBreakOpen(o => !o)}
                title="Minutos de descanso (0–60)"
                disabled={assigning}
              >
                <span>{`${breakMinutes} min`}</span>
                <span className="arrow">▼</span>
              </button>
              {breakOpen && !assigning && (
                <div className="dropdown-content">
                  {breakOptions.map((m) => (
                    <button key={m} onClick={() => { setBreakMinutes(m); setBreakOpen(false); }}>
                      {m} min
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recurrencia */}
            <div className="dropdown" ref={recurrencyRef}>
              <span>Frecuencia</span>
              <button
                type="button"
                className={`dropdown-trigger ${stateOpen ? 'open' : ''}`}
                onClick={() => !assigning && setStateOpen(o => !o)}
                disabled={assigning}
              >
                <span>{currentRecurrency}</span>
                <span className="arrow">▼</span>
              </button>
              {stateOpen && !assigning && (
                <div className="dropdown-content">
                  {RECURRENCES.map((st) => (
                    <button key={st} onClick={() => { openDatesIfNeeded(st); setStateOpen(false); }}>
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-asignacion-form-grid">
            {/* Empleados */}
            <div className="modal-chip-section">
              <label>Empleados</label>
              <div className="modal-chip-container" ref={empleadosRef}>
                <div className="chips">
                  <div className="modal-chip">{empleado?.name} {empleado?.surname}</div>
                  {empleadosAdicionales.map((emp) => (
                    <div className="modal-chip" key={emp.document}>
                      {emp.name} {emp.surname}
                      <span className="modal-asignacion-remove-btn" onClick={() => !assigning && handleEliminarEmpleado(emp.document)}>×</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="modal-asignacion-add-empleado-btn"
                    onClick={() => setMostrarDropdownEmpleados((prev) => !prev)}
                    disabled={assigning}
                    title="Agregar personal"
                  >
                    +
                  </button>
                </div>

                {mostrarDropdownEmpleados && !assigning && (
                  <div className="modal-asignacion-dropdown-chip">
                    <div className="dropdown" style={{ width: '100%', marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Buscar por nombre o documento…"
                        value={empleadoSearchText}
                        onChange={(e) => filtrarEmpleados(e.target.value)}
                        autoFocus
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {empleadosFiltrados.length > 0 ? (
                        empleadosFiltrados.map((e) => (
                          <button key={e.document} onClick={() => handleAgregarEmpleado(e)}>
                            {e.name} {e.surname} — {e.document}
                          </button>
                        ))
                      ) : (
                        <div className="modal-asignacion-no-opciones">
                          {baseEmployees.length === 0 ? 'No hay empleados disponibles' : 'Sin resultados'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Clientes */}
            <div>
              <label>Clientes</label>
              <div className="modal-asignacion-dropdown" ref={clienteRef}>
                <input
                  type="text"
                  placeholder="Nombre del Cliente"
                  value={clienteText}
                  onChange={(e) => filtrarClientes(e.target.value)}
                  onFocus={() => {
                    setMostrarDropdownClientes(true);
                    setClientesFiltrados(clientes);
                    if (!clienteText && clienteSeleccionado) {
                      setClienteText(`${clienteSeleccionado.name} ${clienteSeleccionado.surname}`);
                    }
                  }}
                  onKeyDown={onClienteKeyDown}
                  disabled={assigning}
                />
                {mostrarDropdownClientes && !assigning && (
                  <div className="modal-asignacion-dropdown-content">
                    {clientesFiltrados.length === 0 ? (
                      <div className="modal-asignacion-no-opciones">
                        {clientes.length === 0 ? 'No hay clientes disponibles' : 'Sin resultados'}
                      </div>
                    ) : (
                      clientesFiltrados.flatMap((c) => {
                        const dirs = Array.isArray(c.addresses) && c.addresses.length > 0 ? c.addresses : [null];
                        return dirs.map((addr, idx) => {
                          const key = `${c.document}-${addr?.id ?? idx}`;
                          const isSelected =
                            clienteSeleccionado?.document === c.document &&
                            (!!direccionSeleccionada &&
                              ((direccionSeleccionada.id && addr?.id && direccionSeleccionada.id === addr.id) ||
                                (direccionSeleccionada.address === addr?.address && direccionSeleccionada.city === addr?.city)));
                          return (
                            <button
                              key={key}
                              onClick={() => handleSeleccionarCliente(c, addr)}
                              className={isSelected ? 'selected' : ''}
                              disabled={!addr}
                              title={addr ? `${addr.address}${addr.city ? ` (${addr.city})` : ''}` : 'Sin dirección'}
                            >
                              {c.name} {c.surname}
                              <span className="modal-asignacion-cliente-direccion">
                                &nbsp;— {addr ? `${addr.address}${addr.city ? ` (${addr.city})` : ''}` : 'Sin dirección'}
                              </span>
                            </button>
                          );
                        });
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Servicios */}
            <div className="modal-chip-section">
              <label>Servicios</label>
              <div className="modal-chip-container" ref={serviciosRef}>
                <div className="chips">
                  {servicios.map((serv) => (
                    <div className="modal-chip" key={serv.id}>
                      {serv.description}
                      <span className="modal-asignacion-remove-btn" onClick={() => !assigning && handleEliminarServicio(serv.id)}>×</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="modal-asignacion-add-servicio-btn"
                    onClick={() => setMostrarDropdownServicios((prev) => !prev)}
                    disabled={assigning}
                  >
                    +
                  </button>
                </div>
                {mostrarDropdownServicios && !assigning && (
                  <div className="modal-asignacion-dropdown-chip">
                    {serviciosDisponibles.length === 0 ? (
                      <div className="modal-asignacion-no-opciones">No hay servicios disponibles</div>
                    ) : serviciosDisponibles.filter(s => !servicios.some(sel => sel.id === s.id)).length === 0 ? (
                      <div className="modal-asignacion-no-opciones">Todos los servicios ya están asignados</div>
                    ) : (
                      serviciosDisponibles
                        .filter(s => !servicios.some(sel => sel.id === s.id))
                        .map((s) => (
                          <button key={s.id} onClick={() => handleAgregarServicio(s)}>
                            {s.description}
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Fechas seleccionadas */}
            {selectedDates.length > 0 && (
              <div className="modal-chip-section">
                <label>Fechas seleccionadas</label>
                <div className="modal-chip-container">
                  <div className="chips">
                    {selectedDates.map((d) => (
                      <div key={d} className="modal-chip">{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Comentarios */}
            <div>
              <label>Comentarios</label>
              <textarea
                placeholder="Comentarios adicionales"
                rows={3}
                className="modal-asignacion-textarea"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                disabled={assigning}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="modal-asignacion-form-buttons">
            <button
              type="button"
              onClick={!assigning ? onClose : undefined}
              className="modal-asignacion-btn-cancelar"
              disabled={assigning}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="modal-asignacion-btn-confirmar"
              onClick={handleAsignar}
              disabled={assigning}
            >
              {assigning ? 'Asignando…' : `Asignar ${selectedDates.length > 0 ? `(${selectedDates.length})` : ''}`}
            </button>
          </div>
        </div>

        {/* Modal de frecuencia/fechas */}
        <ModalFrecuenciaFechas
          show={showDatesModal}
          onClose={() => setShowDatesModal(false)}
          recurrence={currentRecurrency}
          baseDate={date}
          occurrences={4}
          onConfirm={(dates) => {
            setSelectedDates(dates);
            setShowDatesModal(false);
          }}
        />
      </div>
    </>
  );
}
