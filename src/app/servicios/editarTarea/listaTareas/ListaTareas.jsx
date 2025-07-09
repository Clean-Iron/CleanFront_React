import React, { useState, useEffect } from "react";
import FormularioTarea from "../formularioTarea/FormularioTarea";

const ListaTareas = ({ data = [], servicios = [], onNuevaBusqueda }) => {
	const [loading, setLoading] = useState(false);
	const [selectedService, setSelectedService] = useState(null);
	const [filteredServices, setFilteredServices] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);

	// Use data prop if available, otherwise use servicios prop
	const servicesData = data && data.length > 0 ? data : servicios;

	useEffect(() => {
		setLoading(true);
		setTimeout(() => {
			setFilteredServices(servicesData || []); // Use servicesData
			setLoading(false);
		}, 1000);
	}, [servicesData]); // Add servicesData as dependency

	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
			minHeight: '400px'
		}}>
			<div className="services-list" style={{ marginBottom: '20px' }}>
				{loading ? (
					<div className="loading-indicator">Cargando servicios...</div>
				) : filteredServices.length > 0 ? (
					filteredServices.map(service => (
						<div
							key={service.id}
							className="service-card"
							onClick={() => {
								setSelectedService(service);
								setModalOpen(true);
							}}
						>
							<div className="service-header">
								<h3>{service.endDate} | {service.serviceDescription?.[0] || 'Servicio'}</h3>
								<div className={`status-indicator ${service.state === "COMPLETADA"
									? "completed"
									: service.state === "PROGRAMADA"
										? "scheduled"
										: service.state === "CANCELADA"
											? "cancelled"
											: "unknown"
									}`}>
									{service.state === "COMPLETADA" ? "✓" :
										service.state === "PROGRAMADA" ? "📅" :
											service.state === "CANCELADA" ? "❌" : "?"}
								</div>
							</div>
							<div className="service-details">
								<p><strong>Cliente:</strong> {service.clientName}</p>
								<p><strong>Dirección:</strong> {service.addressService}</p>
								<p><strong>Ciudad:</strong> {service.city}</p>
								<p><strong>Empleados:</strong> {service.employees?.length || 0}</p>
								<p><strong>Estado:</strong> <span className={`status-text ${service.state.toLowerCase()}`}>{service.state}</span></p>
								{service.comments && <p><strong>Comentarios:</strong> {service.comments}</p>}
							</div>
						</div>
					))
				) : (
					<div className="no-results">
						No hay servicios programados para esta fecha.
					</div>
				)}
			</div>
			{/* Botones de acción */}
			{filteredServices.length > 0 ? (
				<div className="busqueda-form-buttons busqueda-full-width" style={{ marginBottom: '10px' }}>
					<button type="reset" className="menu-btn" onClick={onNuevaBusqueda}>
						❌ CANCELAR
					</button>
				</div>
			) : (
				<div className="busqueda-form-buttons busqueda-full-width">
					<button type="button" className="menu-btn" onClick={onNuevaBusqueda}>
						🔍 NUEVA BÚSQUEDA
					</button>
				</div>
			)}
			{modalOpen && selectedService && (
				<FormularioTarea
					service={selectedService}
					onClose={() => {
						setModalOpen(false);
						setSelectedService(null);
					}}
				/>
			)}
		</div>
	);
};

export default ListaTareas;