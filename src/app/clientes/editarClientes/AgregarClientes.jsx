import React, { useState, useEffect, useRef } from "react";
import ModalEditarDirecciones from "./ModalEditarDirecciones.jsx";
import { agregarCliente } from "@/lib/Logic.js";

const AgregarClientes = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [comentarios, setComentarios] = useState('');

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
    if (!nombre || !documento || !email || !tipoDocumento || !direcciones.length === 0) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const nuevoCliente = {
      name: nombre,
      surname: apellido,
      document: documento,
      email: email,
      phone: phone,
      typeId: tipoDocumento,
      addresses: direcciones,
      comments: comentarios
    };

    try {
      await agregarCliente(nuevoCliente);
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
    setComentarios("");
    setDirecciones([]);
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
          <label htmlFor="nombre">Nombre(s)</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="apellido">Apellido(s)</label>
          <input
            id="apellido"
            type="text"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="tipoDocumento">Tipo ID</label>
          <div className="dropdown" ref={tipoIdDropdownRef}>
            <button
              id="tipoDocumento"
              type="button"
              className={`dropdown-trigger ${tipoIdDropdownOpen ? "open" : ""}`}
              onClick={() => setTipoIdDropdownOpen(o => !o)}
            >
              <span>{tipoDocumento || "Seleccionar Tipo ID"}</span>
              <span className="arrow">▼</span>
            </button>
            {tipoIdDropdownOpen && (
              <div className="dropdown-content">
                {tipoId.map((tipo, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setTipoDocumento(tipo);
                      setTipoIdDropdownOpen(false);
                    }}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="documento">N° Documento</label>
          <input
            id="documento"
            type="text"
            value={documento}
            onChange={e => setDocumento(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="menu-btn"
          onClick={() => setMostrarModalDirecciones(true)}
        >
          📍 Editar Direcciones ({direcciones.length})
        </button>

        <div className="input-group">
          <label htmlFor="phone">N° Celular - Telefono</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Comentarios</label>
          <textarea
            className="modal-asignacion-textarea"
            value={comentarios}
            onChange={e => setComentarios(e.target.value)}
          />
        </div>
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={handleSubmit}>➕ AGREGAR</button>
        <button type="reset" className="cancel-btn" onClick={handleCancelar}>❌ CANCELAR</button>
      </div>

      {mostrarModalDirecciones && (
        <ModalEditarDirecciones
          cliente={{ addresses: direcciones }}
          onClose={() => setMostrarModalDirecciones(false)}
          onGuardar={manejarGuardarDirecciones}
        />
      )}
    </div>
  );
};

export default AgregarClientes;