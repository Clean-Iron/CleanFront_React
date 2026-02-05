"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";

import { buscarEmpleados } from "@/lib/Logic.js";
import { useCiudades } from "@/lib/Hooks";

import FiltrosEmpleados from "./FiltrosEmpleados";
import TablaEmpleados from "./TablaEmpleados";
import ModalAgregarEmpleados from "./ModalAgregarEmpleados";

import "@/styles/Empleados/ListaEmpleados/ListaEmpleados.css";

const norm = (v) => (v ?? "").toString().trim();
const normLower = (v) => norm(v).toLowerCase();
const uc = (v) => norm(v).toUpperCase();

const boolish = (v) => {
  if (v === true) return true;
  if (v === false) return false;

  const s = (v ?? "").toString().trim().toLowerCase();
  if (["true", "1", "si", "sí", "yes", "y", "activo", "active"].includes(s)) return true;
  if (["false", "0", "no", "n", "inactivo", "inactive"].includes(s)) return false;

  return false;
};

const uniqSorted = (arr) =>
  [...new Set(arr)]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

const parseISODateOnly = (iso) => {
  if (!iso) return null;
  const [Y, M, D] = String(iso).slice(0, 10).split("-").map(Number);
  if (!Y || !M || !D) return null;
  return new Date(Y, M - 1, D);
};

const calcAgeFromBirthDate = (birthDateISO) => {
  const d = parseISODateOnly(birthDateISO);
  if (!d) return "";
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return Number.isFinite(age) ? age : "";
};

const toIntOrNull = (v) => {
  const s = norm(v);
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
};

export const EMP_TABLE_HEADERS = [
  "Nombre",
  "Número Contacto",
  "ID",
  "Documento",
  "Email",
  "Fecha nacimiento",
  "Edad",

  // ✅ NUEVOS CAMPOS DTO
  "Talla pantalón",
  "Talla camisa",
  "Talla calzado",

  "Dirección",
  "Ciudad",
  "Cargo",
  "Tipo contrato",
  "EPS",
  "Fondo pensiones",
  "Contacto emergencia",
  "Banco",
  "N° Cuenta",
  "Fecha ingreso",
  "Fecha retiro",
  "Fecha ingreso ARL",
  "Comentarios",
  "Estado",
  "Acciones",
];

const pickCityNameFromEmployee = (e) => {
  return norm(e?.city ?? e?.cityName ?? e?.city?.name);
};

