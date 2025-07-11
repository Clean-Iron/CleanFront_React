import React, { useState, useEffect, useRef } from "react";
import ModalEditarDirecciones from "../modalEditarDirecciones/ModalEditarDirecciones.jsx";
import { agregarCliente } from "@/lib/Services/Logic.js";

const AgregarClientes = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [direcciones, setDirecciones] = useState([]);
  const [mostrarModalDirecciones, setMostrarModalDirecciones] = useState(false);
  const [tipoIdDropdownOpen, setTipoIdDropdownOpen] = useState(false);

  const tipoIdDropdownRef = useRef(null);

  const tipoId = [
    "CC", "TI", "NIT", "CE", "PA"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tipoIdDropdownRef.current && !tipoIdDropdownRef.current.contains(event.target)) {
        setTipoIdDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const manejarGuardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones);
  };

  const handleSubmit = async () => {
    if (!nombre || !apellido || !documento || !email || !tipoDocumento) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const nuevoEmpleado = {
      name: nombre,
      surname: apellido,
      document: documento,
      email: email,
      phone: phone,
      typeId: tipoDocumento,
      addresses: direcciones
    };

    try {
      await agregarCliente(nuevoEmpleado);
      alert("Cliente agregado exitosamente.");
      resetBusqueda();
    } catch (error) {
      alert("Error al agregar cliente.");
      console.error(error);
    }
  };

  const handleCancelar = () => {
    const hayCamposLlenos = nombre || apellido || documento || email || phone || tipoDocumento;
    if (hayCamposLlenos) {
      const confirmar = window.confirm("¿Deseas borrar todos los campos?");
      if (confirmar) resetBusqueda();
    }
  };

  const resetBusqueda = () => {
    setNombre("");
    setApellido("");
    setDocumento("");
    setEmail("");
    setPhone("");
    setTipoDocumento("");
    setDirecciones([]);
  };

  return (
    <div className="empleados-form-grid">
      <input type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input type="text"
        placeholder="Apellido"
        value={apellido}
        onChange={(e) => setApellido(e.target.value)} />

      {/* Dropdown Tipo ID */}
      <div className="dropdown" ref={tipoIdDropdownRef}>
        <button type="button" className={`dropdown-trigger ${tipoIdDropdownOpen ? "open" : ""}`} onClick={() => setTipoIdDropdownOpen(!tipoIdDropdownOpen)}>
          <span>{tipoDocumento || "Seleccionar Tipo ID"}</span>
          <span className="arrow">▼</span>
        </button>
        {tipoIdDropdownOpen && (
          <div className="dropdown-content">
            {tipoId.map((tipo, index) => (
              <button key={index} type="button" onClick={() => { setTipoDocumento(tipo); setTipoIdDropdownOpen(false); }}>
                {tipo}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <input type="text"
        placeholder="Documento"
        value={documento}
        onChange={(e) => setDocumento(e.target.value)} />



      <input type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input type="text"
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button type="button" className="menu-btn" onClick={() => setMostrarModalDirecciones(true)}>
        📍 Editar Direcciones ({direcciones.length})
      </button>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={handleSubmit}>➕ AGREGAR</button>
        <button type="reset" className="menu-btn" onClick={handleCancelar}>❌ CANCELAR</button>
      </div>

      {mostrarModalDirecciones && (
        <ModalEditarDirecciones
          onClose={() => setMostrarModalDirecciones(false)}
          onGuardar={manejarGuardarDirecciones}
        />
      )}
    </div>
  );
};

export default AgregarClientes;
