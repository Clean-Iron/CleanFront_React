'use client';
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { buscarEmpleadosByCity, buscarServiciosPorMesDeEmpleado } from "@/lib/Logic.js";
import { useCiudades } from "@/lib/Hooks.js";
import CalendarioServicios from "./CalendarioServicios";
import CalendarioEspacios from "./CalendarioEspacios";

function getWeeksOfMonth(year, month /*0-based*/) {
  // Devuelve semanas [ [d1,d2], ... ] en Lunes..Domingo dentro del mes
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let d = 1;
  while (d <= lastDay) {
    const date = new Date(year, month, d);
    const dow = (date.getDay() + 6) % 7; // L=0..D=6
    const start = Math.max(1, d - dow);
    let end = start;
    while (end <= lastDay) {
      const ed = new Date(year, month, end);
      const isSunday = ed.getDay() === 0;
      if (isSunday || end === lastDay) break;
      end++;
    }
    weeks.push([start, end]);
    d = end + 1;
  }
  return weeks;
}

const ResumenGeneral = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [city, setCity] = useState('');
  const { ciudades, isLoading, isError } = useCiudades();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dataServicios, setDataServicios] = useState([]);

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  // NUEVO: filtro de semana
  const [selectedWeek, setSelectedWeek] = useState(null); // 1..N o null = todas
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);

  const [employeeText, setEmployeeText] = useState("");
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  const employeeRef = useRef(null);
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const weekDropdownRef = useRef(null);

  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const weeks = useMemo(() => getWeeksOfMonth(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  useEffect(() => {
    if (city) {
      buscarEmpleadosByCity(city)
        .then(list => {
          list = list || [];
          setEmployees(list);
          setSelectedEmployee(null);
          setEmployeeText("");
          setEmpleadosFiltrados(list);
          setSelectedWeek(null); // reset semana
        })
        .catch(() => {
          setEmployees([]); setSelectedEmployee(null); setEmployeeText(""); setEmpleadosFiltrados([]); setSelectedWeek(null);
        });
    } else {
      setEmployees([]); setSelectedEmployee(null); setEmployeeText(""); setEmpleadosFiltrados([]); setSelectedWeek(null);
    }
  }, [city]);

  useEffect(() => {
    if (!selectedEmployee) { setDataServicios([]); return; }
    const year = selectedYear;
    const month = selectedMonth + 1;
    buscarServiciosPorMesDeEmpleado(selectedEmployee.document, year, month)
      .then(data => setDataServicios(data))
      .catch(err => { console.error(err); setDataServicios([]); });
  }, [selectedEmployee, selectedMonth, selectedYear]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) setMonthDropdownOpen(false);
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) setYearDropdownOpen(false);
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) setCityDropdownOpen(false);
      if (employeeRef.current && !employeeRef.current.contains(e.target)) setShowEmployeeDropdown(false);
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(e.target)) setWeekDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset semana al cambiar mes/año/empleado
  useEffect(() => { setSelectedWeek(null); }, [selectedMonth, selectedYear]);
  useEffect(() => { setSelectedWeek(null); }, [selectedEmployee?.document]);

  const recargarServicios = () => {
    if (!selectedEmployee) { setDataServicios([]); return; }
    const year = selectedYear;
    const month = selectedMonth + 1;
    buscarServiciosPorMesDeEmpleado(selectedEmployee.document, year, month)
      .then(data => setDataServicios(data))
      .catch(err => { console.error(err); setDataServicios([]); });
  };

  const handleMonthSelect = (_, idx) => { setSelectedMonth(idx); setMonthDropdownOpen(false); };
  const handleYearSelect = (y) => { setSelectedYear(y); setYearDropdownOpen(false); };
  const handleCitySelect = (c) => { setCity(c); setCityDropdownOpen(false); };

  const filtrarEmpleados = (valor) => {
    setEmployeeText(valor);
    setShowEmployeeDropdown(true);
    const q = valor.trim().toLowerCase();
    if (!q) { setEmpleadosFiltrados(employees); return; }
    setEmpleadosFiltrados(
      employees.filter(emp => {
        const full = `${emp.name ?? ''} ${emp.surname ?? ''}`.toLowerCase();
        const doc = (emp.document ?? '').toString().toLowerCase();
        return full.includes(q) || doc.includes(q);
      })
    );
  };

  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp);
    setEmployeeText(`${emp.name} ${emp.surname}`);
    setShowEmployeeDropdown(false);
    setSelectedWeek(null); // al elegir empleado, muestra "Todas las semanas" por defecto
  };

  return (
    <div className="resumen-layout">
      <div className="resumen-container">
        <div className="filtros-toolbar">
          <Link href="/servicios" className="btn-53 filtro">
            <div className="original">⬅ Regresar</div>
            <div className="letters"><span>M</span><span>E</span><span>N</span><span>Ú</span></div>
          </Link>

          {/* Mes */}
          <div className="dropdown filtro" ref={monthDropdownRef}>
            <button type="button" className={`dropdown-trigger ${monthDropdownOpen ? "open" : ""}`} onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}>
              <span>{months[selectedMonth]}</span><span className="arrow">▼</span>
            </button>
            {monthDropdownOpen && (
              <div className="dropdown-content">
                {months.map((m, i) => (
                  <button key={i} type="button" className={selectedMonth === i ? "selected" : ""} onClick={() => handleMonthSelect(m, i)}>{m}</button>
                ))}
              </div>
            )}
          </div>

          {/* Año */}
          <div className="dropdown filtro" ref={yearDropdownRef}>
            <button type="button" className={`dropdown-trigger ${yearDropdownOpen ? "open" : ""}`} onClick={() => setYearDropdownOpen(!yearDropdownOpen)}>
              <span>{selectedYear}</span><span className="arrow">▼</span>
            </button>
            {yearDropdownOpen && (
              <div className="dropdown-content">
                {years.map((y) => (
                  <button key={y} type="button" className={selectedYear === y ? "selected" : ""} onClick={() => handleYearSelect(y)}>{y}</button>
                ))}
              </div>
            )}
          </div>

          {/* Ciudad */}
          <div className="dropdown filtro" ref={cityDropdownRef}>
            <button type="button" className={`dropdown-trigger ${cityDropdownOpen ? "open" : ""} ${city ? "city-selected" : ""}`} onClick={() => setCityDropdownOpen(!cityDropdownOpen)}>
              <span>{city || "Seleccionar ciudad"}</span><span className="arrow">▼</span>
            </button>
            {cityDropdownOpen && (
              <div className="dropdown-content">
                {city && <button type="button" className="clear-option" onClick={() => handleCitySelect("")}>Limpiar selección</button>}
                {isLoading && <div>Cargando ciudades...</div>}
                {isError && <div>Error al cargar ciudades</div>}
                {!isLoading && !isError && ciudades.map((c, idx) => (
                  <button key={idx} type="button" className={city === c ? "selected" : ""} onClick={() => handleCitySelect(c)}>{c}</button>
                ))}
              </div>
            )}
          </div>

          {/* Empleado */}
          {employees.length > 0 && (
            <div className="dropdown filtro" ref={employeeRef}>
              <input
                type="text"
                placeholder="Selec. empleado"
                value={employeeText}
                onChange={(e) => filtrarEmpleados(e.target.value)}
                onFocus={() => { setShowEmployeeDropdown(true); setEmpleadosFiltrados(employees); }}
              />
              {showEmployeeDropdown && empleadosFiltrados.length > 0 && (
                <div className="dropdown-content">
                  {empleadosFiltrados.map(emp => (
                    <button
                      key={emp.document}
                      type="button"
                      className={selectedEmployee?.document === emp.document ? "selected" : ""}
                      onClick={() => handleEmployeeSelect(emp)}
                    >
                      {emp.name} {emp.surname}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ⬇️ NUEVO: Filtro de Semana (solo si hay empleado seleccionado) */}
          {selectedEmployee && (
            <div className="dropdown filtro" ref={weekDropdownRef}>
              <button
                type="button"
                className={`dropdown-trigger ${weekDropdownOpen ? "open" : ""}`}
                onClick={() => setWeekDropdownOpen(!weekDropdownOpen)}
              >
                <span>
                  {selectedWeek ? (() => {
                    const [d1,d2] = weeks[selectedWeek - 1] || [null,null];
                    return d1 && d2 ? `Semana ${selectedWeek} (${d1}–${d2})` : `Semana ${selectedWeek}`;
                  })() : 'Todas las semanas'}
                </span>
                <span className="arrow">▼</span>
              </button>
              {weekDropdownOpen && (
                <div className="dropdown-content">
                  <button type="button" className={!selectedWeek ? "selected" : ""} onClick={() => { setSelectedWeek(null); setWeekDropdownOpen(false); }}>
                    Todas las semanas
                  </button>
                  {weeks.map(([d1,d2], idx) => (
                    <button
                      key={idx+1}
                      type="button"
                      className={selectedWeek === (idx+1) ? "selected" : ""}
                      onClick={() => { setSelectedWeek(idx+1); setWeekDropdownOpen(false); }}
                    >
                      {`Semana ${idx+1} (${d1}–${d2})`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedEmployee ? (
          <CalendarioServicios
            employee={selectedEmployee}
            dataServicios={dataServicios}
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onServiceUpdate={recargarServicios}
            visibleWeek={selectedWeek}  /* ⬅️ NUEVO */
          />
        ) : (
          <CalendarioEspacios
            city={city}
            currentMonth={selectedMonth}
            currentYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
};

export default ResumenGeneral;
