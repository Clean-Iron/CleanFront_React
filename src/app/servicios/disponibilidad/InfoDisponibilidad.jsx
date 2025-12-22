'use client';

import { useCallback, useState } from "react";
import { buscarServiciosPorMesPorCiudad } from "@/lib/Logic.js";
import EspaciosDisponibles from "./EspaciosDisponibles";
import FiltrarDisponibilidad from "./FiltrarDisponibilidad";

const InfoDisponibilidad = () => {
  const [filters, setFilters] = useState({
    year: null,
    month: null, // 1..12
    city: "",
    week: null,  // 1..N o null
    weeks: [],   // [[startDay,endDay], ...]
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (nextFilters) => {
    setFilters(nextFilters);

    if (!nextFilters?.city || !nextFilters?.year || !nextFilters?.month) {
      setServices([]);
      return;
    }

    try {
      setLoading(true);
      const data = await buscarServiciosPorMesPorCiudad(
        nextFilters.city,
        nextFilters.year,
        nextFilters.month
      );
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error buscando servicios por mes/ciudad:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!filters.city || !filters.year || !filters.month) return;
    await handleSearch(filters);
  }, [filters, handleSearch]);

  return (
    <div className="container">
      <div className="disp-board">
        <FiltrarDisponibilidad onSearch={handleSearch} />
        <EspaciosDisponibles
          services={services}
          filters={filters}
          loading={loading}
          onAssigned={refresh}
        />
      </div>
    </div>
  );
};

export default InfoDisponibilidad;
