import React, { useState, useEffect } from "react";
import { eliminarEmpleado } from "@/lib/Logic.js";

const EliminarEmpleados = ({ empleadoData, onVolver }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [cargo, setCargo] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");

  // Fill form fields when employee data is received
  useEffect(() => {
    if (empleadoData) {
      setNombre(empleadoData.name || "");
      setApellido(empleadoData.surname || "");
      setDocumento(empleadoData.document || "");
      setEmail(empleadoData.email || "");
      setPhone(empleadoData.phone || "");
      setDireccion(empleadoData.addressResidence || "");
      setCiudad(empleadoData.city || "");
      setCargo(empleadoData.position || "");
      setEstado(empleadoData.state ? "Activo" : "Inactivo");
      setFechaIngreso(empleadoData.entryDate || "");
    }
  }, [empleadoData]);

  const handleEliminar = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al empleado ${nombre} ${apellido}?`)) {
      try {
        await eliminarEmpleado(empleadoData.document);
      } catch (error) {
        alert("Error al agregar empleado.");
        console.error(error);
      }
      alert("Empleado eliminado correctamente ✅");
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
      <div
        className="empleados-full-width empleados-form-grid"
        style={{
          maxHeight: '45vh',   // por ejemplo, mitad de la ventana
          overflowY: 'auto',   // activa scroll interno
          paddingRight: '8px'  // para evitar que el scroll tape contenido
        }}
      >
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

        <div className="input-group">
          <label htmlFor="elim-direccion">Dirección</label>
          <input
            id="elim-direccion"
            type="text"
            value={direccion}
            readOnly
            className="empleados-readonly"
          />
        </div>

        <div className="input-group">
          <label htmlFor="elim-ciudad">Ciudad</label>
          <input
            id="elim-ciudad"
            type="text"
            value={ciudad}
            readOnly
            className="empleados-readonly"
          />
        </div>

        <div className="input-group">
          <label htmlFor="elim-cargo">Cargo</label>
          <input
            id="elim-cargo"
            type="text"
            value={cargo}
            readOnly
            className="empleados-readonly"
          />
        </div>

        <div className="input-group">
          <label htmlFor="elim-estado">Estado</label>
          <input
            id="elim-estado"
            type="text"
            value={estado}
            readOnly
            className="empleados-readonly"
          />
        </div>

        <div className="input-group">
          <label htmlFor="elim-fechaIngreso">Fecha de Ingreso</label>
          <input
            id="elim-fechaIngreso"
            type="date"
            value={fechaIngreso}
            readOnly
            className="empleados-readonly"
          />
        </div>
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

export default EliminarEmpleados;