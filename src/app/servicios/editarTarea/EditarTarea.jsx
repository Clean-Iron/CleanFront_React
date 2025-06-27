import React, { useState } from "react";
import BuscarTarea from "./busquedaTarea/BuscarTarea";
import ListaTareas from "./listaTareas/ListaTareas";
import "../../../styles/Servicios/EditarTarea/EditarTarea.css";

const EditarTarea = () => {
  const [servicios, setServicios] = useState(null);

  return (
    <div className="container">
      <div className="editar-wrapper">
        <div className="editar-tab-container">
          {/* Mostrar BuscarTarea solo si no hay servicios aún */}
          {!servicios && (
            <BuscarTarea onResultado={setServicios} />
          )}

          {/* Mostrar ListaTareas si ya se buscaron servicios */}
          {servicios && (
            <ListaTareas servicios={servicios} onNuevaBusqueda={() => setServicios(null)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarTarea;
