import { useState, useEffect } from "react";
import Calendario from "./calendario/Calendario";
import ServiciosDia from "./listaServicios/ServiciosDia";

const InfoServicios = () => {
  const [selectedDate, setSelectedDate] = useState('2025-04-15');
  const [serviceMarkers, setServiceMarkers] = useState({});

  // Datos de ejemplo - En una aplicación real, esto vendría de una API
  const MOCK_SERVICES = {
    '2025-04-03': [{ id: 1 }],
    '2025-04-04': [{ id: 2 }],
    '2025-04-07': [{ id: 3 }],
    '2025-04-15': [{ id: 4, id: 5, id: 6, id: 7 }],
    '2025-04-17': [{ id: 8 }]
  };

  // Cargamos los marcadores de servicios al inicio
  useEffect(() => {
    const fetchServiceMarkers = async () => {
      try {
        // Simulación de una llamada a API
        await new Promise(resolve => setTimeout(resolve, 300));

        // En una aplicación real, esto sería una llamada a tu API
        // const response = await fetch('/api/service-markers');
        // const data = await response.json();

        setServiceMarkers(MOCK_SERVICES);
      } catch (error) {
        console.error("Error al cargar marcadores de servicios:", error);
      }
    };

    fetchServiceMarkers();
  }, []);

  // Manejador de selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="container">
      <Calendario className
        onDateSelect={handleDateSelect}
        serviceMarkers={serviceMarkers}
      />
      <ServiciosDia
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default InfoServicios;
