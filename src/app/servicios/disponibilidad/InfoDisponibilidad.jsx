'use client';
import { useState } from "react";
import { buscarDisponibilidad } from '@/lib/Logic.js';
import EspaciosDisponibles from "./EspaciosDisponibles";
import FiltrarDisponibilidad from "./FiltrarDisponibilidad";

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

  const refreshDisponibilidad = async () => {
    try {
      const data = await buscarDisponibilidad(date, startHour, endHour, city);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error refrescando disponibilidad:", err);
      setEmployees([]);
    }
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
        onAssigned={refreshDisponibilidad}
      />
    </div>
  );
};

export default InfoDisponibilidad;
