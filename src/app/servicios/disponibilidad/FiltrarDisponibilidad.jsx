// src/components/Servicios/Disponibilidad/FiltrarDisponibilidad.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { buscarDisponibilidad } from '@/lib/Logic.js';
import { useCiudades, useTimeOptions } from '@/lib/Hooks';
import '@/styles/Servicios/Disponibilidad/FiltrarDisponibilidad.css';

const FiltrarDisponibilidad = ({ onEmployeesUpdate }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('10:00');
  const [endHour, setEndHour] = useState('13:00');
  const [city, setCity] = useState('');

  const { ciudades, isLoading: ciudadesLoading } = useCiudades();
  const timeOptions = useTimeOptions({ startHour: 6, endHour: 18, stepMinutes: 30 });

  const [startHourDropdownOpen, setStartHourDropdownOpen] = useState(false);
  const [endHourDropdownOpen, setEndHourDropdownOpen] = useState(false);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);

  const timeStartDropdownRef = useRef(null);
  const timeEndDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeStartDropdownRef.current && !timeStartDropdownRef.current.contains(event.target))
        setStartHourDropdownOpen(false);
      if (timeEndDropdownRef.current && !timeEndDropdownRef.current.contains(event.target))
        setEndHourDropdownOpen(false);
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target))
        setCiudadDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    try {
      const data = await buscarDisponibilidad(date, startHour, endHour, city);
      onEmployeesUpdate(Array.isArray(data) ? data : [], date, startHour, endHour, city);
    } catch (error) {
      console.error("Error al buscar disponibilidad:", error);
      onEmployeesUpdate([], date, startHour, endHour, city);
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
          onClick={() => setStartHourDropdownOpen(o => !o)}
        >
          <span>{timeOptions.find(o => o.value === startHour)?.label}</span>
          <span className="arrow">▼</span>
        </button>
        {startHourDropdownOpen && (
          <div className="dropdown-content">
            {timeOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setStartHour(opt.value);
                  setStartHourDropdownOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hora Fin */}
      <div className="dropdown" style={{ marginBottom: 20 }} ref={timeEndDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${endHourDropdownOpen ? 'open' : ''}`}
          onClick={() => setEndHourDropdownOpen(o => !o)}
        >
          <span>{timeOptions.find(o => o.value === endHour)?.label}</span>
          <span className="arrow">▼</span>
        </button>
        {endHourDropdownOpen && (
          <div className="dropdown-content">
            {timeOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setEndHour(opt.value);
                  setEndHourDropdownOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ciudad */}
      <div className="dropdown" ref={cityDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${ciudadDropdownOpen ? 'open' : ''}`}
          onClick={() => setCiudadDropdownOpen(o => !o)}
        >
          <span>{city || (ciudadesLoading ? 'Cargando ciudades…' : 'Seleccionar ciudad')}</span>
          <span className="arrow">▼</span>
        </button>
        {ciudadDropdownOpen && (
          <div className="dropdown-content">
            {ciudadesLoading
              ? <div className="loading">Cargando…</div>
              : ciudades.map((ciu, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCity(ciu);
                    setCiudadDropdownOpen(false);
                  }}
                >
                  {ciu}
                </button>
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
