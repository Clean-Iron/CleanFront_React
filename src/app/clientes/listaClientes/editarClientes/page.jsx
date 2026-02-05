"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { buscarClientes } from "@/lib/Logic.js";
import EditarClientesResumen from "../editarClientes/EditarClientesResumen.jsx";

const norm = (v) => (v ?? "").toString().trim();

const boolish = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  const s = (v ?? "").toString().trim().toLowerCase();
  if (["true", "1", "si", "sí", "yes", "y", "activo", "active"].includes(s)) return true;
  if (["false", "0", "no", "n", "inactivo", "inactive"].includes(s)) return false;
  return false;
};

const normalizeClient = (c) => ({
  ...c,
  state: boolish(c?.state),
  typeId: norm(c?.typeId),
  document: norm(c?.document),
  name: norm(c?.name),
  surname: norm(c?.surname),
  email: norm(c?.email),
  phone: norm(c?.phone),
  addresses: Array.isArray(c?.addresses) ? c.addresses : [],
});

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}><p>Cargando cliente…</p></div>}>
      <PageInner />
    </Suspense>
  );
}

function PageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docFromUrl = useMemo(() => norm(searchParams?.get("doc")), [searchParams]);

  const [cliente, setCliente] = useState(null);
  const [loadingCli, setLoadingCli] = useState(true);
  const [errorCli, setErrorCli] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoadingCli(true);
        setErrorCli("");

        if (!docFromUrl) {
          if (!alive) return;
          setCliente(null);
          setErrorCli("Falta el parámetro ?doc en la URL.");
          return;
        }

        let cached = null;
        try {
          const raw = sessionStorage.getItem("cli_edit");
          cached = raw ? JSON.parse(raw) : null;
        } catch {
          cached = null;
        }

        if (cached && norm(cached?.document) === docFromUrl) {
          if (!alive) return;
          setCliente(normalizeClient(cached));
          return;
        }

        const data = await buscarClientes();
        const list = Array.isArray(data) ? data : [];
        const found = list.find((x) => norm(x?.document) === docFromUrl);

        if (!alive) return;

        if (!found) {
          setCliente(null);
          setErrorCli("No se encontraron datos del cliente. Regresa a la lista e intenta de nuevo.");
          return;
        }

        const normalized = normalizeClient(found);
        setCliente(normalized);

        try {
          sessionStorage.setItem("cli_edit", JSON.stringify(normalized));
        } catch {}
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setCliente(null);
        setErrorCli("Error al cargar el cliente.");
      } finally {
        if (alive) setLoadingCli(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [docFromUrl]);

  if (loadingCli) {
    return (
      <div style={{ padding: 16 }}>
        <p>Cargando cliente…</p>
      </div>
    );
  }

  if (errorCli) {
    return (
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <p>{errorCli}</p>
        <Link href="/clientes">⬅ Volver a lista</Link>
      </div>
    );
  }

  return (
    <EditarClientesResumen
      cliente={cliente}
      backHref="/clientes"
      onClose={() => router.push("/clientes")}
      onUpdated={() => router.push("/clientes")}
    />
  );
}
