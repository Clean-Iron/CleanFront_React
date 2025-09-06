import React, { useEffect, useMemo, useState } from "react";
import { buscarEmpleados } from "@/lib/Logic.js";
import "@/styles/Empleados/ListaEmpleados.css";

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
} from "@mui/material";

const ListaEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState({ ciudad: "", ordenamiento: "nombre" });

  const [menuKey, setMenuKey] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = (key) => (e) => {
    setMenuKey(key);
    setAnchorEl(e.currentTarget);
  };
  const closeMenu = () => {
    setMenuKey(null);
    setAnchorEl(null);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await buscarEmpleados();
        setEmpleados(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Error al cargar los empleados");
        setEmpleados([]);
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

  const ciudadesUnicas = useMemo(() => {
    return [...new Set(empleados.map((e) => e?.city).filter((v) => !!v && v.trim() !== ""))].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [empleados]);

  const empleadosFiltrados = useMemo(() => {
    const t = busqueda.toLowerCase().trim();

    const filtrados = empleados.filter((e) => {
      const nombre = `${e?.name || ""} ${e?.surname || ""}`.toLowerCase();
      const email = (e?.email || "").toLowerCase();
      const ciudad = (e?.city || "").toLowerCase();
      const documento = (e?.document || "").toString();
      const telefono = (e?.phone || "").toString();

      const coincideBusqueda =
        !t ||
        nombre.includes(t) ||
        email.includes(t) ||
        ciudad.includes(t) ||
        documento.includes(t) ||
        telefono.includes(t);

      const coincideCiudad = !filtros.ciudad || e?.city === filtros.ciudad;

      return coincideBusqueda && coincideCiudad;
    });

    const sorters = {
      nombre: (a, b) =>
        `${a?.name || ""} ${a?.surname || ""}`
          .toLowerCase()
          .localeCompare(`${b?.name || ""} ${b?.surname || ""}`.toLowerCase()),
      documento: (a, b) => (+a?.document || 0) - (+b?.document || 0),
      email: (a, b) => (a?.email || "").localeCompare(b?.email || ""),
      ciudad: (a, b) => (a?.city || "").localeCompare(b?.city || ""),
    };

    filtrados.sort(sorters[filtros.ordenamiento] ?? (() => 0));
    return filtrados;
  }, [empleados, busqueda, filtros]);

  let menuItems = [];
  if (menuKey === "Ciudad") {
    menuItems = [
      <MenuItem key="all-cities" onClick={() => aplicarFiltro("ciudad", "")}>
        Todas las ciudades
      </MenuItem>,
      ...ciudadesUnicas.map((c) => (
        <MenuItem key={c} onClick={() => aplicarFiltro("ciudad", c)} selected={filtros.ciudad === c}>
          {c}
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
      <MenuItem key={k} onClick={() => aplicarFiltro("ordenamiento", k)} selected={filtros.ordenamiento === k}>
        {label}
      </MenuItem>
    ));
  }

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
        <div className="lista-clientes-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="no-results" style={{ flexDirection: "column", gap: "1rem" }}>
            <span>{error}</span>
            <button onClick={() => location.reload()} className="retry-btn">
              Reintentar
            </button>
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
          <div className="dropdown" style={{ position: "relative", transition: "all .3s ease-in-out" }}>
            <input
              className="input"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar empleado..."
            />
            {busqueda && (
              <button className="clear-search" onClick={limpiarBusqueda} title="Limpiar búsqueda">
                ✕
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="filter-buttons">
            {["Ciudad", "Ordenar"].map((f) => (
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

        <TableContainer className="tabla-clientes-container">
          <Table className="tabla-clientes" size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Número Contacto</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Ciudad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((e, idx) => {
                  const key = e?.document ?? e?.email ?? e?.id ?? `${e?.name ?? ""}-${idx}`;
                  return (
                    <TableRow key={key} className="cliente-row" hover>
                      <TableCell>{`${e?.name ?? ""} ${e?.surname ?? ""}`}</TableCell>
                      <TableCell>{e?.phone || "—"}</TableCell>
                      <TableCell>{e?.document || "—"}</TableCell>
                      <TableCell>{e?.email || "—"}</TableCell>
                      <TableCell>{e?.addressResidence || "—"}</TableCell>
                      <TableCell>{e?.city || "—"}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ color: "#666", padding: "24px 16px" }}>
                    {busqueda || filtros.ciudad
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
};

export default ListaEmpleados;
