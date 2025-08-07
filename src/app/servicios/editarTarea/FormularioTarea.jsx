'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
	obtenerServicios,
	buscarEmpleados,
	actualizarServicio,
	eliminarServicio
} from '@/lib/Logic.js';
import { useTimeOptions } from '@/lib/Hooks';
import { formatTo12h } from '@/lib/Utils'

const FormularioTarea = ({ service, onClose, onUpdate }) => {
	// Lista de opciones de hora en formato { value: 'HH:mm', label: 'h:mm AM/PM' }
	const timeOptions = useTimeOptions({ startHour: 6, endHour: 18, stepMinutes: 30 });
	const statuses = ['PROGRAMADA', 'COMPLETADA', 'CANCELADA'];

	// Servicios / empleados asignados
	const [servicios, setServicios] = useState([]);
	const [empleadosAsignados, setEmpleadosAsignados] = useState([]);

	// Listas para dropdowns
	const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
	const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);

	// Comentarios
	const [comentarios, setComentarios] = useState('');

	// Hora y estado seleccionados
	const [startHour, setStartHour] = useState(service.startHour || '');
	const [endHour, setEndHour] = useState(service.endHour || '');
	const [currentState, setCurrentState] = useState(service.state || '');

	// Dropdown toggles
	const [startTimeOpen, setStartTimeOpen] = useState(false);
	const [endTimeOpen, setEndTimeOpen] = useState(false);
	const [stateOpen, setStateOpen] = useState(false);
	const [mostrarDropdownServicios, setMostrarDropdownServicios] = useState(false);
	const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false);

	// Refs para detectar clicks fuera
	const startRef = useRef(null);
	const endRef = useRef(null);
	const stateRef = useRef(null);

	useEffect(() => {
		// Inicializa chips de servicios y empleados
		if (service.services) {
			setServicios(service.services.map(s => ({
				id: s.idService,
				description: s.serviceDescription
			})));
		}
		if (service.employees) {
			setEmpleadosAsignados(service.employees.map(e => ({
				document: e.employeeDocument,
				employeeCompleteName: e.employeeCompleteName
			})));
		}
		setComentarios(service.comments || '');

		// Carga datos para dropdowns
		buscarEmpleados()
			.then(setEmpleadosDisponibles)
			.catch(() => setEmpleadosDisponibles([]));
		obtenerServicios()
			.then(setServiciosDisponibles)
			.catch(() => setServiciosDisponibles([]));
	}, [service]);

	// Cerrar dropdowns al hacer click fuera
	useEffect(() => {
		const handleClickOutside = e => {
			if (startRef.current && !startRef.current.contains(e.target)) setStartTimeOpen(false);
			if (endRef.current && !endRef.current.contains(e.target)) setEndTimeOpen(false);
			if (stateRef.current && !stateRef.current.contains(e.target)) setStateOpen(false);
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Helpers para mostrar label de hora
	const labelFor = value =>
		timeOptions.find(opt => opt.value === value)?.label || value;

	// Guardar cambios
	const handleGuardar = async () => {
		const datos = {
			...service,
			startHour,
			endHour,
			state: currentState,
			employeeDocuments: empleadosAsignados.map(e => e.document),
			idServices: servicios.map(s => s.id),
			comments: comentarios
		};
		await actualizarServicio(service.id, datos);
		onUpdate?.();
		onClose();
	};

	// Eliminar servicio
	const handleEliminar = async () => {
		if (confirm('¿Eliminar este servicio?')) {
			await eliminarServicio(service.id);
			onUpdate?.();
			onClose();
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-container" onClick={e => e.stopPropagation()}>

				{/* Encabezado con selects de hora y estado */}
				<div
					className="modal-datos-superiores"
					style={{ justifyContent: 'flex-start', gap: '2rem' }}
				>
					{/* Hora Inicio */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<span>Hora Inicio</span>
						<div className="dropdown" ref={startRef}>
							<button
								type="button"
								className={`dropdown-trigger ${startTimeOpen ? 'open' : ''}`}
								onClick={() => setStartTimeOpen(o => !o)}
							>
								<span>{formatTo12h(startHour) || 'Hora inicio'}</span>
								<span className="arrow">▼</span>
							</button>
							{startTimeOpen && (
								<div className="dropdown-content">
									{timeOptions.map(({ value, label }) => (
										<button
											key={value}
											onClick={() => {
												setStartHour(value);
												setStartTimeOpen(false);
											}}
										>
											{label}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Hora Fin */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<span>Hora Fin</span>
						<div className="dropdown" ref={endRef}>
							<button
								type="button"
								className={`dropdown-trigger ${endTimeOpen ? 'open' : ''}`}
								onClick={() => setEndTimeOpen(o => !o)}
							>
								<span>{formatTo12h(endHour) || 'Hora fin'}</span>
								<span className="arrow">▼</span>
							</button>
							{endTimeOpen && (
								<div className="dropdown-content">
									{timeOptions.map(({ value, label }) => (
										<button
											key={value}
											onClick={() => {
												setEndHour(value);
												setEndTimeOpen(false);
											}}
										>
											{label}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Estado */}
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<span>Estado</span>
						<div className="dropdown" ref={stateRef}>
							<button
								type="button"
								className={`dropdown-trigger ${stateOpen ? 'open' : ''}`}
								onClick={() => setStateOpen(o => !o)}
							>
								<span>{currentState || 'Estado'}</span>
								<span className="arrow">▼</span>
							</button>
							{stateOpen && (
								<div className="dropdown-content">
									{statuses.map(st => (
										<button
											key={st}
											onClick={() => {
												setCurrentState(st);
												setStateOpen(false);
											}}
										>
											{st}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Formulario principal */}
				<div className="modal-asignacion-form-grid">
					<div>
						<label>Cliente</label>
						<input type="text" readOnly value={service.clientCompleteName || ''} />
					</div>
					<div>
						<label>Dirección</label>
						<input type="text" readOnly value={service.addressService || ''} />
					</div>

					{/* Servicios */}
					<div className="modal-chip-section">
						<label>Servicios:</label>
						<div className="modal-chip-container">
							<div className="chips">
								{servicios.map(s => (
									<div className="modal-chip" key={s.id}>
										{s.description}
										<span
											className="modal-asignacion-remove-btn"
											onClick={() => setServicios(servicios.filter(x => x.id !== s.id))}
										>×</span>
									</div>
								))}
								<button
									type="button"
									className="modal-asignacion-add-servicio-btn"
									onClick={() => setMostrarDropdownServicios(v => !v)}
								>
									+
								</button>
							</div>
							{mostrarDropdownServicios && (
								<div className="modal-asignacion-dropdown-chip">
									{serviciosDisponibles
										.filter(sd => !servicios.find(s => s.id === sd.id))
										.map(sd => (
											<button
												key={sd.id}
												onClick={() => {
													setServicios([...servicios, { id: sd.id, description: sd.description }]);
													setMostrarDropdownServicios(false);
												}}
											>
												{sd.description}
											</button>
										))}
								</div>
							)}
						</div>
					</div>

					{/* Empleados */}
					<div className="modal-chip-section">
						<label>Personal Asignado:</label>
						<div className="modal-chip-container">
							<div className="chips">
								{empleadosAsignados.map(e => (
									<div className="modal-chip" key={e.document}>
										{e.employeeCompleteName}
										<span
											className="modal-asignacion-remove-btn"
											onClick={() =>
												setEmpleadosAsignados(empleadosAsignados.filter(x => x.document !== e.document))
											}
										>×</span>
									</div>
								))}
								<button
									type="button"
									className="modal-asignacion-add-empleado-btn"
									onClick={() => setMostrarDropdownEmpleados(v => !v)}
								>
									+
								</button>
							</div>
							{mostrarDropdownEmpleados && (
								<div className="modal-asignacion-dropdown-chip">
									{empleadosDisponibles
										.filter(ed => !empleadosAsignados.some(a => a.document === ed.document))
										.map(ed => (
											<button
												key={ed.document}
												onClick={() => {
													setEmpleadosAsignados([
														...empleadosAsignados,
														{
															document: ed.document,
															employeeCompleteName: `${ed.name} ${ed.surname}`
														}
													]);
													setMostrarDropdownEmpleados(false);
												}}
											>
												{ed.name} {ed.surname}
											</button>
										))}
								</div>
							)}
						</div>
					</div>

					<div>
						<label>Ciudad</label>
						<input type="text" readOnly value={service.city || ''} />
					</div>
					<div>
						<label>Comentarios</label>
						<textarea
							rows={3}
							className="modal-asignacion-textarea"
							value={comentarios}
							onChange={e => setComentarios(e.target.value)}
						/>
					</div>
				</div>

				{/* Botones */}
				<div className="modal-asignacion-form-buttons">
					<button className="modal-asignacion-btn-confirmar" onClick={handleGuardar}>
						Guardar Cambios
					</button>
					<button className="modal-asignacion-btn-eliminar" onClick={handleEliminar}>
						Eliminar
					</button>
					<button className="modal-asignacion-btn-cancelar" onClick={onClose}>
						Cerrar
					</button>
				</div>
			</div>
		</div>
	);
};

export default FormularioTarea;
