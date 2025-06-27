import React, { useState, useRef, useEffect } from "react";
import BuscarEmpleados from "./buscarEmpleados/BuscarEmpleados";
import EliminarEmpleados from "./eliminarEmpleados/EliminarEmpleados";
import AgregarEmpleados from "./agregarEmpleados/AgregarEmpleados";
import { actualizarEmpleado } from "./EditarEmpleados.js";
import "../../../styles/Empleados/EditarEmpleados/EditarEmpleados.css";

const EditarEmpleados = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const ciudadDropdownRef = useRef(null);

  const cargoDropdownRef = useRef(null);
  const estadoDropdownRef = useRef(null);

  const ciudades = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena"];
  const cargos = [
    "Coordinador", "Supervisor", "Asistente Administrativo", "Secretario/a",
    "Auxiliar", "Contador", "Recursos Humanos", "Atención al Cliente", "Operario"
  ];

  const estados = ["Activo", "Inactivo"];

  useEffect(() => {
    if (clienteEncontrado) {
      setNombre(clienteEncontrado.name || "");
      setApellido(clienteEncontrado.surname || "");
      setDocumento(clienteEncontrado.document || "");
      setEmail(clienteEncontrado.email || "");
      setPhone(clienteEncontrado.phone || "");
      setDireccion(clienteEncontrado.addressResidence || "");
      setSelectedCity(clienteEncontrado.city || "");
      if (clienteEncontrado.entryDate) {
        setFechaIngreso(clienteEncontrado.entryDate);
      } else {
        setFechaIngreso("");
      }
    }
  }, [clienteEncontrado]);

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

  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [estadoDropdownOpen, setEstadoDropdownOpen] = useState(false);

  const manejarResultadoBusqueda = (datos) => {
    if (datos) {
      setClienteEncontrado(datos);
      setSelectedCargo(datos.position);
      setSelectedEstado(datos.state ? "Activo" : "Inactivo");
      setMostrarFormulario(true);
      setMensajeError("");
    } else {
      setClienteEncontrado(null);
      setMostrarFormulario(false);
      setMensajeError("Cliente no encontrado.");
    }
  };

  const guardarCambios = async () => {
    if (!clienteEncontrado) return;

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
      state: selectedEstado === "Activo"
    };

    try {
      await actualizarEmpleado(clienteEncontrado.id || clienteEncontrado.document, datosActualizados);
      alert("Empleado actualizado correctamente ✅");
    } catch (error) {
      alert("Error al actualizar empleado ❌" + error);
    }
  };

  const resetBusqueda = () => {
    setBusquedaDocumento("");
    setClienteEncontrado(null);
    setMostrarFormulario(false);
    setMensajeError("");
    setSelectedCargo("");
    setSelectedEstado("");
  };

  const renderFormulario = () => (
    <div className="empleados-form-grid">
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
      <input
        type="text"
        placeholder="Documento"
        value={documento}
        onChange={(e) => setDocumento(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />

      {/* Dropdown Ciudad */}
      <div className="dropdown" ref={ciudadDropdownRef}>
        <button type="button" className={`dropdown-trigger ${ciudadDropdownOpen ? "open" : ""}`} onClick={() => setCiudadDropdownOpen(!ciudadDropdownOpen)}>
          <span>{selectedCity || "Seleccionar ciudad"}</span>
          <span className="arrow">▼</span>
        </button>
        {ciudadDropdownOpen && (
          <div className="dropdown-content">
            {ciudades.map((ciudad, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedCity(ciudad);
                  setCiudadDropdownOpen(false);
                }}
              >
                {ciudad}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="dropdown" ref={cargoDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${cargoDropdownOpen ? "open" : ""}`}
          onClick={() => setCargoDropdownOpen(!cargoDropdownOpen)}
        >
          <span>{selectedCargo || "Seleccionar cargo"}</span>
          <span className="arrow">▼</span>
        </button>
        {cargoDropdownOpen && (
          <div className="dropdown-content">
            {cargos.map((cargo, index) => (
              <button
                key={index}
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

      <div className="dropdown" ref={estadoDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${estadoDropdownOpen ? "open" : ""}`}
          onClick={() => setEstadoDropdownOpen(!estadoDropdownOpen)}
        >
          <span>{selectedEstado || "Seleccionar estado"}</span>
          <span className="arrow">▼</span>
        </button>
        {estadoDropdownOpen && (
          <div className="dropdown-content">
            {estados.map((estado, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedEstado(estado);
                  setEstadoDropdownOpen(false);
                }}
              >
                {estado}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="date"
        placeholder="<fecha Ingreso>"
        value={fechaIngreso}
        onChange={(e) => setFechaIngreso(e.target.value)}
      />

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={resetBusqueda}>
          🔄 NUEVA BÚSQUEDA
        </button>
        <button type="submit" className="menu-btn" onClick={guardarCambios}>
          💾 GUARDAR CAMBIOS
        </button>
        <button type="reset" className="menu-btn" onClick={resetBusqueda}>
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
      return <EliminarEmpleados />;
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
