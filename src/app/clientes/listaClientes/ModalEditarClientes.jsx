'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ModalEditarDirecciones from './ModalEditarDirecciones.jsx';
import { actualizarCliente } from '@/lib/Logic.js';
import { Switch, Chip, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import '@/styles/Clientes/EditarClientes/ModalEditarClientes.css';

const uc = (v) => (v ?? '').toString().toUpperCase();

const boolish = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  const s = (v ?? '').toString().trim().toLowerCase();
  if (['true', '1', 'si', 'sí', 'yes', 'y', 'activo', 'active'].includes(s)) return true;
  if (['false', '0', 'no', 'n', 'inactivo', 'inactive'].includes(s)) return false;
  return false;
};

export default function ModalEditarClientes({ show, onClose, cliente, onUpdated }) {
  const [saving, setSaving] = useState(false);

  const originalDocRef = useRef('');
  const initKeyRef = useRef(null);

  const [typeId, setTypeId] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [activo, setActivo] = useState(true);

  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);

  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);
  const tipoIdDropdownRef = useRef(null);

  const TIPO_ID = useMemo(() => ['CC', 'TI', 'NIT', 'CE', 'PT', 'PA'], []);

  useEffect(() => {
    if (!show) {
      initKeyRef.current = null;
      return;
    }
    if (!cliente) return;

    const key = `${cliente.typeId ?? ''}|${cliente.document ?? ''}`;
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;

    originalDocRef.current = cliente.document ?? '';

    setTypeId(uc(cliente.typeId || ''));
    setNombre(uc(cliente.name || ''));
    setApellido(uc(cliente.surname || ''));
    setDocumento(uc(cliente.document || ''));
    setEmail(uc(cliente.email || ''));
    setPhone(uc(cliente.phone || ''));
    setComentarios(uc(cliente.comments || ''));
    setDirecciones(cliente.addresses || []);
    setActivo(boolish(cliente.state));
  }, [show, cliente]);

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

  const validate = () => {
    const faltantes = [];
    const req = (val) => (typeof val === 'string' ? val.trim() !== '' : !!val);

    if (!req(typeId)) faltantes.push('Tipo de ID');
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

    return faltantes;
  };

  const guardarCambios = async () => {
    if (!cliente || saving) return;

    const faltantes = validate();
    if (faltantes.length) {
      alert('Completa los siguientes campos antes de guardar:\n\n• ' + faltantes.join('\n• '));
      return;
    }

    const addressesNorm = (direcciones || []).map((d) => ({
      ...d,
      address: uc(d?.address || '').trim(),
      city: uc(d?.city || '').trim(),
    }));

    const payload = {
      typeId: uc(typeId).trim(),
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      addresses: addressesNorm,
      document: uc(documento).trim(),
      comments: uc(comentarios).trim(),
      state: !!activo,
    };

    const docOriginal = originalDocRef.current || cliente.document || documento;

    try {
      setSaving(true);
      await actualizarCliente(docOriginal, payload);
      alert('Cliente actualizado correctamente ✅');
      onUpdated?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      alert('Error al actualizar cliente ❌ ' + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const nombreHeader = cliente?.name ? `${cliente.name} ${cliente.surname ?? ''}`.trim() : '—';

  return (
    <div
      className="cliedit-modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose?.()}
      role="dialog"
      aria-modal="true"
    >
      <div className="cliedit-modal-container" aria-busy={saving}>
        {/* Header */}
        <div className="cliedit-modal-header">
          <div className="cliedit-modal-title">
            <div className="cliedit-title">Editar cliente</div>
            <div className="cliedit-subtitle">
              {nombreHeader}
              {cliente?.document ? ` — ${cliente.document}` : ''}
            </div>
          </div>

          <Tooltip title="Cerrar">
            <button
              type="button"
              className="cliedit-close-btn"
              onClick={() => !saving && onClose?.()}
              aria-label="Cerrar"
              disabled={saving}
            >
              <CloseIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>

        {/* Body */}
        <div className="cliedit-body">
          <div className="cliedit-form-grid">
            <div className="cliedit-group">
              <label>Nombre(s)</label>
              <input
                className="cliedit-input cliedit-upper"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="cliedit-group">
              <label>Apellido(s)</label>
              <input
                className="cliedit-input cliedit-upper"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            {/* Tipo ID */}
            <div className="cliedit-group" ref={tipoIdDropdownRef}>
              <label>Tipo ID</label>
              <div className="cliedit-dd">
                <button
                  type="button"
                  className={`cliedit-dd-trigger ${tipoIdDropdownOpen ? 'cliedit-open' : ''}`}
                  onClick={() => !saving && setTipoIdDropdownOpen((o) => !o)}
                  disabled={saving}
                >
                  <span className="cliedit-dd-value">{typeId || 'Seleccionar Tipo ID'}</span>
                  <span className="cliedit-dd-arrow">▼</span>
                </button>

                {tipoIdDropdownOpen && (
                  <div className="cliedit-dd-content">
                    <button
                      type="button"
                      className="cliedit-dd-option cliedit-dd-clear"
                      onClick={() => {
                        setTypeId('');
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
                        className={`cliedit-dd-option ${typeId === tipo ? 'cliedit-selected' : ''}`}
                        onClick={() => {
                          setTypeId(tipo);
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

            <div className="cliedit-group">
              <label>N° Documento</label>
              <input
                className="cliedit-input cliedit-upper"
                type="text"
                value={documento}
                onChange={(e) => setDocumento(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="cliedit-group">
              <label>Correo electrónico</label>
              <input
                className="cliedit-input cliedit-upper"
                type="email"
                value={email}
                onChange={(e) => setEmail(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            <div className="cliedit-group">
              <label>N° Celular - Teléfono</label>
              <input
                className="cliedit-input cliedit-upper"
                type="text"
                value={phone}
                onChange={(e) => setPhone(uc(e.target.value))}
                disabled={saving}
              />
            </div>

            {/* Direcciones */}
            <div className="cliedit-group cliedit-span-2">
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
            <div className="cliedit-group">
              <label>Estado</label>
              <div className="cliedit-state-inline">
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
            <div className="cliedit-group cliedit-span-2">
              <label>Comentarios</label>
              <textarea
                className="cliedit-textarea cliedit-upper"
                value={comentarios}
                onChange={(e) => setComentarios(uc(e.target.value))}
                rows={3}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cliedit-footer">
          <button type="button" className="cancel-btn" onClick={() => !saving && onClose?.()} disabled={saving}>
            ❌ CANCELAR
          </button>
          <button type="button" className="menu-btn" onClick={guardarCambios} disabled={saving}>
            💾 {saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}
          </button>
        </div>

        {mostrarModalDirecciones && (
          <ModalEditarDirecciones
            cliente={{ ...(cliente || {}), addresses: direcciones }}
            onClose={() => setMostrarModalDirecciones(false)}
            onGuardar={manejarGuardarDirecciones}
          />
        )}
      </div>
    </div>
  );
}
