'use client';
import React from 'react';
//import './ServiceDetailModal.css'; // Asegúrate de importar el CSS

const DetalleServicioModal = ({ service, onClose }) => {
    if (!service) return null;
    console.log(service)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-datos-superiores">
                    <span>Hora: {service.time}</span>
                    <span>Estado: {service.state}</span>
                </div>

                <div className="modal-asignacion-form-grid">
                    <div>
                        <label>Cliente</label>
                        <input type="text" readOnly value={service.client} />
                    </div>

                    <div >
                        <label>Dirección</label>
                        <input type="text" readOnly value={service.address} />
                    </div>

                    <div>
                        <label>Ciudad</label>
                        <input type="text" readOnly value={service.city} />
                    </div>

                    <div>
                        <label>Comentarios</label>
                        <input type="text" readOnly value={service.comments} />
                    </div>

                    <div className="modal-chip-section">
                        <label>Servicios</label>
                        <div className="modal-chip-container">
                            <div className="chips">
                                {service.type.map((t, idx) => (
                                    <div key={idx} className="modal-chip">
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-chip-section">
                        <label>Personal Asignado</label>
                        <div className="modal-chip-container">
                            <div className="chips">
                                {service.staff.split(',').map((emp, idx) => (
                                    <div key={idx} className="modal-chip">{emp.trim()}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-asignacion-form-buttons">
                    <button className="modal-asignacion-btn-cancelar" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetalleServicioModal;
