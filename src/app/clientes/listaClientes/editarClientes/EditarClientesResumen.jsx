"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Switch, Chip } from "@mui/material";

import { actualizarCliente } from "@/lib/Logic.js"; // ajusta si difiere
import ModalEditarDirecciones from "../ModalEditarDirecciones.jsx"; // ajusta ruta

import "@/styles/Clientes/EditarClientes/EditarClientesResumen.css";

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

const TIPO_ID_OPTIONS = ["NIT", "CC", "TI", "CE", "PPT", "PA"];

export default function EditarClientesResumen({ cliente, onUpdated, onClose, backHref = "/clientes/" }) {
  const [saving, setSaving] = useState(false);

  const originalDocRef = useRef("");
  const initKeyRef = useRef(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("NIT");
  const [comentarios, setComentarios] = useState("");
  const [activo, setActivo] = useState(true);

  const [direcciones, setDirecciones] = useState([]);
  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);

  // ✅ Dropdown pill (mismo patrón del cliedit)
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);
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
    setTipoDocumento("NIT");
    setComentarios("");
    setActivo(true);

    setDirecciones([]);
    setMostrarModalDirecciones(false);
    setTipoIdDropdownOpen(false);
  };

  useEffect(() => {
    if (!cliente) {
      resetForm();
      return;
    }

    const key = `${cliente.typeId ?? ""}|${cliente.document ?? ""}`;
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;

    originalDocRef.current = cliente.document ?? "";

    setNombre(uc(cliente.name));
    setApellido(uc(cliente.surname));
    setDocumento(uc(cliente.document));
    setEmail(uc(cliente.email));
    setPhone(uc(cliente.phone));
    setTipoDocumento(norm(cliente.typeId) || "NIT");
    setComentarios(uc(cliente.comments));
    setActivo(boolish(cliente.state));

    setDirecciones(Array.isArray(cliente.addresses) ? cliente.addresses : []);
  }, [cliente]);

  // ✅ Cerrar dropdown al hacer click afuera + Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) {
        setTipoIdDropdownOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape" && !saving) {
        setTipoIdDropdownOpen(false);
        onClose?.();
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

    if (!req(tipoDocumento)) faltantes.push("Tipo de ID");
    if (!req(documento)) faltantes.push("Documento");
    if (!req(nombre)) faltantes.push("Nombre");

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) faltantes.push("Correo válido");
    if (phone && !/^[0-9+()\-\s]{6,}$/.test(phone.trim())) faltantes.push("Teléfono válido");

    return faltantes;
  };

  const normalizarDireccionesParaApi = (arr) => {
    const list = Array.isArray(arr) ? arr : [];
    return list
      .filter((d) => (d?.address ?? "").toString().trim() !== "")
      .map((d) => {
        const normalized = {
          ...d,
          address: uc(d?.address || "").trim(),
          description: uc(d?.description || "").trim(),
          city: (d?.city ?? "").toString().trim(),
        };

        if (typeof normalized.id === "string" && normalized.id.startsWith("temp")) {
          const { id, ...rest } = normalized;
          return rest;
        }
        return normalized;
      });
  };

  const guardarCambios = async () => {
    if (!cliente) return;

    const faltantes = validate();
    if (faltantes.length) {
      alert("Completa los siguientes campos antes de guardar:\n\n• " + faltantes.join("\n• "));
      return;
    }

    const payload = {
      name: uc(nombre).trim(),
      surname: uc(apellido).trim(),
      document: uc(documento).trim(),
      email: uc(email).trim(),
      phone: uc(phone).trim(),
      typeId: uc(tipoDocumento).trim(),
      comments: uc(comentarios).trim(),
      state: !!activo,
      addresses: normalizarDireccionesParaApi(direcciones),
    };

    const docOriginal = originalDocRef.current || cliente.document || documento;

    try {
      setSaving(true);
      await actualizarCliente(docOriginal, payload);
      alert("Cliente actualizado correctamente ✅");
      onUpdated?.();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar cliente ❌ " + (error?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const nombreHeader = cliente?.name ? `${cliente.name} ${cliente.surname ?? ""}`.trim() : "—";

  return (
    <div className="cer-layout">
      <div className="cer-container">
        {/* Toolbar */}
        <div className="cer-toolbar">
          <div className="cer-toolbar-row">
            {/* Botón REGRESAR (igual al de empleados) */}
            <div className="cer-back-wrap">
              <Link
                href={backHref}
                className="eer-btn-53"
                aria-disabled={saving ? "true" : "false"}
                onClick={(e) => saving && e.preventDefault()}
              >
                <div className="original">⬅ REGRESAR</div>
                <div className="letters">
                  <span>M</span>
                  <span>E</span>
                  <span>N</span>
                  <span>Ú</span>
                </div>
              </Link>
            </div>

            <div className="cer-header">
              <div className="cer-title">Editar cliente</div>
              <div className="cer-subtitle">
                {nombreHeader}
                {cliente?.document ? ` — ${cliente.document}` : ""}
              </div>
            </div>

            <div className="cer-right-slot" />
          </div>
        </div>

        {/* Body */}
        <div className="cer-body" aria-busy={saving}>
          <div className="cer-grid">
            <div className="cer-group">
              <label>Nombre(s)</label>
              <input
                className="cer-input cer-upper"
                value={nombre}
                onChange={(e) => setNombre(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            <div className="cer-group">
              <label>Apellido(s)</label>
              <input
                className="cer-input cer-upper"
                value={apellido}
                onChange={(e) => setApellido(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* ✅ Tipo ID (dropdown pill con estilo cliedit) */}
            <div className="cer-group" ref={tipoIdDropdownRef}>
              <label>Tipo ID</label>

              <div className="cer-dd">
                <button
                  type="button"
                  className={`cer-dd-trigger ${tipoIdDropdownOpen ? "cer-open" : ""}`}
                  onClick={() => !saving && setTipoIdDropdownOpen((o) => !o)}
                  disabled={saving}
                >
                  <span className="cer-dd-value">{tipoDocumento || "Selecc. Tipo ID"}</span>
                  <span className="cer-dd-arrow">▼</span>
                </button>

                {tipoIdDropdownOpen && (
                  <div className="cer-dd-content">
                    <button
                      type="button"
                      className="cer-dd-option cer-dd-clear"
                      onClick={() => {
                        setTipoDocumento("");
                        setTipoIdDropdownOpen(false);
                      }}
                      disabled={saving}
                    >
                      Limpiar
                    </button>

                    {TIPO_ID_OPTIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`cer-dd-option ${tipoDocumento === t ? "cer-selected" : ""}`}
                        onClick={() => {
                          setTipoDocumento(t);
                          setTipoIdDropdownOpen(false);
                        }}
                        disabled={saving}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="cer-group">
              <label>N° Documento</label>
              <input
                className="cer-input cer-upper"
                value={documento}
                onChange={(e) => setDocumento(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            <div className="cer-group">
              <label>Correo electrónico</label>
              <input
                className="cer-input cer-upper"
                type="email"
                value={email}
                onChange={(e) => setEmail(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            <div className="cer-group">
              <label>N° Celular - Teléfono</label>
              <input
                className="cer-input cer-upper"
                value={phone}
                onChange={(e) => setPhone(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>

            {/* Estado */}
            <div className="cer-group cer-span-2">
              <label>Estado</label>
              <div
                className="cer-state-inline"
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

            {/* Direcciones (botón menu-btn como tú lo usas) */}
            <div className="cer-group cer-span-2">
              <label>Direcciones</label>
              <button type="button" className="menu-btn" onClick={() => setMostrarModalDirecciones(true)} disabled={saving}>
                📍 EDITAR DIRECCIONES ({direcciones?.length || 0})
              </button>
            </div>

            {/* Comentarios */}
            <div className="cer-group cer-span-2">
              <label>Comentarios</label>
              <textarea
                className="cer-textarea cer-upper"
                value={comentarios}
                onChange={(e) => setComentarios(uc(e.target.value))}
                disabled={saving}
                style={inputUpper}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cer-footer">
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
              onClick={(e) => saving && e.preventDefault()}
            >
              ❌ CANCELAR
            </Link>
          )}
        </div>

        {/* Modal direcciones */}
        {mostrarModalDirecciones && (
          <ModalEditarDirecciones
            cliente={{ ...(cliente || {}), addresses: direcciones }}
            onClose={() => setMostrarModalDirecciones(false)}
            onGuardar={(arr) => setDirecciones(Array.isArray(arr) ? arr : [])}
          />
        )}
      </div>
    </div>
  );
}
