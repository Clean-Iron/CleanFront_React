'use client';
import { useState } from "react";
import EspaciosDisponibles from "./espaciosDisponibles/EspaciosDisponibles";
import FiltrarDisponibilidad from "./filtrarDisponibilidad/FiltrarDisponibilidad";

const InfoDisponibilidad = () => {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [city, setCity] = useState("");

  const handleInfo = (newEmployees, date, startHour, endHour, city) => {
    setEmployees(newEmployees);
    setDate(date);
    setStartHour(startHour);
    setEndHour(endHour);
    setCity(city);
  };

  return (
    <div className="container">
      <FiltrarDisponibilidad onEmployeesUpdate={handleInfo} />
      <EspaciosDisponibles 
        employees={employees} 
        date={date}
        startHour={startHour} 
        endHour={endHour} 
        city={city}
      />
    </div>
  );
};

export default InfoDisponibilidad;
