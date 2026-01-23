'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ModalEditarDirecciones from './ModalEditarDirecciones.jsx';
import { agregarCliente } from '@/lib/Logic.js';
import { Switch, Chip, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import '@/styles/Clientes/AgregarClientes/ModalAgregarClientes.css';

const uc = (v) => (v ?? '').toString().toUpperCase();

export default function ModalAgregarClientes({ show, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [comentarios, setComentarios] = useState('');

  const [activo, setActivo] = useState(true);

  const [direcciones, setDirecciones] = useState([]);
  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);

  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);
  const tipoIdDropdownRef = useRef(null);

  const TIPO_ID = useMemo(() => ['CC', 'TI', 'NIT', 'CE', 'PT', 'PA'], []);

  // Click afuera => cerrar dropdown
  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (event) => {
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) {
        setTipoIdDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  // Escape => cerrar modal
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show, saving, onClose]);

  const manejarGuardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones || []);
  };

  const resetFormulario = () => {
    setNombre('');
    setApellido('');
    setDocumento('');
    setEmail('');
    setPhone('');
    setTipoDocumento('');
    setComentarios('');
    setDirecciones([]);
    setActivo(true);
    setTipoIdDropdownOpen(false);
  };

  const hayCambios =
    nombre || apellido || documento || email || phone || tipoDocumento || comentarios || (direcciones?.length || 0) > 0;

  const handleCancelar = () => {
    if (saving) return;

    if (hayCambios) {
      const ok = window.confirm('¿Deseas cerrar y borrar los cambios?');
      if (!ok) return;
    }
    resetFormulario();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (saving) return;

    const faltantes = [];
    const req = (val) => (typeof val === 'string' ? val.trim() !== '' : !!val);

    if (!req(tipoDocumento)) faltantes.push('Tipo de ID');
    if (!req(documento)) faltantes.push('Documento');
    if (!req(nombre)) faltantes.push('Nombre');
    if (!req(email)) faltantes.push('Correo electrónico');

    const tieneDireccionValida =
      Array.isArray(direcciones) &&
      direcciones.length > 0 &&
      direcciones.some((d) => (d?.address || '').toString().trim() !== '');
    if (!tieneDireccionValida) faltantes.push('Direcciones (al menos una)');

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) faltantes.push('Correo válido');
    if (phone && !/^[0-9+()\-\s]{6,}$/.test(phone.trim())) faltantes.push('Teléfono válido');

    if (faltantes.length) {
      alert('Completa los siguientes campos antes de guardar:\n\n• ' + faltantes.join('\n• '));
      return;
    }

    const addressesNorm = (direcciones || []).map((d) => ({
      ...d,
      address: uc(d?.address || '').trim(),
      city: uc(d?.city || '').trim(),
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
      setSaving(true);
      await agregarCliente(nuevoCliente);
      alert('Cliente agregado correctamente ✅');

      onCreated?.(nuevoCliente);
      resetFormulario();
      onClose?.();
    } catch (error) {
      console.error(error);
      alert('Error al agregar cliente ❌ ' + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="cliadd-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleCancelar();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="cliadd-modal-container" aria-busy={saving}>
        {/* Header */}
        <div className="cliadd-modal-header">
          <div className="cliadd-modal-title">
            <div className="cliadd-title">Agregar cliente</div>
            <div className="cliadd-subtitle">Completa los datos y agrega direcciones</div>
          </div>

          <Tooltip title="Cerrar">
            <button
              type="button"
              className="cliadd-close-btn"
              onClick={handleCancelar}
              aria-label="Cerrar"
              disabled={saving}
            >
              <CloseIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>

        {/* Body */}
        <div className="cliadd-body">
          <div className="cliadd-form-grid">
            <div className="cliadd-group">
              <label>Nombre(s)</label>
              <input
                className="cliadd-input cliadd-upper"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="cliadd-group">
              <label>Apellido(s)</label>
              <input
                className="cliadd-input cliadd-upper"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            {/* Tipo ID */}
            <div className="cliadd-group" ref={tipoIdDropdownRef}>
              <label>Tipo ID</label>
              <div className="cliadd-dd">
                <button
                  type="button"
                  className={`cliadd-dd-trigger ${tipoIdDropdownOpen ? 'cliadd-open' : ''}`}
                  onClick={() => !saving && setTipoIdDropdownOpen((o) => !o)}
                  disabled={saving}
                >
                  <span className="cliadd-dd-value">{tipoDocumento || 'Selecc. Tipo ID'}</span>
                  <span className="cliadd-dd-arrow">▼</span>
                </button>

                {tipoIdDropdownOpen && (
                  <div className="cliadd-dd-content">
                    <button
                      type="button"
                      className="cliadd-dd-option cliadd-dd-clear"
                      onClick={() => {
                        setTipoDocumento('');
                        setTipoIdDropdownOpen(false);
                      }}
                      disabled={saving}
                    >
                      Limpiar
                    </button>

                    {TIPO_ID.map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        className={`cliadd-dd-option ${tipoDocumento === tipo ? 'cliadd-selected' : ''}`}
                        onClick={() => {
                          setTipoDocumento(tipo);
                          setTipoIdDropdownOpen(false);
                        }}
                        disabled={saving}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="cliadd-group">
              <label>N° Documento</label>
              <input
                className="cliadd-input cliadd-upper"
                type="text"
                value={documento}
                onChange={(e) => setDocumento(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="cliadd-group">
              <label>Correo electrónico</label>
              <input
                className="cliadd-input cliadd-upper"
                type="email"
                value={email}
                onChange={(e) => setEmail(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="cliadd-group">
              <label>N° Celular - Teléfono</label>
              <input
                className="cliadd-input cliadd-upper"
                type="text"
                value={phone}
                onChange={(e) => setPhone(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            {/* Direcciones */}
            <div className="cliadd-group cliadd-span-2">
              <button
                type="button"
                className="menu-btn"
                onClick={() => setMostrarModalDirecciones(true)}
                disabled={saving}
              >
                📍 Editar Direcciones ({direcciones.length})
              </button>
            </div>

            {/* Estado */}
            <div className="cliadd-group">
              <label>Estado</label>
              <div className="cliadd-state-inline">
                <Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} disabled={saving} />
                <Chip
                  size="small"
                  label={activo ? 'ACTIVO' : 'INACTIVO'}
                  color={activo ? 'success' : 'default'}
                  variant={activo ? 'filled' : 'outlined'}
                />
              </div>
            </div>

            {/* Comentarios */}
            <div className="cliadd-group cliadd-span-2">
              <label>Comentarios</label>
              <textarea
                className="cliadd-textarea cliadd-upper"
                value={comentarios}
                onChange={(e) => setComentarios(uc(e.target.value))}
                rows={3}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cliadd-footer">
          <button type="button" className="menu-btn" onClick={handleSubmit} disabled={saving}>
            ➕ {saving ? 'AGREGANDO…' : 'AGREGAR'}
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancelar} disabled={saving}>
            ❌ CANCELAR
          </button>
        </div>

        {mostrarModalDirecciones && (
          <ModalEditarDirecciones
            cliente={{ addresses: direcciones }}
            onClose={() => setMostrarModalDirecciones(false)}
            onGuardar={manejarGuardarDirecciones}
          />
        )}
      </div>
    </div>
  );
}
