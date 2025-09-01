import React, { useState, useRef, useEffect } from "react";
import BuscarEmpleados from "./BuscarEmpleados";
import EliminarEmpleados from "./EliminarEmpleados";
import AgregarEmpleados from "./AgregarEmpleados";
import { actualizarEmpleado } from "@/lib/Logic.js";
import { useCiudades } from "@/lib/Hooks";
import "@/styles/Empleados/EditarEmpleados.css";

const EditarEmpleados = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [comentarios, setComentarios] = useState("");
  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();

  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [mensajeError, setMensajeError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEliminarForm, setMostrarEliminarForm] = useState(false);

  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [estadoDropdownOpen, setEstadoDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const estadoDropdownRef = useRef(null);

  const cargos = [
    "Coordinador", "Supervisor", "Asistente Administrativo", "Secretario/a",
    "Auxiliar", "Contador", "Recursos Humanos", "Atención al Cliente", "Operario"
  ];

  const estados = ["Activo", "Inactivo"];

  useEffect(() => {
    if (empleadoEncontrado) {
      setNombre(empleadoEncontrado.name || "");
      setApellido(empleadoEncontrado.surname || "");
      setDocumento(empleadoEncontrado.document || "");
      setEmail(empleadoEncontrado.email || "");
      setPhone(empleadoEncontrado.phone || "");
      setDireccion(empleadoEncontrado.addressResidence || "");
      setComentarios(empleadoEncontrado.comments || "");
      setSelectedCity(empleadoEncontrado.city || "");
      if (empleadoEncontrado.entryDate) {
        setFechaIngreso(empleadoEncontrado.entryDate);
      } else {
        setFechaIngreso("");
      }
    }
  }, [empleadoEncontrado]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) {
        setCargoDropdownOpen(false);
      }
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(event.target)) {
        setEstadoDropdownOpen(false);
      }
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) {
        setCiudadDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const manejarResultadoBusqueda = (datos) => {
    if (datos) {
      setEmpleadoEncontrado(datos);
      setSelectedCargo(datos.position);
      setSelectedEstado(datos.state ? "Activo" : "Inactivo");

      if (activeTab === "edit") {
        setMostrarFormulario(true);
      } else if (activeTab === "delete") {
        setMostrarEliminarForm(true);
      }

      setMensajeError("");
    } else {
      setEmpleadoEncontrado(null);
      setMostrarFormulario(false);
      setMostrarEliminarForm(false);
      setMensajeError("Empleado no encontrado.");
    }
  };

  const guardarCambios = async () => {
    if (!empleadoEncontrado) return;

    const datosActualizados = {
      name: nombre,
      surname: apellido,
      email: email,
      phone: phone,
      addressResidence: direccion,
      city: selectedCity,
      document: documento,
      fechaIngreso,
      position: selectedCargo,
      comments: comentarios,
      state: selectedEstado === "Activo"
    };

    try {
      await actualizarEmpleado(empleadoEncontrado.id || empleadoEncontrado.document, datosActualizados);
      alert("Empleado actualizado correctamente ✅");
    } catch (error) {
      alert("Error al actualizar empleado ❌" + error);
    }
  };

  const resetBusqueda = () => {
    setBusquedaDocumento("");
    setEmpleadoEncontrado(null);
    setMostrarFormulario(false);
    setMostrarEliminarForm(false);
    setMensajeError("");
    setSelectedCargo("");
    setSelectedEstado("");
  };

  const renderFormulario = () => (
    <div className="empleados-form-grid">
      <div
        className="empleados-full-width empleados-form-grid"
        style={{
          maxHeight: '45vh',   // por ejemplo, mitad de la ventana
          overflowY: 'auto',   // activa scroll interno
          paddingRight: '8px'  // para evitar que el scroll tape contenido
        }}
      >
        <div className="input-group">
          <label htmlFor="emp-nombre">Nombre(s)</label>
          <input
            id="emp-nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="emp-apellido">Apellido(s)</label>
          <input
            id="emp-apellido"
            type="text"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
          />
        </div>

        {/* Dropdown Ciudad */}
        <div className="input-group" ref={ciudadDropdownRef}>
          <label htmlFor="emp-ciudad">Ciudad</label>
          <div className="dropdown">
            <button
              id="emp-ciudad"
              type="button"
              className={`dropdown-trigger ${ciudadDropdownOpen ? "open" : ""}`}
              onClick={() => setCiudadDropdownOpen(o => !o)}
            >
              <span>{selectedCity || (ciudadesLoading ? "Cargando ciudades…" : "Seleccionar ciudad")}</span>
              <span className="arrow">▼</span>
            </button>
            {ciudadDropdownOpen && (
              <div className="dropdown-content">
                {ciudadesLoading && <div>Cargando ciudades...</div>}
                {ciudadesError && <div>Error al cargar ciudades</div>}
                {!ciudadesLoading && !ciudadesError && ciudades.map((ciu, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCity(ciu);
                      setCiudadDropdownOpen(false);
                    }}
                  >
                    {ciu}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Cargo */}
        <div className="input-group" ref={cargoDropdownRef}>
          <label htmlFor="emp-cargo">Cargo</label>
          <div className="dropdown">
            <button
              id="emp-cargo"
              type="button"
              className={`dropdown-trigger ${cargoDropdownOpen ? "open" : ""}`}
              onClick={() => setCargoDropdownOpen(o => !o)}
            >
              <span>{selectedCargo || "Seleccionar cargo"}</span>
              <span className="arrow">▼</span>
            </button>
            {cargoDropdownOpen && (
              <div className="dropdown-content">
                {cargos.map((cargo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCargo(cargo);
                      setCargoDropdownOpen(false);
                    }}
                  >
                    {cargo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="emp-documento">N° Documento</label>
          <input
            id="emp-documento"
            type="text"
            value={documento}
            onChange={e => setDocumento(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="emp-email">Correo electrónico</label>
          <input
            id="emp-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="emp-phone">N° Celular - Telefono</label>
          <input
            id="emp-phone"
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="emp-direccion">Dirección</label>
          <input
            id="emp-direccion"
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
          />
        </div>

        <div className="input-group" ref={estadoDropdownRef}>
          <label htmlFor="emp-estado">Estado</label>
          <div className="dropdown">
            <button
              id="emp-estado"
              type="button"
              className={`dropdown-trigger ${estadoDropdownOpen ? "open" : ""}`}
              onClick={() => setEstadoDropdownOpen(o => !o)}
            >
              <span>{selectedEstado || "Seleccionar estado"}</span>
              <span className="arrow">▼</span>
            </button>
            {estadoDropdownOpen && (
              <div className="dropdown-content">
                {estados.map((est, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedEstado(est);
                      setEstadoDropdownOpen(false);
                    }}
                  >
                    {est}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="emp-fechaIngreso">Fecha de Ingreso</label>
          <input
            id="emp-fechaIngreso"
            type="date"
            value={fechaIngreso}
            onChange={e => setFechaIngreso(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Comentarios</label>
          <textarea
            className="modal-asignacion-textarea"
            value={comentarios}
            onChange={e => setComentarios(e.target.value)}
          />
        </div>
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={resetBusqueda}>
          🔄 NUEVA BÚSQUEDA
        </button>
        <button type="submit" className="menu-btn" onClick={guardarCambios}>
          💾 GUARDAR CAMBIOS
        </button>
        <button type="reset" className="cancel-btn" onClick={resetBusqueda}>
          ❌ CANCELAR
        </button>
      </div>
    </div>
  );

  const renderForm = () => {
    if (activeTab === "edit") {
      return mostrarFormulario ? (
        renderFormulario()
      ) : (
        <BuscarEmpleados
          value={busquedaDocumento}
          onChange={(e) => setBusquedaDocumento(e.target.value)}
          onResultado={manejarResultadoBusqueda}
          mensajeError={mensajeError}
        />
      );
    }

    if (activeTab === "add") {
      return <AgregarEmpleados />;
    }

    if (activeTab === "delete") {
      return mostrarEliminarForm ? (
        <EliminarEmpleados
          empleadoData={empleadoEncontrado}
          onVolver={resetBusqueda}
        />
      ) : (
        <BuscarEmpleados
          value={busquedaDocumento}
          onChange={(e) => setBusquedaDocumento(e.target.value)}
          onResultado={manejarResultadoBusqueda}
          mensajeError={mensajeError}
        />
      );
    }

    return null;
  };

  return (
    <div className="container">
      <div className="empleados-wrapper">
        <div className="empleados-tab-container">
          <div className="empleados-tabs">
            <button
              className={`empleados-tab ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("edit");
                resetBusqueda();
              }}
            >
              ✏️ Editar
            </button>
            <button
              className={`empleados-tab ${activeTab === "add" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("add");
                resetBusqueda();
              }}
            >
              ➕ Agregar
            </button>
            <button
              className={`empleados-tab ${activeTab === "delete" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("delete");
                resetBusqueda();
              }}
            >
              🗑️ Eliminar
            </button>
          </div>
          <div className="empleados-content-area">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarEmpleados;