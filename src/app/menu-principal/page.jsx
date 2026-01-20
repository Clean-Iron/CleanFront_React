'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@/styles/MenuPrincipal.css';

const MenuPrincipal = () => {
  const router = useRouter();

  // ✅ NUEVO: panel notif/tareas
  const [ntOpen, setNtOpen] = useState(false);
  const [ntTab, setNtTab] = useState('notificaciones'); // 'notificaciones' | 'tareas'

  // ✅ (placeholder) listas: luego las conectas a tu API
  const notifications = useMemo(
    () => [
      { id: 1, title: 'Servicio asignado', detail: 'Agenda creada para 2026-01-18', time: 'Hoy' },
      { id: 2, title: 'Pago pendiente', detail: 'Cliente 0000000004', time: 'Ayer' },
    ],
    []
  );

  const tasks = useMemo(
    () => [
      { id: 1, title: 'Confirmar disponibilidad', done: false },
      { id: 2, title: 'Revisar migración a Postgres', done: true },
    ],
    []
  );

  const notifCount = notifications.length;
  const pendingTasks = tasks.filter(t => !t.done).length;

  const handleLogout = useCallback(() => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error limpiando localStorage:', e);
    }
    router.replace('/?reason=logout');
  }, [router]);

  return (
    <div className="menu-wrapper">
      {/* Botón cerrar sesión */}
      <button className="menu-logout-btn" type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>

      <div className="menu-grid">
        {/* WhatsApp */}
        <button className="menu-card" onClick={() => {}}>
          <svg width="30" height="30" viewBox="0 0 24 24" className="menu-icon whatsapp">
            <path d="M19.001 4.908A9.817 9.817 0 0 0 11.992 2C6.534 2 2.085 6.448 2.08 11.908c0 
              1.748.458 3.45 1.321 4.956L2 22l5.255-1.377a9.916 9.916 0 0 0 
              4.737 1.206h.005c5.46 0 9.908-4.448 9.913-9.913A9.872 9.872 0 0 0 
              19 4.908h.001ZM11.992 20.15A8.216 8.216 0 0 1 7.797 19l-.3-.18-3.117.818.833-3.041-.196-.314a8.2 
              8.2 0 0 1-1.258-4.381c0-4.533 3.696-8.23 8.239-8.23a8.2 8.2 
              0 0 1 5.825 2.413 8.196 8.196 0 0 1 
              2.41 5.825c-.006 4.55-3.702 8.24-8.24 8.24Zm4.52-6.167c-.247-.124-1.463-.723-1.692-.808-.228-.08-.394-.123-.556.124-.166.246-.641.808-.784.969-.143.166-.29.185-.537.062-.247-.125-1.045-.385-1.99-1.23-.738-.657-1.232-1.47-1.38-1.716-.142-.247-.013-.38.11-.504.11-.11.247-.29.37-.432.126-.143.167-.248.248-.413.082-.167.043-.31-.018-.433-.063-.124-.557-1.345-.765-1.838-.2-.486-.404-.419-.557-.425-.142-.009-.309-.009-.475-.009a.911.911 0 0 0-.661.31c-.228.247-.864.845-.864 2.067 0 1.22.888 2.395 1.013 2.56.122.167 1.742 2.666 4.229 3.74.587.257 1.05.408 1.41.523.595.19 1.13.162 1.558.1.475-.072 1.464-.6 1.673-1.178.205-.58.205-1.075.142-1.18-.061-.104-.227-.165-.475-.29Z"/>
          </svg>
          <span className="menu-label">WhatsApp</span>
        </button>

        {/* Servicios */}
        <Link href="/servicios" className="menu-card">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="menu-icon calendario">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 
                 18.75V7.5a2.25 2.25 0 0 1 
                 2.25-2.25h13.5A2.25 2.25 0 
                 0 1 21 7.5v11.25m-18 
                 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 
                 2.25 0 0 0 21 18.75m-18 
                 0v-7.5A2.25 2.25 0 0 1 5.25 
                 9h13.5A2.25 2.25 0 0 1 
                 21 11.25v7.5"/>
          </svg>
          <span className="menu-label">Servicios</span>
        </Link>

        {/* Clientes */}
        <Link href="/clientes" className="menu-card">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="menu-icon clientes">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 
                 0 2.625.372 9.337 9.337 0 
                 0 0 4.121-.952 4.125 4.125 
                 0 0 0-7.533-2.493M15 
                 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 
                 19.128v.106A12.318 12.318 0 
                 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001
                 -.109a6.375 6.375 0 0 1 
                 11.964-3.07M12 6.375a3.375 
                 3.375 0 1 1-6.75 0 3.375 
                 3.375 0 0 1 6.75 0Zm8.25 
                 2.25a2.625 2.625 0 1 1-5.25 0 
                 2.625 2.625 0 0 1 5.25 0Z"/>
          </svg>
          <span className="menu-label">Clientes</span>
        </Link>

        {/* Empleados */}
        <Link href="/empleados" className="menu-card">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="menu-icon empleados">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 
                 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 
                 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 
                 0 0 1-.75.75H9a.75.75 0 0 
                 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 
                 0c.646.049 1.288.11 1.927.184 1.1.128 
                 1.907 1.077 1.907 2.185V19.5a2.25 
                 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 
                 0 1 4.5 19.5V6.257c0-1.108.806-2.057 
                 1.907-2.185a48.208 48.208 0 0 
                 1 1.927-.184"/>
          </svg>
          <span className="menu-label">Empleados</span>
        </Link>
      </div>

      {/* ✅ NUEVO: Botón flotante inferior izquierdo */}
      <button
        type="button"
        className="nt-fab"
        onClick={() => setNtOpen((v) => !v)}
        aria-expanded={ntOpen}
        aria-controls="nt-panel"
        title="Notificaciones y tareas"
      >
        <span className="nt-fab-icon">🔔</span>
        <span className="nt-fab-text">Alertas</span>
        {(notifCount + pendingTasks) > 0 && (
          <span className="nt-badge">{notifCount + pendingTasks}</span>
        )}
      </button>

      {/* ✅ NUEVO: Panel */}
      {ntOpen && (
        <div id="nt-panel" className="nt-panel" role="dialog" aria-label="Notificaciones y tareas">
          <div className="nt-head">
            <div className="nt-tabs">
              <button
                type="button"
                className={`nt-tab ${ntTab === 'notificaciones' ? 'is-active' : ''}`}
                onClick={() => setNtTab('notificaciones')}
              >
                Notificaciones <span className="nt-tab-count">{notifCount}</span>
              </button>
              <button
                type="button"
                className={`nt-tab ${ntTab === 'tareas' ? 'is-active' : ''}`}
                onClick={() => setNtTab('tareas')}
              >
                Tareas <span className="nt-tab-count">{pendingTasks}</span>
              </button>
            </div>

            <button type="button" className="nt-close" onClick={() => setNtOpen(false)} aria-label="Cerrar">
              ✕
            </button>
          </div>

          <div className="nt-body">
            {ntTab === 'notificaciones' ? (
              notifications.length === 0 ? (
                <div className="nt-empty">No hay notificaciones.</div>
              ) : (
                <div className="nt-list">
                  {notifications.map((n) => (
                    <div key={n.id} className="nt-item">
                      <div className="nt-item-title">{n.title}</div>
                      <div className="nt-item-detail">{n.detail}</div>
                      <div className="nt-item-time">{n.time}</div>
                    </div>
                  ))}
                </div>
              )
            ) : tasks.length === 0 ? (
              <div className="nt-empty">No hay tareas.</div>
            ) : (
              <div className="nt-list">
                {tasks.map((t) => (
                  <div key={t.id} className="nt-item nt-item--task">
                    <span className={`nt-dot ${t.done ? 'is-done' : ''}`} />
                    <div className="nt-item-title">{t.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nt-foot">
            <button type="button" className="nt-action" onClick={() => alert('Luego conectamos esto a tu API 🙂')}>
              Marcar como leído / hecho
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPrincipal;
