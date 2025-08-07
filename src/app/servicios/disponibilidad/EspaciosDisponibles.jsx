'use client';
import React, { useState } from 'react';
import ModalAsignacion from './ModalAsignacion';
import '@/styles/Servicios/Disponibilidad/EspaciosDisponibles.css';

const EspaciosDisponibles = ({ employees, date, startHour, endHour, city, onAssigned }) => {
  const [showModal, setShowModal] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  return (
    <div className="container-espacios-disponibles">
      <div className="espacios-scroll">
        {employees.length > 0 ? (
          employees.map((empleado, index) => (
            <div className="espacio-card" key={empleado.document || index}>
              <div className="espacio-info">
                <h4 className="espacio-nombre">{empleado.name} {empleado.surname}</h4>
                <p className="espacio-direccion">{empleado.addressResidence}</p>
              </div>
              <button className="reserva-button" onClick={() => {
                setEmpleadoSeleccionado(empleado);
                setShowModal(true);
              }}>Asignar</button>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>Realiza una búsqueda para ver los espacios disponibles.</p>
          </div>
        )}
      </div>
      {showModal && empleadoSeleccionado && (
        <ModalAsignacion
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEmpleadoSeleccionado(null);
          }}
          empleado={empleadoSeleccionado}
          date={date}
          startHour={startHour}
          endHour={endHour}
          city={city}
          allEmployees={employees}
          onAssigned={() => {
            setShowModal(false);
            setEmpleadoSeleccionado(null);
            onAssigned?.();
          }}
        />
      )}
    </div>
  );
};

export default EspaciosDisponibles;