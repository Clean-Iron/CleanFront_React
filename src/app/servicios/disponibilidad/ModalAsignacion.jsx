'use client';
import React, { useState, useEffect, useRef } from "react";
import {
  obtenerServicios,
  obtenerClientesConDireccionCiudad,
  asignarServicio
} from '@/lib/Logic.js';
import { useTimeOptions } from '@/lib/Hooks';
import { formatTo12h } from '@/lib/Utils';
import '@/styles/Servicios/Disponibilidad/ModalAsignacion.css';

const ModalAsignacion = ({
  show,
  onClose,
  empleado,
  date,
  startHour: startHourProp,
  endHour: endHourProp,
  city,
  allEmployees = [],
  onAssigned
}) => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empleadosAdicionales, setEmpleadosAdicionales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [clientesZona, setClientesZona] = useState([]);
  const [comentarios, setComentarios] = useState("");

  const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false);
  const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false);
  const [mostrarDropdownServicios, setMostrarDropdownServicios] = useState(false);

  // --- NUEVO: búsqueda de clientes tipo BuscarTarea ---
  const [clienteText, setClienteText] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const clienteRef = useRef(null);

  const [currentRecurrency, setCurrentRecurrency] = useState('PUNTUAL');

  // Inputs de hora (igual a FormularioTarea)
  const timeOptions = useTimeOptions({ startHour: 6, endHour: 18, stepMinutes: 30 });
  const [startHour, setStartHour] = useState(startHourProp || '');
  const [endHour, setEndHour] = useState(endHourProp || '');
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);

  // Refs para detectar clicks fuera
  const recurrencyRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  const [stateOpen, setStateOpen] = useState(false);
  const recurrency = ['PUNTUAL', 'FRECUENTE', 'QUINCENAL', 'MENSUAL'];

  useEffect(() => {
    if (show) {
      setStartHour(startHourProp || '');
      setEndHour(endHourProp || '');
    }
  }, [show, startHourProp, endHourProp]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = e => {
      if (recurrencyRef.current && !recurrencyRef.current.contains(e.target)) setStateOpen(false);
      if (startRef.current && !startRef.current.contains(e.target)) setStartTimeOpen(false);
      if (endRef.current && !endRef.current.contains(e.target)) setEndTimeOpen(false);

      if (clienteRef.current && !clienteRef.current.contains(e.target)) {
        setMostrarDropdownClientes(false);
      }
      if (!e.target.closest('.modal-asignacion-dropdown-chip') &&
          !e.target.closest('.modal-asignacion-add-empleado-btn')) {
        setMostrarDropdownEmpleados(false);
      }
      if (!e.target.closest('.modal-asignacion-dropdown-chip') &&
          !e.target.closest('.modal-asignacion-add-servicio-btn')) {
        setMostrarDropdownServicios(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (show) {
      obtenerServicios()
        .then((data) => setServiciosDisponibles(data))
        .catch((error) => {
          console.error("Error al obtener servicios:", error);
          setServiciosDisponibles([]);
        });

      obtenerClientesConDireccionCiudad(city)
        .then((data) => {
          setClientesZona(data || []);
          setClientesFiltrados(data || []);
          // reset selección/búsqueda al abrir
          setClienteSeleccionado(null);
          setClienteText("");
        })
        .catch((error) => {
          console.error("Error al obtener clientes por ciudad:", error);
          setClientesZona([]);
          setClientesFiltrados([]);
        });
    }
  }, [show, city]);

  const handleAgregarEmpleado = (nuevo) => {
    if (!empleadosAdicionales.some(e => e.document === nuevo.document)) {
      setEmpleadosAdicionales([...empleadosAdicionales, nuevo]);
      setMostrarDropdownEmpleados(false);
    }
  };

  const handleEliminarEmpleado = (document) => {
    setEmpleadosAdicionales(empleadosAdicionales.filter(e => e.document !== document));
  };

  const handleAgregarServicio = (nuevoServicio) => {
    if (!servicios.some(s => s.id === nuevoServicio.id)) {
      setServicios([...servicios, nuevoServicio]);
      setMostrarDropdownServicios(false);
    }
  };

  const handleEliminarServicio = (id) => {
    setServicios(servicios.filter(serv => serv.id !== id));
  };

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setClienteText(`${cliente.name} ${cliente.surname}`);
    setMostrarDropdownClientes(false);
  };

  // --- NUEVO: filtrar clientes como en BuscarTarea ---
  const filtrarClientes = (valor) => {
    setClienteText(valor);
    setMostrarDropdownClientes(true);
    const q = valor.trim().toLowerCase();
    if (!q) { setClientesFiltrados(clientesZona); return; }
    setClientesFiltrados(
      clientesZona.filter(c => {
        const full = `${c.name ?? ''} ${c.surname ?? ''}`.toLowerCase();
        const doc  = (c.document ?? '').toString().toLowerCase();
        const addr = (c.addresses?.find(a => a.city === city)?.address ?? '').toLowerCase();
        return full.includes(q) || doc.includes(q) || addr.includes(q);
      })
    );
  };

  const onClienteKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (clientesFiltrados.length > 0) handleSeleccionarCliente(clientesFiltrados[0]);
    } else if (e.key === 'Escape') {
      setMostrarDropdownClientes(false);
    }
  };

  const labelFor = (value) =>
    timeOptions.find(opt => opt.value === value)?.label || (value ? formatTo12h(value) : '');

  const handleAsignar = async () => {
    if (!clienteSeleccionado || servicios.length === 0) {
      alert("Seleccione un cliente y al menos un servicio");
      return;
    }
    if (!startHour || !endHour) {
      alert("Seleccione la hora de inicio y la hora de fin");
      return;
    }

    const direccion = clienteSeleccionado.addresses.find(addr => addr.city === city);
    if (!direccion) {
      alert("El cliente no tiene dirección en esta ciudad");
      return;
    }

    const schedule = {
      client: clienteSeleccionado,
      serviceAddress: direccion,
      employees: [empleado, ...empleadosAdicionales],
      services: servicios,
      date: date,
      startHour: startHour,
      endHour: endHour,
      comments: comentarios,
      state: "PROGRAMADA",
      recurrenceType: currentRecurrency,
    };

    try {
      await asignarServicio(schedule);
      alert("Servicio asignado correctamente");
      onAssigned?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al asignar servicio");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-datos-superiores" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{date}</span>

          {/* Hora Inicio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Hora Inicio</span>
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
                    <button
                      key={value}
                      onClick={() => { setStartHour(value); setStartTimeOpen(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hora Fin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Hora Fin</span>
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
                    <button
                      key={value}
                      onClick={() => { setEndHour(value); setEndTimeOpen(false); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                {recurrency.map(st => (
                  <button key={st} onClick={() => { setCurrentRecurrency(st); setStateOpen(false); }}>
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
            <label>Empleados:</label>
            <div className="modal-chip-container">
              <div className="chips">
                <div className="modal-chip">{empleado.name} {empleado.surname}</div>
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
                      .filter(e => e.document !== empleado.document && !empleadosAdicionales.find(a => a.document === e.document))
                      .map(e => (
                        <button key={e.document} onClick={() => handleAgregarEmpleado(e)}>
                          {e.name} {e.surname}
                        </button>
                      ))
                  )}
                  {allEmployees.length > 0 &&
                    allEmployees.filter(e => e.document !== empleado.document && !empleadosAdicionales.find(a => a.document === e.document)).length === 0 && (
                      <div className="modal-asignacion-no-opciones">Todos los empleados ya están asignados</div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Clientes (input + dropdown filtrable como BuscarTarea) */}
          <div>
            <label>Clientes:</label>
            <div className="modal-asignacion-dropdown" ref={clienteRef}>
              <input
                type="text"
                placeholder="Nombre del Cliente"
                value={clienteText}
                onChange={(e) => filtrarClientes(e.target.value)}
                onFocus={() => {
                  setMostrarDropdownClientes(true);
                  setClientesFiltrados(clientesZona);
                  // si ya hay seleccionado y no hay texto, precarga el nombre para edición
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
                      {clientesZona.length === 0 ? `No hay clientes disponibles en ${city}` : 'Sin resultados'}
                    </div>
                  ) : (
                    clientesFiltrados.map((cliente) => {
                      const direccionCiudad = cliente.addresses?.find(addr => addr.city === city);
                      return (
                        <button
                          key={cliente.document}
                          onClick={() => handleSeleccionarCliente(cliente)}
                          className={clienteSeleccionado?.document === cliente.document ? "selected" : ""}
                        >
                          {cliente.name} {cliente.surname}
                          {direccionCiudad && (
                            <span className="modal-asignacion-cliente-direccion">
                              &nbsp;- {direccionCiudad.address}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Servicios */}
          <div className="modal-chip-section">
            <label>Servicios:</label>
            <div className="modal-chip-container">
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
                  ) : serviciosDisponibles.filter(s => !servicios.some(serv => serv.id === s.id)).length === 0 ? (
                    <div className="modal-asignacion-no-opciones">Todos los servicios ya están asignados</div>
                  ) : (
                    serviciosDisponibles
                      .filter(s => !servicios.some(serv => serv.id === s.id))
                      .map((servicio) => (
                        <button key={servicio.id} onClick={() => handleAgregarServicio(servicio)}>
                          {servicio.description}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label>Comentarios:</label>
            <textarea
              placeholder="Comentarios adicionales"
              rows={3}
              className="modal-asignacion-textarea"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            ></textarea>
          </div>

          {/* Botones de acción */}
          <div className="modal-asignacion-form-buttons modal-asignacion-full-width">
            <button type="button" onClick={onClose} className="modal-asignacion-btn-cancelar">Cancelar</button>
            <button type="button" className="modal-asignacion-btn-confirmar" onClick={handleAsignar}>Asignar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAsignacion;
