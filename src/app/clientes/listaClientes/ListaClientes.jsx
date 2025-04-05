import React, { useState } from "react";
import clientes from "./Data";
import "../../../styles/Clientes/ListaClientes/ListaClientes.css";

const ListaClientes = () => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarDirecciones, setMostrarDirecciones] = useState({});

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const toggleDropdown = (filtro) => {
    setFiltroSeleccionado(filtroSeleccionado === filtro ? null : filtro);
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  const toggleDirecciones = (document) => {
    setMostrarDirecciones(prev => ({
      ...prev,
      [document]: !prev[document]
    }));
  };

  // Filtrar clientes basados en la búsqueda
  const clientesFiltrados = clientes.filter(cliente =>
    (cliente.name + " " + cliente.surname).toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.city?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.document.toString().includes(busqueda)
  );

  return (
    <div className="container">
      <div className="lista-clientes-content">
        <div className="top-bar">
          {/* 🔍 Barra de búsqueda mejorada con SVG y botón de limpieza */}
          <div className="container-input">
            <input
              type="text"
              value={busqueda}
              onChange={handleBusquedaChange}
              placeholder="Buscar clientes..."
              className="input"
            />
            <svg
              className="search-icon"
              fill="#000000"
              width="20px"
              height="20px"
              viewBox="0 0 1920 1920"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z" fillRule="evenodd"></path>
            </svg>
          </div>

          {/* 🎛 Botón de Filtrar */}
          {!mostrarFiltros && (
            <button className="menu-btn-listaclientes filter-btn" onClick={toggleFiltros}>
              <span className="filter-icon">🔍</span> Filtrar
            </button>
          )}

          {/* 🎚 Opciones de Filtro */}
          {mostrarFiltros && (
            <div className="filter-buttons">
              {["Ciudad", "Nombre", "Documento", "Ordenar"].map((filtro) => (
                <div className="dropdown" key={filtro}>
                  <button
                    className={`menu-btn-listaclientes ${filtroSeleccionado === filtro ? 'active-filter' : ''}`}
                    onClick={() => toggleDropdown(filtro)}
                  >
                    {filtro} {filtroSeleccionado === filtro ? '▲' : '▼'}
                  </button>
                  {filtroSeleccionado === filtro && (
                    <div className="dropdown-content">
                      <button>Opción 1</button>
                      <button>Opción 2</button>
                      <button>Opción 3</button>
                    </div>
                  )}
                </div>
              ))}

              {/* ❌ Botón de Cerrar */}
              <button className="close-btn" onClick={toggleFiltros}>✖</button>
            </div>
          )}
        </div>

        {/* Tabla de clientes con scrolling */}
        <div className="tabla-clientes-container">
          <table className="tabla-clientes">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Numero Contacto</th>
                <th>Email</th>
                <th>Ciudad</th>
                <th>Direcciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map(cliente => (
                  <React.Fragment key={cliente.document}>
                    <tr className="cliente-row">
                      <td>{cliente.name} {cliente.surname}</td>
                      <td>{cliente.phone || "—"}</td>
                      <td>{cliente.email || "—"}</td>
                      <td>{cliente.city || "—"}</td>
                      <td>
                        <button
                          className="direcciones-toggle"
                          onClick={() => toggleDirecciones(cliente.document)}
                        >
                          {cliente.addresses.length} {mostrarDirecciones[cliente.document] ? "▲" : "▼"}
                        </button>
                      </td>
                    </tr>
                    {mostrarDirecciones[cliente.document] && (
                      <tr className="direcciones-row">
                        <td colSpan="8">
                          <div className="direcciones-container">
                            <h4>Direcciones:</h4>
                            <div className="direcciones-grid">
                              {cliente.addresses.map(address => (
                                <div key={address.id} className="direccion-card">
                                  <div className="direccion-tipo">{address.type}</div>
                                  <div className="direccion-datos">
                                    <p><strong>Calle:</strong> {address.street}</p>
                                    <p><strong>Ciudad:</strong> {address.city}</p>
                                  </div>
                                  <div className="direccion-acciones">
                                    <button className="action-button edit-button-small" title="Editar dirección">✏️</button>
                                    <button className="action-button delete-button-small" title="Eliminar dirección">🗑️</button>
                                  </div>
                                </div>
                              ))}
                              <div className="direccion-card add-direccion">
                                <button className="add-direccion-button">+ Añadir dirección</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-results">
                    No se encontraron clientes que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaClientes;