'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { agregarEmpleado } from '@/lib/Logic.js';
import { useCiudades, useContractTypes } from '@/lib/Hooks';
import { Switch, Chip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import '@/styles/Empleados/AgregarEmpleados/ModalAgregarEmpleados.css';

export default function ModalAgregarEmpleados({ show, onClose, onCreated }) {
  // básicos
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(''); // entryDate YYYY-MM-DD
  const [phone, setPhone] = useState('');
  const [direccion, setDireccion] = useState('');
  const [comentarios, setComentarios] = useState('');

  // ✅ nuevos
  const [fechaNacimiento, setFechaNacimiento] = useState(''); // birthDate YYYY-MM-DD
  const [contactoEmergencia, setContactoEmergencia] = useState(''); // emergencyContact
  const [eps, setEps] = useState('');
  const [fondoPensiones, setFondoPensiones] = useState(''); // pensionFund
  const [banco, setBanco] = useState(''); // bankName
  const [numeroCuenta, setNumeroCuenta] = useState(''); // bankAccountNumber
  const [fechaRetiro, setFechaRetiro] = useState(''); // exitDate YYYY-MM-DD
  const [fechaIngresoArl, setFechaIngresoArl] = useState(''); // arlEntryDate YYYY-MM-DD

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [selectedTipoId, setSelectedTipoId] = useState('');

  const [activo, setActivo] = useState(true);

  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  const [contractDropdownOpen, setContractDropdownOpen] = useState(false);
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const contractDropdownRef = useRef(null);
  const tipoIdDropdownRef = useRef(null);

  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();
  const { contractTypes, isLoading: contratosLoading, isError: contratosError } = useContractTypes();

  const cargos = useMemo(
    () => [
      'Coordinador',
      'Supervisor',
      'Asistente Administrativo',
      'Secretario/a',
      'Auxiliar',
      'Contador',
      'Recursos Humanos',
      'Atención al Cliente',
      'Operario',
    ],
    []
  );

  const tiposId = useMemo(() => ['CC', 'PPT'], []);

  // helpers
  const uc = (v) => (v ?? '').toString().toUpperCase();
  const toYMD = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    try {
      return new Date(value).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  // cierre por click afuera (solo dropdowns)
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event) => {
      const t = event.target;
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(t)) setCargoDropdownOpen(false);
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(t)) setCiudadDropdownOpen(false);
      if (contractDropdownRef.current && !contractDropdownRef.current.contains(t)) setContractDropdownOpen(false);
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(t)) setTipoIdDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  // escape para cerrar
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  const resetFormulario = () => {
    setNombre('');
    setApellido('');
    setSelectedTipoId('');
    setDocumento('');
    setEmail('');
    setFechaIngreso('');
    setSelectedCargo('');
    setSelectedContractType('');
    setPhone('');
    setDireccion('');
    setComentarios('');
    setSelectedCity('');
    setActivo(true);

    // ✅ nuevos
    setFechaNacimiento('');
    setContactoEmergencia('');
    setEps('');
    setFondoPensiones('');
    setBanco('');
    setNumeroCuenta('');
    setFechaRetiro('');
    setFechaIngresoArl('');

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
    // ✅ nuevos
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
      const ok = window.confirm('¿Deseas cerrar y borrar los cambios?');
      if (!ok) return;
    }
    resetFormulario();
    onClose?.();
  };

  const handleSubmit = async () => {
    const faltantes = [];
    const req = (val) => (typeof val === 'string' ? val.trim() !== '' : !!val);

    // requeridos actuales
    if (!req(selectedTipoId)) faltantes.push('Tipo de ID');
    if (!req(documento)) faltantes.push('Documento');
    if (!req(nombre)) faltantes.push('Nombre');
    if (!req(apellido)) faltantes.push('Apellido');
    if (!req(selectedCity)) faltantes.push('Ciudad');
    if (!req(selectedCargo)) faltantes.push('Cargo');
    if (!req(fechaIngreso)) faltantes.push('Fecha de ingreso');
    if (!req(selectedContractType)) faltantes.push('Tipo de contrato');

    // validaciones básicas
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) faltantes.push('Correo válido');
    if (phone && !/^[0-9+()\-\s]{6,}$/.test(phone.trim())) faltantes.push('Teléfono válido');

    if (faltantes.length) {
      alert('Completa los siguientes campos antes de guardar:\n\n• ' + faltantes.join('\n• '));
      return;
    }

    const nuevoEmpleado = {
      typeId: uc(selectedTipoId).trim(),
      document: uc(documento).trim(),
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      city: (selectedCity || '').trim(),
      position: (selectedCargo || '').trim(),

      entryDate: toYMD(fechaIngreso),
      contractType: (selectedContractType || '').trim(),

      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addressResidence: uc(direccion).trim(),
      comments: uc(comentarios).trim(),
      state: !!activo,

      // ✅ nuevos
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
      alert('Empleado agregado correctamente ✅');

      onCreated?.(nuevoEmpleado);
      resetFormulario();
      onClose?.();
    } catch (error) {
      console.error(error);
      alert('Error al agregar empleado ❌ ' + (error?.message || ''));
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
        {/* Header */}
        <div className="empadd-modal-header">
          <div className="empadd-modal-title">Agregar empleado</div>

          <IconButton
            aria-label="Cerrar"
            onClick={handleCancelar}
            className="empadd-close-btn"
            size="small"
            disableRipple
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Body scroll */}
        <div className="empadd-body">
          <div className="empadd-form-grid">
            <div className="empadd-group">
              <label htmlFor="empadd-nombre">Nombre(s)</label>
              <input
                id="empadd-nombre"
                className="empadd-input empadd-upper"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(uc(e.target.value))}
              />
            </div>

            <div className="empadd-group">
              <label htmlFor="empadd-apellido">Apellido(s)</label>
              <input
                id="empadd-apellido"
                className="empadd-input empadd-upper"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(uc(e.target.value))}
              />
            </div>

            {/* ✅ Fecha nacimiento */}
            <div className="empadd-group">
              <label htmlFor="empadd-nacimiento">Fecha de nacimiento</label>
              <input
                id="empadd-nacimiento"
                className="empadd-input"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(toYMD(e.target.value))}
              />
            </div>

            {/* ✅ Contacto emergencia */}
            <div className="empadd-group">
              <label htmlFor="empadd-emergencia">Contacto emergencia</label>
              <input
                id="empadd-emergencia"
                className="empadd-input empadd-upper"
                type="text"
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
                  className={`empadd-dd-trigger ${ciudadDropdownOpen ? 'empadd-open' : ''}`}
                  onClick={() => setCiudadDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedCity || 'Seleccionar ciudad'}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {ciudadDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedCity('');
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
                          className={`empadd-dd-option ${selectedCity === ciu ? 'empadd-selected' : ''}`}
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
                  className={`empadd-dd-trigger ${cargoDropdownOpen ? 'empadd-open' : ''}`}
                  onClick={() => setCargoDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedCargo || 'Seleccionar cargo'}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {cargoDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedCargo('');
                        setCargoDropdownOpen(false);
                      }}
                    >
                      Limpiar
                    </button>

                    {cargos.map((cargo) => (
                      <button
                        key={cargo}
                        type="button"
                        className={`empadd-dd-option ${selectedCargo === cargo ? 'empadd-selected' : ''}`}
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

            {/* Tipo de contrato */}
            <div className="empadd-group" ref={contractDropdownRef}>
              <label>Tipo de contrato</label>
              <div className="empadd-dd">
                <button
                  type="button"
                  className={`empadd-dd-trigger ${contractDropdownOpen ? 'empadd-open' : ''}`}
                  onClick={() => setContractDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedContractType || 'Seleccionar tipo contrato'}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {contractDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedContractType('');
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
                          className={`empadd-dd-option ${selectedContractType === ct ? 'empadd-selected' : ''}`}
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

            {/* Dirección */}
            <div className="empadd-group empadd-span-2">
              <label htmlFor="empadd-direccion">Dirección</label>
              <input
                id="empadd-direccion"
                className="empadd-input empadd-upper"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(uc(e.target.value))}
              />
            </div>

            {/* ✅ EPS */}
            <div className="empadd-group">
              <label htmlFor="empadd-eps">EPS</label>
              <input
                id="empadd-eps"
                className="empadd-input empadd-upper"
                type="text"
                value={eps}
                onChange={(e) => setEps(uc(e.target.value))}
              />
            </div>

            {/* ✅ Fondo pensiones */}
            <div className="empadd-group">
              <label htmlFor="empadd-pension">Fondo pensiones</label>
              <input
                id="empadd-pension"
                className="empadd-input empadd-upper"
                type="text"
                value={fondoPensiones}
                onChange={(e) => setFondoPensiones(uc(e.target.value))}
              />
            </div>

            {/* ✅ Banco */}
            <div className="empadd-group">
              <label htmlFor="empadd-banco">Banco</label>
              <input
                id="empadd-banco"
                className="empadd-input empadd-upper"
                type="text"
                value={banco}
                onChange={(e) => setBanco(uc(e.target.value))}
              />
            </div>

            {/* ✅ N° cuenta */}
            <div className="empadd-group">
              <label htmlFor="empadd-cuenta">N° Cuenta bancaria</label>
              <input
                id="empadd-cuenta"
                className="empadd-input empadd-upper"
                type="text"
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(uc(e.target.value))}
              />
            </div>

            {/* Tipo ID */}
            <div className="empadd-group" ref={tipoIdDropdownRef}>
              <label>Tipo ID</label>
              <div className="empadd-dd">
                <button
                  type="button"
                  className={`empadd-dd-trigger ${tipoIdDropdownOpen ? 'empadd-open' : ''}`}
                  onClick={() => setTipoIdDropdownOpen((o) => !o)}
                >
                  <span className="empadd-dd-value">{selectedTipoId || 'Selecc. Tipo ID'}</span>
                  <span className="empadd-dd-arrow">▼</span>
                </button>

                {tipoIdDropdownOpen && (
                  <div className="empadd-dd-content">
                    <button
                      type="button"
                      className="empadd-dd-option empadd-dd-clear"
                      onClick={() => {
                        setSelectedTipoId('');
                        setTipoIdDropdownOpen(false);
                      }}
                    >
                      Limpiar
                    </button>

                    {tiposId.map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        className={`empadd-dd-option ${selectedTipoId === tipo ? 'empadd-selected' : ''}`}
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

            {/* Documento */}
            <div className="empadd-group">
              <label htmlFor="empadd-documento">N° Documento</label>
              <input
                id="empadd-documento"
                className="empadd-input empadd-upper"
                type="text"
                value={documento}
                onChange={(e) => setDocumento(uc(e.target.value))}
              />
            </div>

            {/* Email */}
            <div className="empadd-group">
              <label htmlFor="empadd-email">Correo electrónico</label>
              <input
                id="empadd-email"
                className="empadd-input empadd-upper"
                type="email"
                value={email}
                onChange={(e) => setEmail(uc(e.target.value))}
              />
            </div>

            {/* Teléfono */}
            <div className="empadd-group">
              <label htmlFor="empadd-phone">N° Celular - Teléfono</label>
              <input
                id="empadd-phone"
                className="empadd-input empadd-upper"
                type="text"
                value={phone}
                onChange={(e) => setPhone(uc(e.target.value))}
              />
            </div>

            {/* Estado */}
            <div className="empadd-group empadd-state-row">
              <label>Estado</label>
              <div className="empadd-state-inline">
                <Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />
                <Chip
                  size="small"
                  label={activo ? 'ACTIVO' : 'INACTIVO'}
                  color={activo ? 'success' : 'default'}
                  variant={activo ? 'filled' : 'outlined'}
                />
              </div>
            </div>

            {/* Fecha ingreso */}
            <div className="empadd-group">
              <label htmlFor="empadd-fecha">Fecha de ingreso</label>
              <input
                id="empadd-fecha"
                className="empadd-input"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(toYMD(e.target.value))}
              />
            </div>

            {/* ✅ Fecha retiro */}
            <div className="empadd-group">
              <label htmlFor="empadd-fechaRetiro">Fecha de retiro</label>
              <input
                id="empadd-fechaRetiro"
                className="empadd-input"
                type="date"
                value={fechaRetiro}
                onChange={(e) => setFechaRetiro(toYMD(e.target.value))}
              />
            </div>

            {/* ✅ Fecha ingreso ARL */}
            <div className="empadd-group">
              <label htmlFor="empadd-fechaArl">Fecha ingreso ARL</label>
              <input
                id="empadd-fechaArl"
                className="empadd-input"
                type="date"
                value={fechaIngresoArl}
                onChange={(e) => setFechaIngresoArl(toYMD(e.target.value))}
              />
            </div>

            {/* Comentarios */}
            <div className="empadd-group empadd-span-2">
              <label htmlFor="empadd-comentarios">Comentarios</label>
              <textarea
                id="empadd-comentarios"
                className="empadd-textarea empadd-upper"
                value={comentarios}
                onChange={(e) => setComentarios(uc(e.target.value))}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
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
