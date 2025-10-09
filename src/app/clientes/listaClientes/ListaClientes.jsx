'use client';

import React, { useState, useEffect, useMemo } from "react";
import { buscarClientes } from "@/lib/Logic.js";
import { useCiudades } from "@/lib/Hooks";
import "@/styles/Clientes/ListaClientes.css";

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [mostrarDirecciones, setMostrarDirecciones] = useState({});

  const [filtros, setFiltros] = useState({
    ciudad: "",
    tipoId: "",
    ordenamiento: "nombre",
  });

  // 🔵 NUEVO: switch para filtrar por estado
  // ON = Activos; OFF = Inactivos
  const [soloActivos, setSoloActivos] = useState(true);

  const { ciudades, isLoading: loadingCiudades } = useCiudades();

  const [menuKey, setMenuKey] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenMenu = (key) => (e) => { setMenuKey(key); setAnchorEl(e.currentTarget); };
  const closeMenu = () => { setMenuKey(null); setAnchorEl(null); };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await buscarClientes();
        // Normaliza state a boolean
        const toBool = (v) => v === true || v === "true";
        const arr = (Array.isArray(data) ? data : []).map(c => ({ ...c, state: toBool(c?.state) }));
        setClientes(arr);
      } catch (e) {
        console.error("Error al buscar clientes:", e);
        setError("Error al cargar los clientes");
        setClientes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const limpiarBusqueda = () => setBusqueda("");
  const aplicarFiltro = (tipo, valor) => {
    setFiltros((prev) => ({ ...prev, [tipo]: valor }));
    closeMenu();
  };

  const tiposIdUnicos = useMemo(
    () =>
      [...new Set(
        clientes.map((c) => c.typeId?.trim()).filter((v) => v && v !== "")
      )].sort(),
    [clientes]
  );

  const norm = (s) => (s ?? "").toString().trim().toLowerCase();

  const clientesFiltrados = useMemo(() => {
    const r = clientes.filter((cliente) => {
      const t = norm(busqueda);

      const nombre = norm(`${cliente.name || ""} ${cliente.surname || ""}`);
      const email = norm(cliente.email || "");
      const ciudadTop = norm(cliente.city || "");
      const documento = (cliente.document ?? "").toString();
      const telefono = (cliente.phone ?? "").toString();

      const okBusqueda =
        t === "" ||
        nombre.includes(t) ||
        email.includes(t) ||
        ciudadTop.includes(t) ||
        documento.includes(t) ||
        telefono.includes(t);

      const okCiudad =
        !filtros.ciudad ||
        (cliente.addresses?.some((a) => norm(a?.city) === norm(filtros.ciudad)) ?? false);

      const okTipo = !filtros.tipoId || norm(cliente.typeId?.trim()) === norm(filtros.tipoId);

      // 🔵 NUEVO: filtro por estado según el switch
      const okEstado = soloActivos ? cliente.state === true : cliente.state === false;

      return okBusqueda && okCiudad && okTipo && okEstado;
    });

    r.sort((a, b) => {
      switch (filtros.ordenamiento) {
        case "nombre": {
          const A = norm(`${a.name || ""} ${a.surname || ""}`);
          const B = norm(`${b.name || ""} ${b.surname || ""}`);
          return A.localeCompare(B);
        }
        case "documento":
          return (a.document || 0) - (b.document || 0);
        case "email":
          return norm(a.email).localeCompare(norm(b.email));
        case "ciudad":
          return norm(a.city).localeCompare(norm(b.city));
        default:
          return 0;
      }
    });

    return r;
  }, [clientes, busqueda, filtros, soloActivos]);

  if (loading) {
    return (
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="no-results" style={{ flexDirection: "column", gap: "1rem" }}>
            <span>{error}</span>
            <button className="retry-btn" onClick={() => location.reload()}>Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  let menuItems = [];
  if (menuKey === "Ciudad") {
    menuItems = [
      <MenuItem key="all-cities" onClick={() => aplicarFiltro("ciudad", "")}>
        Todas las ciudades
      </MenuItem>,
      ...(loadingCiudades
        ? [<MenuItem key="loading-cities" disabled>Cargando ciudades…</MenuItem>]
        : (ciudades || []).map((c) => (
          <MenuItem
            key={c}
            onClick={() => aplicarFiltro("ciudad", c)}
            selected={norm(filtros.ciudad) === norm(c)}
          >
            {c}
          </MenuItem>
        ))),
    ];
  } else if (menuKey === "Tipo ID") {
    menuItems = [
      <MenuItem key="all-types" onClick={() => aplicarFiltro("tipoId", "")}>
        Todos los tipos
      </MenuItem>,
      ...tiposIdUnicos.map((t) => (
        <MenuItem
          key={t}
          onClick={() => aplicarFiltro("tipoId", t)}
          selected={norm(filtros.tipoId) === norm(t)}
        >
          {t}
        </MenuItem>
      )),
    ];
  } else if (menuKey === "Ordenar") {
    const opciones = [
      ["nombre", "Por Nombre"],
      ["documento", "Por Documento"],
      ["email", "Por Email"],
      ["ciudad", "Por Ciudad"],
    ];
    menuItems = opciones.map(([k, label]) => (
      <MenuItem
        key={k}
        onClick={() => aplicarFiltro("ordenamiento", k)}
        selected={filtros.ordenamiento === k}
      >
        {label}
      </MenuItem>
    ));
  }

  return (
    <div className="container">
      <div className="lista-clientes-content">
        {/* Top bar */}
        <div className="top-bar">
          <div className="dropdown" style={{ position: "relative", transition: "all .3s ease-in-out" }}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar clientes..."
            />
            {busqueda && (
              <button className="clear-search" onClick={limpiarBusqueda} title="Limpiar búsqueda">✕</button>
            )}
          </div>

          {/* 🔵 NUEVO: Switch Activos/Inactivos */}
          <FormControlLabel
            sx={{ ml: 2 }}
            label={soloActivos ? "Activos" : "Inactivos"}
            control={
              <Switch
                checked={soloActivos}
                onChange={(e) => setSoloActivos(e.target.checked)}
              />
            }
          />

          <div className="filter-buttons">
            {["Ciudad", "Tipo ID", "Ordenar"].map((f) => (
              <button
                key={f}
                className={`menu-btn-listaclientes ${menuKey === f ? "active-filter" : ""}`}
                onClick={handleOpenMenu(f)}
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
          {clientesFiltrados.length === clientes.length
            ? `Mostrando ${clientes.length} clientes`
            : `Mostrando ${clientesFiltrados.length} de ${clientes.length} clientes`}
        </div>

        {/* Tabla */}
        <TableContainer className="tabla-clientes-container">
          <Table className="tabla-clientes" size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Número Contacto</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Direcciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.flatMap((cliente, idx) => {
                  const keyBase =
                    cliente?.document ??
                    cliente?.email ??
                    `${cliente?.name ?? ""}-${cliente?.phone ?? ""}-${idx}`;

                  const fila = (
                    <TableRow key={`row-${keyBase}`} className="cliente-row" hover>
                      <TableCell>{cliente.name} {cliente.surname}</TableCell>
                      <TableCell>{cliente.phone || "—"}</TableCell>
                      <TableCell>{cliente.typeId?.trim() || "—"}</TableCell>
                      <TableCell>{cliente.document || "—"}</TableCell>
                      <TableCell>{cliente.email || "—"}</TableCell>
                      <TableCell>
                        {cliente.state === undefined || cliente.state === null ? "—" : (
                          <Chip
                            size="small"
                            label={cliente.state ? "ACTIVO" : "INACTIVO"}
                            color={cliente.state ? "success" : "default"}
                            variant={cliente.state ? "filled" : "outlined"}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          className="direcciones-toggle"
                          onClick={() =>
                            setMostrarDirecciones((prev) => ({
                              ...prev,
                              [cliente.document]: !prev[cliente.document],
                            }))}
                        >
                          {cliente.addresses?.length || 0}{" "}
                          {mostrarDirecciones[cliente.document] ? "▲" : "▼"}
                        </button>
                      </TableCell>
                    </TableRow>
                  );

                  const filaDirecciones =
                    mostrarDirecciones[cliente.document] && cliente.addresses ? (
                      <TableRow key={`dir-${keyBase}`} className="direcciones-row">
                        <TableCell className="direcciones-cell" colSpan={6}>
                          <div className="direcciones-container">
                            <h4>Direcciones:</h4>
                            <div className="direcciones-grid">
                              {cliente.addresses.map((address) => (
                                <div key={address.id} className="direccion-card">
                                  <div className="direccion-tipo">{address.description}</div>
                                  <div className="direccion-datos">
                                    <p><strong>Dirección:</strong> {address.address}</p>
                                    <p><strong>Ciudad:</strong> {address.city}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null;

                  return [fila, filaDirecciones].filter(Boolean);
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" style={{ color: "#666", padding: "24px 16px" }}>
                    {busqueda || filtros.ciudad || filtros.tipoId
                      ? "No se encontraron clientes que coincidan con los filtros"
                      : "No hay clientes para mostrar"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ListaClientes;
