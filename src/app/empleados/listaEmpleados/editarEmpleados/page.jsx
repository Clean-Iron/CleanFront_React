"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { buscarEmpleados } from "@/lib/Logic.js";
import { useCiudades } from "@/lib/Hooks";

import EditarEmpleadosResumen from "./EditarEmpleadosResumen";

const norm = (v) => (v ?? "").toString().trim();

const boolish = (v) => {
  if (v === true) return true;
  if (v === false) return false;

  const s = (v ?? "").toString().trim().toLowerCase();
  if (["true", "1", "si", "sí", "yes", "y", "activo", "active"].includes(s)) return true;
  if (["false", "0", "no", "n", "inactivo", "inactive"].includes(s)) return false;

  return false;
};

const pickCityNameFromEmployee = (e) => norm(e?.city ?? e?.cityName ?? e?.city?.name);

const normalizeEmployee = (e) => ({
  ...e,
  state: boolish(e?.state),
  typeId: norm(e?.typeId).toUpperCase(),
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

  // ✅ CAMPOS FALTANTES DEL DTO
  age: e?.age ?? "",
  pantSize: norm(e?.pantSize),
  shirtSize: norm(e?.shirtSize),
  shoeSize: norm(e?.shoeSize),
});

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 16 }}>
          <p>Cargando empleado…</p>
        </div>
      }
    >
      <PageInner />
    </Suspense>
  );
}

function PageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const docFromUrl = useMemo(() => norm(searchParams?.get("doc")), [searchParams]);

  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();

  const [empleado, setEmpleado] = useState(null);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [errorEmp, setErrorEmp] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoadingEmp(true);
        setErrorEmp("");

        if (!docFromUrl) {
          if (!alive) return;
          setEmpleado(null);
          setErrorEmp("Falta el parámetro ?doc en la URL.");
          return;
        }

        let cached = null;
        try {
          const raw = sessionStorage.getItem("emp_edit");
          cached = raw ? JSON.parse(raw) : null;
        } catch {
          cached = null;
        }

        if (cached && norm(cached?.document) === docFromUrl) {
          if (!alive) return;
          setEmpleado(normalizeEmployee(cached));
          return;
        }

        // Fallback (solo si recargaron o entraron directo)
        const data = await buscarEmpleados();
        const list = Array.isArray(data) ? data : [];
        const found = list.find((x) => norm(x?.document) === docFromUrl);

        if (!alive) return;

        if (!found) {
          setEmpleado(null);
          setErrorEmp("No se encontraron datos del empleado. Regresa a la lista e intenta de nuevo.");
          return;
        }

        const normalized = normalizeEmployee(found);
        setEmpleado(normalized);

        try {
          sessionStorage.setItem("emp_edit", JSON.stringify(normalized));
        } catch {}
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setEmpleado(null);
        setErrorEmp("Error al cargar el empleado.");
      } finally {
        if (alive) setLoadingEmp(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [docFromUrl]);

  if (loadingEmp) {
    return (
      <div style={{ padding: 16 }}>
        <p>Cargando empleado…</p>
      </div>
    );
  }

  if (errorEmp) {
    return (
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <p>{errorEmp}</p>
        <Link href="/empleados/listaEmpleados/">⬅ Volver a lista</Link>
      </div>
    );
  }

  return (
    <EditarEmpleadosResumen
      empleado={empleado}
      ciudades={ciudades || []}
      ciudadesLoading={ciudadesLoading}
      ciudadesError={ciudadesError}
      backHref="/empleados"
      onClose={() => router.push("/empleados")}
      onUpdated={() => router.push("/empleados")}
    />
  );
}
