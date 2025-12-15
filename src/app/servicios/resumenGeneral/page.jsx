'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

import {
  buscarEmpleadosByCity,
  buscarServiciosPorMesDeEmpleado,
  buscarClientesByCity,
  buscarServiciosPorMesDeClientes,
} from "@/lib/Logic.js";

import { useCiudades } from "@/lib/Hooks.js";
import CalendarioServicios from "./CalendarioServicios";
import CalendarioEspacios from "./CalendarioEspacios";
import CalendarioClientes from "./CalendarioClientes";

import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

function getWeeksOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let d = 1;

  while (d <= lastDay) {
    const date = new Date(year, month, d);
    const dow = (date.getDay() + 6) % 7; // lunes = 0
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
  const [city, setCity] = useState("");
  const { ciudades, isLoading, isError } = useCiudades();

  const [viewMode, setViewMode] = useState("clients");

  // Empleados
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeText, setEmployeeText] = useState("");
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Clientes
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientText, setClientText] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Servicios empleado
  const [dataServicios, setDataServicios] = useState([]);

  // Servicios cliente
  const [dataServiciosCliente, setDataServiciosCliente] = useState([]);

  // Dropdowns
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);

  // Semana (1..N, null = todas)
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Refs
  const employeeRef = useRef(null);
  const clientRef = useRef(null);
  const monthDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const weekDropdownRef = useRef(null);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const weeks = useMemo(
    () => getWeeksOfMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  // Entidad sobre la que aplica el filtro de semanas
  const selectedEntity =
    viewMode === "employees" ? selectedEmployee : selectedClient;

  // Cargar empleados y clientes por ciudad
  useEffect(() => {
    if (city) {
      buscarEmpleadosByCity(city)
        .then((list) => {
          list = list || [];
          setEmployees(list);
          setSelectedEmployee(null);
          setEmployeeText("");
          setEmpleadosFiltrados(list);
        })
        .catch(() => {
          setEmployees([]);
          setSelectedEmployee(null);
          setEmployeeText("");
          setEmpleadosFiltrados([]);
        });

      buscarClientesByCity(city)
        .then((list) => {
          list = list || [];
          setClients(list);
          setSelectedClient(null);
          setClientText("");
          setClientesFiltrados(list);
        })
        .catch(() => {
          setClients([]);
          setSelectedClient(null);
          setClientText("");
          setClientesFiltrados([]);
        });

      setSelectedWeek(null);
      setDataServicios([]);
      setDataServiciosCliente([]);
    } else {
      setEmployees([]);
      setSelectedEmployee(null);
      setEmployeeText("");
      setEmpleadosFiltrados([]);

      setClients([]);
      setSelectedClient(null);
      setClientText("");
      setClientesFiltrados([]);

      setSelectedWeek(null);
      setDataServicios([]);
      setDataServiciosCliente([]);
    }
  }, [city]);

  // Servicios del empleado
  useEffect(() => {
    if (!selectedEmployee) {
      setDataServicios([]);
      return;
    }
    const year = selectedYear;
    const month = selectedMonth + 1;

    buscarServiciosPorMesDeEmpleado(selectedEmployee.document, year, month)
      .then((data) => setDataServicios(data || []))
      .catch((err) => {
        console.error(err);
        setDataServicios([]);
      });
  }, [selectedEmployee, selectedMonth, selectedYear]);

  // Servicios del cliente
  useEffect(() => {
    if (!selectedClient) {
      setDataServiciosCliente([]);
      return;
    }
    const year = selectedYear;
    const month = selectedMonth + 1;

    buscarServiciosPorMesDeClientes(selectedClient.document, year, month)
      .then((data) => setDataServiciosCliente(data || []))
      .catch((err) => {
        console.error(err);
        setDataServiciosCliente([]);
      });
  }, [selectedClient, selectedMonth, selectedYear]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target))
        setMonthDropdownOpen(false);
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target))
        setYearDropdownOpen(false);
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target))
        setCityDropdownOpen(false);
      if (employeeRef.current && !employeeRef.current.contains(e.target))
        setShowEmployeeDropdown(false);
      if (clientRef.current && !clientRef.current.contains(e.target))
        setShowClientDropdown(false);
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(e.target))
        setWeekDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset de semana al cambiar filtros principales
  useEffect(() => {
    setSelectedWeek(null);
  }, [
    selectedMonth,
    selectedYear,
    selectedEmployee?.document,
    selectedClient?.document,
    viewMode,
  ]);

  const handleMonthSelect = (_, idx) => {
    setSelectedMonth(idx);
    setMonthDropdownOpen(false);
  };

  const handleYearSelect = (y) => {
    setSelectedYear(y);
    setYearDropdownOpen(false);
  };

  const handleCitySelect = (c) => {
    setCity(c);
    setCityDropdownOpen(false);
  };

  const filtrarEmpleados = (valor) => {
    setEmployeeText(valor);
    setShowEmployeeDropdown(true);
    const q = valor.trim().toLowerCase();
    if (!q) {
      setEmpleadosFiltrados(employees);
      return;
    }
    setEmpleadosFiltrados(
      employees.filter((emp) => {
        const full = `${emp.name ?? ""} ${emp.surname ?? ""}`.toLowerCase();
        const doc = (emp.document ?? "").toString().toLowerCase();
        return full.includes(q) || doc.includes(q);
      })
    );
  };

  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp);
    setEmployeeText(`${emp.name} ${emp.surname ?? ""}`.trim());
    setShowEmployeeDropdown(false);
    setSelectedWeek(null);
  };

  const filtrarClientes = (valor) => {
    setClientText(valor);
    setShowClientDropdown(true);
    const q = valor.trim().toLowerCase();
    if (!q) {
      setClientesFiltrados(clients);
      return;
    }
    setClientesFiltrados(
      clients.filter((cli) => {
        const full = `${cli.name ?? ""} ${cli.surname ?? ""}`.toLowerCase();
        const doc = (cli.document ?? "").toString().toLowerCase();
        return full.includes(q) || doc.includes(q);
      })
    );
  };

  const handleClientSelect = (cli) => {
    setSelectedClient(cli);
    setClientText(
      `${cli.name ?? ""} ${cli.surname ?? ""}`.trim() || cli.document
    );
    setShowClientDropdown(false);
    setSelectedWeek(null);
  };

  // helper para refrescar servicios del empleado seleccionado
  const refetchServiciosEmpleado = useMemo(() => {
    return () => {
      if (!selectedEmployee) return;
      const year = selectedYear;
      const month = selectedMonth + 1;
      buscarServiciosPorMesDeEmpleado(selectedEmployee.document, year, month)
        .then((data) => setDataServicios(data || []))
        .catch(() => { });
    };
  }, [selectedEmployee, selectedMonth, selectedYear]);

  return (
    <div className="resumen-layout">
      <div className="resumen-container">
        <div className="filtros-toolbar">
          <div className="filtros-row filtros-row-main">
            <Link href="/servicios" className="btn-53 filtro">
              <div className="original">⬅ REGRESAR</div>
              <div className="letters">
                <span>M</span>
                <span>E</span>
                <span>N</span>
                <span>Ú</span>
              </div>
            </Link>

            {/* Mes */}
            <div className="dropdown filtro" ref={monthDropdownRef}>
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

            {/* Año */}
            <div className="dropdown filtro" ref={yearDropdownRef}>
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

            {/* Ciudad */}
            <div className="dropdown filtro" ref={cityDropdownRef}>
              <button
                type="button"
                className={`dropdown-trigger ${cityDropdownOpen ? "open" : ""} ${city ? "city-selected" : ""
                  }`}
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
                      onClick={() => handleCitySelect("")}
                    >
                      Limpiar selección
                    </button>
                  )}
                  {isLoading && <div>Cargando ciudades...</div>}
                  {isError && <div>Error al cargar ciudades</div>}
                  {!isLoading &&
                    !isError &&
                    ciudades.map((c, idx) => (
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

            {/* Toggle Clientes / Empleados */}
            <div className="view-toggle">
              <button
                type="button"
                className={`view-option ${viewMode === "clients" ? "active" : ""
                  }`}
                onClick={() => {
                  setViewMode("clients");
                  setSelectedEmployee(null);
                  setEmployeeText("");
                  setSelectedWeek(null);
                }}
              >
                <GroupOutlinedIcon className="view-icon" />
                <span>Clientes</span>
              </button>

              <button
                type="button"
                className={`view-option ${viewMode === "employees" ? "active" : ""
                  }`}
                onClick={() => {
                  setViewMode("employees");
                  setSelectedClient(null);
                  setClientText("");
                  setSelectedWeek(null);
                }}
              >
                <BadgeOutlinedIcon className="view-icon" />
                <span>Empleados</span>
              </button>
            </div>
          </div>

          {((viewMode === "employees" && employees.length > 0) ||
            (viewMode === "clients" && clients.length > 0)) && (
              <div className="filtros-row filtros-row-secondary">
                {viewMode === "employees" ? (
                  <div className="dropdown filtro" ref={employeeRef}>
                    <input
                      type="text"
                      placeholder="Selec. empleado"
                      value={employeeText}
                      onChange={(e) => filtrarEmpleados(e.target.value)}
                      onFocus={() => {
                        setShowEmployeeDropdown(true);
                        setEmpleadosFiltrados(employees);
                      }}
                    />
                    {showEmployeeDropdown && empleadosFiltrados.length > 0 && (
                      <div className="dropdown-content">
                        {empleadosFiltrados.map((emp) => (
                          <button
                            key={emp.document}
                            type="button"
                            className={
                              selectedEmployee?.document === emp.document
                                ? "selected"
                                : ""
                            }
                            onClick={() => handleEmployeeSelect(emp)}
                          >
                            {emp.name} {emp.surname}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="dropdown filtro" ref={clientRef}>
                    <input
                      type="text"
                      placeholder="Selec. cliente"
                      value={clientText}
                      onChange={(e) => filtrarClientes(e.target.value)}
                      onFocus={() => {
                        setShowClientDropdown(true);
                        setClientesFiltrados(clients);
                      }}
                    />
                    {showClientDropdown && clientesFiltrados.length > 0 && (
                      <div className="dropdown-content">
                        {clientesFiltrados.map((cli) => (
                          <button
                            key={cli.document}
                            type="button"
                            className={
                              selectedClient?.document === cli.document
                                ? "selected"
                                : ""
                            }
                            onClick={() => handleClientSelect(cli)}
                          >
                            {cli.name} {cli.surname}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dropdown de semanas */}
                {selectedEntity && (
                  <div className="dropdown filtro" ref={weekDropdownRef}>
                    <button
                      type="button"
                      className={`dropdown-trigger ${weekDropdownOpen ? "open" : ""
                        }`}
                      onClick={() => setWeekDropdownOpen(!weekDropdownOpen)}
                    >
                      <span>
                        {selectedWeek
                          ? (() => {
                            const [d1, d2] =
                              weeks[selectedWeek - 1] || [null, null];
                            return d1 && d2
                              ? `Semana ${selectedWeek} (${d1}–${d2})`
                              : `Semana ${selectedWeek}`;
                          })()
                          : "Todas las semanas"}
                      </span>
                      <span className="arrow">▼</span>
                    </button>
                    {weekDropdownOpen && (
                      <div className="dropdown-content">
                        <button
                          type="button"
                          className={!selectedWeek ? "selected" : ""}
                          onClick={() => {
                            setSelectedWeek(null);
                            setWeekDropdownOpen(false);
                          }}
                        >
                          Todas las semanas
                        </button>
                        {weeks.map(([d1, d2], idx) => (
                          <button
                            key={idx + 1}
                            type="button"
                            className={
                              selectedWeek === idx + 1 ? "selected" : ""
                            }
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
                )}
              </div>
            )}
        </div>

        {viewMode === "employees" && selectedEmployee ? (
          <CalendarioServicios
            employee={selectedEmployee}
            dataServicios={dataServicios}
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            visibleWeek={selectedWeek}
            onServiceUpdate={refetchServiciosEmpleado}
          />
        ) : viewMode === "clients" && selectedClient ? (
          <CalendarioClientes
            selectedClient={selectedClient}
            dataServicios={dataServiciosCliente}
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            visibleWeek={selectedWeek}
            calendarCity={city}
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