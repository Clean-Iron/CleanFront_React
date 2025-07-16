'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { buscarEmpleadosByCity, buscarServiciosPorMesDeEmpleado } from "@/lib/Services/Logic.js";
import { useCiudades } from "@/lib/Hooks/Hooks.js";
import CalendarioServicios from "./calendarioServicios/CalendarioServicios";
import CalendarioEspacios from "./calendarioEspacios/CalendarioEspacios";

const ResumenGeneral = () => {
  const [selectedDate, setSelectedDate] = useState('');
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
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Al cambiar la ciudad, traemos empleados
  useEffect(() => {
    if (city) {
      buscarEmpleadosByCity(city)
        .then(data => {
          setEmployees(data);
          setSelectedEmployee(null);
        })
        .catch(() => {
          setEmployees([]);
          setSelectedEmployee(null);
        });
    } else {
      setEmployees([]);
      setSelectedEmployee(null);
    }
  }, [city]);

  // Cargar datos de servicios al cambiar empleado, mes o año
  useEffect(() => {
    if (!selectedEmployee) {
      setDataServicios([]);
      return;
    }
    const year = selectedYear;
    const month = selectedMonth + 1;
    buscarServiciosPorMesDeEmpleado(selectedEmployee.document, year, month)
      .then(data => setDataServicios(data))
      .catch(err => { console.error(err); setDataServicios([]); });
  }, [selectedEmployee, selectedMonth, selectedYear]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
        setMonthDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
        setYearDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(e.target)) {
        setEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleButtonClick = (date, idx, label) => {
    console.log(`${label} seleccionado para ${date}, empleado: ${selectedEmployee?.name || 'ninguno'}`);
  };

  const handleMonthSelect = (name, idx) => {
    setSelectedMonth(idx);
    setMonthDropdownOpen(false);
  };
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setYearDropdownOpen(false);
  };
  const handleCitySelect = (c) => {
    setCity(c);
    setCityDropdownOpen(false);
  };
  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp);
    setEmployeeDropdownOpen(false);
  };

  const renderCalendar = () => {
    // Si hay empleado seleccionado -> CalendarioServicios (2 botones)
    if (selectedEmployee) {
      return (
        <CalendarioServicios
          dataServicios={dataServicios}
          onDateSelect={handleDateSelect}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          hideNavigation={true}
        />
      );
    }
    // Si NO hay empleado -> CalendarioEspacios (3 botones)
    return (
      <CalendarioEspacios
        onDateSelect={handleDateSelect}
        onButtonClick={handleButtonClick}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        hideNavigation={true}
        buttonLabels={['DISPONIBLE', 'OCUPADO', 'PERMISO/VAC']}
      />
    );
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
          <Link href="/servicios" className="btn-53">
            <div className="original">⬅ Regresar</div>
            <div className="letters">
              <span>M</span><span>E</span><span>N</span><span>Ú</span>
            </div>
          </Link>

          <div className="menu-buttons">
            <ul>
              {/* Mes */}
              <li>
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
                      {months.map((m, i) => (
                        <button
                          key={i}
                          type="button"
                          className={selectedMonth === i ? "selected" : ""}
                          onClick={() => handleMonthSelect(m, i)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>

              {/* Año */}
              <li>
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
                      {years.map((y) => (
                        <button
                          key={y}
                          type="button"
                          className={selectedYear === y ? "selected" : ""}
                          onClick={() => handleYearSelect(y)}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>

              {/* Ciudad */}
              <li>
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
                      {city && (
                        <button
                          type="button"
                          className="clear-option"
                          onClick={() => handleCitySelect('')}
                        >
                          Limpiar selección
                        </button>
                      )}
                      {isLoading && <div>Cargando ciudades...</div>}
                      {isError && <div>Error al cargar ciudades</div>}
                      {!isLoading && !isError && ciudades.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={city === c ? "selected" : ""}
                          onClick={() => handleCitySelect(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>

              {/* Empleado */}
              {employees.length > 0 && (
                <li>
                  <div className="dropdown" ref={employeeDropdownRef}>
                    <button
                      type="button"
                      className={`dropdown-trigger ${employeeDropdownOpen ? "open" : ""} ${selectedEmployee ? "employee-selected" : ""}`}
                      onClick={() => setEmployeeDropdownOpen(!employeeDropdownOpen)}
                    >
                      <span>
                        {selectedEmployee
                          ? `${selectedEmployee.name} ${selectedEmployee.surname}`
                          : "Selec. empleado"}
                      </span>
                      <span className="arrow">▼</span>
                    </button>
                    {employeeDropdownOpen && (
                      <div className="dropdown-content">
                        {selectedEmployee && (
                          <button
                            type="button"
                            className="clear-option"
                            onClick={() => handleEmployeeSelect(null)}
                          >
                            Limpiar selección
                          </button>
                        )}
                        {employees.map(emp => (
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
                </li>
              )}
            </ul>
          </div>
        </div>

        {renderCalendar()}
      </div>
    </div>
  );
};

export default ResumenGeneral;
