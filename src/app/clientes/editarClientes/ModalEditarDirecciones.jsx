'use client';
import React, { useState, useEffect } from 'react';
import { useCiudades } from "@/lib/Hooks";

const ModalEditarDirecciones = ({ cliente = {}, onClose, onGuardar }) => {
  const { ciudades, isLoading: ciudadesLoading, isError: ciudadesError } = useCiudades();

  const [direcciones, setDirecciones] = useState([]);
  const [ciudadDropdownOpen, setCiudadDropdownOpen] = useState({});

  useEffect(() => {
    const arr = Array.isArray(cliente.addresses) ? cliente.addresses : [];
    const inicial = arr.map(addr => ({
      id: addr.id,
      address: addr.address || '',
      city: addr.city || '',
      description: addr.description || ''
    }));
    if (inicial.length === 0) {
      inicial.push({
        id: `temp-${Date.now()}`,
        address: '',
        city: '',
        description: ''
      });
    }
    setDirecciones(inicial);
  }, [cliente.addresses]);

  const handleDireccionChange = (id, campo, valor) => {
    setDirecciones(prev =>
      prev.map(dir =>
        dir.id === id ? { ...dir, [campo]: valor } : dir
      )
    );
  };

  const handleCiudadSelect = (id, ciudad) => {
    setDirecciones(prev =>
      prev.map(dir =>
        dir.id === id ? { ...dir, city: ciudad } : dir
      )
    );
    setCiudadDropdownOpen(prev => ({ ...prev, [id]: false }));
  };

  const toggleCiudadDropdown = (id) => {
    setCiudadDropdownOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const agregarDireccion = () => {
    const nuevaId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setDirecciones(prev => [
      ...prev,
      { id: nuevaId, address: "", city: "", description: "" }
    ]);
  };

  const eliminarDireccion = (id) => {
    if (direcciones.length > 1) {
      setDirecciones(prev => prev.filter(dir => dir.id !== id));
    }
  };

  const guardarCambios = () => {
    const direccionesValidas = direcciones
      .filter(dir => dir.address.trim() !== '')
      .map(dir => {
        if (typeof dir.id === 'string' && dir.id.startsWith('temp')) {
          const { id, ...rest } = dir;
          return rest;
        }
        return dir;
      });

    if (onGuardar) {
      onGuardar(direccionesValidas);
    }
    onClose();
  };

  if (!cliente) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ height: '55vh' }}>
        <div style={{ height: '40vh', overflowY: 'auto' }}>
          {direcciones.map((direccion) => (
            <div key={direccion.id} className="direccion-row" >
              {/* Dirección */}
              <input
                type="text"
                placeholder="Dirección"
                value={direccion.address}
                onChange={(e) => handleDireccionChange(direccion.id, 'address', e.target.value)}
              />

              {/* Descripción */}
              <input
                type="text"
                placeholder="Descripción"
                value={direccion.description}
                onChange={(e) => handleDireccionChange(direccion.id, 'description', e.target.value)}
              />

              {/* Ciudad (dropdown) */}
              <div
                className="dropdown"
              >
                <button
                  type="button"
                  className={`dropdown-trigger ${ciudadDropdownOpen[direccion.id] ? 'open' : ''}`}
                  onClick={() => toggleCiudadDropdown(direccion.id)}
                >
                  <span>{direccion.city || 'Seleccionar ciudad'}</span>
                  <span className="arrow">▼</span>
                </button>

                {ciudadDropdownOpen[direccion.id] && (
                  <div className="dropdown-content">
                    {ciudadesLoading && <div>Cargando ciudades...</div>}
                    {ciudadesError && <div>Error al cargar ciudades</div>}
                    {!ciudadesLoading && !ciudadesError && ciudades.map((ciu, idx) => (
                      <button
                        key={`${direccion.id}-${ciu}`}
                        type="button"
                        onClick={() => handleCiudadSelect(direccion.id, ciu)}
                      >
                        {ciu}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Eliminar */}
              <button
                type="button"
                className="btn-delete-round"
                onClick={() => eliminarDireccion(direccion.id)}
                title="Eliminar dirección"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="modal-asignacion-form-buttons">
          <button
            className="menu-btn"
            onClick={agregarDireccion}
          >
            + Agregar Dirección
          </button>
          <button className="menu-btn" onClick={guardarCambios}>
            Guardar Cambios
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarDirecciones;