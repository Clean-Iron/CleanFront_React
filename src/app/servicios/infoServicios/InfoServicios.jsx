import { useState, useEffect } from "react";
import Calendario from "./calendario/Calendario";
import ServiciosDia from "./listaServicios/ServiciosDia";

const InfoServicios = () => {
  const [selectedDate, setSelectedDate] = useState('');

  // Manejador de selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="container">
      <Calendario className
        onDateSelect={handleDateSelect}
      />
      <ServiciosDia
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default InfoServicios;
