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

  const [mensajeError, setMensajeError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEliminarForm, setMostrarEliminarForm] = useState(false);
  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);

  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  const tipoIdDropdownRef = useRef(null);

  const uc = (v) => (v ?? "").toString().toUpperCase();
  const inputUpper = { textTransform: "uppercase" };

  useEffect(() => {
    if (clienteEncontrado) {
      setTypeId(uc(clienteEncontrado.typeId || ""));
      setNombre(uc(clienteEncontrado.name || ""));
      setApellido(uc(clienteEncontrado.surname || ""));
      setDocumento(uc(clienteEncontrado.document || ""));
      setEmail(uc(clienteEncontrado.email || ""));
      setPhone(uc(clienteEncontrado.phone || ""));
      setComentarios(uc(clienteEncontrado.comments || ""));
      setDirecciones(clienteEncontrado.addresses || []);
      setActivo(clienteEncontrado.state === true || clienteEncontrado.state === "true");
    }
  }, [clienteEncontrado]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) {
        setTipoIdDropdownOpen(false);
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

  const manejarGuardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones);
    setClienteEncontrado(prev => ({
      ...prev,
      addresses: nuevasDirecciones
    }));
  };

  const guardarCambios = async () => {
    if (!clienteEncontrado) return;

    // ===== Validación detallada =====
    const faltantes = [];
    const req = (val) => (typeof val === "string" ? val.trim() !== "" : !!val);

    if (!req(typeId)) faltantes.push("Tipo de ID");
    if (!req(documento)) faltantes.push("Documento");
    if (!req(nombre)) faltantes.push("Nombre");
    if (!req(email)) faltantes.push("Correo electrónico");

    // Al menos una dirección válida (address no vacío)
    const tieneDireccionValida =
      Array.isArray(direcciones) &&
      direcciones.length > 0 &&
      direcciones.some(d => (d?.address || "").toString().trim() !== "");
    if (!tieneDireccionValida) faltantes.push("Direcciones (al menos una)");

    // Formatos suaves
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      faltantes.push("Correo válido");
    }
    if (phone && !/^[0-9+()\-\s]{6,}$/.test(phone.trim())) {
      faltantes.push("Teléfono válido");
    }

    if (faltantes.length) {
      alert("Completa los siguientes campos antes de guardar:\n\n• " + faltantes.join("\n• "));
      return;
    }

    // Normaliza direcciones a MAYÚSCULAS
    const addressesNorm = (direcciones || []).map(d => ({
      ...d,
      address: uc(d?.address || "").trim(),
      city: uc(d?.city || "").trim(),
    }));

    const datosActualizados = {
      typeId: uc(typeId).trim(),
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addresses: addressesNorm,
      document: uc(documento).trim(),
      comments: uc(comentarios).trim(),
      state: !!activo
    };

    try {
      await actualizarCliente(clienteEncontrado.document, datosActualizados);
      alert("Cliente actualizado correctamente ✅");
    } catch (error) {
      alert("Error al actualizar cliente ❌ " + (error?.message || ""));
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
    setActivo(true);
  };

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
                {["CC", "TI", "NIT", "CE", "PA"].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      setTypeId(uc(tipo));
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

    if (activeTab === "add") return <AgregarClientes />;

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
              onClick={() => { setActiveTab("edit"); resetBusqueda(); }}
            >
              ✏️ Editar
            </button>
            <button
              className={`empleados-tab ${activeTab === "add" ? "active" : ""}`}
              onClick={() => { setActiveTab("add"); resetBusqueda(); }}
            >
              ➕ Agregar
            </button>
            <button
              className={`empleados-tab ${activeTab === "delete" ? "active" : ""}`}
              onClick={() => { setActiveTab("delete"); resetBusqueda(); }}
            >
              🗑️ Eliminar
            </button>
          </div>
          <div className="empleados-content-area">
            {renderForm()}
          </div>
        </div>
      </div>

      {mostrarModalDirecciones && (
        <ModalEditarDirecciones
          cliente={{ ...clienteEncontrado, addresses: direcciones }}
          onClose={() => setMostrarModalDirecciones(false)}
          onGuardar={manejarGuardarDirecciones}
        />
      )}
    </div>
  );
};

export default EditarClientes;