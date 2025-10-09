'use client';

import React, { useState } from "react";
import Menu from "./MenuLateral";
import ResumenGeneral from "./resumenGeneral/page";
import InfoServicios from "./infoServicios/InfoServicios";
import InfoDisponibilidad from "./disponibilidad/InfoDisponibilidad";
import EditarTarea from "./editarTarea/EditarTarea";

const Servicios = () => {
  const [componenteActual, setComponenteActual] = useState("InfoDisponibilidad");
  // Función para cambiar el componente actual
  const cambiarComponente = (nombreComponente) => {
    setComponenteActual(nombreComponente);
  };

  const renderComponente = () => {
    switch (componenteActual) {
      case "resumenGeneral":
        return <ResumenGeneral />;
      case "infoDisponibilidad":
        return <InfoDisponibilidad />;
      case "infoServicios":
        return <InfoServicios />;
      case "editarTarea":
        return <EditarTarea />;
      default:
        return <InfoDisponibilidad />;
    }
  };

  return (
    <div className="layout">
      <Menu onNavClick={cambiarComponente} seccionActiva={componenteActual} />
      {renderComponente()}
    </div>
  );
};

export default Servicios;