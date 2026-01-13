'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCiudades } from '@/lib/Hooks';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function buildISODate(year, month1, day) {
  return `${year}-${pad2(month1)}-${pad2(day)}`;
}

function getWeeksOfMonthSimple(year, month0) {
  const lastDay = new Date(year, month0 + 1, 0).getDate();
  const weeks = [];
  for (let start = 1; start <= lastDay; start += 7) {
    weeks.push([start, Math.min(start + 6, lastDay)]);
  }
  return weeks;
}

function getDaysOfRange(year, month1, startDay, endDay) {
  const out = [];
  for (let d = startDay; d <= endDay; d++) {
    out.push({ day: d, iso: buildISODate(year, month1, d) });
  }
  return out;
}

const FiltrarServicios = ({ onSearch }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0..11
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [city, setCity] = useState('');

  const [selectedWeek, setSelectedWeek] = useState(null); // 1..N | null
  const [selectedDay, setSelectedDay] = useState(null);   // 'YYYY-MM-DD' | null
  const [keyword, setKeyword] = useState('');             // texto libre

  const { ciudades, isLoading: ciudadesLoading } = useCiudades();

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const weekDropdownRef = useRef(null);
  const dayDropdownRef = useRef(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const weeks = useMemo(
    () => getWeeksOfMonthSimple(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const daysOptions = useMemo(() => {
    const year = selectedYear;
    const month1 = selectedMonth + 1;
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    if (selectedWeek) {
      const [d1, d2] = weeks[selectedWeek - 1] || [1, Math.min(7, lastDay)];
      return getDaysOfRange(year, month1, d1, d2);
    }
    return getDaysOfRange(year, month1, 1, lastDay);
  }, [selectedYear, selectedMonth, selectedWeek, weeks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) setMonthDropdownOpen(false);
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) setYearDropdownOpen(false);
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) setCityDropdownOpen(false);
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(event.target)) setWeekDropdownOpen(false);
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target)) setDayDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // reset semana + día cuando cambian mes/año/ciudad
  useEffect(() => {
    setSelectedWeek(null);
    setSelectedDay(null);
  }, [selectedMonth, selectedYear, city]);

  // reset día cuando cambia la semana
  useEffect(() => {
    setSelectedDay(null);
  }, [selectedWeek]);

  const handleSearch = () => {
    const payload = {
      year: selectedYear,
      month: selectedMonth + 1, // 1..12
      city,
      week: selectedWeek,
      day: selectedDay,
      keyword: keyword?.trim() || '',
      weeks,
    };
    onSearch?.(payload);
  };

  return (
    <div className="filter-container filter-container--row">
      {/* Mes */}
      <div className="dropdown filtro" ref={monthDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${monthDropdownOpen ? 'open' : ''}`}
          onClick={() => setMonthDropdownOpen((o) => !o)}
        >
          <span>{months[selectedMonth]}</span>
          <span className="arrow">▼</span>
        </button>
        {monthDropdownOpen && (
          <div className="dropdown-content">
            {months.map((m, idx) => (
              <button
                key={m}
                type="button"
                className={selectedMonth === idx ? 'selected' : ''}
                onClick={() => {
                  setSelectedMonth(idx);
                  setMonthDropdownOpen(false);
                }}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Año */}
      <div className="dropdown filtro" ref={yearDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${yearDropdownOpen ? 'open' : ''}`}
          onClick={() => setYearDropdownOpen((o) => !o)}
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
                onClick={() => {
                  setSelectedYear(y);
                  setYearDropdownOpen(false);
                }}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ciudad */}
      <div className="dropdown filtro" ref={cityDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${cityDropdownOpen ? 'open' : ''} ${city ? 'city-selected' : ''}`}
          onClick={() => setCityDropdownOpen((o) => !o)}
        >
          <span>{city || (ciudadesLoading ? 'Cargando ciudades…' : 'Seleccionar ciudad')}</span>
          <span className="arrow">▼</span>
        </button>
        {cityDropdownOpen && (
          <div className="dropdown-content">
            {city && (
              <button
                type="button"
                className="clear-option"
                onClick={() => {
                  setCity('');
                  setCityDropdownOpen(false);
                }}
              >
                Limpiar selección
              </button>
            )}
            {ciudadesLoading ? (
              <div className="loading">Cargando…</div>
            ) : (
              ciudades.map((ciu, idx) => (
                <button
                  key={`${ciu}-${idx}`}
                  type="button"
                  className={city === ciu ? 'selected' : ''}
                  onClick={() => {
                    setCity(ciu);
                    setCityDropdownOpen(false);
                  }}
                >
                  {ciu}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Semana */}
      <div className="dropdown filtro" ref={weekDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${weekDropdownOpen ? 'open' : ''}`}
          onClick={() => setWeekDropdownOpen((o) => !o)}
        >
          <span>
            {selectedWeek
              ? (() => {
                  const [d1, d2] = weeks[selectedWeek - 1] || [null, null];
                  return d1 && d2 ? `Semana ${selectedWeek} (${d1}–${d2})` : `Semana ${selectedWeek}`;
                })()
              : 'Todas las semanas'}
          </span>
          <span className="arrow">▼</span>
        </button>

        {weekDropdownOpen && (
          <div className="dropdown-content">
            <button
              type="button"
              className={!selectedWeek ? 'selected' : ''}
              onClick={() => {
                setSelectedWeek(null);
                setWeekDropdownOpen(false);
              }}
            >
              Todas las semanas
            </button>
            {weeks.map(([d1, d2], idx) => (
              <button
                key={`wk-${idx + 1}`}
                type="button"
                className={selectedWeek === idx + 1 ? 'selected' : ''}
                onClick={() => {
                  setSelectedWeek(idx + 1);
                  setWeekDropdownOpen(false);
                }}
              >
                {`Semana ${idx + 1} (${d1}–${d2})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Día */}
      <div className="dropdown filtro" ref={dayDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${dayDropdownOpen ? 'open' : ''}`}
          onClick={() => setDayDropdownOpen((o) => !o)}
          disabled={!daysOptions.length}
        >
          <span>{selectedDay || 'Todos los días'}</span>
          <span className="arrow">▼</span>
        </button>

        {dayDropdownOpen && (
          <div className="dropdown-content">
            <button
              type="button"
              className={!selectedDay ? 'selected' : ''}
              onClick={() => {
                setSelectedDay(null);
                setDayDropdownOpen(false);
              }}
            >
              Todos los días
            </button>

            {daysOptions.map((d) => (
              <button
                key={d.iso}
                type="button"
                className={selectedDay === d.iso ? 'selected' : ''}
                onClick={() => {
                  setSelectedDay(d.iso);
                  setDayDropdownOpen(false);
                }}
              >
                {d.iso}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Palabras clave */}
      <div className="filtro filtro-keyword">
        <input
          type="text"
          className="keyword-input"
          placeholder="Buscar por palabra clave…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
      </div>

      <button id="buscarServicios" onClick={handleSearch} className="search-button">
        BUSCAR SERVICIOS
      </button>
    </div>
  );
};

export default FiltrarServicios;
