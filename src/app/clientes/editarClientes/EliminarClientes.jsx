import React, { useState, useEffect } from "react";
import { eliminarEmpleado } from "@/lib/Logic.js";
const EliminarClientes = ({ cliente, onVolver }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.name || "");
      setApellido(cliente.surname || "");
      setDocumento(cliente.document || "");
      setEmail(cliente.email || "");
      setPhone(cliente.phone || "");
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
      <div className="input-group">
        <label htmlFor="elim-nombre">Nombre(s)</label>
        <input
          id="elim-nombre"
          type="text"
          value={nombre}
          readOnly
          className="empleados-readonly"
        />
      </div>
      <div className="input-group">
        <label htmlFor="elim-apellido">Apellido(s)</label>
        <input
          id="elim-apellido"
          type="text"
          value={apellido}
          readOnly
          className="empleados-readonly"
        />
      </div>
      <div className="input-group">
        <label htmlFor="elim-documento">N° Documento</label>
        <input
          id="elim-documento"
          type="text"
          value={documento}
          readOnly
          className="empleados-readonly"
        />
      </div>
      <div className="input-group">
        <label htmlFor="elim-email">Correo electrónico</label>
        <input
          id="elim-email"
          type="email"
          value={email}
          readOnly
          className="empleados-readonly"
        />
      </div>
      <div className="input-group">
        <label htmlFor="elim-phone">N° Celular - Telefono</label>
        <input
          id="elim-phone"
          type="text"
          value={phone}
          readOnly
          className="empleados-readonly"
        />
      </div>

      <div className="empleados-form-buttons empleados-full-width">
        <button type="button" className="menu-btn" onClick={onVolver}>
          🔄 NUEVA BÚSQUEDA
        </button>
        <button type="button" className="delete-btn" onClick={handleEliminar}>
          🗑️ ELIMINAR
        </button>
        <button type="button" className="cancel-btn" onClick={handleCancelar}>
          ❌ CANCELAR
        </button>
      </div>
    </div>
  );
};

export default EliminarClientes;