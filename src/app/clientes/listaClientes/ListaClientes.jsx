'use client';

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { buscarClientes } from "@/lib/Logic.js";

import FiltrosClientes from "./FiltrosClientes";
import TablaClientes from "./TablaClientes";

import ModalAgregarClientes from "./ModalAgregarClientes.jsx";

import "@/styles/Clientes/ListaClientes/ListaClientes.css";

const norm = (s) => (s ?? "").toString().trim();
const normLower = (s) => norm(s).toLowerCase();
const boolish = (v) => v === true || v === "true";

export const CLI_HEADERS = [
  "Nombre",
  "Número Contacto",
  "ID",
  "Documento",
  "Email",
  "Estado",
  "Direcciones",
  "Acciones",
];

export default function ListaClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);

  const [filtros, setFiltros] = useState({
    ciudad: "",
    tipoId: "",
  });

  const [mostrarDirecciones, setMostrarDirecciones] = useState({});

  const [showAddModal, setShowAddModal] = useState(false);

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await buscarClientes();
      const arr = (Array.isArray(data) ? data : []).map((c) => ({
        ...c,
        state: boolish(c?.state),
        typeId: norm(c?.typeId),
      }));

      setClientes(arr);
    } catch (e) {
      console.error("Error al buscar clientes:", e);
      setError("Error al cargar los clientes");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const tiposIdUnicos = useMemo(() => {
    const set = new Set();
    for (const c of clientes) {
      const t = norm(c?.typeId);
      if (t) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [clientes]);

  const clientesFiltrados = useMemo(() => {
    const t = normLower(busqueda);

    const r = clientes.filter((cliente) => {
      const nombre = normLower(`${cliente.name || ""} ${cliente.surname || ""}`);
      const email = normLower(cliente.email || "");
      const doc = (cliente.document ?? "").toString();
      const phone = (cliente.phone ?? "").toString();

      const okBusqueda =
        !t ||
        nombre.includes(t) ||
        email.includes(t) ||
        doc.includes(t) ||
        phone.includes(t);

      const okCiudad =
        !filtros.ciudad ||
        (Array.isArray(cliente.addresses)
          ? cliente.addresses.some((a) => normLower(a?.city) === normLower(filtros.ciudad))
          : false);

      const okTipo =
        !filtros.tipoId || normLower(cliente.typeId) === normLower(filtros.tipoId);

      const okEstado = soloActivos ? cliente.state === true : cliente.state === false;

      return okBusqueda && okCiudad && okTipo && okEstado;
    });

    // ✅ orden fijo por nombre
    r.sort((a, b) => {
      const A = normLower(`${a.name || ""} ${a.surname || ""}`);
      const B = normLower(`${b.name || ""} ${b.surname || ""}`);
      return A.localeCompare(B);
    });

    return r;
  }, [clientes, busqueda, filtros, soloActivos]);

  const toggleDirecciones = (key) => {
    setMostrarDirecciones((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ abrir modal crear
  const handleCreate = () => {
    setShowAddModal(true);
  };

  // ✅ abrir modal editar
  const handleEdit = (cliente) => {
    setClienteEditando(cliente);
    setShowEditModal(true);
  };

  // ✅ cuando se crea o edita, recargamos lista
  const onCreated = async () => {
    await cargarClientes();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="cli-board">
          <div className="cli-root">
            <div className="cli-panel">
              <div className="cli-empty-state cli-empty-strong">
                <div className="cli-empty-inner">
                  <span className="cli-spinner" aria-hidden="true" />
                  <p>Cargando clientes…</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ModalAgregarClientes
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={onCreated}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="cli-board">
          <div className="cli-root">
            <div className="cli-panel">
              <div className="cli-empty-state cli-empty-strong">
                <div className="cli-empty-inner" style={{ display: "grid", gap: 12 }}>
                  <p>{error}</p>
                  <button className="cli-retry-btn" onClick={() => location.reload()}>
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ModalAgregarClientes
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={onCreated}
        />
      </div>
    );
  }

  const resultsText =
    clientesFiltrados.length === clientes.length
      ? `Mostrando ${clientes.length} clientes`
      : `Mostrando ${clientesFiltrados.length} de ${clientes.length} clientes`;

  return (
    <div className="container">
      <div className="cli-board">
        <FiltrosClientes
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          soloActivos={soloActivos}
          setSoloActivos={setSoloActivos}
          filtros={filtros}
          setFiltros={setFiltros}
          tiposId={tiposIdUnicos}
          onCreateClient={handleCreate}
        />

        <div className="cli-root">
          <div className="cli-panel">
            <div className="cli-results-info">{resultsText}</div>

            <TablaClientes
              clientes={clientesFiltrados}
              mostrarDirecciones={mostrarDirecciones}
              onToggleDirecciones={toggleDirecciones}
              onEditClient={handleEdit}
            />
          </div>
        </div>
      </div>

      {/* ✅ Modal Agregar */}
      <ModalAgregarClientes
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={onCreated}
      />
    </div>
  );
}
