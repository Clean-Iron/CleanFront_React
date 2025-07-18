import React, { useState, useEffect, useRef } from 'react';
import { buscarDisponibilidad } from '@/lib/Services/Logic.js';
import { useCiudades } from '@/lib/Hooks/Hooks.js';
import '../../../../styles/Servicios/Disponibilidad/FiltrarDisponibilidad/FiltrarDisponibilidad.css';

const FiltrarDisponibilidad = ({ onEmployeesUpdate }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('10:00');
  const [endHour, setEndHour] = useState('13:00');
  const [city, setCity] = useState('');

  const { ciudades, isLoading } = useCiudades();

  const [startHourDropdownOpen, setStartHourDropdownOpen] = useState(false);
  const [endHourDropdownOpen, setEndHourDropdownOpen] = useState(false);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);

  const timeStartDropdownRef = useRef(null);
  const timeEndDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  const availableTimes = [
    "06:00", "07:00", "08:00", "09:00", "10:00",
    "11:00", "12:00", "13:00", "14:00", "15:00",
    "15:30", "16:00", "17:00"
  ];

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeStartDropdownRef.current && !timeStartDropdownRef.current.contains(event.target)) {
        setStartHourDropdownOpen(false);
      }
      if (timeEndDropdownRef.current && !timeEndDropdownRef.current.contains(event.target)) {
        setEndHourDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setCiudadDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    try {
      const data = await buscarDisponibilidad(date, startHour, endHour, city);
      const employeeList = Array.isArray(data) ? data : [];
      onEmployeesUpdate(employeeList, date, startHour, endHour, city);
    } catch (error) {
      console.error("Error al buscar disponibilidad:", error);
      onEmployeesUpdate([]);
    }
  };

  return (
    <div className="filter-container">
      {/* Fecha */}
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      {/* Hora Inicio */}
      <div className="dropdown" style={{ marginBottom: 20 }} ref={timeStartDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${startHourDropdownOpen ? 'open' : ''}`}
          onClick={() => setStartHourDropdownOpen(open => !open)}
        >
          <span>{startHour || 'Seleccionar Hora Inicio'}</span>
          <span className="arrow">▼</span>
        </button>
        {startHourDropdownOpen && (
          <div className="dropdown-content">
            {availableTimes.map((hour, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setStartHour(hour); setStartHourDropdownOpen(false); }}
              >{hour}</button>
            ))}
          </div>
        )}
      </div>

      {/* Hora Fin */}
      <div className="dropdown" style={{ marginBottom: 20 }} ref={timeEndDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${endHourDropdownOpen ? 'open' : ''}`}
          onClick={() => setEndHourDropdownOpen(open => !open)}
        >
          <span>{endHour || 'Seleccionar Hora Fin'}</span>
          <span className="arrow">▼</span>
        </button>
        {endHourDropdownOpen && (
          <div className="dropdown-content">
            {availableTimes.map((hour, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setEndHour(hour); setEndHourDropdownOpen(false); }}
              >{hour}</button>
            ))}
          </div>
        )}
      </div>

      {/* Ciudad */}
      <div className="dropdown" ref={cityDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${ciudadDropdownOpen ? 'open' : ''}`}
          onClick={() => setCiudadDropdownOpen(open => !open)}
        >
          <span>{city || (isLoading ? 'Cargando ciudades…' : 'Seleccionar ciudad')}</span>
          <span className="arrow">▼</span>
        </button>
        {ciudadDropdownOpen && (
          <div className="dropdown-content">
            {isLoading
              ? <div className="loading">Cargando…</div>
              : ciudades.map((ciud, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setCity(ciud); setCiudadDropdownOpen(false); }}
                  >{ciud}</button>
                ))
            }
          </div>
        )}
      </div>

      {/* Botón de búsqueda */}
      <button onClick={handleSearch} className="search-button">
        BUSCAR DISPONIBILIDAD
      </button>
    </div>
  );
};

export default FiltrarDisponibilidad;
