import React, { useState, useEffect, useRef } from "react";
import { buscarClientes, buscarServiciosConParam } from "@/lib/Services/Logic.js";


const BuscarTarea = ({ onResultado }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const [personas, setPersonas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nombresFiltrados, setNombresFiltrados] = useState([]);
  const [apellidosFiltrados, setApellidosFiltrados] = useState([]);

  const [showNombreDropdown, setShowNombreDropdown] = useState(false);
  const [showApellidoDropdown, setShowApellidoDropdown] = useState(false);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);

  const ciudadDropdownRef = useRef(null);
  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);

  const ciudades = ["Bogota", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena"];

  const nombresUnicos = [...new Set(personas.map(p => p.name))];
  const apellidosUnicos = [...new Set(personas.map(p => p.surname))];

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const data = await buscarClientes();
        setPersonas(data);
      } catch (error) {
        console.error("Error al cargar personas:", error);
      }
    };

    fetchPersonas();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target) &&
        nombreRef.current && !nombreRef.current.contains(event.target) &&
        apellidoRef.current && !apellidoRef.current.contains(event.target)
      ) {
        setCiudadDropdownOpen(false);
        setShowNombreDropdown(false);
        setShowApellidoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBuscar = async () => {

    setLoading(true);
    setMensajeError(false);

    try {
      const servicios = await buscarServiciosConParam(nombre, apellido, selectedCity, date);
      if (servicios) {
        onResultado(servicios, { nombre, apellido, selectedCity, date });
        setMensajeError(false);
      } else {
        onResultado(null);
        setMensajeError(true);
      }
    } catch (err) {
      console.error("Error en la búsqueda:", err);
      onResultado(null);
      setMensajeError(true);
    } finally {
      setLoading(false);
    }
  };

  const filtrarNombres = (valor) => {
    setNombre(valor);
    setShowNombreDropdown(true);
    setNombresFiltrados(nombresUnicos.filter(n => n.toLowerCase().includes(valor.toLowerCase())));
  };

  const filtrarApellidos = (valor) => {
    setApellido(valor);
    setShowApellidoDropdown(true);
    setApellidosFiltrados(apellidosUnicos.filter(a => a.toLowerCase().includes(valor.toLowerCase())));
  };

  return (
    <div className="busqueda-form-grid">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="busqueda-full-width"
      />

      {/* Nombre Cliente */}
      <div className="dropdown" ref={nombreRef}>
        <input
          type="text"
          placeholder="Nombre del Cliente"
          value={nombre}
          onChange={(e) => filtrarNombres(e.target.value)}
          onFocus={() => filtrarNombres(nombre)}
        />
        {showNombreDropdown && nombresFiltrados.length > 0 && (
          <div className="dropdown-content">
            {nombresFiltrados.map((n, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setNombre(n);
                  setShowNombreDropdown(false);
                }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Apellido Cliente */}
      <div className="dropdown" ref={apellidoRef}>
        <input
          type="text"
          placeholder="Apellido del Cliente"
          value={apellido}
          onChange={(e) => filtrarApellidos(e.target.value)}
          onFocus={() => filtrarApellidos(apellido)}
        />
        {showApellidoDropdown && apellidosFiltrados.length > 0 && (
          <div className="dropdown-content">
            {apellidosFiltrados.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setApellido(a);
                  setShowApellidoDropdown(false);
                }}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ciudad Dropdown */}
      <div className="dropdown busqueda-full-width" ref={ciudadDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${ciudadDropdownOpen ? "open" : ""}`}
          onClick={() => setCiudadDropdownOpen(!ciudadDropdownOpen)}
        >
          <span>{selectedCity || "Seleccionar ciudad"}</span>
          <span className="arrow">▼</span>
        </button>
        {ciudadDropdownOpen && (
          <div className="dropdown-content busqueda-full-width">
            {ciudades.map((ciudad, index) => (
              <button key={index} type="button" onClick={() => {
                setSelectedCity(ciudad);
                setCiudadDropdownOpen(false);
              }}>
                {ciudad}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="busqueda-form-buttons busqueda-full-width">
        <button type="button" onClick={handleBuscar} className="menu-btn">
          {loading ? "Buscando..." : "🔍 BUSCAR"}
        </button>
      </div>

      {mensajeError && <p className="no-results">no se encontraron resultados</p>}
    </div>
  );
};

export default BuscarTarea;
