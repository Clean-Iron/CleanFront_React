'use client';
import React, { useState, useMemo, useEffect } from 'react';
import '@/styles/Servicios/ResumenGeneral/CalendarioEspacios.css';
import { buscarServiciosPorMes, buscarEmpleadosByCity } from '@/lib/Logic.js';
import ModalEspaciosServicios from './ModalEspaciosServicios';

// Jornada
const WORKDAY_START = '06:00:00';
const WORKDAY_END = '17:00:00';

// Utils
function hhmmssToMinutes(hhmmss) {
    if (!hhmmss) return 0;
    const [h, m, s] = hhmmss.split(':').map(Number);
    return (h * 60) + (m || 0) + ((s || 0) / 60);
}
function mergeIntervals(intervals) {
    if (!intervals.length) return [];
    const arr = intervals.slice().sort((a, b) => a.start - b.start);
    const merged = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
        const prev = merged[merged.length - 1];
        const cur = arr[i];
        if (cur.start <= prev.end) prev.end = Math.max(prev.end, cur.end);
        else merged.push(cur);
    }
    return merged;
}
const pad2 = (n) => String(n).padStart(2, '0');

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CalendarioEspacios = ({
    city = '',
    currentMonth = null,
    currentYear = null,
}) => {
    const buttonLabels = ['DISPONIBLE', 'PERMISO/VAC'];
    const now = useMemo(() => new Date(), []);
    const year = currentYear ?? now.getFullYear();
    const month = currentMonth ?? now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Datos
    const [serviciosAsignados, setServiciosAsignados] = useState([]);
    const [employeesCity, setEmployeesCity] = useState([]);
    // { [day]: { any, h4, h5, h8 } }
    const [availabilityByDay, setAvailabilityByDay] = useState({});

    // Estado del modal
    const [showModal, setShowModal] = useState(false);
    const [modalEntries, setModalEntries] = useState([]);
    const [modalDate, setModalDate] = useState('');

    // Fetch mes
    useEffect(() => {
        const run = async () => {
            if (!city) { setServiciosAsignados([]); return; }
            try {
                const data = await buscarServiciosPorMes(city, year, month + 1);
                setServiciosAsignados(Array.isArray(data) ? data : []);
            } catch { setServiciosAsignados([]); }
        };
        run();
    }, [city, year, month]);

    // Fetch empleados ciudad
    useEffect(() => {
        const run = async () => {
            if (!city) { setEmployeesCity([]); return; }
            try {
                const data = await buscarEmpleadosByCity(city);
                setEmployeesCity(Array.isArray(data) ? data : []);
            } catch { setEmployeesCity([]); }
        };
        run();
    }, [city]);

    // Calcular slots por día (para la etiqueta "Slots: 4h/5h/8h")
    useEffect(() => {
        const jornadaStart = hhmmssToMinutes(WORKDAY_START);
        const jornadaEnd = hhmmssToMinutes(WORKDAY_END);

        const byDateByEmp = {};
        for (const srv of serviciosAsignados) {
            const d = srv.serviceDate;
            const start = Math.max(hhmmssToMinutes(srv.startHour), jornadaStart);
            const end = Math.min(hhmmssToMinutes(srv.endHour), jornadaEnd);
            if (end <= start) continue;

            if (!byDateByEmp[d]) byDateByEmp[d] = {};
            const emps = Array.isArray(srv.employees) ? srv.employees : [];
            for (const e of emps) {
                const doc = e.employeeDocument || e.document;
                if (!doc) continue;
                if (!byDateByEmp[d][doc]) byDateByEmp[d][doc] = [];
                byDateByEmp[d][doc].push({ start, end });
            }
        }

        const docsFromEmployees = employeesCity.map(e => e.document || e.employeeDocument).filter(Boolean);
        const docsFromServicios = serviciosAsignados
            .flatMap(s => (s.employees || []).map(e => e.employeeDocument))
            .filter(Boolean);
        const allDocs = new Set([...docsFromEmployees, ...docsFromServicios]);

        const counts = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const ymd = new Date(year, month, day).toISOString().slice(0, 10);
            let any = 0, h4 = 0, h5 = 0, h8 = 0;

            for (const doc of allDocs) {
                const busy = mergeIntervals((byDateByEmp[ymd]?.[doc] || []).filter(iv => iv.end > iv.start));
                const freeGaps = [];
                if (!busy.length) {
                    if (jornadaEnd > jornadaStart) freeGaps.push({ start: jornadaStart, end: jornadaEnd });
                } else {
                    let prev = jornadaStart;
                    for (const iv of busy) {
                        if (iv.start > prev) freeGaps.push({ start: prev, end: iv.start });
                        prev = Math.max(prev, iv.end);
                    }
                    if (jornadaEnd > prev) freeGaps.push({ start: prev, end: jornadaEnd });
                }
                for (const gap of freeGaps) {
                    const mins = gap.end - gap.start;
                    any += Math.floor(mins / 240);
                    h4 += Math.floor(mins / 240);
                    h5 += Math.floor(mins / 300);
                    h8 += Math.floor(mins / 480);
                }
            }
            counts[day] = { any, h4, h5, h8 };
        }

        setAvailabilityByDay(prev => {
            for (let d = 1; d <= daysInMonth; d++) {
                const a = prev?.[d] || {};
                const b = counts?.[d] || {};
                if (a.any !== b.any || a.h4 !== b.h4 || a.h5 !== b.h5 || a.h8 !== b.h8) return counts;
            }
            return prev;
        });
    }, [serviciosAsignados, employeesCity, daysInMonth, month, year]);

    const startDay = useMemo(() => {
        const d = new Date(year, month, 1).getDay();
        return d === 0 ? 6 : d - 1;
    }, [year, month]);

    const isToday = (day) => {
        const t = new Date();
        return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
    };

    // Abrir modal desde "DISPONIBLE"
    const openModalForDay = (day) => {
        const ymd = `${year}-${pad2(month + 1)}-${pad2(day)}`;
        setModalDate(ymd);

        // Construimos la lista de empleados para ese día (unión empleados ciudad + servicios del día)
        const serviceEmployeesForDay = serviciosAsignados
            .filter(s => s.serviceDate === ymd)
            .flatMap(s => (s.employees || []).map(e => ({
                document: e.employeeDocument,
                name: e.employeeName,
                surname: e.employeeSurname
            })))
            .filter(e => e.document);

        // Unir con los empleados de la ciudad
        const mapByDoc = new Map();
        for (const e of employeesCity) {
            const doc = e.document || e.employeeDocument;
            if (!doc) continue;
            mapByDoc.set(doc, { document: doc, name: e.name, surname: e.surname });
        }
        for (const e of serviceEmployeesForDay) {
            if (!mapByDoc.has(e.document)) {
                mapByDoc.set(e.document, { document: e.document, name: e.name, surname: e.surname });
            }
        }
        const allEmployeesForModal = Array.from(mapByDoc.values());

        // Para cada empleado, armar sus intervalos ocupados del día
        const entries = allEmployeesForModal.map(emp => {
            const busy = serviciosAsignados
                .filter(s =>
                    s.serviceDate === ymd &&
                    (s.employees || []).some(x => (x.employeeDocument || x.document) === emp.document)
                )
                .map(s => ({
                    startHour: s.startHour,
                    endHour: s.endHour,
                    label: s.clientCompleteName || s.clientName || ''
                }));
            return { employee: emp, busy };
        });

        setModalEntries(entries);
        setShowModal(true);
    };

    // Render
    const days = useMemo(() => {
        const all = [];
        for (let i = 0; i < startDay; i++) {
            all.push(<div key={`empty-${i}`} className="calendar-date-empty" />);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const isTodayDate = isToday(day);
            const breakdown = availabilityByDay[day] || { any: 0, h4: 0, h5: 0, h8: 0 };

            const dayClasses = [
                'calendar-date-container',
                isTodayDate && 'calendar-date-container-today',
            ].filter(Boolean).join(' ');

            all.push(
                <div key={`day-${day}`} className={dayClasses}>
                    <div className="calendar-date-number">{day}</div>
                    <div className="calendar-date-buttons">
                        {buttonLabels.map((label, idx) => (
                            <button
                                key={`${day}-${idx}`}
                                className={[
                                    'calendar-date-button',
                                    `calendar-date-button-${idx}`
                                ].join(' ')}
                                // ⬇️ Abrimos el modal SOLO en "DISPONIBLE" (idx === 0)
                                onClick={idx === 0 ? () => openModalForDay(day) : undefined}
                            >
                                <span className="btn-content">
                                    <span className="label">{label}</span>
                                    {idx === 0 && (
                                        <span className="slots-line">
                                            <span className="slots-top">4h: {breakdown.h4} 5h: {breakdown.h5}</span>
                                            <span className="slots-8h">8h: {breakdown.h8}</span>
                                        </span>
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        return all;
    }, [startDay, daysInMonth, isToday, availabilityByDay, buttonLabels, month, year]);

    return (
        <>
            <div className="three-button-calendar" role="application" aria-label="Calendario de selección de fechas">
                <div className="calendar-month-header">
                    <h2 className="calendar-month-title centered">
                        {monthNames[month]} {year}
                    </h2>
                </div>

                <div className="calendar-weekdays">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
                        <div key={i} className="calendar-weekday">{d}</div>
                    ))}
                </div>

                <div className="calendar-grid">{days}</div>
            </div>

            {/* Modal con timeline y lista de huecos */}
            <ModalEspaciosServicios
                show={showModal}
                onClose={() => setShowModal(false)}
                date={modalDate}
                entries={modalEntries}
                workdayStart={WORKDAY_START}
                workdayEnd={WORKDAY_END}
            />
        </>
    );
};

export default CalendarioEspacios;