export default function ListaEmpleados({ onCreateEmployee }) {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);

  const [filtros, setFiltros] = useState({
    ciudad: "",
    tipoId: "",
    tipoContrato: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);

  const { ciudades: ciudadesCatalogo, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();

  const cargarEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await buscarEmpleados();

      const list = (Array.isArray(data) ? data : []).map((e) => ({
        ...e,
        state: boolish(e?.state),
        typeId: uc(e?.typeId),
        contractType: norm(e?.contractType),
        city: pickCityNameFromEmployee(e),
        position: norm(e?.position),
        eps: norm(e?.eps),
        pensionFund: norm(e?.pensionFund),
        emergencyContact: norm(e?.emergencyContact),
        bankName: norm(e?.bankName),
        bankAccountNumber: norm(e?.bankAccountNumber),
        birthDate: norm(e?.birthDate),
        entryDate: norm(e?.entryDate),
        exitDate: norm(e?.exitDate),
        arlEntryDate: norm(e?.arlEntryDate),
        comments: norm(e?.comments),
        addressResidence: norm(e?.addressResidence),
        email: norm(e?.email),
        phone: norm(e?.phone),
        name: norm(e?.name),
        surname: norm(e?.surname),
        document: norm(e?.document),

        // ✅ CAMPOS DTO
        age: typeof e?.age === "number" ? e.age : toIntOrNull(e?.age),
        pantSize: uc(e?.pantSize),
        shirtSize: uc(e?.shirtSize),
        shoeSize: uc(e?.shoeSize),
      }));

      setEmpleados(list);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los empleados");
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  const ciudadesDesdeEmpleados = useMemo(() => uniqSorted(empleados.map((e) => norm(e.city)).filter(Boolean)), [empleados]);

  const ciudadesParaUI = useMemo(() => {
    return ciudadesCatalogo?.length ? ciudadesCatalogo : ciudadesDesdeEmpleados;
  }, [ciudadesCatalogo, ciudadesDesdeEmpleados]);

  const tiposId = useMemo(() => uniqSorted(empleados.map((e) => uc(e.typeId)).filter(Boolean)), [empleados]);

  const tiposContrato = useMemo(() => uniqSorted(empleados.map((e) => norm(e.contractType)).filter(Boolean)), [empleados]);

  const empleadosFiltrados = useMemo(() => {
    const q = normLower(busqueda);

    const filtered = empleados.filter((e) => {
      const fullName = normLower(`${e.name ?? ""} ${e.surname ?? ""}`);

      const byQuery =
        !q ||
        fullName.includes(q) ||
        normLower(e.email).includes(q) ||
        normLower(e.city).includes(q) ||
        norm(e.document).includes(q) ||
        norm(e.phone).includes(q) ||
        normLower(e.position).includes(q) ||
        normLower(e.eps).includes(q) ||
        normLower(e.pensionFund).includes(q) ||
        normLower(e.emergencyContact).includes(q) ||
        normLower(e.bankName).includes(q) ||
        normLower(e.bankAccountNumber).includes(q) ||
        normLower(e.addressResidence).includes(q) ||
        normLower(e.comments).includes(q) ||
        // ✅ búsqueda por tallas
        normLower(e.pantSize).includes(q) ||
        normLower(e.shirtSize).includes(q) ||
        normLower(e.shoeSize).includes(q) ||
        // ✅ búsqueda por edad (si escriben número)
        (q && String(e.age ?? "").includes(q));

      const byCity = !filtros.ciudad || norm(e.city) === filtros.ciudad;
      const byTipo = !filtros.tipoId || uc(e.typeId) === uc(filtros.tipoId);

      const byContrato =
        !filtros.tipoContrato || norm(e.contractType).toLowerCase() === norm(filtros.tipoContrato).toLowerCase();

      const byState = soloActivos ? e.state === true : e.state === false;

      return byQuery && byCity && byTipo && byContrato && byState;
    });

    filtered.sort((a, b) =>
      normLower(`${a.name ?? ""} ${a.surname ?? ""}`).localeCompare(normLower(`${b.name ?? ""} ${b.surname ?? ""}`), "es", {
        sensitivity: "base",
      })
    );

    return filtered;
  }, [empleados, busqueda, filtros, soloActivos]);

  const handleCreate = () => {
    if (typeof onCreateEmployee === "function") return onCreateEmployee();
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="emp-board">
          <div className="emp-root">
            <div className="emp-panel">
              <div className="emp-empty-state emp-empty-strong">
                <div className="emp-empty-inner">
                  <span className="emp-spinner" aria-hidden="true" />
                  <p>Cargando empleados…</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="emp-board">
          <div className="emp-root">
            <div className="emp-panel">
              <div className="emp-empty-state emp-empty-strong">
                <div className="emp-empty-inner" style={{ display: "grid", gap: 12 }}>
                  <p>{error}</p>
                  <button className="emp-retry-btn" onClick={() => location.reload()}>
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resultsText =
    empleadosFiltrados.length === empleados.length
      ? `Mostrando ${empleados.length} empleados`
      : `Mostrando ${empleadosFiltrados.length} de ${empleados.length} empleados`;

  return (
    <div className="container">
      <div className="emp-board">
        <FiltrosEmpleados
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          soloActivos={soloActivos}
          setSoloActivos={setSoloActivos}
          filtros={filtros}
          setFiltros={setFiltros}
          ciudades={ciudadesParaUI}
          tiposId={tiposId}
          tiposContrato={tiposContrato}
          // ✅ sin Excel
          onCreateEmployee={handleCreate}
        />

        <div className="emp-root">
          <div className="emp-panel">
            <div className="emp-results-info">{resultsText}</div>

            <TablaEmpleados
              empleados={empleadosFiltrados}
              hasAnyFilter={!!(busqueda || filtros.ciudad || filtros.tipoId || filtros.tipoContrato)}
              calcAge={calcAgeFromBirthDate}
            />
          </div>
        </div>
      </div>

      <ModalAgregarEmpleados
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => {
          setShowAddModal(false);
          cargarEmpleados();
        }}
        ciudades={ciudadesParaUI}
        ciudadesLoading={ciudadesLoading}
        ciudadesError={ciudadesError}
      />
    </div>
  );
}
