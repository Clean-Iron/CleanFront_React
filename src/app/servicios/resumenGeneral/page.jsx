'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CalendarioServicios from "./calendarioServicios/CalendarioServicios";
import CalendarioEspacios from "./calendarioEspacios/CalendarioEspacios";

const ResumenGeneral = () => {
	const [selectedDate, setSelectedDate] = useState('');
	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [city, setCity] = useState('');
	const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
	const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
	const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
	const monthDropdownRef = useRef(null);
	const yearDropdownRef = useRef(null);
	const cityDropdownRef = useRef(null);

	const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
	const cities = ["Bogota", "Medellin", "Madrid", "Barranquilla"];

	// Generar años (desde hace 5 años hasta dentro de 5 años)
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

	// Manejador de selección de fecha desde el calendario
	const handleDateSelect = (date) => {
		setSelectedDate(date);
	};

	// Manejador específico para el calendario de espacios (tres botones)
	const handleButtonClick = (date, buttonIndex, buttonLabel) => {
		console.log(`${buttonLabel} seleccionado para la fecha ${date} en la ciudad ${city}`);
		// Aquí puedes agregar lógica adicional para manejar la selección de estado
	};

	// Manejador de cambio de mes desde el dropdown
	const handleMonthSelect = (monthName, monthIndex) => {
		setSelectedMonth(monthIndex);
		setMonthDropdownOpen(false);
	};

	// Manejador de cambio de año desde el dropdown
	const handleYearSelect = (year) => {
		setSelectedYear(year);
		setYearDropdownOpen(false);
	};

	// Manejador para cuando el calendario cambie de mes internamente
	const handleCalendarMonthChange = (month, year) => {
		setSelectedMonth(month);
		setSelectedYear(year);
	};

	// Manejador de selección de ciudad
	const handleCitySelect = (selectedCity) => {
		setCity(selectedCity);
		setCityDropdownOpen(false);
		console.log('Ciudad seleccionada:', selectedCity);
	};

	// Cerrar dropdowns cuando se hace clic fuera
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
				setMonthDropdownOpen(false);
			}
			if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
				setYearDropdownOpen(false);
			}
			if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
				setCityDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Función para renderizar el calendario apropiado
	const renderCalendar = () => {
		if (city) {
			// Si hay una ciudad seleccionada, mostrar CalendarioEspacios (tres botones)
			return (
				<CalendarioEspacios
					onDateSelect={handleDateSelect}
					onButtonClick={handleButtonClick}
					currentMonth={selectedMonth}
					currentYear={selectedYear}
					onMonthChange={handleCalendarMonthChange}
					hideNavigation={true}
					buttonLabels={['DISPONIBLE', 'OCUPADO', 'PERMISO/VAC']}
				/>
			);
		} else {
			// Si no hay ciudad seleccionada, mostrar CalendarioServicios (dos botones)
			return (
				<CalendarioServicios
					onDateSelect={handleDateSelect}
					currentMonth={selectedMonth}
					currentYear={selectedYear}
					onMonthChange={handleCalendarMonthChange}
					hideNavigation={true}
				/>
			);
		}
	};

	return (
		<div style={{
			width: '100vw',
			height: '180vh',
			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			display: 'flex',
			position: 'relative'
		}}>
			<div className="container" style={{ height: '170vh', marginLeft: '0.5cm', marginTop: '0.5cm' }}>
				<div style={{
					width: '240px',
					height: '100%',
					marginRight: 'auto',
					padding: '20px',
					boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.2)',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}>
					<Link href={"/servicios"} className="btn-53" >
						<div className="original">⬅ Regresar</div>
						<div className="letters">
							<span>M</span>
							<span>E</span>
							<span>N</span>
							<span>Ú</span>
						</div>
					</Link>

					<div className="menu-buttons">
						<ul>
							<li>
								{/* Selector de mes */}
								<div className="dropdown" ref={monthDropdownRef}>
									<button
										type="button"
										className={`dropdown-trigger ${monthDropdownOpen ? "open" : ""}`}
										onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
									>
										<span>{months[selectedMonth]}</span>
										<span className="arrow">▼</span>
									</button>
									{monthDropdownOpen && (
										<div className="dropdown-content">
											{months.map((month, index) => (
												<button
													key={index}
													type="button"
													className={selectedMonth === index ? "selected" : ""}
													onClick={() => handleMonthSelect(month, index)}
												>
													{month}
												</button>
											))}
										</div>
									)}
								</div>
							</li>
							<li>
								{/* Selector de año */}
								<div className="dropdown" ref={yearDropdownRef}>
									<button
										type="button"
										className={`dropdown-trigger ${yearDropdownOpen ? "open" : ""}`}
										onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
									>
										<span>{selectedYear}</span>
										<span className="arrow">▼</span>
									</button>
									{yearDropdownOpen && (
										<div className="dropdown-content">
											{years.map((year) => (
												<button
													key={year}
													type="button"
													className={selectedYear === year ? "selected" : ""}
													onClick={() => handleYearSelect(year)}
												>
													{year}
												</button>
											))}
										</div>
									)}
								</div>
							</li>
							<li>
								{/* Selector de ciudad */}
								<div className="dropdown" ref={cityDropdownRef}>
									<button 
										type="button" 
										className={`dropdown-trigger ${cityDropdownOpen ? "open" : ""} ${city ? "city-selected" : ""}`} 
										onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
									>
										<span>{city || "Seleccionar ciudad"}</span>
										<span className="arrow">▼</span>
									</button>
									{cityDropdownOpen && (
										<div className="dropdown-content">
											{/* Opción para limpiar selección */}
											{city && (
												<button 
													type="button" 
													className="clear-option"
													onClick={() => handleCitySelect('')}
												>
													Limpiar selección
												</button>
											)}
											{cities.map((cityOption, index) => (
												<button 
													key={index} 
													type="button" 
													className={city === cityOption ? "selected" : ""}
													onClick={() => handleCitySelect(cityOption)}
												>
													{cityOption}
												</button>
											))}
										</div>
									)}
								</div>
							</li>
						</ul>
					</div>
				</div>

				{/* Calendario dinámico basado en la selección de ciudad */}
				{renderCalendar()}
			</div>
		</div>
	);
};

export default ResumenGeneral;