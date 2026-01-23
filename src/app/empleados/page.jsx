'use client';

import React, { useState } from "react";
import Sidebar from "./MenuLateral";
import InfoGeneral from "./infoGeneral/InfoGeneral.jsx";
import ListaEmpleadosOrchestrator from "./listaEmpleados/ListaEmpleados";

const Empleados = () => {
  const [componenteActual, setComponenteActual] = useState("infoGeneral");

  const cambiarComponente = (nombreComponente) => {
    setComponenteActual(nombreComponente);
  };

  const renderComponente = () => {
    switch (componenteActual) {
      case "infoGeneral":
        return <InfoGeneral />;
      case "listaEmpleados":
        return <ListaEmpleadosOrchestrator />;
      default:
        return <InfoGeneral />;
    }
  };

  return (
    <div className="layout">
      <Sidebar onNavClick={cambiarComponente} seccionActiva={componenteActual} />
      {renderComponente()}
    </div>
  );
};

export default Empleados;