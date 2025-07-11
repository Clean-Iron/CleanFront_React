'use client';
import React, { useState, useEffect } from 'react';
import { obtenerServicios, buscarEmpleados, actualizarServicio, eliminarServicio } from '@/lib/Services/Logic.js';

const FormularioTarea = ({ service, onClose, onUpdate }) => {
	const [servicios, setServicios] = useState([]);
	const [empleadosAsignados, setEmpleadosAsignados] = useState([]);
	const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
	const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
	const [comentarios, setComentarios] = useState("");
	const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false);
	const [mostrarDropdownServicios, setMostrarDropdownServicios] = useState(false);

	useEffect(() => {
		// Inicializar servicios desde el service prop
		if (service.services) {
			const serviciosIniciales = service.services.map((desc) => ({
				id: desc.idService,
				description: desc.serviceDescription
			}));
			setServicios(serviciosIniciales);
		}

		// Inicializar empleados desde el service prop
		if (service.employees) {
			const empleadosIniciales = service.employees.map((emp) => ({
				document: emp.employeeDocument,
				name: emp.employeeCompleteName?.split(' ')[0] || '',
				surname: emp.employeeCompleteName?.split(' ').slice(1).join(' ') || '',
				employeeCompleteName: emp.employeeCompleteName
			}));
			setEmpleadosAsignados(empleadosIniciales);
		}

		// Inicializar comentarios
		setComentarios(service.comments || '');

		buscarEmpleados()
			.then((data) => {
				setEmpleadosDisponibles(data); // aquí va!
			})
			.catch((error) => {
				console.error("Error al obtener empleados:", error);
				setEmpleadosDisponibles([]);
			});


		// Obtener servicios disponibles
		obtenerServicios()
			.then((data) => {
				setServiciosDisponibles(data);
			})
			.catch((error) => {
				console.error("Error al obtener servicios:", error);
				setServiciosDisponibles([]);
			});
	}, [service]);

	const handleAgregarEmpleado = (nuevo) => {
		if (!empleadosAsignados.some(e => e.document === nuevo.document)) {
			setEmpleadosAsignados([...empleadosAsignados, nuevo]);
			setMostrarDropdownEmpleados(false);
		}
	};

	const handleEliminarEmpleado = (document) => {
		setEmpleadosAsignados(empleadosAsignados.filter(e => e.document !== document));
	};

	const handleAgregarServicio = (nuevoServicio) => {
		if (!servicios.some(s => s.id === nuevoServicio.id)) {
			setServicios([...servicios, nuevoServicio]);
			setMostrarDropdownServicios(false);
		}
	};

	const handleEliminarServicio = (id) => {
		setServicios(servicios.filter(serv => serv.id !== id));
	};

	const handleGuardarCambios = async () => {
		// Aquí implementarías la lógica para guardar los cambios
		const datosActualizados = {
			...service,
			employeeDocuments: empleadosAsignados.map(emp => emp.document),  // solo documentos
			idServices: servicios.map(serv => serv.id), // solo IDs
			comments: comentarios
		};

		await actualizarServicio(service.id, datosActualizados);
		alert('Cambios guardados correctamente');
		if (onUpdate) await onUpdate();
		onClose();
	};

	const handleEliminar = async () => {
		if (window.confirm('¿Está seguro de que desea eliminar este servicio?')) {
			try {
				await eliminarServicio(service.id);
				alert('Servicio eliminado');
				if (onUpdate) await onUpdate();
				onClose();
			} catch (error) {
				console.error('Error al eliminar:', error);
				alert('Error al eliminar el servicio');
			}
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-container" onClick={(e) => e.stopPropagation()}>
				<div className="modal-datos-superiores">
					<span>Hora: {service.startDate} - {service.endDate}</span>
					<span>Estado: {service.state}</span>
				</div>

				<div className="modal-asignacion-form-grid">
					<div>
						<label>Cliente</label>
						<input type="text" readOnly value={service.clientCompleteName || ''} />
					</div>

					<div>
						<label>Dirección</label>
						<input type="text" readOnly value={service.addressService || ''} />
					</div>

					{/* Servicios con lógica interactiva */}
					<div className="modal-chip-section">
						<label>Servicios:</label>
						<div className="modal-chip-container">
							<div className="chips">
								{servicios.map((serv) => (
									<div className="modal-chip" key={serv.id}>
										{serv.description}
										<span className="modal-asignacion-remove-btn" onClick={() => handleEliminarServicio(serv.id)}>×</span>
									</div>
								))}
								<button
									type="button"
									className="modal-asignacion-add-servicio-btn"
									onClick={() => setMostrarDropdownServicios(prev => !prev)}
								>
									+
								</button>
							</div>
							{mostrarDropdownServicios && (
								<div className="modal-asignacion-dropdown-chip">
									{serviciosDisponibles.length === 0 ? (
										<div className="modal-asignacion-no-opciones">No hay servicios disponibles</div>
									) : serviciosDisponibles.filter(s => !servicios.some(serv => serv.id === s.id)).length === 0 ? (
										<div className="modal-asignacion-no-opciones">Todos los servicios ya están asignados</div>
									) : (
										serviciosDisponibles
											.filter(s => !servicios.some(serv => serv.id === s.id))
											.map((servicio) => (
												<button key={servicio.id} onClick={() => handleAgregarServicio(servicio)}>
													{servicio.description}
												</button>
											))
									)}
								</div>
							)}
						</div>
					</div>

					{/* Empleados con lógica interactiva */}
					<div className="modal-chip-section">
						<label>Personal Asignado:</label>
						<div className="modal-chip-container">
							<div className="chips">
								{empleadosAsignados.map(emp => (
									<div className="modal-chip" key={emp.document}>
										{emp.employeeCompleteName || `${emp.name} ${emp.surname}`}
										<span className="modal-asignacion-remove-btn" onClick={() => handleEliminarEmpleado(emp.document)}>×</span>
									</div>
								))}
								<button
									type="button"
									className="modal-asignacion-add-empleado-btn"
									onClick={() => setMostrarDropdownEmpleados(prev => !prev)}
								>
									+
								</button>
							</div>
							{mostrarDropdownEmpleados && (
								<div className="modal-asignacion-dropdown-chip">
									{empleadosDisponibles.length === 0 ? (
										<div className="modal-asignacion-no-opciones">No hay empleados disponibles</div>
									) : (
										empleadosDisponibles
											.filter(e => !empleadosAsignados.find(a => a.document === e.document))
											.map(e => (
												<button key={e.document} onClick={() => handleAgregarEmpleado(e)}>
													{e.name} {e.surname}
												</button>
											))
									)}
									{empleadosDisponibles.length > 0 &&
										empleadosDisponibles.filter(e => !empleadosAsignados.find(a => a.document === e.document)).length === 0 && (
											<div className="modal-asignacion-no-opciones">Todos los empleados ya están asignados</div>
										)}
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
							placeholder="Comentarios adicionales"
							rows={3}
							className="modal-asignacion-textarea"
							value={comentarios}
							onChange={(e) => setComentarios(e.target.value)}
						/>
					</div>
				</div>

				<div className="modal-asignacion-form-buttons">
					<button className="modal-asignacion-btn-confirmar" onClick={handleGuardarCambios}>
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