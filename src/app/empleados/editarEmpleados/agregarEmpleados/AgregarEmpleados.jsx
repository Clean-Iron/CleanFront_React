import React, { useState, useRef, useEffect } from "react";
import { agregarEmpleado } from "./AgregarEmpleado";

const AgregarEmpleados = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [selectedCargo, setSelectedCargo] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [cargoDropdownOpen, setCargoDropdownOpen] = useState(false);
  const [estadoDropdownOpen, setEstadoDropdownOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState(false);
  
  
  const ciudadDropdownRef = useRef(null);
  const cargoDropdownRef = useRef(null);
  const estadoDropdownRef = useRef(null);

  const ciudades = [
    "Bogotá", "Medellín", "Cali",
    "Barranquilla", "Bucaramanga", "Cartagena"
  ];
  const cargos = [
    "Coordinador", "Supervisor", "Asistente Administrativo",
    "Secretario/a", "Auxiliar", "Contador",
    "Recursos Humanos", "Atención al Cliente", "Operario"
  ];

  const estados = ["Activo", "Inactivo"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) {
        setCargoDropdownOpen(false);
      }
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(event.target)) {
        setEstadoDropdownOpen(false);
      }
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) {
        setCiudadDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    if (!nombre || !apellido || !documento || !email || !selectedCargo || !fechaIngreso || !selectedEstado) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const nuevoEmpleado = {
      name: nombre,
      surname: apellido,
      document: documento,
      email: email,
      phone: phone,
      addressResidence: direccion,
      city: selectedCity,
      entryDate: fechaIngreso,
      position: selectedCargo,
      state: selectedEstado === "Activo"
    };

    try {
      await agregarEmpleado(nuevoEmpleado);
      alert("Empleado agregado exitosamente.");
      setNombre("");
      setApellido("");
      setDocumento("");
      setEmail("");
      setFechaIngreso("");
      setSelectedCargo("");
      setSelectedEstado("");
    } catch (error) {
      alert("Error al agregar empleado.");
      console.error(error);
    }
  };

  const handleCancelar = () => {
    const hayCamposLlenos = nombre || apellido || documento || email || phone || direccion || selectedCity || selectedCargo || selectedEstado || fechaIngreso;

    if (hayCamposLlenos) {
      const confirmar = window.confirm("¿Deseas borrar todos los campos?");
      if (confirmar) {
        resetBusqueda();
        setPhone("");
        setDireccion("");
        setSelectedCity("");
      }
    }
  };

  const resetBusqueda = () => {
    setNombre("");
    setApellido("");
    setDocumento("");
    setEmail("");
    setFechaIngreso("");
    setSelectedCargo("");
    setSelectedEstado("");
    setPhone("");
    setDireccion("");
    setSelectedCity("");
  };


  return (
    <div className="empleados-form-grid">
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)}
      />
      <input
        type="text"
        placeholder="Documento"
        value={documento}
        onChange={(e) => setDocumento(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input type="text" placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />

      {/* Dropdown Ciudad */}
      <div className="dropdown" ref={ciudadDropdownRef}>
        <button type="button" className={`dropdown-trigger ${ciudadDropdownOpen ? "open" : ""}`} onClick={() => setCiudadDropdownOpen(!ciudadDropdownOpen)}>
          <span>{selectedCity || "Seleccionar ciudad"}</span>
          <span className="arrow">▼</span>
        </button>
        {ciudadDropdownOpen && (
          <div className="dropdown-content">
            {ciudades.map((ciudad, index) => (
              <button key={index} type="button" onClick={() => { setSelectedCity(ciudad); setCiudadDropdownOpen(false); }}>
                {ciudad}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown Cargo */}
      <div className="dropdown" ref={cargoDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${cargoDropdownOpen ? "open" : ""}`}
          onClick={() => setCargoDropdownOpen(!cargoDropdownOpen)}
        >
          <span>{selectedCargo || "Seleccionar cargo"}</span>
          <span className="arrow">▼</span>
        </button>
        {cargoDropdownOpen && (
          <div className="dropdown-content">
            {cargos.map((cargo, index) => (
              <button key={index} type="button" onClick={() => {
                setSelectedCargo(cargo);
                setCargoDropdownOpen(false);
              }}>
                {cargo}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="date"
        placeholder="Fecha de ingreso"
        value={fechaIngreso}
        onChange={(e) => setFechaIngreso(e.target.value)}
      />

      {/* Dropdown Estado */}
      <div className="dropdown" ref={estadoDropdownRef}>
        <button
          type="button"
          className={`dropdown-trigger ${estadoDropdownOpen ? "open" : ""}`}
          onClick={() => setEstadoDropdownOpen(!estadoDropdownOpen)}
        >
          <span>{selectedEstado || "Seleccionar estado"}</span>
          <span className="arrow">▼</span>
        </button>
        {estadoDropdownOpen && (
          <div className="dropdown-content">
            {estados.map((estado, index) => (
              <button key={index} type="button" onClick={() => {
                setSelectedEstado(estado);
                setEstadoDropdownOpen(false);
              }}>
                {estado}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={handleSubmit}>
          ➕ AGREGAR
        </button>
        <button type="reset" className="menu-btn" onClick={handleCancelar}>
          ❌ CANCELAR
        </button>
      </div>
    </div>
  );
};

export default AgregarEmpleados;
