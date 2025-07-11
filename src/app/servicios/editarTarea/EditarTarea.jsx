import React, { useState } from "react";
import BuscarTarea from "./busquedaTarea/BuscarTarea";
import ListaTareas from "./listaTareas/ListaTareas";
import { buscarServiciosConParam } from "@/lib/Services/Logic.js";
import "../../../styles/Servicios/EditarTarea/EditarTarea.css";

const EditarTarea = () => {
  const [servicios, setServicios] = useState(null);
  const [filtros, setFiltros] = useState(null);

  return (
    <div className="container">
      <div className="editar-wrapper">
        <div className="editar-tab-container">
          {/* Mostrar BuscarTarea solo si no hay servicios aún */}
          {!servicios && (
            <BuscarTarea onResultado={(resultados, filtrosUsados) => {
              setServicios(resultados);
              setFiltros(filtrosUsados);
            }} />
          )}

          {/* Mostrar ListaTareas si ya se buscaron servicios */}
          {servicios && (
            <ListaTareas
              servicios={servicios}
              onNuevaBusqueda={() => setServicios(null)}
              onRecargar={async () => {
                if (filtros) {
                  try {
                    const nuevos = await buscarServiciosConParam(
                      filtros.nombre,
                      filtros.apellido,
                      filtros.selectedCity,
                      filtros.date
                    );
                    setServicios(nuevos);
                  } catch (error) {
                    console.error("Error recargando servicios:", error);
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarTarea;
