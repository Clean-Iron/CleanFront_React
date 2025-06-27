import React, { useState } from "react";
import { buscarEmpleadoById } from "./BuscarEmpleado";

const BuscarEmpleados = ({ value, onChange, onResultado, mensajeError }) => {
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      const empleado = await buscarEmpleadoById(value);
      onResultado(empleado);
    } catch (err) {
      onResultado(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="busqueda-form-grid">
      <input
        type="text"
        placeholder="Documento del empleado"
        value={value}
        onChange={onChange}
        className="busqueda-full-width"
      />
      <div className="busqueda-form-buttons busqueda-full-width">
        <button type="button" onClick={handleBuscar} className="menu-btn">
          {loading ? "Buscando..." : "🔍 BUSCAR"}
        </button>
      </div>
      {mensajeError && (
        <p className="no-results">{mensajeError}</p>
      )}
    </div>
  );
};

export default BuscarEmpleados;
