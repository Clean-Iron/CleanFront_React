// /components/Empleados/ListaEmpleados/ModalAgregarEmpleados.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { agregarEmpleado } from "@/lib/Logic.js";
import { useContractTypes } from "@/lib/Hooks";
import { Switch, Chip, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import "@/styles/Empleados/AgregarEmpleados/ModalAgregarEmpleados.css";

export default function ModalAgregarEmpleados({
  show,
  onClose,
  onCreated,
  ciudades = [], // ✅ string[]
  ciudadesLoading = false,
  ciudadesError = false,
}) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [eps, setEps] = useState("");
  const [fondoPensiones, setFondoPensiones] = useState("");
  const [banco, setBanco] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [fechaRetiro, setFechaRetiro] = useState("");
  const [fechaIngresoArl, setFechaIngresoArl] = useState("");

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedContractType, setSelectedContractType] = useState("");
  const [selectedTipoId, setSelectedTipoId] = useState("");

  const [activo, setActivo] = useState(true);

  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const [contractDropdownOpen, setContractDropdownOpen] = useState(false);
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const contractDropdownRef = useRef(null);
  const tipoIdDropdownRef = useRef(null);

  const { contractTypes, isLoading: contratosLoading, isError: contratosError } = useContractTypes();

  const cargos = useMemo(
    () => [
      "Coordinador",
      "Supervisor",
      "Asistente Administrativo",
      "Secretario/a",
      "Auxiliar",
      "Contador",
      "Recursos Humanos",
      "Atención al Cliente",
      "Operario",
    ],
    []
  );

  const tiposId = useMemo(() => ["CC", "PPT"], []);

  const uc = (v) => (v ?? "").toString().toUpperCase();
  const toYMD = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    try {
      return new Date(value).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event) => {
      const t = event.target;
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(t)) setCargoDropdownOpen(false);
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(t)) setCiudadDropdownOpen(false);
      if (contractDropdownRef.current && !contractDropdownRef.current.contains(t)) setContractDropdownOpen(false);
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(t)) setTipoIdDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show, onClose]);

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

    setFechaNacimiento("");
    setContactoEmergencia("");
    setEps("");
    setFondoPensiones("");
    setBanco("");
    setNumeroCuenta("");
    setFechaRetiro("");
    setFechaIngresoArl("");

    setCargoDropdownOpen(false);
    setCiudadDropdownOpen(false);
    setContractDropdownOpen(false);
    setTipoIdDropdownOpen(false);
  };

  const hayCambios =
    nombre ||
    apellido ||
    selectedTipoId ||
    documento ||
    email ||
    phone ||
    direccion ||
    selectedCity ||
    selectedCargo ||
    selectedContractType ||
    fechaIngreso ||
    comentarios ||
    fechaNacimiento ||
    contactoEmergencia ||
    eps ||
    fondoPensiones ||
    banco ||
    numeroCuenta ||
    fechaRetiro ||
    fechaIngresoArl;

  const handleCancelar = () => {
    if (hayCambios) {
      const ok = window.confirm("¿Deseas cerrar y borrar los cambios?");
      if (!ok) return;
    }
    resetFormulario();
    onClose?.();
  };

  const handleSubmit = async () => {
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

    if (faltantes.length) {
      alert("Completa los siguientes campos antes de guardar:\n\n• " + faltantes.join("\n• "));
      return;
    }

    // ✅ DTO EmployeeUpsertRequestDto
    const nuevoEmpleado = {
      typeId: uc(selectedTipoId).trim(),
      document: uc(documento).trim(),
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),

      city: (selectedCity || "").trim(), // ✅ STRING

      position: (selectedCargo || "").trim(),
      entryDate: toYMD(fechaIngreso),
      contractType: (selectedContractType || "").trim(),

      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addressResidence: uc(direccion).trim(),
      comments: uc(comentarios).trim(),
      state: !!activo,

      birthDate: toYMD(fechaNacimiento),
      emergencyContact: uc(contactoEmergencia).trim(),
      eps: uc(eps).trim(),
      pensionFund: uc(fondoPensiones).trim(),
      bankName: uc(banco).trim(),
      bankAccountNumber: uc(numeroCuenta).trim(),
      exitDate: toYMD(fechaRetiro),
      arlEntryDate: toYMD(fechaIngresoArl),
    };

    try {
      await agregarEmpleado(nuevoEmpleado);
      alert("Empleado agregado correctamente ✅");
      onCreated?.(nuevoEmpleado);
      resetFormulario();
      onClose?.();
    } catch (error) {
      console.error(error);
      alert("Error al agregar empleado ❌ " + (error?.message || ""));
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleCancelar();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-container empadd-modal-container">
        <div className="empadd-modal-header">
          <div className="empadd-modal-title">Agregar empleado</div>

          <IconButton aria-label="Cerrar" onClick={handleCancelar} className="empadd-close-btn" size="small" disableRipple>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <div className="empadd-body">
          <div className="empadd-form-grid">
            <div className="empadd-group">
              <label>Nombre(s)</label>
              <input className="empadd-input empadd-upper" value={nombre} onChange={(e) => setNombre(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Apellido(s)</label>
              <input className="empadd-input empadd-upper" value={apellido} onChange={(e) => setApellido(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Fecha de nacimiento</label>
              <input className="empadd-input" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(toYMD(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Contacto emergencia</label>
              <input
                className="empadd-input empadd-upper"
                value={contactoEmergencia}
                onChange={(e) => setContactoEmergencia(uc(e.target.value))}
                placeholder="Nombre y teléfono"
              />
            </div>

            {/* Ciudad */}
            <div className="empadd-group" ref={ciudadDropdownRef}>
              <label>Ciudad</label>
              <div className="empadd-dd">
                <button
                  type="button"
                  className={`empadd-dd-trigger ${ciudadDropdownOpen ? "empadd-open" : ""}`}
                  onClick={() => setCiudadDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedCity || "Seleccionar ciudad"}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {ciudadDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedCity("");
                        setCiudadDropdownOpen(false);
                      }}
                    >
                      Limpiar
                    </button>

                    {ciudadesLoading && <div className="empadd-dd-loading">Cargando ciudades…</div>}
                    {ciudadesError && <div className="empadd-dd-loading">Error al cargar ciudades</div>}

                    {!ciudadesLoading &&
                      !ciudadesError &&
                      (ciudades || []).map((ciu) => (
                        <button
                          key={ciu}
                          type="button"
                          className={`empadd-dd-option ${selectedCity === ciu ? "empadd-selected" : ""}`}
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

            {/* Cargo */}
            <div className="empadd-group" ref={cargoDropdownRef}>
              <label>Cargo</label>
              <div className="empadd-dd">
                <button
                  type="button"
                  className={`empadd-dd-trigger ${cargoDropdownOpen ? "empadd-open" : ""}`}
                  onClick={() => setCargoDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedCargo || "Seleccionar cargo"}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {cargoDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedCargo("");
                        setCargoDropdownOpen(false);
                      }}
                    >
                      Limpiar
                    </button>

                    {cargos.map((cargo) => (
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
            </div>

            {/* Tipo contrato */}
            <div className="empadd-group" ref={contractDropdownRef}>
              <label>Tipo de contrato</label>
              <div className="empadd-dd">
                <button
                  type="button"
                  className={`empadd-dd-trigger ${contractDropdownOpen ? "empadd-open" : ""}`}
                  onClick={() => setContractDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedContractType || "Seleccionar tipo contrato"}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {contractDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedContractType("");
                        setContractDropdownOpen(false);
                      }}
                    >
                      Limpiar
                    </button>

                    {contratosLoading && <div className="empadd-dd-loading">Cargando tipos…</div>}
                    {contratosError && <div className="empadd-dd-loading">Error al cargar tipos</div>}

                    {!contratosLoading &&
                      !contratosError &&
                      (contractTypes || []).map((ct) => (
                        <button
                          key={ct}
                          type="button"
                          className={`empadd-dd-option ${selectedContractType === ct ? "empadd-selected" : ""}`}
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
            </div>

            <div className="empadd-group empadd-span-2">
              <label>Dirección</label>
              <input className="empadd-input empadd-upper" value={direccion} onChange={(e) => setDireccion(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>EPS</label>
              <input className="empadd-input empadd-upper" value={eps} onChange={(e) => setEps(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Fondo pensiones</label>
              <input className="empadd-input empadd-upper" value={fondoPensiones} onChange={(e) => setFondoPensiones(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Banco</label>
              <input className="empadd-input empadd-upper" value={banco} onChange={(e) => setBanco(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>N° Cuenta bancaria</label>
              <input className="empadd-input empadd-upper" value={numeroCuenta} onChange={(e) => setNumeroCuenta(uc(e.target.value))} />
            </div>

            {/* Tipo ID */}
            <div className="empadd-group" ref={tipoIdDropdownRef}>
              <label>Tipo ID</label>
              <div className="empadd-dd">
                <button
                  type="button"
                  className={`empadd-dd-trigger ${tipoIdDropdownOpen ? "empadd-open" : ""}`}
                  onClick={() => setTipoIdDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedTipoId || "Selecc. Tipo ID"}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {tipoIdDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedTipoId("");
                        setTipoIdDropdownOpen(false);
                      }}
                    >
                      Limpiar
                    </button>

                    {tiposId.map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        className={`empadd-dd-option ${selectedTipoId === tipo ? "empadd-selected" : ""}`}
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
            </div>

            <div className="empadd-group">
              <label>N° Documento</label>
              <input className="empadd-input empadd-upper" value={documento} onChange={(e) => setDocumento(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Correo electrónico</label>
              <input className="empadd-input empadd-upper" type="email" value={email} onChange={(e) => setEmail(uc(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>N° Celular - Teléfono</label>
              <input className="empadd-input empadd-upper" value={phone} onChange={(e) => setPhone(uc(e.target.value))} />
            </div>

            <div className="empadd-group empadd-state-row">
              <label>Estado</label>
              <div className="empadd-state-inline">
                <Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                <Chip size="small" label={activo ? "ACTIVO" : "INACTIVO"} color={activo ? "success" : "default"} variant={activo ? "filled" : "outlined"} />
              </div>
            </div>

            <div className="empadd-group">
              <label>Fecha de ingreso</label>
              <input className="empadd-input" type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(toYMD(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Fecha de retiro</label>
              <input className="empadd-input" type="date" value={fechaRetiro} onChange={(e) => setFechaRetiro(toYMD(e.target.value))} />
            </div>

            <div className="empadd-group">
              <label>Fecha ingreso ARL</label>
              <input className="empadd-input" type="date" value={fechaIngresoArl} onChange={(e) => setFechaIngresoArl(toYMD(e.target.value))} />
            </div>

            <div className="empadd-group empadd-span-2">
              <label>Comentarios</label>
              <textarea className="empadd-textarea empadd-upper" value={comentarios} onChange={(e) => setComentarios(uc(e.target.value))} rows={3} />
            </div>
          </div>
        </div>

        <div className="empadd-footer">
          <button type="button" className="menu-btn" onClick={handleSubmit}>
            ➕ AGREGAR
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancelar}>
            ❌ CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}
