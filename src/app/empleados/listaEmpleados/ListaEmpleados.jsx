'use client';

import React, { useEffect, useMemo, useState } from "react";
import { buscarEmpleados } from "@/lib/Logic.js";
import "@/styles/Empleados/ListaEmpleados.css";
import {
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Menu, MenuItem, CircularProgress, Switch, FormControlLabel, Chip
} from "@mui/material";

const norm = (v) => (v ?? "").toString().trim();
const normLower = (v) => norm(v).toLowerCase();
const boolish = (v) => v === true || v === "true";
const uniqSorted = (arr) => [...new Set(arr)].sort();

export default function ListaEmpleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [busqueda, setBusqueda] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const [filtros, setFiltros] = useState({
    ciudad: "",
    tipoId: "",
    ordenamiento: "nombre",
  });

  // Menú flotante
  const [menuKey, setMenuKey] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = (key) => (e) => { setMenuKey(key); setAnchorEl(e.currentTarget); };
  const closeMenu = () => { setMenuKey(null); setAnchorEl(null); };
  const setFiltro = (k, v) => { setFiltros((p) => ({ ...p, [k]: v })); closeMenu(); };

  // Carga
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await buscarEmpleados();
        const list = (Array.isArray(data) ? data : []).map((e) => ({
          ...e,
          state: boolish(e?.state),
          typeId: norm(e?.typeId).toUpperCase(),
          contractType: norm(e?.contractType), // ← NUEVO: normalizamos tipo de contrato
        }));
        setEmpleados(list);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los empleados");
        setEmpleados([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Opciones de filtros (únicos)
  const ciudades = useMemo(
    () => uniqSorted(empleados.map((e) => norm(e.city)).filter(Boolean)),
    [empleados]
  );
  const tiposId = useMemo(
    () => uniqSorted(empleados.map((e) => norm(e.typeId).toUpperCase()).filter(Boolean)),
    [empleados]
  );

  // Filtrado + orden
  const empleadosFiltrados = useMemo(() => {
    const q = normLower(busqueda);

    const filtered = empleados.filter((e) => {
      const byQuery =
        !q ||
        normLower(`${e.name} ${e.surname}`).includes(q) ||
        normLower(e.email).includes(q) ||
        normLower(e.city).includes(q) ||
        norm(e.document).includes(q) ||
        norm(e.phone).includes(q);

      const byCity = !filtros.ciudad || norm(e.city) === filtros.ciudad;
      const byTipo = !filtros.tipoId || norm(e.typeId).toUpperCase() === filtros.tipoId.toUpperCase();
      const byState = soloActivos ? e.state === true : e.state === false;

      return byQuery && byCity && byTipo && byState;
    });

    const sorters = {
      nombre: (a, b) => normLower(`${a.name} ${a.surname}`).localeCompare(normLower(`${b.name} ${b.surname}`)),
      documento: (a, b) => (+a.document || 0) - (+b.document || 0),
      email: (a, b) => norm(a.email).localeCompare(norm(b.email)),
      ciudad: (a, b) => norm(a.city).localeCompare(norm(b.city)),
    };

    filtered.sort(sorters[filtros.ordenamiento] ?? (() => 0));
    return filtered;
  }, [empleados, busqueda, filtros, soloActivos]);

  // Menú dinámico
  const menuItems =
    menuKey === "Ciudad"
      ? [
        <MenuItem key="all" onClick={() => setFiltro("ciudad", "")}>Todas las ciudades</MenuItem>,
        ...ciudades.map((c) => (
          <MenuItem key={c} onClick={() => setFiltro("ciudad", c)} selected={filtros.ciudad === c}>
            {c}
          </MenuItem>
        )),
      ]
      : menuKey === "Tipo ID"
        ? [
          <MenuItem key="all" onClick={() => setFiltro("tipoId", "")}>Todos los tipos</MenuItem>,
          ...tiposId.map((t) => (
            <MenuItem key={t} onClick={() => setFiltro("tipoId", t)} selected={(filtros.tipoId || "").toUpperCase() === t}>
              {t}
            </MenuItem>
          )),
        ]
        : [
          ["nombre", "Por Nombre"],
          ["documento", "Por Documento"],
          ["email", "Por Email"],
          ["ciudad", "Por Ciudad"],
        ].map(([k, label]) => (
          <MenuItem key={k} onClick={() => setFiltro("ordenamiento", k)} selected={filtros.ordenamiento === k}>
            {label}
          </MenuItem>
        ));

  // Estados de carga/error
  if (loading) {
    return (
      <div className="container" style={{ display: "grid", placeItems: "center", minHeight: 160 }}>
        <CircularProgress />
      </div>
    );
  }
  if (error) {
    return (
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="no-results" style={{ flexDirection: "column", gap: "1rem" }}>
            <span>{error}</span>
            <button onClick={() => location.reload()} className="retry-btn">Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="lista-clientes-content">
        {/* Top bar */}
        <div className="top-bar">
          {/* Búsqueda */}
          <div className="dropdown" style={{ position: "relative" }}>
            <input
              className="input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar empleado…"
            />
            {busqueda && (
              <button className="clear-search" onClick={() => setBusqueda("")} title="Limpiar">
                ✕
              </button>
            )}
          </div>

          {/* Switch Activo/Inactivo con Chip */}
          <FormControlLabel
            sx={{ ml: 2 }}
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

          {/* Menús */}
          <div className="filter-buttons">
            {["Ciudad", "Tipo ID", "Ordenar"].map((f) => (
              <button
                key={f}
                className={`menu-btn-listaclientes ${menuKey === f ? "active-filter" : ""}`}
                onClick={openMenu(f)}
              >
                {f} {menuKey === f ? "▲" : "▼"}
              </button>
            ))}
          </div>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            keepMounted
          >
            {menuItems}
          </Menu>
        </div>

        {/* Contador */}
        <div className="results-info">
          {empleadosFiltrados.length === empleados.length
            ? `Mostrando ${empleados.length} empleados`
            : `Mostrando ${empleadosFiltrados.length} de ${empleados.length} empleados`}
        </div>

        {/* Tabla */}
        <TableContainer className="tabla-clientes-container">
          <Table size="small" stickyHeader className="tabla-clientes">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Número Contacto</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Ciudad</TableCell>
                <TableCell>Tipo contrato</TableCell> {/* ← NUEVA COLUMNA */}
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empleadosFiltrados.length ? (
                empleadosFiltrados.map((e, i) => (
                  <TableRow key={e.document ?? e.email ?? e.id ?? i} hover>
                    <TableCell>{`${e.name ?? ""} ${e.surname ?? ""}`.trim() || "—"}</TableCell>
                    <TableCell>{e.phone || "—"}</TableCell>
                    <TableCell>{e.typeId || "—"}</TableCell>
                    <TableCell>{e.document || "—"}</TableCell>
                    <TableCell>{e.email || "—"}</TableCell>
                    <TableCell>{e.addressResidence || "—"}</TableCell>
                    <TableCell>{e.city || "—"}</TableCell>
                    <TableCell>{e.contractType || "—"}</TableCell> {/* ← NUEVO DATO */}
                    <TableCell>
                      {e.state == null ? (
                        "—"
                      ) : (
                        <Chip
                          size="small"
                          label={e.state ? "ACTIVO" : "INACTIVO"}
                          color={e.state ? "success" : "default"}
                          variant={e.state ? "filled" : "outlined"}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" style={{ color: "#666", padding: "24px 16px" }}>
                    {busqueda || filtros.ciudad || filtros.tipoId
                      ? "No se encontraron empleados que coincidan con los filtros"
                      : "No hay empleados para mostrar"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
