'use client';
import React, { useEffect, useRef, useState } from 'react';
import { obtenerServicios, buscarClientes, asignarServicio } from '@/lib/Logic.js';
import { useTimeOptions } from '@/lib/Hooks';
import { formatTo12h } from '@/lib/Utils';
import ModalFrecuenciaFechas from './ModalFrecuenciaFechas';

const RECURRENCES = ['NINGUNA', 'PUNTUAL', 'FRECUENTE', 'QUINCENAL', 'MENSUAL'];

export default function ModalAsignacion({
  show,
  onClose,
  empleado,
  date,
  startHour: startHourProp,
  endHour: endHourProp,
  allEmployees = [],
  onAssigned,
}) {
  const recurrencyRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const clienteRef = useRef(null);
  const empleadosRef = useRef(null);
  const serviciosRef = useRef(null);

  const [startHour, setStartHour] = useState(startHourProp || '');
  const [endHour, setEndHour] = useState(endHourProp || '');
  const [currentRecurrency, setCurrentRecurrency] = useState('NINGUNA');
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  const [stateOpen, setStateOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);

  const [empleadosAdicionales, setEmpleadosAdicionales] = useState([]);
  const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false);

  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [mostrarDropdownServicios, setMostrarDropdownServicios] = useState(false);

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

  useEffect(() => {
    if (!show) return;
    setStartHour(startHourProp || '');
    setEndHour(endHourProp || '');
  }, [show, startHourProp, endHourProp]);

  useEffect(() => {
    if (!show) return;

    obtenerServicios()
      .then((data) => setServiciosDisponibles(data || []))
      .catch(() => setServiciosDisponibles([]));

    buscarClientes()
      .then((data) => {
        setClientes(data || []);
        setClientesFiltrados(data || []);
        setClienteSeleccionado(null);
        setDireccionSeleccionada(null);
        setClienteText('');
      })
      .catch(() => {
        setClientes([]);
        setClientesFiltrados([]);
      });
  }, [show]);

  useEffect(() => {
    if (!show) return;

    const isInside = (ref, target) => ref?.current && ref.current.contains(target);

    const handleOutside = (e) => {
      const t = e.target;

      if (startTimeOpen && !isInside(startRef, t)) setStartTimeOpen(false);
      if (endTimeOpen && !isInside(endRef, t)) setEndTimeOpen(false);
      if (stateOpen && !isInside(recurrencyRef, t)) setStateOpen(false);
      if (mostrarDropdownClientes && !isInside(clienteRef, t)) setMostrarDropdownClientes(false);
      if (mostrarDropdownEmpleados && !isInside(empleadosRef, t)) setMostrarDropdownEmpleados(false);
      if (mostrarDropdownServicios && !isInside(serviciosRef, t)) setMostrarDropdownServicios(false);
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [
    show,
    startTimeOpen,
    endTimeOpen,
    stateOpen,
    mostrarDropdownClientes,
    mostrarDropdownEmpleados,
    mostrarDropdownServicios,
  ]);

  // Empleados
  const handleAgregarEmpleado = (nuevo) => {
    setEmpleadosAdicionales((prev) =>
      prev.some(e => e.document === nuevo.document) ? prev : [...prev, nuevo]
    );
    setMostrarDropdownEmpleados(false);
  };
  const handleEliminarEmpleado = (document) => {
    setEmpleadosAdicionales((prev) => prev.filter(e => e.document !== document));
  };

  // Servicios
  const handleAgregarServicio = (nuevo) => {
    setServicios((prev) => prev.some(s => s.id === nuevo.id) ? prev : [...prev, nuevo]);
    setMostrarDropdownServicios(false);
  };
  const handleEliminarServicio = (id) => {
    setServicios((prev) => prev.filter(s => s.id !== id));
  };

  // Clientes
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

  // abrir modal de fechas si corresponde
  const openDatesIfNeeded = (value) => {
    setCurrentRecurrency(value);
    if (value !== 'NINGUNA') setShowDatesModal(true);
    else setSelectedDates([]);
  };

  // Enviar ARRAY al API
  const handleAsignar = async () => {
    if (!clienteSeleccionado || servicios.length === 0) {
      alert('Seleccione un cliente y al menos un servicio');
      return;
    }
    if (!startHour || !endHour) {
      alert('Seleccione la hora de inicio y la hora de fin');
      return;
    }
    if (!direccionSeleccionada) {
      alert('Seleccione una dirección para el servicio');
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
      comments: comentarios,
      state: 'PROGRAMADA',
      recurrenceType: currentRecurrency === 'NINGUNA' ? 'PUNTUAL' : currentRecurrency,
    }));

    try {
      await asignarServicio(schedules);
      alert(`Servicio(s) asignado(s) correctamente (${schedules.length})`);
      onAssigned?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al asignar servicio(s)');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Superiores */}
        <div className="modal-datos-superiores">
          <span>{date}</span>

          {/* Hora Inicio */}
          <div className="dropdown" ref={startRef}>
            <button
              type="button"
              className={`dropdown-trigger ${startTimeOpen ? 'open' : ''}`}
              onClick={() => setStartTimeOpen(o => !o)}
            >
              <span>{labelFor(startHour) || 'Hora inicio'}</span>
              <span className="arrow">▼</span>
            </button>
            {startTimeOpen && (
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
            <button
              type="button"
              className={`dropdown-trigger ${endTimeOpen ? 'open' : ''}`}
              onClick={() => setEndTimeOpen(o => !o)}
            >
              <span>{labelFor(endHour) || 'Hora fin'}</span>
              <span className="arrow">▼</span>
            </button>
            {endTimeOpen && (
              <div className="dropdown-content">
                {timeOptions.map(({ value, label }) => (
                  <button key={value} onClick={() => { setEndHour(value); setEndTimeOpen(false); }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recurrencia */}
          <div className="dropdown" ref={recurrencyRef}>
            <button
              type="button"
              className={`dropdown-trigger ${stateOpen ? 'open' : ''}`}
              onClick={() => setStateOpen(o => !o)}
            >
              <span>{currentRecurrency}</span>
              <span className="arrow">▼</span>
            </button>
            {stateOpen && (
              <div className="dropdown-content">
                {RECURRENCES.map(st => (
                  <button key={st} onClick={() => { openDatesIfNeeded(st); setStateOpen(false); }}>
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="modal-asignacion-form-grid">
          {/* Empleados */}
          <div className="modal-chip-section">
            <label>Empleados</label>
            <div className="modal-chip-container" ref={empleadosRef}>
              <div className="chips">
                <div className="modal-chip">{empleado?.name} {empleado?.surname}</div>
                {empleadosAdicionales.map(emp => (
                  <div className="modal-chip" key={emp.document}>
                    {emp.name} {emp.surname}
                    <span className="modal-asignacion-remove-btn" onClick={() => handleEliminarEmpleado(emp.document)}>×</span>
                  </div>
                ))}
                <button
                  type="button"
                  className="modal-asignacion-add-empleado-btn"
                  onClick={() => setMostrarDropdownEmpleados(prev => !prev)}
                >
                  +
                </button>
              </div>
              {mostrarDropdownEmpleados && (
                <div className="modal-asignacion-dropdown-chip">
                  {allEmployees.length === 0 ? (
                    <div className="modal-asignacion-no-opciones">No hay empleados disponibles</div>
                  ) : (
                    allEmployees
                      .filter(e => e.document !== empleado?.document && !empleadosAdicionales.find(a => a.document === e.document))
                      .map(e => (
                        <button key={e.document} onClick={() => handleAgregarEmpleado(e)}>
                          {e.name} {e.surname}
                        </button>
                      ))
                  )}
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
              />
              {mostrarDropdownClientes && (
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
                    <span className="modal-asignacion-remove-btn" onClick={() => handleEliminarServicio(serv.id)}>×</span>
                  </div>
                ))}
                <button
                  type="button"
                  className="modal-asignacion-add-servicio-btn"
                  onClick={() => setMostrarDropdownServicios(prev => !prev)}
                >
                  +
                </button>
              </div>
              {mostrarDropdownServicios && (
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

          {/* Comentarios */}
          <div>
            <label>Comentarios</label>
            <textarea
              placeholder="Comentarios adicionales"
              rows={3}
              className="modal-asignacion-textarea"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
          </div>

          {/* Resumen de fechas elegidas */}
          {selectedDates.length > 0 && (
            <div className="modal-chip-section">
              <label>Fechas seleccionadas</label>
              <div className="modal-chip-container">
                <div className="chips">
                  {selectedDates.map(d => (
                    <div key={d} className="modal-chip">{d}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="modal-asignacion-form-buttons modal-asignacion-full-width">
            <button type="button" onClick={onClose} className="modal-asignacion-btn-cancelar">Cancelar</button>
            <button type="button" className="modal-asignacion-btn-confirmar" onClick={handleAsignar}>
              Asignar {selectedDates.length > 0 ? `(${selectedDates.length})` : ''}
            </button>
          </div>
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
  );
}
