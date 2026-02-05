"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { actualizarEmpleado } from "@/lib/Logic.js";
import { useCiudades, useContractTypes } from "@/lib/Hooks";
import { Switch, Chip, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import "@/styles/Empleados/EditarEmpleados/ModalEditarEmpleados.css";

const uc = (v) => (v ?? "").toString().toUpperCase();
const norm = (v) => (v ?? "").toString().trim();

// Normaliza cualquier formato del backend a boolean real
const boolish = (v) => {
  if (v === true) return true;
  if (v === false) return false;

  const s = (v ?? "").toString().trim().toLowerCase();
  if (["true", "1", "si", "sí", "yes", "y", "activo", "active"].includes(s)) return true;
  if (["false", "0", "no", "n", "inactivo", "inactive"].includes(s)) return false;

  return false;
};

const CARGOS = [
  "Coordinador",
  "Supervisor",
  "Asistente Administrativo",
  "Secretario/a",
  "Auxiliar",
  "Contador",
  "Recursos Humanos",
  "Atención al Cliente",
  "Operario",
];

const TIPO_ID_OPTIONS = ["CC", "PPT"];

const toYMD = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

export default function ModalEditarEmpleados({ show, onClose, empleado, onUpdated }) {
  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();
  const { contractTypes, isLoading: contratosLoading, isError: contratosError } = useContractTypes();

  const [saving, setSaving] = useState(false);

  const originalDocRef = useRef("");
  const initKeyRef = useRef(null);

  // Form base
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [eps, setEps] = useState("");
  const [fondoPensiones, setFondoPensiones] = useState("");
  const [banco, setBanco] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [fechaRetiro, setFechaRetiro] = useState("");
  const [fechaIngresoArl, setFechaIngresoArl] = useState("");

  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedContractType, setSelectedContractType] = useState("");
  const [selectedTipoId, setSelectedTipoId] = useState("");

  const [activo, setActivo] = useState(true);

  // Dropdowns
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [contractDropdownOpen, setContractDropdownOpen] = useState(false);
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const contractDropdownRef = useRef(null);
  const tipoIdDropdownRef = useRef(null);

  const inputUpper = useMemo(() => ({ textTransform: "uppercase" }), []);

  const resetForm = () => {
    originalDocRef.current = "";
    initKeyRef.current = null;

    setNombre("");
    setApellido("");
    setDocumento("");
    setEmail("");
    setPhone("");
    setDireccion("");
    setFechaIngreso("");
    setComentarios("");

    setFechaNacimiento("");
    setContactoEmergencia("");
    setEps("");
    setFondoPensiones("");
    setBanco("");
    setNumeroCuenta("");
    setFechaRetiro("");
    setFechaIngresoArl("");

    setSelectedCargo("");
    setSelectedCity("");
    setSelectedContractType("");
    setSelectedTipoId("");

    setActivo(true);

    setCiudadDropdownOpen(false);
    setCargoDropdownOpen(false);
    setContractDropdownOpen(false);
    setTipoIdDropdownOpen(false);
  };

  useEffect(() => {
    if (!show) {
      initKeyRef.current = null;
      return;
    }

    if (!empleado) {
      resetForm();
      return;
    }

    const key = `${empleado.typeId ?? ""}|${empleado.document ?? ""}`;
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;

    originalDocRef.current = empleado.document ?? "";

    setNombre(uc(empleado.name));
    setApellido(uc(empleado.surname));
    setDocumento(uc(empleado.document));
    setEmail(uc(empleado.email));
    setPhone(uc(empleado.phone));
    setDireccion(uc(empleado.addressResidence));
    setComentarios(uc(empleado.comments));

    setSelectedCity(empleado.city || "");
    setSelectedCargo(empleado.position || "");
    setSelectedContractType(empleado.contractType || "");
    setSelectedTipoId(uc(empleado.typeId));

    setActivo(boolish(empleado.state));
    setFechaIngreso(toYMD(empleado.entryDate));

    setFechaNacimiento(toYMD(empleado.birthDate));
    setContactoEmergencia(uc(empleado.emergencyContact));
    setEps(uc(empleado.eps));
    setFondoPensiones(uc(empleado.pensionFund));
    setBanco(uc(empleado.bankName));
    setNumeroCuenta(uc(empleado.bankAccountNumber));
    setFechaRetiro(toYMD(empleado.exitDate));
    setFechaIngresoArl(toYMD(empleado.arlEntryDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, empleado]);

  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) setCargoDropdownOpen(false);
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) setCiudadDropdownOpen(false);
      if (contractDropdownRef.current && !contractDropdownRef.current.contains(event.target)) setContractDropdownOpen(false);
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) setTipoIdDropdownOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") !saving && onClose?.();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [show, saving, onClose]);

  const validate = () => {
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

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) faltantes.push("Correo válido");
    if (phone && !/^[0-9+()\-\s]{6,}$/.test(phone.trim())) faltantes.push("Teléfono válido");

    return faltantes;
  };

  const guardarCambios = async () => {
    if (!empleado) return;

    const faltantes = validate();
    if (faltantes.length) {
      alert("Completa los siguientes campos antes de guardar:\n\n• " + faltantes.join("\n• "));
      return;
    }

    const payload = {
      typeId: uc(selectedTipoId).trim(),
      document: uc(documento).trim(),
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      city: norm(selectedCity),
      position: norm(selectedCargo),
      entryDate: toYMD(fechaIngreso),
      contractType: norm(selectedContractType),

      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addressResidence: uc(direccion).trim(),
      comments: uc(comentarios).trim(),
      state: activo,

      birthDate: toYMD(fechaNacimiento),
      emergencyContact: uc(contactoEmergencia).trim(),
      eps: uc(eps).trim(),
      pensionFund: uc(fondoPensiones).trim(),
      bankName: uc(banco).trim(),
      bankAccountNumber: uc(numeroCuenta).trim(),
      exitDate: toYMD(fechaRetiro),
      arlEntryDate: toYMD(fechaIngresoArl),
    };

    const docOriginal = originalDocRef.current || empleado.document || documento;

    try {
      setSaving(true);
      await actualizarEmpleado(docOriginal, payload);
      alert("Empleado actualizado correctamente ✅");
      onUpdated?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar empleado ❌ " + (error?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const stop = (e) => e.stopPropagation();

  const nombreHeader = empleado?.name
    ? `${empleado.name} ${empleado.surname ?? ""}`.trim()
    : "—";

  return (
    <div className="emp-edit-modal-overlay" onClick={() => !saving && onClose?.()}>
      <div className="emp-edit-modal-container empadd-modal-container" onClick={stop} aria-busy={saving}>
        {/* Header */}
        <div className="empadd-modal-header">
          <div>
            <div className="empadd-modal-title">Editar empleado</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
              {nombreHeader}
              {empleado?.document ? ` — ${empleado.document}` : ""}
            </div>
          </div>

          <Tooltip title="Cerrar">
            <button
              type="button"
              onClick={() => !saving && onClose?.()}
              className="emp-edit-close-btn"
              aria-label="Cerrar"
              disabled={saving}
            >
              <CloseIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>

        {/* Body */}
        <div className="empadd-body">
          <div className="empadd-form-grid">
            <div className="empadd-group">
              <label htmlFor="emp-nombre">Nombre(s)</label>
              <input
                id="emp-nombre"
                className="empadd-input empadd-upper"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            <div className="empadd-group">
              <label htmlFor="emp-apellido">Apellido(s)</label>
              <input
                id="emp-apellido"
                className="empadd-input empadd-upper"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* ✅ Fecha nacimiento */}
            <div className="empadd-group">
              <label htmlFor="emp-nacimiento">Fecha de nacimiento</label>
              <input
                id="emp-nacimiento"
                className="empadd-input"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(toYMD(e.target.value))}
                disabled={saving}
              />
            </div>

            {/* ✅ Contacto emergencia */}
            <div className="empadd-group">
              <label htmlFor="emp-emergencia">Contacto emergencia</label>
              <input
                id="emp-emergencia"
                className="empadd-input empadd-upper"
                type="text"
                value={contactoEmergencia}
                onChange={(e) => setContactoEmergencia(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* ✅ EPS */}
            <div className="empadd-group">
              <label htmlFor="emp-eps">EPS</label>
              <input
                id="emp-eps"
                className="empadd-input empadd-upper"
                type="text"
                value={eps}
                onChange={(e) => setEps(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* ✅ Fondo pensiones */}
            <div className="empadd-group">
              <label htmlFor="emp-pension">Fondo pensiones</label>
              <input
                id="emp-pension"
                className="empadd-input empadd-upper"
                type="text"
                value={fondoPensiones}
                onChange={(e) => setFondoPensiones(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* ✅ Banco */}
            <div className="empadd-group">
              <label htmlFor="emp-banco">Banco</label>
              <input
                id="emp-banco"
                className="empadd-input empadd-upper"
                type="text"
                value={banco}
                onChange={(e) => setBanco(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* ✅ N° cuenta */}
            <div className="empadd-group">
              <label htmlFor="emp-cuenta">N° Cuenta bancaria</label>
              <input
                id="emp-cuenta"
                className="empadd-input empadd-upper"
                type="text"
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* Ciudad */}
            <div className="empadd-group empadd-dd" ref={ciudadDropdownRef}>
              <label>Ciudad</label>
              <button
                type="button"
                className={`empadd-dd-trigger ${ciudadDropdownOpen ? "empadd-open" : ""}`}
                onClick={() => !saving && setCiudadDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="empadd-dd-value">
                  {selectedCity || (ciudadesLoading ? "Cargando ciudades…" : "Seleccionar ciudad")}
                </span>
                <span className="empadd-dd-arrow">▼</span>
              </button>

              {ciudadDropdownOpen && (
                <div className="empadd-dd-content">
                  {ciudadesLoading && <div className="empadd-dd-loading">Cargando ciudades...</div>}
                  {ciudadesError && <div className="empadd-dd-loading">Error al cargar ciudades</div>}
                  {!ciudadesLoading &&
                    !ciudadesError &&
                    (ciudades || []).map((ciu) => (
                      <button
                        key={ciu}
                        type="button"
                        className="empadd-dd-option"
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

            {/* Cargo */}
            <div className="empadd-group empadd-dd" ref={cargoDropdownRef}>
              <label>Cargo</label>
              <button
                type="button"
                className={`empadd-dd-trigger ${cargoDropdownOpen ? "empadd-open" : ""}`}
                onClick={() => !saving && setCargoDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="empadd-dd-value">{selectedCargo || "Seleccionar cargo"}</span>
                <span className="empadd-dd-arrow">▼</span>
              </button>

              {cargoDropdownOpen && (
                <div className="empadd-dd-content">
                  {CARGOS.map((cargo) => (
                    <button
                      key={cargo}
                      type="button"
                      className={`empadd-dd-option ${selectedCargo === cargo ? "empadd-selected" : ""}`}
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

            {/* Tipo de contrato */}
            <div className="empadd-group empadd-dd" ref={contractDropdownRef}>
              <label>Tipo de contrato</label>
              <button
                type="button"
                className={`empadd-dd-trigger ${contractDropdownOpen ? "empadd-open" : ""}`}
                onClick={() => !saving && setContractDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="empadd-dd-value">
                  {selectedContractType || (contratosLoading ? "Cargando tipos…" : "Seleccionar tipo")}
                </span>
                <span className="empadd-dd-arrow">▼</span>
              </button>

              {contractDropdownOpen && (
                <div className="empadd-dd-content">
                  {contratosLoading && <div className="empadd-dd-loading">Cargando tipos...</div>}
                  {contratosError && <div className="empadd-dd-loading">Error al cargar tipos</div>}
                  {!contratosLoading &&
                    !contratosError &&
                    (contractTypes || []).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        className={`empadd-dd-option ${
                          (selectedContractType || "").toLowerCase() === ct.toLowerCase()
                            ? "empadd-selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedContractType(ct);
                          setContractDropdownOpen(false);
                        }}
                      >
                        {ct}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Tipo ID */}
            <div className="empadd-group empadd-dd" ref={tipoIdDropdownRef}>
              <label>Tipo ID</label>
              <button
                type="button"
                className={`empadd-dd-trigger ${tipoIdDropdownOpen ? "empadd-open" : ""}`}
                onClick={() => !saving && setTipoIdDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="empadd-dd-value">{selectedTipoId || "Selecc. Tipo ID"}</span>
                <span className="empadd-dd-arrow">▼</span>
              </button>

              {tipoIdDropdownOpen && (
                <div className="empadd-dd-content">
                  {TIPO_ID_OPTIONS.map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      className={`empadd-dd-option ${
                        (selectedTipoId || "").toUpperCase() === tipo ? "empadd-selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedTipoId(uc(tipo));
                        setTipoIdDropdownOpen(false);
                      }}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="empadd-group">
              <label htmlFor="emp-documento">N° Documento</label>
              <input
                id="emp-documento"
                className="empadd-input empadd-upper"
                type="text"
                value={documento}
                onChange={(e) => setDocumento(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            <div className="empadd-group">
              <label htmlFor="emp-email">Correo electrónico</label>
              <input
                id="emp-email"
                className="empadd-input empadd-upper"
                type="email"
                value={email}
                onChange={(e) => setEmail(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            <div className="empadd-group">
              <label htmlFor="emp-phone">N° Celular - Teléfono</label>
              <input
                id="emp-phone"
                className="empadd-input empadd-upper"
                type="text"
                value={phone}
                onChange={(e) => setPhone(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            <div className="empadd-group">
              <label htmlFor="emp-direccion">Dirección</label>
              <input
                id="emp-direccion"
                className="empadd-input empadd-upper"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* Estado */}
            <div className="empadd-group empadd-state-row empadd-span-2">
              <label>Estado</label>
              <div
                className="empadd-state-inline"
                role="button"
                tabIndex={0}
                aria-disabled={saving ? "true" : "false"}
                onClick={() => !saving && setActivo((v) => !v)}
                onKeyDown={(e) => {
                  if (saving) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActivo((v) => !v);
                  }
                }}
              >
                <Switch checked={activo} onChange={(_, checked) => setActivo(checked)} disabled={saving} />
                <Chip
                  size="small"
                  label={activo ? "ACTIVO" : "INACTIVO"}
                  color={activo ? "success" : "default"}
                  variant={activo ? "filled" : "outlined"}
                />
              </div>
            </div>

            <div className="empadd-group">
              <label htmlFor="emp-fechaIngreso">Fecha de ingreso</label>
              <input
                id="emp-fechaIngreso"
                className="empadd-input"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(toYMD(e.target.value))}
                disabled={saving}
              />
            </div>

            {/* ✅ Fecha retiro */}
            <div className="empadd-group">
              <label htmlFor="emp-fechaRetiro">Fecha de retiro</label>
              <input
                id="emp-fechaRetiro"
                className="empadd-input"
                type="date"
                value={fechaRetiro}
                onChange={(e) => setFechaRetiro(toYMD(e.target.value))}
                disabled={saving}
              />
            </div>

            {/* ✅ Fecha ingreso ARL */}
            <div className="empadd-group">
              <label htmlFor="emp-fechaArl">Fecha ingreso ARL</label>
              <input
                id="emp-fechaArl"
                className="empadd-input"
                type="date"
                value={fechaIngresoArl}
                onChange={(e) => setFechaIngresoArl(toYMD(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="empadd-group empadd-span-2">
              <label>Comentarios</label>
              <textarea
                className="empadd-textarea empadd-upper"
                value={comentarios}
                onChange={(e) => setComentarios(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="empadd-footer">
          <button type="button" className="cancel-btn" onClick={() => !saving && onClose?.()} disabled={saving}>
            ❌ CANCELAR
          </button>

          <button type="button" className="menu-btn" onClick={guardarCambios} disabled={saving}>
            💾 {saving ? "GUARDANDO…" : "GUARDAR CAMBIOS"}
          </button>
        </div>
      </div>
    </div>
  );
}
