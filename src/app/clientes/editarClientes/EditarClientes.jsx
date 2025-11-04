'use client';

import React, { useState, useRef, useEffect } from "react";
import BuscarClientes from "./BuscarClientes";
import EliminarClientes from "./EliminarClientes";
import AgregarClientes from "./AgregarClientes";
import ModalEditarDirecciones from "./ModalEditarDirecciones.jsx";
import { actualizarCliente } from "@/lib/Logic.js";
import { Switch, Chip } from "@mui/material";
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

  const [activo, setActivo] = useState(true);

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

  const tipoId = ["CC", "TI", "NIT", "CE", "PA"];

  // Helper: uppercase seguro
  const uc = (v) => (v ?? "").toString().toUpperCase();
  const inputUpper = { textTransform: "uppercase" };

  useEffect(() => {
    if (clienteEncontrado) {
      // Normaliza a mayúsculas para mostrar consistente
      setTypeId(uc(clienteEncontrado.typeId || ""));
      setNombre(uc(clienteEncontrado.name || ""));
      setApellido(uc(clienteEncontrado.surname || ""));
      setDocumento(uc(clienteEncontrado.document || ""));
      setEmail(uc(clienteEncontrado.email || ""));
      setPhone(uc(clienteEncontrado.phone || ""));
      setComentarios(uc(clienteEncontrado.comments || ""));
      setDirecciones(clienteEncontrado.addresses || []);
      setSelectedCity(clienteEncontrado.city || ""); // ciudad viene de dropdown/lista, no forzamos aquí
      setActivo(clienteEncontrado.state === true || clienteEncontrado.state === "true");
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
      setMostrarFormulario(activeTab === "edit");
      setMostrarEliminarForm(activeTab === "delete");
      setMensajeError("");
    } else {
      setClienteEncontrado(null);
      setMostrarFormulario(false);
      setMostrarEliminarForm(false);
      setMensajeError("Cliente no encontrado.");
    }
  };

  // Guardado desde modal de direcciones
  const manejarGuardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones);
    setClienteEncontrado(prev => ({
      ...prev,
      addresses: nuevasDirecciones
    }));
  };

  const guardarCambios = async () => {
    if (!clienteEncontrado) return;

    const datosActualizados = {
      typeId: uc(typeId).trim(),
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addresses: direcciones,
      city: selectedCity,           // si quieres, puedes uppercasing aquí también
      document: uc(documento).trim(),
      comments: uc(comentarios).trim(),
      state: !!activo
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
    setTypeId("");
    setNombre("");
    setApellido("");
    setDocumento("");
    setEmail("");
    setPhone("");
    setComentarios("");
    setDirecciones([]);
    setSelectedCity("");
    setActivo(true);
  };

  // Handlers en tiempo real (uppercase)
  const onNombre = (e) => setNombre(uc(e.target.value));
  const onApellido = (e) => setApellido(uc(e.target.value));
  const onDocumento = (e) => setDocumento(uc(e.target.value));
  const onEmail = (e) => setEmail(uc(e.target.value));
  const onPhone = (e) => setPhone(uc(e.target.value));
  const onComentarios = (e) => setComentarios(uc(e.target.value));

  const renderFormulario = () => (
    <div className="empleados-form-grid">
      <div
        className="empleados-full-width empleados-form-grid"
        style={{ maxHeight: '45vh', overflowY: 'auto', paddingRight: '8px' }}
      >
        <div className="input-group">
          <label htmlFor="nombre">Nombre(s)</label>
          <input id="nombre" type="text" value={nombre} onChange={onNombre} style={inputUpper} />
        </div>

        <div className="input-group">
          <label htmlFor="apellido">Apellido(s)</label>
          <input id="apellido" type="text" value={apellido} onChange={onApellido} style={inputUpper} />
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
                {tipoId.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      setTypeId(uc(tipo)); // asegura mayúsculas
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
          <input id="documento" type="text" value={documento} onChange={onDocumento} style={inputUpper} />
        </div>

        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" value={email} onChange={onEmail} style={inputUpper} />
        </div>

        {/* Botón para abrir el modal de direcciones */}
        <button type="button" className="menu-btn" onClick={() => setMostrarModalDirecciones(true)}>
          📍 Editar Direcciones ({direcciones.length})
        </button>

        <div className="input-group">
          <label htmlFor="phone">N° Celular - Telefono</label>
          <input id="phone" type="text" value={phone} onChange={onPhone} style={inputUpper} />
        </div>

        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <Chip
            size="small"
            label={activo ? "ACTIVO" : "INACTIVO"}
            color={activo ? "success" : "default"}
            variant={activo ? "filled" : "outlined"}
          />
        </div>

        <div className="input-group">
          <label>Comentarios</label>
          <textarea
            className="modal-asignacion-textarea"
            value={comentarios}
            onChange={onComentarios}
            style={inputUpper}
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
        <EliminarClientes cliente={clienteEncontrado} onVolver={resetBusqueda} />
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
