'use client';
import React, { useMemo } from 'react';
import '@/styles/Servicios/Disponibilidad/ModalAsignacion.css';

const toMin = (hhmmss) => {
    if (!hhmmss) return 0;
    const [h, m, s] = hhmmss.split(':').map(Number);
    return (h || 0) * 60 + (m || 0) + Math.floor((s || 0) / 60);
};
const toHHMM = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

function mergeBusy(intervals, jStart, jEnd) {
    const arr = (intervals || [])
        .map(({ start, end }) => ({
            start: Math.max(start, jStart),
            end: Math.min(end, jEnd),
        }))
        .filter(iv => iv.end > iv.start)
        .sort((a, b) => a.start - b.start);

    if (!arr.length) return [];
    const merged = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
        const prev = merged[merged.length - 1];
        const cur = arr[i];
        if (cur.start <= prev.end) prev.end = Math.max(prev.end, cur.end);
        else merged.push(cur);
    }
    return merged;
}

function buildFree(busy, jStart, jEnd) {
    const free = [];
    if (!busy.length) {
        if (jEnd > jStart) free.push({ start: jStart, end: jEnd });
        return free;
    }
    let prev = jStart;
    for (const iv of busy) {
        if (iv.start > prev) free.push({ start: prev, end: iv.start });
        prev = Math.max(prev, iv.end);
    }
    if (jEnd > prev) free.push({ start: prev, end: jEnd });
    return free;
}

const ModalEspaciosServicios = ({
    show,
    onClose,
    date,
    entries = [],
    workdayStart = '06:00:00',
    workdayEnd = '17:00:00',
}) => {
    if (!show) return null;

    const jStart = useMemo(() => toMin(workdayStart), [workdayStart]);
    const jEnd = useMemo(() => toMin(workdayEnd), [workdayEnd]);
    const jTotal = Math.max(1, jEnd - jStart);

    const prepared = useMemo(() => {
        return (entries || []).map(({ employee, busy = [] }) => {
            const busyMin = busy.map(b => ({
                start: toMin(b.startHour),
                end: toMin(b.endHour),
            }));
            const mergedBusy = mergeBusy(busyMin, jStart, jEnd);
            const free = buildFree(mergedBusy, jStart, jEnd);

            const segments = [];
            if (!mergedBusy.length) {
                segments.push({ kind: 'free', start: jStart, end: jEnd });
            } else {
                let cursor = jStart;
                for (const b of mergedBusy) {
                    if (b.start > cursor) segments.push({ kind: 'free', start: cursor, end: b.start });
                    segments.push({ kind: 'busy', start: b.start, end: b.end });
                    cursor = b.end;
                }
                if (cursor < jEnd) segments.push({ kind: 'free', start: cursor, end: jEnd });
            }

            return { employee, mergedBusy, free, segments };
        });
    }, [entries, jStart, jEnd]);

    const hourLabels = useMemo(() => {
        const labels = [toHHMM(jStart)]; // inicio una vez
        const startH = Math.ceil(jStart / 60);
        const endH = Math.floor(jEnd / 60);

        // horas completas estrictamente entre inicio y fin
        for (let h = startH; h <= endH; h++) {
            const hh = `${String(h).padStart(2, '0')}:00`;
            if (hh !== labels[0]) labels.push(hh); // evita repetir el inicio
        }

        const endLabel = toHHMM(jEnd);
        if (labels[labels.length - 1] !== endLabel) {
            labels.push(endLabel); // agrega el fin si hace falta
        }

        return labels;
    }, [jStart, jEnd]);

    return (
        <div className="modal-overlay">
            <div className="modal-container modal-espacios-servicios">
                <div className="mess-header">
                    
                    <button className="mess-close" onClick={onClose} aria-label="Cerrar">×</button>
                </div>

                <div className="mess-content">
                    {prepared.map(({ employee, mergedBusy, free, segments }) => (
                        <div className="mess-employee-block" key={employee?.document ?? Math.random()}>
                            <h3 className="mess-employee-name">
                                {employee?.name} {employee?.surname} <span className="doc">({employee?.document})</span>
                            </h3>

                            <div className="timeline">
                                <div className="timeline-bar">
                                    {segments.map((seg, idx) => {
                                        const widthPct = ((seg.end - seg.start) / jTotal) * 100;
                                        return (
                                            <span
                                                key={idx}
                                                className={`segment ${seg.kind}`}
                                                style={{ width: `${widthPct}%` }}
                                                title={`${seg.kind === 'free' ? 'Libre' : 'Asignado'}: ${toHHMM(seg.start)}–${toHHMM(seg.end)}`}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Escala en flex para evitar solapamiento */}
                                <div className="timeline-scale">
                                    {hourLabels.map((txt, i) => (
                                        <span className="tick" key={`${txt}-${i}`}>{txt}</span>
                                    ))}
                                </div>

                                <div className="timeline-legend">
                                    <span className="legend-item"><i className="swatch free" /> Disponible</span>
                                    <span className="legend-item"><i className="swatch busy" /> Asignado</span>
                                </div>
                            </div>

                            {/* Se eliminó la sección "Espacios disponibles" como pediste */}

                            {mergedBusy.length > 0 && (
                                <details className="mess-busy-details">
                                    <summary>Ver espacios asignados</summary>
                                    <ul className="busy-list">
                                        {mergedBusy.map((b, i) => (
                                            <li key={i}>{toHHMM(b.start)} – {toHHMM(b.end)}</li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModalEspaciosServicios;
