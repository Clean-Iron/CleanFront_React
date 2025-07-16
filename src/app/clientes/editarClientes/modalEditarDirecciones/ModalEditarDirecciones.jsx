'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useCiudades } from "@/lib/Hooks/Hooks";


const ModalEditarDirecciones = ({ cliente = {}, onClose, onGuardar }) => {
	const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();

	const [direcciones, setDirecciones] = useState([]);
	const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState({});
	const ciudadDropdownRefs = useRef({});

	useEffect(() => {
		const arr = Array.isArray(cliente.addresses) ? cliente.addresses : [];
		const inicial = arr.map(addr => ({
			id: addr.id,
			address: addr.address || '',
			city: addr.city || '',
			description: addr.description || ''
		}));
		if (inicial.length === 0) {
			inicial.push({
				id: `temp-${Date.now()}`,
				address: '',
				city: '',
				description: ''
			});
		}
		setDirecciones(inicial);
	}, [cliente.addresses]);

	// Manejar clicks fuera del dropdown
	useEffect(() => {
		const handleClickOutside = (event) => {
			Object.keys(ciudadDropdownRefs.current).forEach(id => {
				if (ciudadDropdownRefs.current[id] && !ciudadDropdownRefs.current[id].contains(event.target)) {
					setCiudadDropdownOpen(prev => ({ ...prev, [id]: false }));
				}
			});
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleDireccionChange = (id, campo, valor) => {
		setDirecciones(prev =>
			prev.map(dir =>
				dir.id === id ? { ...dir, [campo]: valor } : dir
			)
		);
	};

	const handleCiudadSelect = (id, ciudad) => {
		setDirecciones(prev =>
			prev.map(dir =>
				dir.id === id ? { ...dir, city: ciudad } : dir
			)
		);
		setCiudadDropdownOpen(prev => ({ ...prev, [id]: false }));
	};

	const toggleCiudadDropdown = (id) => {
		setCiudadDropdownOpen(prev => ({ ...prev, [id]: !prev[id] }));
	};

	const agregarDireccion = () => {
		const nuevaId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		setDirecciones(prev => [
			...prev,
			{ id: nuevaId, address: "", city: "", description: "" }
		]);
	};

	const eliminarDireccion = (id) => {
		if (direcciones.length > 1) {
			setDirecciones(prev => prev.filter(dir => dir.id !== id));
		}
	};

	const guardarCambios = () => {
		const direccionesValidas = direcciones
			.filter(dir => dir.address.trim() !== '')
			.map(dir => {
				if (typeof dir.id === 'string' && dir.id.startsWith('temp')) {
					const { id, ...rest } = dir;
					return rest;
				}
				return dir;
			});

		if (onGuardar) {
			onGuardar(direccionesValidas);
		}
		onClose();
	};

	if (!cliente) return null;

	return (
		<div className="modal-overlay" style={{ overflowY: 'auto' }} onClick={onClose}>
			<div className="modal-container" onClick={(e) => e.stopPropagation()}>
				<div>
					<div>
						{direcciones.map((direccion) => (
							<div key={direccion.id} style={{ marginBottom: '15px' }}>
								<div className="modal-asignacion-form-grid" style={{
									display: 'flex',
									alignItems: 'center',
									gap: '15px',
									flexWrap: 'wrap'
								}}>
									{/* Campo Dirección - Más ancho */}
									<input
										type="text"
										placeholder="Dirección"
										value={direccion.address}
										onChange={(e) => handleDireccionChange(direccion.id, 'address', e.target.value)}
										style={{
											flex: '2',
											minWidth: '250px'
										}}
									/>

									{/* Campo Descripción - Tamaño medio */}
									<input
										type="text"
										placeholder="Descripción"
										value={direccion.description}
										onChange={(e) => handleDireccionChange(direccion.id, 'description', e.target.value)}
										style={{
											flex: '1',
											minWidth: '150px'
										}}
									/>

									{/* Dropdown Ciudad - Tamaño fijo */}
									<div
										className="dropdown"
										ref={el => ciudadDropdownRefs.current[direccion.id] = el}
										style={{
											minWidth: '180px',
											flex: '0 0 auto',
											position: 'relative'
										}}
									>
										<button
											type="button"
											className={`dropdown-trigger ${ciudadDropdownOpen[direccion.id] ? "open" : ""}`}
											onClick={() => toggleCiudadDropdown(direccion.id)}
											style={{ width: '100%' }}
										>
											<span>{direccion.city || "Seleccionar ciudad"}</span>
											<span className="arrow">▼</span>
										</button>
										{ciudadDropdownOpen[direccion.id] && (
											<div
												className="dropdown-content"
												style={{
													position: 'absolute',
													top: '100%',
													left: '0',
													right: '0',
													zIndex: 9999,
													backgroundColor: 'white',
													border: '1px solid #ccc',
													borderRadius: '4px',
													boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
													maxHeight: '200px',
													overflowY: 'auto'
												}}
											>
												{ciudadesLoading && <div>Cargando ciudades...</div>}
												{ciudadesError && <div>Error al cargar ciudades</div>}
												{!ciudadesLoading && !ciudadesError && ciudades.map((ciu, idx) => (
													<button
														key={`${direccion.id}-${ciu}`}
														type="button"
														onClick={() => handleCiudadSelect(direccion.id, ciu)}
														style={{
															display: 'block',
															width: '100%',
															padding: '8px 12px',
															textAlign: 'left',
															border: 'none',
															backgroundColor: 'transparent',
															cursor: 'pointer',
															borderBottom: idx < ciudades.length - 1 ? '1px solid #eee' : 'none'
														}}
														onMouseEnter={e => e.target.style.backgroundColor = '#f5f5f5'}
														onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
													>
														{ciu}
													</button>
												))}
											</div>
										)}
									</div>

									{/* Botón Eliminar - Circular */}
									<button
										type="button"
										className="menu-btn"
										onClick={() => eliminarDireccion(direccion.id)}
										style={{
											borderRadius: '50%',
											width: '40px',
											height: '40px',
											fontSize: '18px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											padding: '0',
											flex: '0 0 auto'
										}}
									>
										×
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="modal-asignacion-form-buttons">
					<button
						className="menu-btn"
						onClick={agregarDireccion}
					>
						+ Agregar Dirección
					</button>
					<button className="menu-btn" onClick={guardarCambios}>
						Guardar Cambios
					</button>
					<button className="menu-btn" onClick={onClose}>
						Cancelar
					</button>
				</div>
			</div>
		</div>
	);
};

export default ModalEditarDirecciones;