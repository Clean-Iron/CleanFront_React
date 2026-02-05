'use client';

import React, { useMemo, useState } from 'react';
import { useEmployees } from '@/lib/Hooks';
import '@/styles/Servicios/ReasignarServicios/ReasignarServicios.css';
import { reasignarServicios } from '@/lib/Logic';

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

// Helpers para mostrar errores de axios/safeApi
const errStatus = (e) => e?.response?.status || e?.status || null;
const errMsg = (e) => {
  const data = e?.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    return data?.message || data?.error || data?.title || JSON.stringify(data);
  }
  return e?.message || 'Error desconocido';
};

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

  // Renuncia / reemplazo
  const [transferFromDoc, setTransferFromDoc] = useState('');
  const [transferToDoc, setTransferToDoc] = useState('');

  // Bloqueos anti doble clic / estado de ejecución
  const [isCloning, setIsCloning] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Alert UI
  const [uiAlert, setUiAlert] = useState(null); // {type:'info'|'success'|'error', text:string}

  // Reportes UI
  const [cloneReport, setCloneReport] = useState(null); // { meta, ok[], fail[] }
  const [transferReport, setTransferReport] = useState(null);

  // Hook empleados
  const emp = useEmployees();

  // Solo activos
  const activeEmployeesOnly = useMemo(() => {
    return (emp.employees || []).filter((e) => e?.state === true);
  }, [emp.employees]);

  // doc -> empleado
  const employeeByDoc = useMemo(() => {
    const m = new Map();
    (emp.employees || []).forEach((e) => {
      const d = formatDoc(e?.document);
      if (d) m.set(d, e);
    });
    return m;
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

  const isBusy = isCloning || isTransferring;

  const toggleEmployee = (doc) => {
    if (isBusy) return; // bloqueo durante ejecución
    const d = formatDoc(doc);
    if (!d) return;

    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  const selectedCount = selectedDocs.size;

  const onClear = () => {
    if (isBusy) return; // no permitir limpiar mientras corre
    setSelectedDocs(new Set());
    setQEmp('');
    setTransferFromDoc('');
    setTransferToDoc('');
    setUiAlert(null);
    setCloneReport(null);
    setTransferReport(null);
  };

  const onClearResults = () => {
    if (isBusy) return;
    setUiAlert(null);
    setCloneReport(null);
    setTransferReport(null);
  };

  // Payloads clonación (1 por empleado)
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

  // Payload renuncia/reemplazo (1 solo payload)
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

  const transferReady = Boolean(transferFromDoc && transferToDoc);
  const cloneReady = selectedCount > 0;

  const transferToOptions = useMemo(() => {
    const from = formatDoc(transferFromDoc);
    return activeEmployeesOnly.filter((e) => formatDoc(e.document) !== from);
  }, [activeEmployeesOnly, transferFromDoc]);

  const originLabel = `${originYear} / ${monthText(originMonth)}`;
  const targetLabel = `${targetYear} / ${monthText(targetMonth)}`;

  const summary = useMemo(() => {
    return { selectedCount, originLabel, targetLabel };
  }, [selectedCount, originLabel, targetLabel]);

  // UI components internos
  const AlertBox = ({ alert }) => {
    if (!alert) return null;
    return (
      <div className={`rm-alert rm-alert--${alert.type}`}>
        <div className="rm-alert__title">
          {alert.type === 'success' ? 'Éxito' : alert.type === 'error' ? 'Error' : 'Info'}
        </div>
        <div className="rm-alert__text">{alert.text}</div>
      </div>
    );
  };

  const ResultsBox = ({ title, report }) => {
    if (!report) return null;

    const ok = report.ok || [];
    const fail = report.fail || [];
    const meta = report.meta || {};

    return (
      <div className="rm-results">
        <div className="rm-results__head">
          <div className="rm-results__title">{title}</div>
          <div className="rm-results__chips">
            {'total' in meta && (
              <span className="rm-chip">
                Total: <b>{meta.total}</b>
              </span>
            )}
            <span className="rm-chip">
              OK: <b>{ok.length}</b>
            </span>
            <span className="rm-chip">
              Fallidos: <b>{fail.length}</b>
            </span>
          </div>
        </div>

        <div className="rm-results__meta">
          <span className="rm-chip">Origen: <b>{meta.originLabel}</b></span>
          <span className="rm-chip">Destino: <b>{meta.targetLabel}</b></span>
        </div>

        {ok.length > 0 && (
          <div className="rm-results__block">
            <div className="rm-results__subtitle">✅ Pasaron</div>
            <div className="rm-results__list">
              {ok.map((x) => (
                <div className="rm-item rm-item--ok" key={`ok-${x.doc}-${x.name}`}>
                  <div className="rm-item__main">
                    <b>{x.name}</b> — {x.doc}
                  </div>

                  {x.movedTo && (
                    <div className="rm-item__sub">
                      → <b>{x.movedTo.name}</b> — {x.movedTo.doc}
                    </div>
                  )}

                  {x.data && (
                    <pre className="rm-item__pre">{JSON.stringify(x.data, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {fail.length > 0 && (
          <div className="rm-results__block">
            <div className="rm-results__subtitle">❌ Fallaron</div>
            <div className="rm-results__list">
              {fail.map((x) => (
                <div className="rm-item rm-item--fail" key={`fail-${x.doc}-${x.name}`}>
                  <div className="rm-item__main">
                    <b>{x.name}</b> — {x.doc}
                  </div>

                  {x.movedTo && (
                    <div className="rm-item__sub">
                      → <b>{x.movedTo.name}</b> — {x.movedTo.doc}
                    </div>
                  )}

                  <div className="rm-item__err">
                    {x.status ? <b>HTTP {x.status}</b> : <b>Error</b>}: {x.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Acciones
  const onCloneSelected = async () => {
    if (isCloning) return; // anti doble clic

    if (!cloneReady) {
      setUiAlert({ type: 'error', text: 'Selecciona al menos un empleado para clonar.' });
      return;
    }

    const okConfirm = window.confirm(
      `Vas a CLONAR ${selectedCount} empleado(s) desde ${originLabel} hacia ${targetLabel}. ¿Continuar?`
    );
    if (!okConfirm) return;

    setIsCloning(true);
    setUiAlert({ type: 'info', text: 'Procesando clonación…' });
    setCloneReport(null);

    const payloads = buildClonePayloads();

    try {
      const results = await Promise.allSettled(payloads.map((p) => reasignarServicios(p)));

      const ok = [];
      const fail = [];

      results.forEach((r, idx) => {
        const p = payloads[idx];
        const doc = formatDoc(p?.originEmployeeDoc);
        const e = employeeByDoc.get(doc);
        const name = e ? buildEmployeeLabel(e) : 'Empleado';

        if (r.status === 'fulfilled') {
          ok.push({ doc, name, data: r.value ?? null });
        } else {
          fail.push({
            doc,
            name,
            status: errStatus(r.reason),
            message: errMsg(r.reason),
          });
        }
      });

      setCloneReport({
        meta: { originLabel, targetLabel, total: payloads.length },
        ok,
        fail,
      });

      if (fail.length === 0) {
        setUiAlert({ type: 'success', text: `Clonación completada: ${ok.length} OK, 0 fallidos.` });
      } else {
        setUiAlert({ type: 'error', text: `Clonación parcial: ${ok.length} OK, ${fail.length} fallidos.` });
        window.alert(`Clonación parcial:\nOK: ${ok.length}\nFallidos: ${fail.length}`);
      }
    } catch (e) {
      setUiAlert({ type: 'error', text: `Error general en clonación: ${errMsg(e)}` });
      window.alert(`Error general en clonación: ${errMsg(e)}`);
    } finally {
      setIsCloning(false);
    }
  };

  const onTransfer = async () => {
    if (isTransferring) return; // anti doble clic

    if (!transferReady) {
      setUiAlert({ type: 'error', text: 'Completa empleado origen y empleado destino para reasignar.' });
      return;
    }

    const okConfirm = window.confirm(`Vas a REASIGNAR desde ${originLabel} hacia ${targetLabel}. ¿Continuar?`);
    if (!okConfirm) return;

    const payload = buildTransferPayload();
    if (!payload) return;

    setIsTransferring(true);
    setUiAlert({ type: 'info', text: 'Procesando reasignación…' });
    setTransferReport(null);

    const fromDoc = formatDoc(payload.originEmployeeDoc);
    const toDoc = formatDoc(payload.targetEmployeeDocs?.[0]);

    const fromEmp = employeeByDoc.get(fromDoc);
    const toEmp = employeeByDoc.get(toDoc);

    const fromName = fromEmp ? buildEmployeeLabel(fromEmp) : 'Empleado origen';
    const toName = toEmp ? buildEmployeeLabel(toEmp) : 'Empleado destino';

    try {
      const data = await reasignarServicios(payload);

      setTransferReport({
        meta: { originLabel, targetLabel },
        ok: [{ doc: fromDoc, name: fromName, movedTo: { doc: toDoc, name: toName }, data: data ?? null }],
        fail: [],
      });

      setUiAlert({ type: 'success', text: `Reasignación completada: ${fromName} → ${toName}` });
    } catch (e) {
      const msg = errMsg(e);

      setTransferReport({
        meta: { originLabel, targetLabel },
        ok: [],
        fail: [
          {
            doc: fromDoc,
            name: fromName,
            movedTo: { doc: toDoc, name: toName },
            status: errStatus(e),
            message: msg,
          },
        ],
      });

      setUiAlert({ type: 'error', text: `Reasignación fallida: ${msg}` });
      window.alert(`Reasignación fallida: ${msg}`);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="container">
      <div className="rm-root">
        <div className="rm-shell">
          {/* Empleados */}
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
                  disabled={isBusy}
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
                        title={isBusy ? 'Procesando…' : 'Click: seleccionar'}
                        aria-disabled={isBusy}
                      >
                        <span className={`rm-check ${checked ? 'is-on' : ''}`} />

                        <div className="rm-emp-meta" style={{ flex: 1, minWidth: 0 }}>
                          <div className="rm-emp-name">{buildEmployeeLabel(e)}</div>
                          <div className="rm-emp-doc">Documento: {doc}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Reasignación */}
          <div className="rm-right">
            <div className="rm-card rm-card--reassign">
              <div className="rm-reassign-body">
                <AlertBox alert={uiAlert} />

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
                        disabled={isBusy}
                      />
                      <select value={originMonth} onChange={(e) => setOriginMonth(Number(e.target.value))} disabled={isBusy}>
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
                        disabled={isBusy}
                      />
                      <select value={targetMonth} onChange={(e) => setTargetMonth(Number(e.target.value))} disabled={isBusy}>
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
                  </div>

                  <div className="rm-summary-note">La operación se ejecuta sobre los empleados seleccionados.</div>
                </div>

                <div className="rm-actions rm-actions--row">
                  <button type="button" className="rm-btn" onClick={onClear} disabled={isBusy}>
                    Limpiar
                  </button>

                  <button
                    type="button"
                    className="rm-btn rm-btn--primary"
                    disabled={!cloneReady || isBusy}
                    onClick={onCloneSelected}
                    title={!cloneReady ? 'Selecciona al menos un empleado' : isCloning ? 'Clonando…' : 'Clonar'}
                  >
                    {isCloning ? 'Clonando…' : 'Clonar'}
                  </button>

                  <button
                    type="button"
                    className="rm-btn rm-btn--danger"
                    disabled={!transferReady || isBusy}
                    onClick={onTransfer}
                    title={!transferReady ? 'Completa origen y destino en Renuncia/Reemplazo' : isTransferring ? 'Reasignando…' : 'Reasignar'}
                  >
                    {isTransferring ? 'Reasignando…' : 'Reasignar'}
                  </button>
                </div>

                <div className="rm-actions" style={{ marginTop: 2 }}>
                  <button type="button" className="rm-btn" onClick={onClearResults} disabled={isBusy}>
                    Limpiar resultados
                  </button>
                </div>

                {/* Resultados */}
                <ResultsBox title="Resultados de clonación" report={cloneReport} />
                <ResultsBox title="Resultados de reasignación" report={transferReport} />

                <div className="rm-section">
                  <div className="rm-section-title">Renuncia / reemplazo</div>

                  <div className="rm-transfer-body" style={{ padding: 0 }}>
                    <div className="rm-transfer-sub">
                      Selecciona empleado origen y empleado destino. Esto genera 1 payload de traspaso.
                    </div>

                    <div className="rm-transfer-grid">
                      <div className="rm-field">
                        <label>Empleado origen</label>
                        <select
                          value={transferFromDoc}
                          disabled={isBusy}
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
                        <select value={transferToDoc} disabled={isBusy} onChange={(e) => setTransferToDoc(formatDoc(e.target.value))}>
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
                      El botón <b>Reasignar</b> usará esta selección.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          {/* fin columna derecha */}
        </div>
      </div>
    </div>
  );
};

export default ReasignarServicios;
