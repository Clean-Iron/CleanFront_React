'use client';

import React, { useState } from "react";
import Menu from "./MenuLateral";
import InfoServicios from "./infoServicios/InfoServicios";
import InfoDisponibilidad from "./disponibilidad/InfoDisponibilidad";
import EditarTarea from "./editarTarea/EditarTarea";

const Servicios = () => {
  const [componenteActual, setComponenteActual] = useState("infoServicios");
  // Función para cambiar el componente actual
  const cambiarComponente = (nombreComponente) => {
    setComponenteActual(nombreComponente);
  };
  
  // Renderizado condicional del componente seleccionado
  const renderComponente = () => {
    switch (componenteActual) {
      case "infoServicios":
        return <InfoServicios />;
      case "infoDisponibilidad":
        return <InfoDisponibilidad />;
      case "editarTarea":
        return <EditarTarea />;
      /*
      case "reportes":
        return <Reportes />;
      case "configuracion":
        return <Configuracion />;
      */
      default:
        return <InfoServicios />;
    }
  };
  
  return (
    <div className="flex">
      <Menu onNavClick={cambiarComponente} seccionActiva={componenteActual}/>
      {renderComponente()}
    </div>
  );
};

export default Servicios;