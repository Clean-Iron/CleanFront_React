"use client";

import React from "react";
import Link from "next/link";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { EMP_TABLE_HEADERS } from "./ListaEmpleados";
import "@/styles/Empleados/ListaEmpleados/ListaEmpleados.css";

export default function TablaEmpleados({ empleados = [], hasAnyFilter = false, calcAge }) {
  return (
    <TableContainer className="emp-table-wrap">
      <Table size="small" stickyHeader className="emp-table">
        <TableHead>
          <TableRow>
            {EMP_TABLE_HEADERS.map((h) => (
              <TableCell key={h} className={h === "Acciones" ? "emp-actions-cell" : ""}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {empleados.length > 0 ? (
            empleados.map((e, i) => {
              const rowKey = e.document || e.email || `${e.typeId || "ID"}-${i}`;
              const nombre = `${e.name ?? ""} ${e.surname ?? ""}`.trim() || "—";
              const age = (typeof e.age === "number" ? e.age : calcAge?.(e.birthDate)) || "—";

              const doc = encodeURIComponent(e.document || "");
              const href = e.document ? `/empleados/listaEmpleados/editarEmpleados/?doc=${doc}` : "#";

              return (
                <TableRow key={rowKey} hover>
                  <TableCell>{nombre}</TableCell>
                  <TableCell>{e.phone || "—"}</TableCell>
                  <TableCell>{e.typeId || "—"}</TableCell>
                  <TableCell>{e.document || "—"}</TableCell>
                  <TableCell>{e.email || "—"}</TableCell>

                  <TableCell>{e.birthDate || "—"}</TableCell>
                  <TableCell>{age}</TableCell>

                  <TableCell>{e.addressResidence || "—"}</TableCell>
                  <TableCell>{e.city || "—"}</TableCell>

                  <TableCell>{e.position || "—"}</TableCell>
                  <TableCell>{e.contractType || "—"}</TableCell>

                  <TableCell>{e.eps || "—"}</TableCell>
                  <TableCell>{e.pensionFund || "—"}</TableCell>

                  <TableCell>{e.emergencyContact || "—"}</TableCell>

                  <TableCell>{e.bankName || "—"}</TableCell>
                  <TableCell>{e.bankAccountNumber || "—"}</TableCell>

                  <TableCell>{e.entryDate || "—"}</TableCell>
                  <TableCell>{e.exitDate || "—"}</TableCell>
                  <TableCell>{e.arlEntryDate || "—"}</TableCell>

                  <TableCell>{e.comments || "—"}</TableCell>

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

                  <TableCell className="emp-actions-cell">
                    <Tooltip title="Editar">
                      <span>
                        {e.document ? (
                          <Link
                            href={href}
                            className="emp-row-icon-btn"
                            aria-label="Editar"
                            onClick={() => {
                              try {
                                sessionStorage.setItem("emp_edit", JSON.stringify(e));
                              } catch {}
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="emp-row-icon-btn"
                            onClick={() => alert("No se encontró el documento del empleado para editar.")}
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
            })
          ) : (
            <TableRow>
              <TableCell colSpan={EMP_TABLE_HEADERS.length} align="center" style={{ color: "#666", padding: "24px 16px" }}>
                {hasAnyFilter ? "No se encontraron empleados que coincidan con los filtros" : "No hay empleados para mostrar"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
