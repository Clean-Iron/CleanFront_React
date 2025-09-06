'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { buscarClientes, buscarServiciosPorMesDeClientes } from '@/lib/Logic.js';
import {
	TableContainer, Table, TableHead,
	TableRow, TableCell, TableBody,
	Paper, CircularProgress, Button
} from '@mui/material';

const ListaServicios = () => {
	// Controles
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

	// Cliente
	const [clienteText, setClienteText] = useState('');
	const [clientes, setClientes] = useState([]);
	const [clientesFiltrados, setClientesFiltrados] = useState([]);
	const [selectedCliente, setSelectedCliente] = useState(null);

	// Dropdowns
	const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
	const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
	const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
	const monthDropdownRef = useRef(null);
	const yearDropdownRef = useRef(null);
	const clienteDropdownRef = useRef(null);

	// Estado consulta
	const [buscando, setBuscando] = useState(false);
	const [dataServicios, setDataServicios] = useState([]);

	// Mostrar detalles por fila
	const [mostrarDetalles, setMostrarDetalles] = useState({});

	const params = useSearchParams();
	const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

	const normKey = (k = '') => k.toString().toLowerCase().replace(/[\s_]/g, '');
	const getN = (obj, candidates) => {
		if (!obj) return undefined;
		const map = new Map(Object.keys(obj).map(k => [normKey(k), k]));
		for (const c of candidates) {
			const real = map.get(normKey(c));
			if (real !== undefined) {
				const v = obj[real];
				if (v !== undefined && v !== null && String(v).trim() !== '') return v;
			}
		}
		return undefined;
	};

	const fmtFecha = (v) => {
		const d = v || '';
		try {
			const [y, m, dd] = String(d).split('-');
			if (y && m && dd) return `${dd}/${m}/${y}`;
			return String(d);
		} catch { return String(d); }
	};
	const fmtHora = (t) => {
		if (!t) return '—';
		if (typeof t === 'string') return t.slice(0, 5);
		const hh = String(t?.hour ?? '').padStart(2, '0');
		const mm = String(t?.minute ?? '').padStart(2, '0');
		return `${hh}:${mm}`;
	};

	const servicioLabel = (s) =>
		getN(s, ['serviceDescription', 'description', 'name', 'serviceName', 'type']) ??
		`#${getN(s, ['idService', 'id']) ?? ''}`.trim();

	const empleadoNombre = (e) => {
		const full = getN(e, ['employeeCompleteName', 'fullName']);
		if (full) return full;
		const nom = getN(e, ['employeeName', 'name', 'firstName']);
		const ape = getN(e, ['employeeSurname', 'surname', 'lastName']);
		const combo = `${nom ?? ''} ${ape ?? ''}`.trim();
		if (combo) return combo;
		return getN(e, ['employeeDocument', 'document', 'id']) ?? '—';
	};

	useEffect(() => {
		(async () => {
			try {
				const list = await buscarClientes();
				const arr = Array.isArray(list) ? list : [];
				setClientes(arr);
				setClientesFiltrados(arr);

				const docFromQuery = params.get('doc');
				if (docFromQuery) {
					const c = arr.find(x => String(x.document) === String(docFromQuery));
					if (c) {
						setSelectedCliente(c);
						setClienteText(params.get('name') || `${c.name ?? ''} ${c.surname ?? ''}`.trim());
					}
				}
			} catch {
				setClientes([]);
				setClientesFiltrados([]);
			}
		})();
	}, []);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) setMonthDropdownOpen(false);
			if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) setYearDropdownOpen(false);
			if (clienteDropdownRef.current && !clienteDropdownRef.current.contains(e.target)) setClienteDropdownOpen(false);
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// -------- filtros / búsqueda --------
	const norm = (s) => (s ?? '').toString().trim().toLowerCase();

	const filtrarClientes = (valor) => {
		setClienteText(valor);
		setClienteDropdownOpen(true);
		const q = norm(valor);
		if (!q) { setClientesFiltrados(clientes); return; }
		setClientesFiltrados(
			clientes.filter(c => {
				const full = `${c.name ?? ''} ${c.surname ?? ''}`.toLowerCase();
				const doc = (c.document ?? '').toString().toLowerCase();
				const email = (c.email ?? '').toLowerCase();
				return full.includes(q) || doc.includes(q) || email.includes(q);
			})
		);
	};

	const handleClienteSelect = (c) => {
		setSelectedCliente(c);
		setClienteText(`${c.name ?? ''} ${c.surname ?? ''}`.trim());
		setClienteDropdownOpen(false);
	};
	const handleMonthSelect = (_, idx) => { setSelectedMonth(idx); setMonthDropdownOpen(false); };
	const handleYearSelect = (y) => { setSelectedYear(y); setYearDropdownOpen(false); };

	const puedeBuscar = !!selectedCliente && Number.isInteger(selectedMonth) && !!selectedYear;

	const handleBuscar = async () => {
		if (!puedeBuscar) return;
		setBuscando(true);
		setMostrarDetalles({});
		setDataServicios([]);
		try {
			const res = await buscarServiciosPorMesDeClientes(
				selectedCliente.document,
				selectedYear,
				selectedMonth + 1
			);
			setDataServicios(Array.isArray(res) ? res : []);
		} catch (e) {
			setDataServicios([]);
		} finally {
			setBuscando(false);
		}
	};

	const onKeyDown = (e) => { if (e.key === 'Enter' && puedeBuscar) handleBuscar(); };

	return (
		<div className="container">
			<div className="lista-clientes-content">
				{/* Top bar (mismos className) */}
				<div className="top-bar">
					{/* Cliente */}
					<div className="dropdown" ref={clienteDropdownRef}>
						<input
							type="text"
							placeholder="Seleccionar cliente"
							value={clienteText}
							onChange={(e) => filtrarClientes(e.target.value)}
							onFocus={() => { setClienteDropdownOpen(true); setClientesFiltrados(clientes); }}
							onKeyDown={onKeyDown}
						/>
						{clienteDropdownOpen && clientesFiltrados.length > 0 && (
							<div className="dropdown-content">
								{clientesFiltrados.map((c) => (
									<button
										key={c.document}
										type="button"
										className={selectedCliente?.document === c.document ? 'selected' : ''}
										onClick={() => handleClienteSelect(c)}
										title={c.email || ''}
									>
										{c.name} {c.surname} • {c.document}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Mes / Año / Buscar */}
					<div className="filter-buttons">
						<div className="dropdown" ref={monthDropdownRef}>
							<button
								type="button"
								className={`dropdown-trigger ${monthDropdownOpen ? 'open' : ''}`}
								onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
							>
								<span>{months[selectedMonth]}</span>
								<span className="arrow">▼</span>
							</button>
							{monthDropdownOpen && (
								<div className="dropdown-content">
									{months.map((m, i) => (
										<button
											key={i}
											type="button"
											className={selectedMonth === i ? 'selected' : ''}
											onClick={() => handleMonthSelect(m, i)}
										>
											{m}
										</button>
									))}
								</div>
							)}
						</div>

						<div className="dropdown" ref={yearDropdownRef}>
							<button
								type="button"
								className={`dropdown-trigger ${yearDropdownOpen ? 'open' : ''}`}
								onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
							>
								<span>{selectedYear}</span>
								<span className="arrow">▼</span>
							</button>
							{yearDropdownOpen && (
								<div className="dropdown-content">
									{years.map((y) => (
										<button
											key={y}
											type="button"
											className={selectedYear === y ? 'selected' : ''}
											onClick={() => handleYearSelect(y)}
										>
											{y}
										</button>
									))}
								</div>
							)}
						</div>

						<Button variant="contained" onClick={handleBuscar} disabled={!puedeBuscar || buscando}>
							{buscando ? 'Buscando…' : 'Buscar'}
						</Button>
					</div>
				</div>

				{/* Tabla */}
				<TableContainer component={Paper} className="tabla-clientes-container">
					<Table className="tabla-clientes" size="small" stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell>Fecha</TableCell>
								<TableCell>Hora</TableCell>
								<TableCell>Horas</TableCell>
								<TableCell>Estado</TableCell>
								<TableCell>Ciudad</TableCell>
								<TableCell>Dirección</TableCell>
								<TableCell>Detalles</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{buscando ? (
								<TableRow>
									<TableCell colSpan={7} align="center">
										<div className="no-results">
											<CircularProgress size={24} sx={{ borderBottom: 'none' }} />
										</div>
									</TableCell>
								</TableRow>
							) : dataServicios.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} align="center" sx={{ borderBottom: 'none' }}>
										{puedeBuscar ? 'Sin datos para los filtros seleccionados' : 'Selecciona filtros y presiona Buscar'}
									</TableCell>
								</TableRow>
							) : (
								dataServicios.flatMap((s, idx) => {
									const id = s?.id ?? idx;

									const fecha = fmtFecha(getN(s, ['serviceDate']));
									const hi = fmtHora(getN(s, ['startHour']));
									const hf = fmtHora(getN(s, ['endHour']));
									const horas = getN(s, ['totalServiceHours', 'totalServiceH ours']) ?? 0;
									const estado = getN(s, ['state']) ?? '—';
									const ciudad = getN(s, ['city']) ?? '—';
									const dir = getN(s, ['addressService']) ?? '—';

									const arrServicios = Array.isArray(getN(s, ['services'])) ? getN(s, ['services']) : [];
									const arrEmps = Array.isArray(getN(s, ['employees'])) ? getN(s, ['employees']) : [];

									const rec = getN(s, ['recurrenceType']) ?? '—';
									const com = getN(s, ['comments']) || '—';

									const fila = (
										<TableRow key={`row-${id}`} className="cliente-row" hover>
											<TableCell>{fecha}</TableCell>
											<TableCell>{hi} - {hf}</TableCell>
											<TableCell>{Number(horas).toFixed(2)}</TableCell>
											<TableCell>{estado}</TableCell>
											<TableCell>{ciudad}</TableCell>
											<TableCell>{dir}</TableCell>
											<TableCell>
												<button
													className="direcciones-toggle"
													onClick={() => setMostrarDetalles(prev => ({ ...prev, [id]: !prev[id] }))}
												>
													{`${arrEmps.length} emp • ${arrServicios.length} serv`} {mostrarDetalles[id] ? '▲' : '▼'}
												</button>
											</TableCell>
										</TableRow>
									);

									const filaDetalles = mostrarDetalles[id] ? (
										<TableRow key={`det-${id}`} className="direcciones-row">
											<TableCell className="direcciones-cell" colSpan={7}>
												<div className="direcciones-container">
													<div className="direcciones-grid">
														{/* Empleados primero */}
														<div className="direccion-card">
															<div className="direccion-tipo"><strong>Empleados</strong></div>
															<div className="direccion-datos">
																{arrEmps.length ? (
																	<ul>{arrEmps.map((e, i) => <li key={i}>{empleadoNombre(e)}</li>)}</ul>
																) : '—'}
															</div>
														</div>

														<div className="direccion-card">
															<div className="direccion-tipo"><strong>Servicios</strong></div>
															<div className="direccion-datos">
																{arrServicios.length ? (
																	<ul>{arrServicios.map((sv, i) => <li key={i}>{servicioLabel(sv)}</li>)}</ul>
																) : '—'}
															</div>
														</div>

														<div className="direccion-card">
															<div className="direccion-tipo"><strong>Recurrencia</strong></div>
															<div className="direccion-datos">{rec}</div>
														</div>

														<div className="direccion-card">
															<div className="direccion-tipo"><strong>Comentarios</strong></div>
															<div className="direccion-datos">{com}</div>
														</div>
													</div>
												</div>
											</TableCell>
										</TableRow>
									) : null;
									return [fila, filaDetalles].filter(Boolean);
								})
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		</div>
	);
};

export default ListaServicios;