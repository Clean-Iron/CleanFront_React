'use client';

import React, { useState } from "react";
import Menu from "./MenuLateral";
import ResumenGeneral from "./resumenGeneral/page";
import InfoDisponibilidad from "./disponibilidad/InfoDisponibilidad";
import ReasignarServicios from "./reasignar/ReasignarTareas";

const Servicios = () => {
  const [componenteActual, setComponenteActual] = useState("InfoDisponibilidad");
  const cambiarComponente = (nombreComponente) => {
    setComponenteActual(nombreComponente);
  };

  const renderComponente = () => {
    switch (componenteActual) {
      case "resumenGeneral":
        return <ResumenGeneral />;
      case "infoDisponibilidad":
        return <InfoDisponibilidad />;
      case "reasignarServicios":
        return <ReasignarServicios />;
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