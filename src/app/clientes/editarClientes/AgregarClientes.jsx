'use client';

import React, { useState, useEffect, useRef } from "react";
import ModalEditarDirecciones from "./ModalEditarDirecciones.jsx";
import { agregarCliente } from "@/lib/Logic.js";
import { Switch, Chip } from "@mui/material";

const AgregarClientes = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [activo, setActivo] = useState(true);

  const [direcciones, setDirecciones] = useState([]);
  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  const tipoIdDropdownRef = useRef(null);

  const tipoId = ["CC", "TI", "NIT", "CE", "PT"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) {
        setTipoIdDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const manejarGuardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones);
  };

  // Uppercase helpers
  const uc = (v) => (v ?? "").toString().toUpperCase();
  const onNombre = (e) => setNombre(uc(e.target.value));
  const onApellido = (e) => setApellido(uc(e.target.value));
  const onDocumento = (e) => setDocumento(uc(e.target.value));
  const onEmail = (e) => setEmail(uc(e.target.value));
  const onPhone = (e) => setPhone(uc(e.target.value));
  const onComentarios = (e) => setComentarios(uc(e.target.value));
  const inputUpperStyle = { textTransform: "uppercase" };

  const handleSubmit = async () => {
    // ===== Validación detallada (con lista de faltantes) =====
    const faltantes = [];
    const req = (val) => (typeof val === "string" ? val.trim() !== "" : !!val);

    if (!req(tipoDocumento)) faltantes.push("Tipo de ID");
    if (!req(documento))     faltantes.push("Documento");
    if (!req(nombre))        faltantes.push("Nombre");
    // Apellido no obligatorio, quítale el comentario si lo quieres obligatorio
    // if (!req(apellido))       faltantes.push("Apellido");
    if (!req(email))         faltantes.push("Correo electrónico");

    // Al menos una dirección válida (con 'address' no vacío)
    const tieneDireccionValida =
      Array.isArray(direcciones) &&
      direcciones.length > 0 &&
      direcciones.some(d => (d?.address || "").toString().trim() !== "");
    if (!tieneDireccionValida) faltantes.push("Direcciones (al menos una)");

    // Validaciones de formato (suaves)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      faltantes.push("Correo válido");
    }
    if (phone && !/^[0-9+()\-\s]{6,}$/.test(phone.trim())) {
      faltantes.push("Teléfono válido");
    }

    if (faltantes.length) {
      alert(
        "Completa los siguientes campos antes de guardar:\n\n• " +
        faltantes.join("\n• ")
      );
      return;
    }

    // Normaliza direcciones a MAYÚSCULAS (address/city si existen)
    const addressesNorm = (direcciones || []).map(d => ({
      ...d,
      address: uc(d?.address || "").trim(),
      city: uc(d?.city || "").trim(),
    }));

    const nuevoCliente = {
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      document: uc(documento).trim(),
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      typeId: uc(tipoDocumento).trim(),
      addresses: addressesNorm,
      comments: uc(comentarios).trim(),
      state: !!activo,
    };

    try {
      await agregarCliente(nuevoCliente);
      alert("Cliente agregado correctamente ✅");
      resetBusqueda();
    } catch (error) {
      console.error(error);
      alert("Error al agregar cliente ❌ " + (error?.message || ""));
    }
  };

  const handleCancelar = () => {
    const hayCamposLlenos =
      nombre || apellido || documento || email || phone || tipoDocumento || comentarios || direcciones.length > 0;
    if (hayCamposLlenos && window.confirm("¿Deseas borrar todos los campos?")) {
      resetBusqueda();
    }
  };

  const resetBusqueda = () => {
    setNombre("");
    setApellido("");
    setDocumento("");
    setEmail("");
    setPhone("");
    setTipoDocumento("");
    setComentarios("");
    setDirecciones([]);
    setActivo(true);
  };

  return (
    <div className="empleados-form-grid">
      <div
        className="empleados-full-width empleados-form-grid"
        style={{ maxHeight: "45vh", overflowY: "auto", paddingRight: "8px" }}
      >
        <div className="input-group">
          <label htmlFor="nombre">Nombre(s)</label>
          <input id="nombre" type="text" value={nombre} onChange={onNombre} style={inputUpperStyle} />
        </div>

        <div className="input-group">
          <label htmlFor="apellido">Apellido(s)</label>
          <input id="apellido" type="text" value={apellido} onChange={onApellido} style={inputUpperStyle} />
        </div>

        <div className="input-group" ref={tipoIdDropdownRef}>
          <label htmlFor="tipoDocumento">Tipo ID</label>
          <div className="dropdown">
            <button
              id="tipoDocumento"
              type="button"
              className={`dropdown-trigger ${tipoIdDropdownOpen ? "open" : ""}`}
              onClick={() => setTipoIdDropdownOpen((o) => !o)}
            >
              <span>{tipoDocumento || "Selecc. Tipo ID"}</span>
              <span className="arrow">▼</span>
            </button>
            {tipoIdDropdownOpen && (
              <div className="dropdown-content">
                {tipoId.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      setTipoDocumento(tipo.toUpperCase());
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
          <input id="documento" type="text" value={documento} onChange={onDocumento} style={inputUpperStyle} />
        </div>

        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" value={email} onChange={onEmail} style={inputUpperStyle} />
        </div>

        <button type="button" className="menu-btn" onClick={() => setMostrarModalDirecciones(true)}>
          📍 Editar Direcciones ({direcciones.length})
        </button>

        <div className="input-group">
          <label htmlFor="phone">N° Celular - Telefono</label>
          <input id="phone" type="text" value={phone} onChange={onPhone} style={inputUpperStyle} />
        </div>

        <div className="input-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            style={inputUpperStyle}
          />
        </div>
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={handleSubmit}>➕ AGREGAR</button>
        <button type="reset" className="cancel-btn" onClick={handleCancelar}>❌ CANCELAR</button>
      </div>

      {mostrarModalDirecciones && (
        <ModalEditarDirecciones
          cliente={{ addresses: direcciones }}
          onClose={() => setMostrarModalDirecciones(false)}
          onGuardar={manejarGuardarDirecciones}
        />
      )}
    </div>
  );
};

export default AgregarClientes;
