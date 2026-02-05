"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { actualizarEmpleado } from "@/lib/Logic.js";
import { useContractTypes } from "@/lib/Hooks";

import { Switch, Chip } from "@mui/material";

import "@/styles/Empleados/EditarEmpleados/EditarEmpleadosResumen.css";

const uc = (v) => (v ?? "").toString().toUpperCase();
const norm = (v) => (v ?? "").toString().trim();

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

// ✅ Enum Bank (backend)
const BANK_OPTIONS = ["DP", "CA", "OTRO"];

const toYMD = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const pickCityNameFromEmployee = (e) => norm(e?.city ?? e?.cityName ?? e?.city?.name);

const toIntOrNull = (v) => {
  const n = Number.parseInt((v ?? "").toString().trim(), 10);
  return Number.isFinite(n) ? n : null;
};

const calcAgeFromBirthYMD = (ymd) => {
  const s = toYMD(ymd);
  if (!s) return "";
  const parts = s.split("-");
  if (parts.length !== 3) return "";

  const y = Number.parseInt(parts[0], 10);
  const m = Number.parseInt(parts[1], 10);
  const d = Number.parseInt(parts[2], 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return "";

  const today = new Date();
  let age = today.getFullYear() - y;
  const mm = today.getMonth() + 1;
  const dd = today.getDate();

  if (mm < m || (mm === m && dd < d)) age -= 1;
  if (age < 0 || age > 120) return "";

  return String(age);
};

export default function EditarEmpleadosResumen({
  empleado,
  onUpdated,
  onClose,
  backHref = "/empleados/",
  ciudades = [],
  ciudadesLoading = false,
  ciudadesError = false,
}) {
  const { contractTypes, isLoading: contratosLoading, isError: contratosError } = useContractTypes();
  const [saving, setSaving] = useState(false);

  const originalDocRef = useRef("");
  const initKeyRef = useRef(null);

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

  // ✅ CAMPOS FALTANTES DEL DTO
  const [edad, setEdad] = useState("");
  const ageTouchedRef = useRef(false);

  const [tallaPantalon, setTallaPantalon] = useState("");
  const [tallaCamisa, setTallaCamisa] = useState("");
  const [tallaZapato, setTallaZapato] = useState("");

  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedContractType, setSelectedContractType] = useState("");
  const [selectedTipoId, setSelectedTipoId] = useState("");

  const [activo, setActivo] = useState(true);

  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [contractDropdownOpen, setContractDropdownOpen] = useState(false);
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  // ✅ dropdown banco
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const contractDropdownRef = useRef(null);
  const tipoIdDropdownRef = useRef(null);
  const bankDropdownRef = useRef(null);

  const inputUpper = useMemo(() => ({ textTransform: "uppercase" }), []);

  const resetForm = () => {
    originalDocRef.current = "";
    initKeyRef.current = null;
    ageTouchedRef.current = false;

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

    setEdad("");
    setTallaPantalon("");
    setTallaCamisa("");
    setTallaZapato("");

    setSelectedCargo("");
    setSelectedCity("");
    setSelectedContractType("");
    setSelectedTipoId("");

    setActivo(true);

    setCiudadDropdownOpen(false);
    setCargoDropdownOpen(false);
    setContractDropdownOpen(false);
    setTipoIdDropdownOpen(false);
    setBankDropdownOpen(false);
  };

  useEffect(() => {
    if (!empleado) {
      resetForm();
      return;
    }

    const key = `${empleado.typeId ?? ""}|${empleado.document ?? ""}`;
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;

    originalDocRef.current = empleado.document ?? "";
    ageTouchedRef.current = false;

    setNombre(uc(empleado.name));
    setApellido(uc(empleado.surname));
    setDocumento(uc(empleado.document));
    setEmail(uc(empleado.email));
    setPhone(uc(empleado.phone));
    setDireccion(uc(empleado.addressResidence));
    setComentarios(uc(empleado.comments));

    setSelectedCity(pickCityNameFromEmployee(empleado));
    setSelectedCargo(empleado.position || "");
    setSelectedContractType(empleado.contractType || "");
    setSelectedTipoId(uc(empleado.typeId));

    setActivo(boolish(empleado.state));
    setFechaIngreso(toYMD(empleado.entryDate));

    setFechaNacimiento(toYMD(empleado.birthDate));
    setContactoEmergencia(uc(empleado.emergencyContact));
    setEps(uc(empleado.eps));
    setFondoPensiones(uc(empleado.pensionFund));

    // ✅ banco: asegurar enum válido
    const bankFromApi = uc(empleado.bankName);
    setBanco(BANK_OPTIONS.includes(bankFromApi) ? bankFromApi : "");

    setNumeroCuenta(uc(empleado.bankAccountNumber));
    setFechaRetiro(toYMD(empleado.exitDate));
    setFechaIngresoArl(toYMD(empleado.arlEntryDate));

    const ageFromDto = empleado?.age ?? "";
    const computedAge = calcAgeFromBirthYMD(empleado?.birthDate);
    setEdad(ageFromDto !== "" && ageFromDto !== null && ageFromDto !== undefined ? String(ageFromDto) : computedAge);

    setTallaPantalon(uc(empleado?.pantSize));
    setTallaCamisa(uc(empleado?.shirtSize));
    setTallaZapato(uc(empleado?.shoeSize));
  }, [empleado]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) setCargoDropdownOpen(false);
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) setCiudadDropdownOpen(false);
      if (contractDropdownRef.current && !contractDropdownRef.current.contains(event.target)) setContractDropdownOpen(false);
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) setTipoIdDropdownOpen(false);
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) setBankDropdownOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (!saving) {
          setCiudadDropdownOpen(false);
          setCargoDropdownOpen(false);
          setContractDropdownOpen(false);
          setTipoIdDropdownOpen(false);
          setBankDropdownOpen(false);
          onClose?.();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [saving, onClose]);

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

    if (edad && !Number.isFinite(Number.parseInt(edad, 10))) faltantes.push("Edad válida");

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
      city: (selectedCity || "").trim(),
      position: norm(selectedCargo),
      entryDate: toYMD(fechaIngreso),
      contractType: norm(selectedContractType),
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addressResidence: uc(direccion).trim(),
      comments: uc(comentarios).trim(),
      state: activo,
      birthDate: toYMD(fechaNacimiento),

      age: toIntOrNull(edad),
      pantSize: uc(tallaPantalon).trim(),
      shirtSize: uc(tallaCamisa).trim(),
      shoeSize: uc(tallaZapato).trim(),

      emergencyContact: uc(contactoEmergencia).trim(),
      eps: uc(eps).trim(),
      pensionFund: uc(fondoPensiones).trim(),

      // ✅ No enviar "" para enum
      bankName: banco ? banco : null,
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
    } catch (error) {
      console.error(error);
      alert("Error al actualizar empleado ❌ " + (error?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const nombreHeader = empleado?.name ? `${empleado.name} ${empleado.surname ?? ""}`.trim() : "—";

  return (
    <div className="eer-layout">
      <div className="eer-container">
        <div className="eer-toolbar">
          <div className="eer-toolbar-row">
            <Link
              href={backHref}
              className="eer-btn-53"
              aria-disabled={saving ? "true" : "false"}
              onClick={(e) => {
                if (saving) e.preventDefault();
              }}
            >
              <div className="original">⬅ REGRESAR</div>
              <div className="letters">
                <span>M</span>
                <span>E</span>
                <span>N</span>
                <span>Ú</span>
              </div>
            </Link>

            <div className="eer-header">
              <div className="eer-title">Editar empleado</div>
              <div className="eer-subtitle">
                {nombreHeader}
                {empleado?.document ? ` — ${empleado.document}` : ""}
              </div>
            </div>

            <div className="eer-close-slot" />
          </div>
        </div>

        <div className="eer-body" aria-busy={saving}>
          <div className="eer-grid">
            <div className="eer-group">
              <label>Nombre(s)</label>
              <input className="eer-input eer-upper" value={nombre} onChange={(e) => setNombre(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Apellido(s)</label>
              <input className="eer-input eer-upper" value={apellido} onChange={(e) => setApellido(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Fecha de nacimiento</label>
              <input
                className="eer-input"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => {
                  const v = toYMD(e.target.value);
                  setFechaNacimiento(v);
                  if (!ageTouchedRef.current) setEdad(calcAgeFromBirthYMD(v));
                }}
                disabled={saving}
              />
            </div>

            <div className="eer-group">
              <label>Edad</label>
              <input
                className="eer-input"
                type="number"
                value={edad}
                onChange={(e) => {
                  ageTouchedRef.current = true;
                  setEdad(e.target.value);
                }}
                disabled={saving}
                min={0}
                max={120}
              />
            </div>

            <div className="eer-group">
              <label>Contacto emergencia</label>
              <input className="eer-input eer-upper" value={contactoEmergencia} onChange={(e) => setContactoEmergencia(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>EPS</label>
              <input className="eer-input eer-upper" value={eps} onChange={(e) => setEps(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Fondo pensiones</label>
              <input className="eer-input eer-upper" value={fondoPensiones} onChange={(e) => setFondoPensiones(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            {/* ✅ BANCO dropdown (misma estructura/clases de tus dropdowns) */}
            <div className="eer-group eer-dd" ref={bankDropdownRef}>
              <label>Banco</label>

              <button
                type="button"
                className={`eer-dd-trigger ${bankDropdownOpen ? "eer-open" : ""}`}
                onClick={() => !saving && setBankDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="eer-dd-value">{banco || "Seleccionar banco"}</span>
                <span className="eer-dd-arrow">▼</span>
              </button>

              {bankDropdownOpen && (
                <div className="eer-dd-content">
                  <button
                    type="button"
                    className={`eer-dd-option ${banco === "" ? "eer-selected" : ""}`}
                    onClick={() => {
                      setBanco("");
                      setBankDropdownOpen(false);
                    }}
                    disabled={saving}
                  >
                    Limpiar
                  </button>

                  {BANK_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`eer-dd-option ${banco === b ? "eer-selected" : ""}`}
                      onClick={() => {
                        setBanco(b);
                        setBankDropdownOpen(false);
                      }}
                      disabled={saving}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="eer-group">
              <label>N° Cuenta bancaria</label>
              <input className="eer-input eer-upper" value={numeroCuenta} onChange={(e) => setNumeroCuenta(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Talla pantalón</label>
              <input className="eer-input eer-upper" value={tallaPantalon} onChange={(e) => setTallaPantalon(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Talla camisa</label>
              <input className="eer-input eer-upper" value={tallaCamisa} onChange={(e) => setTallaCamisa(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Talla calzado</label>
              <input className="eer-input eer-upper" value={tallaZapato} onChange={(e) => setTallaZapato(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group eer-dd" ref={ciudadDropdownRef}>
              <label>Ciudad</label>
              <button
                type="button"
                className={`eer-dd-trigger ${ciudadDropdownOpen ? "eer-open" : ""}`}
                onClick={() => !saving && setCiudadDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="eer-dd-value">{selectedCity || (ciudadesLoading ? "Cargando ciudades…" : "Seleccionar ciudad")}</span>
                <span className="eer-dd-arrow">▼</span>
              </button>

              {ciudadDropdownOpen && (
                <div className="eer-dd-content">
                  {ciudadesLoading && <div className="eer-dd-loading">Cargando ciudades...</div>}
                  {ciudadesError && <div className="eer-dd-loading">Error al cargar ciudades</div>}

                  {!ciudadesLoading &&
                    !ciudadesError &&
                    (ciudades || []).map((ciu) => (
                      <button
                        key={ciu}
                        type="button"
                        className={`eer-dd-option ${selectedCity === ciu ? "eer-selected" : ""}`}
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

            <div className="eer-group eer-dd" ref={cargoDropdownRef}>
              <label>Cargo</label>
              <button
                type="button"
                className={`eer-dd-trigger ${cargoDropdownOpen ? "eer-open" : ""}`}
                onClick={() => !saving && setCargoDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="eer-dd-value">{selectedCargo || "Seleccionar cargo"}</span>
                <span className="eer-dd-arrow">▼</span>
              </button>

              {cargoDropdownOpen && (
                <div className="eer-dd-content">
                  {CARGOS.map((cargo) => (
                    <button
                      key={cargo}
                      type="button"
                      className={`eer-dd-option ${selectedCargo === cargo ? "eer-selected" : ""}`}
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

            <div className="eer-group eer-dd" ref={contractDropdownRef}>
              <label>Tipo de contrato</label>
              <button
                type="button"
                className={`eer-dd-trigger ${contractDropdownOpen ? "eer-open" : ""}`}
                onClick={() => !saving && setContractDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="eer-dd-value">{selectedContractType || (contratosLoading ? "Cargando tipos…" : "Seleccionar tipo")}</span>
                <span className="eer-dd-arrow">▼</span>
              </button>

              {contractDropdownOpen && (
                <div className="eer-dd-content">
                  {contratosLoading && <div className="eer-dd-loading">Cargando tipos...</div>}
                  {contratosError && <div className="eer-dd-loading">Error al cargar tipos</div>}

                  {!contratosLoading &&
                    !contratosError &&
                    (contractTypes || []).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        className={`eer-dd-option ${(selectedContractType || "").toLowerCase() === ct.toLowerCase() ? "eer-selected" : ""}`}
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

            <div className="eer-group eer-dd" ref={tipoIdDropdownRef}>
              <label>Tipo ID</label>
              <button
                type="button"
                className={`eer-dd-trigger ${tipoIdDropdownOpen ? "eer-open" : ""}`}
                onClick={() => !saving && setTipoIdDropdownOpen((o) => !o)}
                disabled={saving}
              >
                <span className="eer-dd-value">{selectedTipoId || "Selecc. Tipo ID"}</span>
                <span className="eer-dd-arrow">▼</span>
              </button>

              {tipoIdDropdownOpen && (
                <div className="eer-dd-content">
                  {TIPO_ID_OPTIONS.map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      className={`eer-dd-option ${(selectedTipoId || "").toUpperCase() === tipo ? "eer-selected" : ""}`}
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

            <div className="eer-group">
              <label>N° Documento</label>
              <input className="eer-input eer-upper" value={documento} onChange={(e) => setDocumento(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Correo electrónico</label>
              <input className="eer-input eer-upper" type="email" value={email} onChange={(e) => setEmail(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>N° Celular - Teléfono</label>
              <input className="eer-input eer-upper" value={phone} onChange={(e) => setPhone(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group">
              <label>Dirección</label>
              <input className="eer-input eer-upper" value={direccion} onChange={(e) => setDireccion(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>

            <div className="eer-group eer-state-row eer-span-2">
              <label>Estado</label>
              <div
                className="eer-state-inline"
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
                <Chip size="small" label={activo ? "ACTIVO" : "INACTIVO"} color={activo ? "success" : "default"} variant={activo ? "filled" : "outlined"} />
              </div>
            </div>

            <div className="eer-group">
              <label>Fecha de ingreso</label>
              <input className="eer-input" type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(toYMD(e.target.value))} disabled={saving} />
            </div>

            <div className="eer-group">
              <label>Fecha de retiro</label>
              <input className="eer-input" type="date" value={fechaRetiro} onChange={(e) => setFechaRetiro(toYMD(e.target.value))} disabled={saving} />
            </div>

            <div className="eer-group">
              <label>Fecha ingreso ARL</label>
              <input className="eer-input" type="date" value={fechaIngresoArl} onChange={(e) => setFechaIngresoArl(toYMD(e.target.value))} disabled={saving} />
            </div>

            <div className="eer-group eer-span-2">
              <label>Comentarios</label>
              <textarea className="eer-textarea eer-upper" value={comentarios} onChange={(e) => setComentarios(uc(e.target.value))} disabled={saving} style={inputUpper} />
            </div>
          </div>
        </div>

        <div className="eer-footer">
          <button type="button" className="menu-btn" onClick={guardarCambios} disabled={saving}>
            💾 {saving ? "GUARDANDO…" : "GUARDAR CAMBIOS"}
          </button>

          {onClose ? (
            <button type="button" className="cancel-btn" onClick={() => !saving && onClose?.()} disabled={saving}>
              ❌ CANCELAR
            </button>
          ) : (
            <Link
              href={backHref}
              className="cancel-btn"
              aria-disabled={saving ? "true" : "false"}
              onClick={(e) => {
                if (saving) e.preventDefault();
              }}
            >
              ❌ CANCELAR
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}