"use client";

import React from "react";
import Link from "next/link";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { CLI_HEADERS } from "./ListaClientes";
import "@/styles/Clientes/ListaClientes/ListaClientes.css";

const safeKey = (c, idx) =>
  c?.document ?? c?.email ?? c?.id ?? `${c?.name ?? ""}-${c?.phone ?? ""}-${idx}`;

export default function TablaClientes({
  clientes = [],
  mostrarDirecciones = {},
  onToggleDirecciones,
}) {
  return (
    <TableContainer className="cli-table-wrap">
      <Table className="cli-table" size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {CLI_HEADERS.map((h) => (
              <TableCell key={h}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {clientes.length > 0 ? (
            clientes.flatMap((cliente, idx) => {
              const key = safeKey(cliente, idx);
              const isOpen = !!mostrarDirecciones[key];
              const addresses = Array.isArray(cliente.addresses) ? cliente.addresses : [];

              const doc = encodeURIComponent(cliente.document || "");
              const href = cliente.document ? `/clientes/listaClientes/editarClientes/?doc=${doc}` : "#";

              const fila = (
                <TableRow key={`row-${key}`} hover>
                  <TableCell>{`${cliente.name ?? ""} ${cliente.surname ?? ""}`.trim() || "—"}</TableCell>
                  <TableCell>{cliente.phone || "—"}</TableCell>
                  <TableCell>{cliente.typeId?.trim() || "—"}</TableCell>
                  <TableCell>{cliente.document || "—"}</TableCell>
                  <TableCell>{cliente.email || "—"}</TableCell>
                  <TableCell>
                    {cliente.state == null ? (
                      "—"
                    ) : (
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
                      type="button"
                      className="cli-dir-toggle"
                      onClick={() => onToggleDirecciones?.(key)}
                      aria-label="Ver direcciones"
                      title="Ver direcciones"
                    >
                      <span className="cli-dir-count">{addresses.length}</span>
                      {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </button>
                  </TableCell>

                  <TableCell className="cli-actions-cell">
                    <Tooltip title="Editar cliente">
                      <span>
                        {cliente.document ? (
                          <Link
                            href={href}
                            className="cli-row-icon-btn"
                            aria-label="Editar"
                            onClick={() => {
                              try {
                                sessionStorage.setItem("cli_edit", JSON.stringify(cliente));
                              } catch {}
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="cli-row-icon-btn"
                            onClick={() => alert("No se encontró el documento del cliente para editar.")}
                            aria-label="Editar"
                          >
                            <EditIcon fontSize="small" />
                          </button>
                        )}
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );

              const filaDirecciones =
                isOpen ? (
                  <TableRow key={`dir-${key}`} className="cli-dir-row">
                    <TableCell colSpan={CLI_HEADERS.length} className="cli-dir-cell">
                      <div className="cli-direcciones-container">
                        <div className="cli-direcciones-title">Direcciones</div>

                        {addresses.length === 0 ? (
                          <div className="cli-direcciones-empty">Este cliente no tiene direcciones registradas.</div>
                        ) : (
                          <div className="cli-direcciones-grid">
                            {addresses.map((a, i) => (
                              <div key={a?.id ?? `${key}-a-${i}`} className="cli-direccion-card">
                                <div className="cli-direccion-tipo">{a?.description || "Dirección"}</div>
                                <div className="cli-direccion-datos">
                                  <p><strong>Dirección:</strong> {a?.address || "—"}</p>
                                  <p><strong>Ciudad:</strong> {a?.city || "—"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null;

              return [fila, filaDirecciones].filter(Boolean);
            })
          ) : (
            <TableRow>
              <TableCell colSpan={CLI_HEADERS.length} align="center" style={{ color: "#666", padding: "24px 16px" }}>
                No hay clientes para mostrar
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
