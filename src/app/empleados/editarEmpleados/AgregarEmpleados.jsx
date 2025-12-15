'use client';

import React, { useState, useRef, useEffect } from "react";
import { agregarEmpleado } from "@/lib/Logic.js";
import { useCiudades, useContractTypes } from "@/lib/Hooks";
import { Switch, Chip } from "@mui/material";

const AgregarEmpleados = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();
  const { contractTypes, isLoading: contratosLoading, isError: contratosError } = useContractTypes();

  const [fechaIngreso, setFechaIngreso] = useState(""); // YYYY-MM-DD
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedContractType, setSelectedContractType] = useState("");

  const [activo, setActivo] = useState(true);

  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const [contractDropdownOpen, setContractDropdownOpen] = useState(false);

  const [selectedTipoId, setSelectedTipoId] = useState("");
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const contractDropdownRef = useRef(null);
  const tipoIdDropdownRef = useRef(null);

  const cargos = [
    "Coordinador", "Supervisor", "Asistente Administrativo",
    "Secretario/a", "Auxiliar", "Contador",
    "Recursos Humanos", "Atención al Cliente", "Operario"
  ];
  const tiposId = ["CC", "PPT"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) setCargoDropdownOpen(false);
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) setCiudadDropdownOpen(false);
      if (contractDropdownRef.current && !contractDropdownRef.current.contains(event.target)) setContractDropdownOpen(false);
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) setTipoIdDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normaliza fechas a YYYY-MM-DD
  const toYMD = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    try { return new Date(value).toISOString().slice(0, 10); } catch { return ""; }
  };

  // Uppercase helpers
  const uc = (v) => (v ?? "").toString().toUpperCase();
  const onNombre = (e) => setNombre(uc(e.target.value));
  const onApellido = (e) => setApellido(uc(e.target.value));
  const onDocumento = (e) => setDocumento(uc(e.target.value));
  const onEmail = (e) => setEmail(uc(e.target.value));
  const onPhone = (e) => setPhone(uc(e.target.value));
  const onDireccion = (e) => setDireccion(uc(e.target.value));
  const onComentarios = (e) => setComentarios(uc(e.target.value));

  const handleSubmit = async () => {
    // === Validación fuerte (lista campos faltantes) ===
    const faltantes = [];
    const req = (val) => (typeof val === "string" ? val.trim() !== "" : !!val);

    if (!req(selectedTipoId)) faltantes.push("Tipo de ID");
    if (!req(documento)) faltantes.push("Documento");
    if (!req(nombre)) faltantes.push("Nombre");
    if (!req(apellido)) faltantes.push("Apellido");
    if (!req(selectedCity)) faltantes.push("Ciudad");
    if (!req(selectedCargo)) faltantes.push("Cargo");
    if (!req(fechaIngreso)) faltantes.push("Fecha de ingreso");
    if (!req(selectedContractType)) faltantes.push("Tipo de contrato");

    // Validaciones suaves
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

    const toYMD = (value) => {
      if (!value) return "";
      if (typeof value === "string") return value.slice(0, 10);
      try { return new Date(value).toISOString().slice(0, 10); } catch { return ""; }
    };
    const uc = (v) => (v ?? "").toString().toUpperCase();

    const nuevoEmpleado = {
      typeId: uc(selectedTipoId).trim(),
      document: uc(documento).trim(),
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      city: (selectedCity || "").trim(),
      position: (selectedCargo || "").trim(),
      entryDate: toYMD(fechaIngreso),
      contractType: (selectedContractType || "").trim(), // enum/label aceptado
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addressResidence: uc(direccion).trim(),
      comments: uc(comentarios).trim(),
      state: !!activo,
    };

    try {
      await agregarEmpleado(nuevoEmpleado);
      alert("Empleado agregado correctamente ✅");
      resetFormulario();
    } catch (error) {
      console.error(error);
      alert("Error al agregar empleado ❌ " + (error?.message || ""));
    }
  };


  const handleCancelar = () => {
    const hayCamposLlenos =
      nombre || apellido || selectedTipoId || documento || email || phone || direccion ||
      selectedCity || selectedCargo || selectedContractType || fechaIngreso || comentarios;

    if (hayCamposLlenos && window.confirm("¿Deseas borrar todos los campos?")) {
      resetFormulario();
    }
  };

  const resetFormulario = () => {
    setNombre("");
    setApellido("");
    setSelectedTipoId("");
    setDocumento("");
    setEmail("");
    setFechaIngreso("");
    setSelectedCargo("");
    setSelectedContractType("");
    setPhone("");
    setDireccion("");
    setComentarios("");
    setSelectedCity("");
    setActivo(true);
  };

  const inputUpperStyle = { textTransform: "uppercase" };

  return (
    <div className="empleados-form-grid">
      <div
        className="empleados-full-width empleados-form-grid"
        style={{ maxHeight: '45vh', overflowY: 'auto', paddingRight: '8px' }}
      >
        <div className="input-group">
          <label htmlFor="agregar-nombre">Nombre(s)</label>
          <input id="agregar-nombre" type="text" value={nombre} onChange={onNombre} style={inputUpperStyle} />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-apellido">Apellido(s)</label>
          <input id="agregar-apellido" type="text" value={apellido} onChange={onApellido} style={inputUpperStyle} />
        </div>

        {/* Ciudad */}
        <div className="input-group" ref={ciudadDropdownRef}>
          <label htmlFor="agregar-ciudad">Ciudad</label>
          <div className="dropdown">
            <button
              id="agregar-ciudad"
              type="button"
              className={`dropdown-trigger ${ciudadDropdownOpen ? "open" : ""}`}
              onClick={() => setCiudadDropdownOpen(o => !o)}
            >
              <span>{selectedCity || "Seleccionar ciudad"}</span>
              <span className="arrow">▼</span>
            </button>
            {ciudadDropdownOpen && (
              <div className="dropdown-content">
                {ciudadesLoading && <div>Cargando ciudades...</div>}
                {ciudadesError && <div>Error al cargar ciudades</div>}
                {!ciudadesLoading && !ciudadesError && (ciudades || []).map((ciu) => (
                  <button key={ciu} type="button" onClick={() => { setSelectedCity(ciu); setCiudadDropdownOpen(false); }}>
                    {ciu}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cargo */}
        <div className="input-group" ref={cargoDropdownRef}>
          <label htmlFor="agregar-cargo">Cargo</label>
          <div className="dropdown">
            <button
              id="agregar-cargo"
              type="button"
              className={`dropdown-trigger ${cargoDropdownOpen ? "open" : ""}`}
              onClick={() => setCargoDropdownOpen(o => !o)}
            >
              <span>{selectedCargo || "Seleccionar cargo"}</span>
              <span className="arrow">▼</span>
            </button>
            {cargoDropdownOpen && (
              <div className="dropdown-content">
                {cargos.map((cargo) => (
                  <button key={cargo} type="button" onClick={() => { setSelectedCargo(cargo); setCargoDropdownOpen(false); }}>
                    {cargo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tipo de contrato */}
        <div className="input-group" ref={contractDropdownRef}>
          <label htmlFor="agregar-contrato">Tipo de contrato</label>
          <div className="dropdown">
            <button
              id="agregar-contrato"
              type="button"
              className={`dropdown-trigger ${contractDropdownOpen ? "open" : ""}`}
              onClick={() => setContractDropdownOpen(o => !o)}
            >
              <span>{selectedContractType || "Seleccionar tipo contrato"}</span>
              <span className="arrow">▼</span>
            </button>
            {contractDropdownOpen && (
              <div className="dropdown-content">
                {contratosLoading && <div>Cargando tipos...</div>}
                {contratosError && <div>Error al cargar tipos</div>}
                {!contratosLoading && !contratosError && (contractTypes || []).map((ct) => (
                  <button key={ct} type="button" onClick={() => { setSelectedContractType(ct); setContractDropdownOpen(false); }}>
                    {ct}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="input-group">
          <label htmlFor="agregar-direccion">Dirección</label>
          <input id="agregar-direccion" type="text" value={direccion} onChange={onDireccion} style={inputUpperStyle} />
        </div>

        {/* Tipo ID */}
        <div className="input-group" ref={tipoIdDropdownRef}>
          <label htmlFor="agregar-tipoid">Tipo ID</label>
          <div className="dropdown">
            <button
              id="agregar-tipoid"
              type="button"
              className={`dropdown-trigger ${tipoIdDropdownOpen ? "open" : ""}`}
              onClick={() => setTipoIdDropdownOpen(o => !o)}
            >
              <span>{selectedTipoId || "Selecc. Tipo ID"}</span>
              <span className="arrow">▼</span>
            </button>
            {tipoIdDropdownOpen && (
              <div className="dropdown-content">
                {tiposId.map((tipo) => (
                  <button key={tipo} type="button" onClick={() => { setSelectedTipoId(uc(tipo)); setTipoIdDropdownOpen(false); }}>
                    {tipo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="agregar-documento">N° Documento</label>
          <input id="agregar-documento" type="text" value={documento} onChange={onDocumento} style={inputUpperStyle} />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-email">Correo electrónico</label>
          <input id="agregar-email" type="email" value={email} onChange={onEmail} style={inputUpperStyle} />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-phone">N° Celular - Telefono</label>
          <input id="agregar-phone" type="text" value={phone} onChange={onPhone} style={inputUpperStyle} />
        </div>

        {/* Estado */}
        <div className="input-group" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <Chip size="small" label={activo ? "ACTIVO" : "INACTIVO"} color={activo ? "success" : "default"} variant={activo ? "filled" : "outlined"} />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-fecha">Fecha de ingreso</label>
          <input id="agregar-fecha" type="date" value={fechaIngreso} onChange={e => setFechaIngreso(toYMD(e.target.value))} />
        </div>

        <div className="input-group">
          <label>Comentarios</label>
          <textarea className="modal-asignacion-textarea" value={comentarios} onChange={onComentarios} style={inputUpperStyle} />
        </div>
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={handleSubmit}>➕ AGREGAR</button>
        <button type="reset" className="cancel-btn" onClick={handleCancelar}>❌ CANCELAR</button>
      </div>
    </div>
  );
};

export default AgregarEmpleados;
