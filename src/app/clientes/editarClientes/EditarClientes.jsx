import React, { useState, useRef, useEffect } from "react";
import BuscarClientes from "./BuscarClientes";
import EliminarClientes from "./EliminarClientes";
import AgregarClientes from "./AgregarClientes";
import ModalEditarDirecciones from "./ModalEditarDirecciones.jsx";
import { actualizarCliente } from "@/lib/Logic.js";
import '@/styles/Empleados/EditarEmpleados.css';

const EditarClientes = () => {
  const [activeTab, setActiveTab] = useState("edit");
  const [busquedaDocumento, setBusquedaDocumento] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [typeId, setTypeId] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [direcciones, setDirecciones] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  const [mensajeError, setMensajeError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEliminarForm, setMostrarEliminarForm] = useState(false);
  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);

  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);

  const tipoIdDropdownRef = useRef(null);
  const ciudadDropdownRef = useRef(null);

  const tipoId = [
    "CC", "TI", "NIT", "CE", "PA"
  ];

  useEffect(() => {
    if (clienteEncontrado) {
      setTypeId(clienteEncontrado.typeId || "");
      setNombre(clienteEncontrado.name || "");
      setApellido(clienteEncontrado.surname || "");
      setDocumento(clienteEncontrado.document || "");
      setEmail(clienteEncontrado.email || "");
      setPhone(clienteEncontrado.phone || "");
      setComentarios(clienteEncontrado.comments || "");
      setDirecciones(clienteEncontrado.addresses || []);
      setSelectedCity(clienteEncontrado.city || "");
    }
  }, [clienteEncontrado]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) {
        setTipoIdDropdownOpen(false);
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
      setClienteEncontrado(datos);

      if (activeTab === "edit") {
        setMostrarFormulario(true);
      } else if (activeTab === "delete") {
        setMostrarEliminarForm(true);
      }

      setMensajeError("");
    } else {
      setClienteEncontrado(null);
      setMostrarFormulario(false);
      setMostrarEliminarForm(false);
      setMensajeError("Cliente no encontrado.");
    }
  };

  // Función para manejar el guardado de direcciones desde el modal
  const manejarGuardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones);
    // Actualizar también el cliente encontrado
    setClienteEncontrado(prev => ({
      ...prev,
      addresses: nuevasDirecciones
    }));
  };

  const guardarCambios = async () => {
    if (!clienteEncontrado) return;

    const datosActualizados = {
      typeId: typeId,
      name: nombre,
      surname: apellido,
      email: email,
      phone: phone,
      addresses: direcciones,
      city: selectedCity,
      document: documento,
      comments: comentarios
    };

    try {
      await actualizarCliente(clienteEncontrado.document, datosActualizados);
      alert("Cliente actualizado correctamente ✅");
    } catch (error) {
      alert("Error al actualizar cliente ❌" + error);
    }
  };

  const resetBusqueda = () => {
    setBusquedaDocumento("");
    setClienteEncontrado(null);
    setMostrarFormulario(false);
    setMostrarEliminarForm(false);
    setMensajeError("");
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
          <label htmlFor="nombre">Nombre(s)</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="apellido">Apellido(s)</label>
          <input
            id="apellido"
            type="text"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="tipoDocumento">Tipo ID</label>
          <div className="dropdown" ref={tipoIdDropdownRef}>
            <button
              id="tipoDocumento"
              type="button"
              className={`dropdown-trigger ${tipoIdDropdownOpen ? "open" : ""}`}
              onClick={() => setTipoIdDropdownOpen(o => !o)}
            >
              <span>{typeId || "Seleccionar Tipo ID"}</span>
              <span className="arrow">▼</span>
            </button>
            {tipoIdDropdownOpen && (
              <div className="dropdown-content">
                {tipoId.map((tipo, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setTypeId(tipo);
                      setTipoIdDropdownOpen(false);
                    }}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="documento">N° Documento</label>
          <input
            id="documento"
            type="text"
            value={documento}
            onChange={e => setDocumento(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Botón para abrir el modal de direcciones */}
        <button
          type="button"
          className="menu-btn"
          onClick={() => setMostrarModalDirecciones(true)}
        >
          📍 Editar Direcciones ({direcciones.length})
        </button>

        <div className="input-group">
          <label htmlFor="phone">N° Celular - Telefono</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
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
        <BuscarClientes
          value={busquedaDocumento}
          onChange={(e) => setBusquedaDocumento(e.target.value)}
          onResultado={manejarResultadoBusqueda}
          mensajeError={mensajeError}
        />
      );
    }

    if (activeTab === "add") {
      return <AgregarClientes />;
    }

    if (activeTab === "delete") {
      return mostrarEliminarForm ? (
        <EliminarClientes
          cliente={clienteEncontrado}
          onVolver={resetBusqueda}
        />
      ) : (
        <BuscarClientes
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

      {/* Modal para editar direcciones */}
      {mostrarModalDirecciones && (
        <ModalEditarDirecciones
          cliente={clienteEncontrado}
          onClose={() => setMostrarModalDirecciones(false)}
          onGuardar={manejarGuardarDirecciones}
        />
      )}
    </div>
  );
};

export default EditarClientes;