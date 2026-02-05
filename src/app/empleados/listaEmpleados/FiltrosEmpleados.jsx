// /components/Empleados/ListaEmpleados/FiltrosEmpleados.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Chip, FormControlLabel, Switch, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import "@/styles/Empleados/ListaEmpleados/ListaEmpleados.css";

export default function FiltrosEmpleados({
  busqueda,
  setBusqueda,
  soloActivos,
  setSoloActivos,
  filtros,
  setFiltros,
  ciudades = [],
  tiposId = [],
  tiposContrato = [],
  onCreateEmployee,
}) {
  const [cityOpen, setCityOpen] = useState(false);
  const [tipoOpen, setTipoOpen] = useState(false);
  const [contratoOpen, setContratoOpen] = useState(false);

  const cityRef = useRef(null);
  const tipoRef = useRef(null);
  const contratoRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false);
      if (tipoRef.current && !tipoRef.current.contains(e.target)) setTipoOpen(false);
      if (contratoRef.current && !contratoRef.current.contains(e.target)) setContratoOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const setFiltro = (k, v) => setFiltros((p) => ({ ...p, [k]: v }));

  return (
    <div className="emp-filter-bar">
      <div className="emp-search">
        <input className="emp-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar empleado…" />
        {busqueda && (
          <button className="emp-clear-search" onClick={() => setBusqueda("")} title="Limpiar">
            ✕
          </button>
        )}
      </div>

      <FormControlLabel
        sx={{ ml: 1 }}
        label={<Chip size="small" label={soloActivos ? "ACTIVOS" : "INACTIVOS"} color={soloActivos ? "success" : "default"} variant={soloActivos ? "filled" : "outlined"} />}
        control={<Switch checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />}
      />

      {/* Ciudad */}
      <div className="emp-dropdown" ref={cityRef}>
        <button type="button" className={`emp-dropdown-trigger ${cityOpen ? "emp-open" : ""}`} onClick={() => setCityOpen((o) => !o)}>
          <span>{filtros.ciudad || "Ciudad"}</span>
          <span className="emp-arrow">▼</span>
        </button>

        {cityOpen && (
          <div className="emp-dropdown-content">
            {!!filtros.ciudad && (
              <button
                type="button"
                className="emp-clear-option"
                onClick={() => {
                  setFiltro("ciudad", "");
                  setCityOpen(false);
                }}
              >
                Limpiar selección
              </button>
            )}

            {ciudades.length === 0 ? (
              <div className="emp-loading">Cargando…</div>
            ) : (
              <>
                <button
                  type="button"
                  className={`emp-dropdown-option ${!filtros.ciudad ? "emp-selected" : ""}`}
                  onClick={() => {
                    setFiltro("ciudad", "");
                    setCityOpen(false);
                  }}
                >
                  Todas las ciudades
                </button>

                {ciudades.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`emp-dropdown-option ${filtros.ciudad === c ? "emp-selected" : ""}`}
                    onClick={() => {
                      setFiltro("ciudad", c);
                      setCityOpen(false);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Tipo ID */}
      <div className="emp-dropdown" ref={tipoRef}>
        <button type="button" className={`emp-dropdown-trigger ${tipoOpen ? "emp-open" : ""}`} onClick={() => setTipoOpen((o) => !o)}>
          <span>{filtros.tipoId || "Tipo ID"}</span>
          <span className="emp-arrow">▼</span>
        </button>

        {tipoOpen && (
          <div className="emp-dropdown-content">
            <button
              type="button"
              className={`emp-dropdown-option ${!filtros.tipoId ? "emp-selected" : ""}`}
              onClick={() => {
                setFiltro("tipoId", "");
                setTipoOpen(false);
              }}
            >
              Todos los tipos
            </button>

            {tiposId.map((t) => (
              <button
                key={t}
                type="button"
                className={`emp-dropdown-option ${(filtros.tipoId || "").toUpperCase() === t ? "emp-selected" : ""}`}
                onClick={() => {
                  setFiltro("tipoId", t);
                  setTipoOpen(false);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tipo contrato */}
      <div className="emp-dropdown" ref={contratoRef}>
        <button
          type="button"
          className={`emp-dropdown-trigger ${contratoOpen ? "emp-open" : ""}`}
          onClick={() => setContratoOpen((o) => !o)}
        >
          <span>{filtros.tipoContrato || "Tipo contrato"}</span>
          <span className="emp-arrow">▼</span>
        </button>

        {contratoOpen && (
          <div className="emp-dropdown-content">
            <button
              type="button"
              className={`emp-dropdown-option ${!filtros.tipoContrato ? "emp-selected" : ""}`}
              onClick={() => {
                setFiltro("tipoContrato", "");
                setContratoOpen(false);
              }}
            >
              Todos los contratos
            </button>

            {tiposContrato.length === 0 ? (
              <div className="emp-loading">Cargando…</div>
            ) : (
              tiposContrato.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`emp-dropdown-option ${(filtros.tipoContrato || "").toLowerCase() === c.toLowerCase() ? "emp-selected" : ""}`}
                  onClick={() => {
                    setFiltro("tipoContrato", c);
                    setContratoOpen(false);
                  }}
                >
                  {c}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="emp-actions">
        <Tooltip title="Crear empleado">
          <button type="button" className="emp-icon-btn emp-create-btn" onClick={onCreateEmployee} aria-label="Crear">
            <AddIcon />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
