'use client';

import React, { useState } from "react";
import Sidebar from "./MenuLateral";
import InfoGeneral from "./infoGeneral/InfoGeneral.jsx";
import ListaEmpleados from "./listaEmpleados/ListaEmpleados";
import EditarEmpleados from "./editarEmpleados/EditarEmpleados";

const Empleados = () => {
  const [componenteActual, setComponenteActual] = useState("infoGeneral");
  
  // Función para cambiar el componente actual
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
      /*
      case "reportes":
        return <Reportes />;
      case "configuracion":
        return <Configuracion />;
      */
      default:
        return <InfoGeneral />;
    }
  };
  
  return (
    <div className="flex">
      <Sidebar onNavClick={cambiarComponente} seccionActiva={componenteActual} />
      {renderComponente()}
    </div>
  );
};

export default Empleados;