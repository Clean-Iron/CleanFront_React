import React, { useState, useEffect } from "react";
import { eliminarEmpleado } from "@/lib/Services/Logic.js";
const EliminarClientes = ({ cliente, onVolver }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.name || "");
      setApellido(cliente.surname || "");
      setDocumento(cliente.document || "");
      setEmail(cliente.email || "");
      setPhone(cliente.phone || "");
      setDireccion(cliente.addressResidence || "");
      setCiudad(cliente.city || "");
    }
  }, [cliente]);

  const handleEliminar = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al cliente ${nombre} ${apellido}?`)) {
      try {
        await eliminarEmpleado(cliente.document);
      } catch (error) {
        alert("Error al agregar Cliente.");
        console.error(error);
      }
      alert("Cliente eliminado correctamente ✅");
      if (onVolver) onVolver();
    }
  };

  const handleCancelar = () => {
    if (onVolver) {
      onVolver();
    }
  };

  return (
    <div className="empleados-form-grid">
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="text"
        placeholder="Apellido"
        value={apellido}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="text"
        placeholder="Documento"
        value={documento}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={phone}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="text"
        placeholder="Dirección"
        value={direccion}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="text"
        placeholder="Ciudad"
        value={ciudad}
        readOnly
        className="empleados-readonly"
      />

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={onVolver}>
          🔄 NUEVA BÚSQUEDA
        </button>
        <button type="button" className="menu-btn delete-btn" onClick={handleEliminar}>
          🗑️ ELIMINAR
        </button>
        <button type="button" className="menu-btn" onClick={handleCancelar}>
          ❌ CANCELAR
        </button>
      </div>
    </div>
  );
};

export default EliminarClientes;