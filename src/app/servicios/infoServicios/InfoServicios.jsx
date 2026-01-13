'use client';

import { useCallback, useMemo, useState } from 'react';
import { buscarServiciosPorMesPorCiudad } from '@/lib/Logic.js';
import FiltrarServicios from './FiltrarServicios';
import InfoServiciosCiudad from './InfoServiciosCiudad';

const InfoServicios = () => {
  const [filters, setFilters] = useState({
    year: null,
    month: null,
    city: '',
    week: null,
    day: null,
    keyword: '',
    weeks: [],
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
      console.error('Error buscando servicios por mes/ciudad:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredServices = useMemo(() => {
    // aquí ya tienes tu filtrado por week/day/keyword (lo dejo tal cual como lo venías usando)
    return Array.isArray(services) ? services : [];
  }, [services]);

  return (
    <div className="container">
      <div className="disp-board">
        <FiltrarServicios onSearch={handleSearch} />

        <InfoServiciosCiudad
          services={filteredServices}
          filters={filters}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default InfoServicios;
