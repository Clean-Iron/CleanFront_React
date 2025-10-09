'use client';

import React, { useState } from "react";
import Sidebar from "./MenuLateral";
import InfoGeneral from "./infoGeneral/InfoGeneral.jsx";
import ListaEmpleados from "./listaEmpleados/ListaEmpleados";
import EditarEmpleados from "./editarEmpleados/EditarEmpleados";

const Empleados = () => {
  const [componenteActual, setComponenteActual] = useState("infoGeneral");

  const cambiarComponente = (nombreComponente) => {
    setComponenteActual(nombreComponente);
  };

  // Renderizado condicional del componente seleccionado
  const renderComponente = () => {
    switch (componenteActual) {
      case "infoGeneral":
        return <InfoGeneral />;
      case "listaEmpleados":
        return <ListaEmpleados />;
      case "editarEmpleados":
        return <EditarEmpleados />;
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