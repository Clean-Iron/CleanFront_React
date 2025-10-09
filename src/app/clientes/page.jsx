'use client';

import React, { useState } from "react";
import Sidebar from "./MenuLateral";
import InfoGeneral from "./infoGeneral/InfoGeneral.jsx";
import ListaClientes from "./listaClientes/ListaClientes.jsx";
import EditarEmpleados from "./editarClientes/EditarClientes";
import ListaServicios from "./listaServicios/ListaServicios.jsx";

const Clientes = () => {
  const [componenteActual, setComponenteActual] = useState("infoGeneral");
  
  const cambiarComponente = (nombreComponente) => {
    setComponenteActual(nombreComponente);
  };
  
  const renderComponente = () => {
    switch (componenteActual) {
      case "infoGeneral":
        return <InfoGeneral />;
      case "listaClientes":
        return <ListaClientes />;
      case "editarClientes":
        return <EditarEmpleados />;
      case "listaServicios":
        return <ListaServicios />;
      default:
        return <ListaClientes />;
    }
  };
  
  return (
    <div className="layout">
      <Sidebar onNavClick={cambiarComponente} seccionActiva={componenteActual} />
      {renderComponente()}
    </div>
  );
};

export default Clientes;