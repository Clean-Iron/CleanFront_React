'use client';

import React, { useEffect, useRef, useState } from "react";
import { Chip, FormControlLabel, Switch, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCiudades } from "@/lib/Hooks";

import "@/styles/Clientes/ListaClientes/ListaClientes.css";

export default function FiltrosClientes({
  busqueda,
  setBusqueda,
  soloActivos,
  setSoloActivos,
  filtros,
  setFiltros,
  tiposId = [],
  onCreateClient,
}) {
  const { ciudades, isLoading: loadingCiudades } = useCiudades();

  const [cityOpen, setCityOpen] = useState(false);
  const [tipoOpen, setTipoOpen] = useState(false);

  const cityRef = useRef(null);
  const tipoRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false);
      if (tipoRef.current && !tipoRef.current.contains(e.target)) setTipoOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const setFiltro = (k, v) => setFiltros((p) => ({ ...p, [k]: v }));

  return (
    <div className="cli-filter-bar">
      {/* Buscar */}
      <div className="cli-search">
        <input
          className="cli-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente…"
        />
        {busqueda && (
          <button className="cli-clear-search" onClick={() => setBusqueda("")} title="Limpiar">
            ✕
          </button>
        )}
      </div>

      {/* Activos / Inactivos */}
      <FormControlLabel
        sx={{ ml: 1 }}
        label={
          <Chip
            size="small"
            label={soloActivos ? "ACTIVOS" : "INACTIVOS"}
            color={soloActivos ? "success" : "default"}
            variant={soloActivos ? "filled" : "outlined"}
          />
        }
        control={<Switch checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} />}
      />

      {/* Ciudad */}
      <div className="cli-dropdown" ref={cityRef}>
        <button
          type="button"
          className={`cli-dropdown-trigger ${cityOpen ? "cli-open" : ""}`}
          onClick={() => setCityOpen((o) => !o)}
        >
          <span>{filtros.ciudad || "Ciudad"}</span>
          <span className="cli-arrow">▼</span>
        </button>

        {cityOpen && (
          <div className="cli-dropdown-content">
            {!!filtros.ciudad && (
              <button
                type="button"
                className="cli-clear-option"
                onClick={() => {
                  setFiltro("ciudad", "");
                  setCityOpen(false);
                }}
              >
                Limpiar selección
              </button>
            )}

            {loadingCiudades ? (
              <div className="cli-loading">Cargando ciudades…</div>
            ) : (
              <>
                <button
                  type="button"
                  className={`cli-dropdown-option ${!filtros.ciudad ? "cli-selected" : ""}`}
                  onClick={() => {
                    setFiltro("ciudad", "");
                    setCityOpen(false);
                  }}
                >
                  Todas las ciudades
                </button>

                {(ciudades || []).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cli-dropdown-option ${filtros.ciudad === c ? "cli-selected" : ""}`}
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
      <div className="cli-dropdown" ref={tipoRef}>
        <button
          type="button"
          className={`cli-dropdown-trigger ${tipoOpen ? "cli-open" : ""}`}
          onClick={() => setTipoOpen((o) => !o)}
        >
          <span>{filtros.tipoId || "Tipo ID"}</span>
          <span className="cli-arrow">▼</span>
        </button>

        {tipoOpen && (
          <div className="cli-dropdown-content">
            <button
              type="button"
              className={`cli-dropdown-option ${!filtros.tipoId ? "cli-selected" : ""}`}
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
                className={`cli-dropdown-option ${(filtros.tipoId || "").toLowerCase() === t.toLowerCase() ? "cli-selected" : ""}`}
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

      <div className="cli-actions">
        <Tooltip title="Crear cliente">
          <button
            type="button"
            className="cli-icon-btn cli-create-btn"
            onClick={onCreateClient}
            aria-label="Crear cliente"
          >
            <AddIcon />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
