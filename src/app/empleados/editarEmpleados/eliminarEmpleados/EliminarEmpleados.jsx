import React, { useState } from "react";

const EliminarEmpleados = () => {

  return (
    <div className="empleados-form-grid">
      <input
        type="text"
        placeholder="Documento del empleado a eliminar"
        className="empleados-full-width"
      />
      <div className="empleados-form-buttons empleados-full-width">
        <button type="submit" className="menu-btn">🗑️ ELIMINAR</button>
        <button type="reset" className="menu-btn">❌ CANCELAR</button>
      </div>
    </div>
  );
};

export default EliminarEmpleados;
