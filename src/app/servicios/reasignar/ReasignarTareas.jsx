'use client';

import React, { useMemo, useState } from 'react';
import { useEmployees, useEmployeeMonthServices } from '@/lib/Hooks';
import '@/styles/Servicios/ReasignarServicios/ReasignarServicios.css';

const monthOptions = [
  { v: 1, t: 'Enero' },
  { v: 2, t: 'Febrero' },
  { v: 3, t: 'Marzo' },
  { v: 4, t: 'Abril' },
  { v: 5, t: 'Mayo' },
  { v: 6, t: 'Junio' },
  { v: 7, t: 'Julio' },
  { v: 8, t: 'Agosto' },
  { v: 9, t: 'Septiembre' },
  { v: 10, t: 'Octubre' },
  { v: 11, t: 'Noviembre' },
  { v: 12, t: 'Diciembre' },
];

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const buildEmployeeLabel = (e) => {
  const full = `${e?.name || ''} ${e?.surname || ''}`.trim();
  return full || 'Empleado';
};

const formatDoc = (doc) => (doc ? String(doc) : '');

const monthText = (m) => monthOptions.find((x) => x.v === Number(m))?.t || String(m || '');

const ReasignarServicios = () => {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;

  // Mes ORIGEN
  const [originYear, setOriginYear] = useState(nowYear);
  const [originMonth, setOriginMonth] = useState(nowMonth);

  // Mes DESTINO (maneja rollover)
  const initTarget = (() => {
    const next = nowMonth + 1;
    if (next <= 12) return { y: nowYear, m: next };
    return { y: nowYear + 1, m: 1 };
  })();
  const [targetYear, setTargetYear] = useState(initTarget.y);
  const [targetMonth, setTargetMonth] = useState(initTarget.m);

  // Lista empleados (izquierda)
  const [qEmp, setQEmp] = useState('');
  const [selectedDocs, setSelectedDocs] = useState(() => new Set());

  // Vista (tabla derecha)
  const [previewDoc, setPreviewDoc] = useState('');
  const previewServices = useEmployeeMonthServices(previewDoc, originYear, originMonth);

  // Renuncia / reemplazo (colapsable)
  const [transferFromDoc, setTransferFromDoc] = useState('');
  const [transferToDoc, setTransferToDoc] = useState('');

  // Hook empleados
  const emp = useEmployees();

  // Solo activos
  const activeEmployeesOnly = useMemo(() => {
    return (emp.employees || []).filter((e) => e?.state === true);
  }, [emp.employees]);

  const filteredEmployees = useMemo(() => {
    const q = qEmp.trim().toLowerCase();
    const base = activeEmployeesOnly;
    if (!q) return base;

    return base.filter((e) => {
      const name = buildEmployeeLabel(e).toLowerCase();
      const doc = (e.document || '').toLowerCase();
      return name.includes(q) || doc.includes(q);
    });
  }, [activeEmployeesOnly, qEmp]);

  const toggleEmployee = (doc) => {
    const d = formatDoc(doc);
    if (!d) return;

    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  const pickPreview = (doc) => {
    const d = formatDoc(doc);
    if (!d) return;
    setPreviewDoc(d);
    setSelectedDocs((prev) => new Set([...prev, d]));
  };

  const selectedCount = selectedDocs.size;

  const kpis = useMemo(() => {
    const total = previewServices.services?.length || 0;
    return { total };
  }, [previewServices.services]);

  const onClear = () => {
    setSelectedDocs(new Set());
    setQEmp('');
    setPreviewDoc('');
    setTransferFromDoc('');
    setTransferToDoc('');
  };

  // Payloads clonación (uno por empleado seleccionado)
  const buildClonePayloads = () => {
    const docs = Array.from(selectedDocs);

    return docs.map((doc) => ({
      originEmployeeDoc: doc,
      originYear,
      originMonth,
      targetYear,
      targetMonth,
      targetEmployeeDocs: [doc],
      replaceEmployees: true,
      skipIfBusinessKeyExists: true,
    }));
  };

  // Payload renuncia/reemplazo
  const buildTransferPayload = () => {
    if (!transferFromDoc || !transferToDoc) return null;

    return {
      originEmployeeDoc: transferFromDoc,
      originYear,
      originMonth,
      targetYear,
      targetMonth,
      targetEmployeeDocs: [transferToDoc],
      replaceEmployees: true,
      skipIfBusinessKeyExists: true,
    };
  };

  const onCloneSelected = () => {
    const payloads = buildClonePayloads();
    console.log('Payloads CLONAR (uno por empleado):', payloads);
  };

  const onTransfer = () => {
    const payload = buildTransferPayload();
    console.log('Payload REASIGNAR (renuncia/reemplazo):', payload);
  };

  const transferReady = Boolean(transferFromDoc && transferToDoc);
  const cloneReady = selectedCount > 0;

  const transferToOptions = useMemo(() => {
    const from = formatDoc(transferFromDoc);
    return activeEmployeesOnly.filter((e) => formatDoc(e.document) !== from);
  }, [activeEmployeesOnly, transferFromDoc]);

  const originLabel = `${originYear} / ${monthText(originMonth)}`;
  const targetLabel = `${targetYear} / ${monthText(targetMonth)}`;

  const summary = useMemo(() => {
    // Esto es resumen UI (no “cálculo real” de todos los empleados, porque no cargamos todos los meses de todos)
    const viewCount = previewDoc ? (kpis.total || 0) : 0;
    return {
      selectedCount,
      originLabel,
      targetLabel,
      previewDoc,
      viewCount,
    };
  }, [selectedCount, originLabel, targetLabel, previewDoc, kpis.total]);

  return (
    <div className="container">
      <div className="rm-root">
        <div className="rm-shell">
          {/* IZQUIERDA (solo empleados, ocupa todo el alto) */}
          <div className="rm-left">
            <div className="rm-card rm-card--employees">
              <div className="rm-card__head">
                <h3>Empleados (activos)</h3>
                <span className="rm-pill">{selectedCount} seleccionados</span>
              </div>

              <div className="rm-search">
                <input
                  value={qEmp}
                  onChange={(e) => setQEmp(e.target.value)}
                  placeholder="Buscar por nombre o documento…"
                />
              </div>

              <div className="rm-emp-list">
                {emp.isLoading ? (
                  <div className="rm-empty">Cargando empleados…</div>
                ) : emp.isError ? (
                  <div className="rm-empty">No se pudieron cargar empleados.</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="rm-empty">Sin resultados (solo se muestran activos).</div>
                ) : (
                  filteredEmployees.map((e) => {
                    const doc = formatDoc(e.document);
                    const checked = selectedDocs.has(doc);
                    const isPreview = previewDoc === doc;

                    return (
                      <div
                        key={doc}
                        className={`rm-emp-row ${checked ? 'is-checked' : ''}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleEmployee(doc)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === ' ') toggleEmployee(doc);
                        }}
                        title="Click: seleccionar"
                      >
                        <span className={`rm-check ${checked ? 'is-on' : ''}`} />

                        <div className="rm-emp-meta" style={{ flex: 1, minWidth: 0 }}>
                          <div className="rm-emp-name">
                            {buildEmployeeLabel(e)}{' '}
                            {isPreview ? <span className="rm-badge rm-badge--target">Vista</span> : null}
                          </div>
                          <div className="rm-emp-doc">Documento: {doc}</div>
                        </div>

                        <button
                          type="button"
                          className="rm-emp-view"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            pickPreview(doc);
                          }}
                          title="Ver servicios (carga a la derecha)"
                        >
                          Ver
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* DERECHA (dos cuadros apilados) */}
          <div className="rm-right">
            <div className="rm-right-top">
              {/* Cuadro 1: Vista */}
              <div className="rm-card rm-card--services">
                <div className="rm-right-head">
                  <div className="rm-right-title">
                    <h2>Servicios (vista)</h2>
                    <div className="rm-sub">
                      Usa el botón “Ver” (en la izquierda) para cargar los servicios del mes origen.
                    </div>
                  </div>
                  <span className="rm-pill">{previewDoc ? `Doc: ${previewDoc}` : 'Sin vista'}</span>
                </div>

                <div className="rm-kpis">
                  <span>
                    Servicios (vista): <b>{summary.viewCount}</b>
                  </span>
                  <span className="rm-muted">Estado: PROGRAMADA / COMPLETADA</span>
                  <span className="rm-muted">Mes origen: {originLabel}</span>
                </div>

                {!previewDoc ? (
                  <div className="rm-empty">Selecciona “Ver” en un empleado para cargar su agenda.</div>
                ) : previewServices.isLoading ? (
                  <div className="rm-empty">Cargando servicios…</div>
                ) : previewServices.isError ? (
                  <div className="rm-empty">No se pudieron cargar servicios de este empleado.</div>
                ) : (previewServices.services?.length || 0) === 0 ? (
                  <div className="rm-empty">No hay servicios para el mes origen seleccionado.</div>
                ) : (
                  <div className="rm-table-wrap">
                    <table className="rm-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Cliente</th>
                          <th>Horario</th>
                          <th>Ciudad</th>
                          <th>Dirección</th>
                          <th>Servicios</th>
                          <th>Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {previewServices.services.map((s) => {
                          const st = String(s.state || '').toUpperCase();
                          const isOk = st === 'PROGRAMADA' || st === 'COMPLETADA';

                          const servicesText = Array.isArray(s.services)
                            ? s.services.map((x) => x?.serviceDescription).filter(Boolean).join(', ')
                            : '';

                          const clientName =
                            s.clientCompleteName ||
                            `${s.clientName || ''} ${s.clientSurname || ''}`.trim() ||
                            'Cliente';

                          return (
                            <tr key={`${s.id}-${s.serviceDate}-${s.startHour}-${s.clientDocument}`}>
                              <td>
                                <div className="rm-cell-main">
                                  <span className="rm-badge rm-badge--date">{String(s.serviceDate || '')}</span>
                                </div>
                              </td>

                              <td>
                                <div className="rm-cell-main">
                                  <span className="rm-badge rm-badge--blue">{clientName}</span>
                                </div>
                                <div className="rm-cell-sub">{s.clientDocument ? `Doc: ${s.clientDocument}` : ''}</div>
                              </td>

                              <td>
                                <div className="rm-cell-main">
                                  <span className="rm-badge rm-badge--gray">
                                    {String(s.startHour || '').slice(0, 5) || '--:--'} –{' '}
                                    {String(s.endHour || '').slice(0, 5) || '--:--'}
                                  </span>
                                  <span className="rm-badge rm-badge--gray">
                                    {Number.isFinite(s.totalServiceHours)
                                      ? `${s.totalServiceHours.toFixed(1)}h`
                                      : '0.0h'}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <span className="rm-badge rm-badge--gray">{s.city || '—'}</span>
                              </td>

                              <td>
                                <div className="rm-cell-sub rm-addr" style={{ fontWeight: 800 }}>
                                  {s.addressService || '—'}
                                </div>
                              </td>

                              <td>
                                <div className="rm-cell-sub rm-services" style={{ fontWeight: 800 }}>
                                  {servicesText || '—'}
                                </div>
                              </td>

                              <td>
                                <span className={`rm-chip ${isOk ? 'rm-chip--ok' : 'rm-chip--bad'}`}>
                                  {st || '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Cuadro 2: Opción A (resumen + acciones) */}
              <div className="rm-card rm-card--reassign">
                <div className="rm-reassign-body">
                  <div className="rm-reassign-grid">
                    <div className="rm-field">
                      <label>Mes origen (Año / Mes)</label>
                      <div className="rm-inline">
                        <input
                          type="number"
                          value={originYear}
                          onChange={(e) => setOriginYear(toNum(e.target.value) || nowYear)}
                          min={2000}
                          max={2100}
                        />
                        <select value={originMonth} onChange={(e) => setOriginMonth(Number(e.target.value))}>
                          {monthOptions.map((m) => (
                            <option key={m.v} value={m.v}>
                              {m.t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="rm-field">
                      <label>Mes destino (Año / Mes)</label>
                      <div className="rm-inline">
                        <input
                          type="number"
                          value={targetYear}
                          onChange={(e) => setTargetYear(toNum(e.target.value) || nowYear)}
                          min={2000}
                          max={2100}
                        />
                        <select value={targetMonth} onChange={(e) => setTargetMonth(Number(e.target.value))}>
                          {monthOptions.map((m) => (
                            <option key={m.v} value={m.v}>
                              {m.t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rm-summary">
                    <div className="rm-summary-title">Resumen</div>
                    <div className="rm-summary-grid">
                      <div>
                        <div className="rm-summary-k">Seleccionados</div>
                        <div className="rm-summary-v">{summary.selectedCount}</div>
                      </div>

                      <div>
                        <div className="rm-summary-k">Origen</div>
                        <div className="rm-summary-v">{summary.originLabel}</div>
                      </div>

                      <div>
                        <div className="rm-summary-k">Destino</div>
                        <div className="rm-summary-v">{summary.targetLabel}</div>
                      </div>

                      <div>
                        <div className="rm-summary-k">Vista</div>
                        <div className="rm-summary-v">
                          {summary.previewDoc ? `Doc ${summary.previewDoc} (${summary.viewCount} servicios)` : 'Sin vista'}
                        </div>
                      </div>
                    </div>

                    <div className="rm-summary-note">
                      Este resumen usa la “vista” cargada para referencia. La operación real se ejecuta sobre los empleados
                      seleccionados.
                    </div>
                  </div>

                  <div className="rm-actions rm-actions--row">
                    <button type="button" className="rm-btn" onClick={onClear}>
                      Limpiar
                    </button>

                    <button
                      type="button"
                      className="rm-btn rm-btn--primary"
                      disabled={!cloneReady}
                      onClick={onCloneSelected}
                      title={!cloneReady ? 'Selecciona al menos un empleado' : 'Generar payloads de clonación'}
                    >
                      Clonar seleccionados
                    </button>

                    <button
                      type="button"
                      className="rm-btn rm-btn--danger"
                      disabled={!transferReady}
                      onClick={onTransfer}
                      title={!transferReady ? 'Completa origen y destino en Renuncia/Reemplazo' : 'Generar payload de traspaso'}
                    >
                      Reasignar (renuncia / reemplazo)
                    </button>
                  </div>

                  <details className="rm-details">
                    <summary className="rm-details-summary">Renuncia / reemplazo</summary>

                    <div className="rm-transfer-body" style={{ padding: 0 }}>
                      <div className="rm-transfer-sub">
                        Selecciona empleado origen y empleado destino. Esto genera 1 payload de traspaso.
                      </div>

                      <div className="rm-transfer-grid">
                        <div className="rm-field">
                          <label>Empleado origen</label>
                          <select
                            value={transferFromDoc}
                            onChange={(e) => {
                              const v = formatDoc(e.target.value);
                              setTransferFromDoc(v);
                              if (formatDoc(transferToDoc) === v) setTransferToDoc('');
                            }}
                          >
                            <option value="">— Selecciona —</option>
                            {activeEmployeesOnly.map((e) => {
                              const doc = formatDoc(e.document);
                              return (
                                <option key={doc} value={doc}>
                                  {buildEmployeeLabel(e)} — {doc}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="rm-field">
                          <label>Empleado destino</label>
                          <select value={transferToDoc} onChange={(e) => setTransferToDoc(formatDoc(e.target.value))}>
                            <option value="">— Selecciona —</option>
                            {transferToOptions.map((e) => {
                              const doc = formatDoc(e.document);
                              return (
                                <option key={doc} value={doc}>
                                  {buildEmployeeLabel(e)} — {doc}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      <div className="rm-transfer-hint">
                        El botón <b>Reasignar (renuncia / reemplazo)</b> usará esta selección.
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div className="rm-right-bottom-spacer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasignarServicios;
