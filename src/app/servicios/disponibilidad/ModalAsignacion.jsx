import React, { useState, useEffect, useRef } from "react";
import { obtenerServicios, obtenerClientesConDireccionCiudad, asignarServicio } from '@/lib/Logic.js';
import { formatTo12h } from '@/lib/Utils';
import '@/styles/Servicios/Disponibilidad/ModalAsignacion.css';

const ModalAsignacion = ({
  show,
  onClose,
  empleado,
  date,
  startHour,
  endHour,
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

  const [currentRecurrency, setCurrentRecurrency] = useState('PUNTUAL');

  const [stateOpen, setStateOpen] = useState(false);

  // Refs para detectar clicks fuera
  const recurrencyRef = useRef(null);

  const recurrency = ['PUNTUAL', 'QUINCENAL', 'MENSUAL', 'FRECUENTE'];

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = e => {

      if (recurrencyRef.current && !recurrencyRef.current.contains(e.target)) setStateOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (show) {
      obtenerServicios()
        .then((data) => {
          setServiciosDisponibles(data);
        })
        .catch((error) => {
          console.error("Error al obtener servicios:", error);
          setServiciosDisponibles([]);
        });
      obtenerClientesConDireccionCiudad(city)
        .then((data) => {
          setClientesZona(data);
        })
        .catch((error) => {
          console.error("Error al obtener clientes por ciudad:", error);
          setClientesZona([]);
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
    setMostrarDropdownClientes(false);
  };

  const handleAsignar = async () => {
    if (!clienteSeleccionado || servicios.length === 0) {
      alert("Seleccione un cliente y al menos un servicio");
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

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-datos-superiores">
          <span><strong>Fecha:</strong> {date}</span>
          <span><strong>Hora:</strong> {formatTo12h(startHour)} - {formatTo12h(endHour)}</span>
          <span><strong>Ciudad:</strong> {city}</span>

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
                  <button
                    key={st}
                    onClick={() => {
                      setCurrentRecurrency(st);
                      setStateOpen(false);
                    }}
                  >
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
                  {allEmployees.length > 0 && allEmployees.filter(e => e.document !== empleado.document && !empleadosAdicionales.find(a => a.document === e.document)).length === 0 && (
                    <div className="modal-asignacion-no-opciones">Todos los empleados ya están asignados</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Clientes */}
          <div>
            <label>Clientes:</label>
            <div className="modal-asignacion-dropdown">
              <div
                className={`modal-asignacion-dropdown-trigger ${mostrarDropdownClientes ? "open" : ""}`}
                onClick={() => setMostrarDropdownClientes(!mostrarDropdownClientes)}
              >
                {clienteSeleccionado
                  ? `${clienteSeleccionado.name} ${clienteSeleccionado.surname}`
                  : "Seleccione cliente"
                }
                <span className="modal-asignacion-arrow">▼</span>
              </div>
              {mostrarDropdownClientes && (
                <div className="modal-asignacion-dropdown-content">
                  {clientesZona.length === 0 ? (
                    <div className="modal-asignacion-no-opciones">
                      No hay clientes disponibles en {city}
                    </div>
                  ) : (
                    clientesZona.map((cliente) => {
                      const direccionCiudad = cliente.addresses?.find(addr => addr.city === city);
                      return (
                        <button
                          key={cliente.document}
                          onClick={() => handleSeleccionarCliente(cliente)}
                          className={clienteSeleccionado?.document === cliente.document ? "selected" : ""}
                        >
                          {cliente.name} {cliente.surname}
                          {direccionCiudad && (
                            <span key={`${cliente.document}-address`} className="modal-asignacion-cliente-direccion">
                              - {direccionCiudad.address}
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