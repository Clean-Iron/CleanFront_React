import React, { useState, useRef, useEffect } from "react";
import { agregarEmpleado } from "@/lib/Logic.js";
import { useCiudades } from "@/lib/Hooks";

const AgregarEmpleados = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();
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
      <div
        className="empleados-full-width empleados-form-grid"
        style={{
          maxHeight: '45vh',   // por ejemplo, mitad de la ventana
          overflowY: 'auto',   // activa scroll interno
          paddingRight: '8px'  // para evitar que el scroll tape contenido
        }}
      >
        <div className="input-group">
          <label htmlFor="agregar-nombre">Nombre(s)</label>
          <input
            id="agregar-nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-apellido">Apellido(s)</label>
          <input
            id="agregar-apellido"
            type="text"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
          />
        </div>

        {/* Dropdown Ciudad */}
        <div className="input-group" ref={ciudadDropdownRef}>
          <label htmlFor="agregar-ciudad">Ciudad</label>
          <div className="dropdown">
            <button
              id="agregar-ciudad"
              type="button"
              className={`dropdown-trigger ${ciudadDropdownOpen ? "open" : ""}`}
              onClick={() => setCiudadDropdownOpen(o => !o)}
            >
              <span>
                {selectedCity || "Seleccionar ciudad"}
              </span>
              <span className="arrow">▼</span>
            </button>
            {ciudadDropdownOpen && (
              <div className="dropdown-content">
                {ciudadesLoading && <div>Cargando ciudades...</div>}
                {ciudadesError && <div>Error al cargar ciudades</div>}
                {!ciudadesLoading &&
                  !ciudadesError &&
                  ciudades.map((ciu, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedCity(ciu);
                        setCiudadDropdownOpen(false);
                      }}
                    >
                      {ciu}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Cargo */}
        <div className="input-group" ref={cargoDropdownRef}>
          <label htmlFor="agregar-cargo">Cargo</label>
          <div className="dropdown">
            <button
              id="agregar-cargo"
              type="button"
              className={`dropdown-trigger ${cargoDropdownOpen ? "open" : ""}`}
              onClick={() => setCargoDropdownOpen(o => !o)}
            >
              <span>
                {selectedCargo || "Seleccionar cargo"}
              </span>
              <span className="arrow">▼</span>
            </button>
            {cargoDropdownOpen && (
              <div className="dropdown-content">
                {cargos.map((cargo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedCargo(cargo);
                      setCargoDropdownOpen(false);
                    }}
                  >
                    {cargo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="agregar-direccion">Dirección</label>
          <input
            id="agregar-direccion"
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-documento">N° Documento</label>
          <input
            id="agregar-documento"
            type="text"
            value={documento}
            onChange={e => setDocumento(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-email">Correo electrónico</label>
          <input
            id="agregar-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="agregar-phone">N° Celular - Telefono</label>
          <input
            id="agregar-phone"
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        {/* Dropdown Estado */}
        <div className="input-group" ref={estadoDropdownRef}>
          <label htmlFor="agregar-estado">Estado</label>
          <div className="dropdown">
            <button
              id="agregar-estado"
              type="button"
              className={`dropdown-trigger ${estadoDropdownOpen ? "open" : ""}`}
              onClick={() => setEstadoDropdownOpen(o => !o)}
            >
              <span>
                {selectedEstado || "Seleccionar estado"}
              </span>
              <span className="arrow">▼</span>
            </button>
            {estadoDropdownOpen && (
              <div className="dropdown-content">
                {estados.map((est, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedEstado(est);
                      setEstadoDropdownOpen(false);
                    }}
                  >
                    {est}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="agregar-fecha">Fecha de ingreso</label>
          <input
            id="agregar-fecha"
            type="date"
            value={fechaIngreso}
            onChange={e => setFechaIngreso(e.target.value)}
          />
        </div>
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={handleSubmit}>
          ➕ AGREGAR
        </button>
        <button type="reset" className="cancel-btn" onClick={handleCancelar}>
          ❌ CANCELAR
        </button>
      </div>
    </div>
  );
};

export default AgregarEmpleados;
