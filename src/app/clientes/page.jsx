'use client';

import React, { useState } from "react";
import Sidebar from "./MenuLateral";
import InfoGeneral from "./infoGeneral/InfoGeneral.jsx";
import ListaClientes from "./listaClientes/ListaClientes.jsx";
/*import AgregarCliente from "./AgregarCliente";
import Reportes from "./Reportes";
import Configuracion from "./Configuracion";*/

const Clientes = () => {
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
      case "listaClientes":
        return <ListaClientes />;
      // Cuando se descomenten los demás componentes, agregar los casos:
      /*
      case "agregarCliente":
        return <AgregarCliente />;
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

export default Clientes;