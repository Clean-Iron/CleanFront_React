import React, { useState, useEffect } from "react";
import { eliminarEmpleado } from "@/lib/Services/Logic.js";

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
      <input
        type="text"
        placeholder="Cargo"
        value={cargo}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="text"
        placeholder="Estado"
        value={estado}
        readOnly
        className="empleados-readonly"
      />
      <input
        type="date"
        placeholder="Fecha de Ingreso"
        value={fechaIngreso}
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

export default EliminarEmpleados;