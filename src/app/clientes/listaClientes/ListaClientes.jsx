import React, { useState, useEffect, useMemo } from "react";
import { buscarClientes } from "@/lib/Logic.js";
import "@/styles/Clientes/ListaClientes.css";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarDirecciones, setMostrarDirecciones] = useState({});

  const [filtros, setFiltros] = useState({
    ciudad: "",
    tipoId: "",
    ordenamiento: "nombre" // nombre, documento, email, ciudad
  });

  useEffect(() => {
    handleConsulta();
  }, []);

  const handleConsulta = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buscarClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al buscar clientes:", error);
      setError("Error al cargar los clientes");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar la búsqueda
  const limpiarBusqueda = () => {
    setBusqueda("");
  };

  // Función para aplicar filtros
  const aplicarFiltro = (tipoFiltro, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipoFiltro]: valor
    }));
    setFiltroSeleccionado(null);
  };

  // Obtener opciones únicas para los filtros
  const opcionesUnicas = useMemo(() => {
    const ciudades = clientes
      .map(cliente => cliente.city)
      .filter(ciudad => ciudad && ciudad.trim() !== "")
      .filter((ciudad, index, arr) => arr.indexOf(ciudad) === index)
      .sort();

    const tiposId = clientes
      .map(cliente => cliente.typeId?.trim())
      .filter(tipo => tipo && tipo !== "")
      .filter((tipo, index, arr) => arr.indexOf(tipo) === index)
      .sort();

    return { ciudades, tiposId };
  }, [clientes]);

  // Filtrar y ordenar clientes
  const clientesFiltrados = useMemo(() => {
    let resultado = clientes.filter(cliente => {
      // Filtro de búsqueda general
      const terminoBusqueda = busqueda.toLowerCase().trim();
      const nombreCompleto = `${cliente.name || ''} ${cliente.surname || ''}`.toLowerCase();
      const email = (cliente.email || '').toLowerCase();
      const ciudad = (cliente.city || '').toLowerCase();
      const documento = (cliente.document || '').toString();
      const telefono = (cliente.phone || '').toString();

      const coincideBusqueda = terminoBusqueda === '' ||
        nombreCompleto.includes(terminoBusqueda) ||
        email.includes(terminoBusqueda) ||
        ciudad.includes(terminoBusqueda) ||
        documento.includes(terminoBusqueda) ||
        telefono.includes(terminoBusqueda);

      // Filtro por ciudad
      const coincideCiudad = !filtros.ciudad || cliente.city === filtros.ciudad;

      // Filtro por tipo de ID
      const coincideTipoId = !filtros.tipoId || cliente.typeId?.trim() === filtros.tipoId;

      return coincideBusqueda && coincideCiudad && coincideTipoId;
    });

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      switch (filtros.ordenamiento) {
        case 'nombre':
          const nombreA = `${a.name || ''} ${a.surname || ''}`.toLowerCase();
          const nombreB = `${b.name || ''} ${b.surname || ''}`.toLowerCase();
          return nombreA.localeCompare(nombreB);
        case 'documento':
          return (a.document || 0) - (b.document || 0);
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'ciudad':
          return (a.city || '').localeCompare(b.city || '');
        default:
          return 0;
      }
    });

    return resultado;
  }, [clientes, busqueda, filtros]);

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
    setFiltroSeleccionado(null);
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

  // Renderizar opciones de dropdown
  const renderDropdownOptions = (filtro) => {
    switch (filtro) {
      case 'Ciudad':
        return (
          <>
            <button onClick={() => aplicarFiltro('ciudad', '')}>
              Todas las ciudades
            </button>
            {opcionesUnicas.ciudades.map(ciudad => (
              <button
                key={ciudad}
                onClick={() => aplicarFiltro('ciudad', ciudad)}
                className={filtros.ciudad === ciudad ? 'selected' : ''}
              >
                {ciudad}
              </button>
            ))}
          </>
        );
      case 'Tipo ID':
        return (
          <>
            <button onClick={() => aplicarFiltro('tipoId', '')}>
              Todos los tipos
            </button>
            {opcionesUnicas.tiposId.map(tipo => (
              <button
                key={tipo}
                onClick={() => aplicarFiltro('tipoId', tipo)}
                className={filtros.tipoId === tipo ? 'selected' : ''}
              >
                {tipo}
              </button>
            ))}
          </>
        );
      case 'Ordenar':
        return (
          <>
            <button
              onClick={() => aplicarFiltro('ordenamiento', 'nombre')}
              className={filtros.ordenamiento === 'nombre' ? 'selected' : ''}
            >
              Por Nombre
            </button>
            <button
              onClick={() => aplicarFiltro('ordenamiento', 'documento')}
              className={filtros.ordenamiento === 'documento' ? 'selected' : ''}
            >
              Por Documento
            </button>
            <button
              onClick={() => aplicarFiltro('ordenamiento', 'email')}
              className={filtros.ordenamiento === 'email' ? 'selected' : ''}
            >
              Por Email
            </button>
            <button
              onClick={() => aplicarFiltro('ordenamiento', 'ciudad')}
              className={filtros.ordenamiento === 'ciudad' ? 'selected' : ''}
            >
              Por Ciudad
            </button>
          </>
        );
      default:
        return (
          <>
            <button>Opción 1</button>
            <button>Opción 2</button>
            <button>Opción 3</button>
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div
          className="lista-clientes-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="no-results">Cargando Clientes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div
          className="lista-clientes-content"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            className="no-results"
            style={{ flexDirection: 'column', gap: '1rem' }}
          >
            {/* Mensaje de error */}
            <span>{error}</span>

            {/* Botón abajo del texto */}
            <button onClick={handleConsulta} className="retry-btn">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              placeholder="Buscar clientes por nombre, email, ciudad, documento..."
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
            {busqueda && (
              <button
                className="clear-search"
                onClick={limpiarBusqueda}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
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
              {["Ciudad", "Tipo ID", "Ordenar"].map((filtro) => (
                <div className="dropdown" key={filtro}>
                  <button
                    className={`menu-btn-listaclientes ${filtroSeleccionado === filtro ? 'active-filter' : ''}`}
                    onClick={() => toggleDropdown(filtro)}
                  >
                    {filtro} {filtroSeleccionado === filtro ? '▲' : '▼'}
                  </button>
                  {filtroSeleccionado === filtro && (
                    <div className="dropdown-content">
                      {renderDropdownOptions(filtro)}
                    </div>
                  )}
                </div>
              ))}

              {/* ❌ Botón de Cerrar */}
              <button className="close-btn" onClick={toggleFiltros}>✖</button>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        <div className="results-info">
          {clientesFiltrados.length === clientes.length
            ? `Mostrando ${clientes.length} clientes`
            : `Mostrando ${clientesFiltrados.length} de ${clientes.length} clientes`
          }
        </div>

        {/* Tabla de clientes con scrolling */}
        <div className="tabla-clientes-container">
          {clientesFiltrados.length > 0 ? (
            <table className="tabla-clientes">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Numero Contacto</th>
                  <th>ID</th>
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Direcciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map(cliente => (
                  <React.Fragment key={cliente.document}>
                    <tr className="cliente-row">
                      <td>{cliente.name} {cliente.surname}</td>
                      <td>{cliente.phone || "—"}</td>
                      <td>{cliente.typeId?.trim() || "—"}</td>
                      <td>{cliente.document || "—"}</td>
                      <td>{cliente.email || "—"}</td>
                      <td>
                        <button
                          className="direcciones-toggle"
                          onClick={() => toggleDirecciones(cliente.document)}
                        >
                          {cliente.addresses?.length || 0} {mostrarDirecciones[cliente.document] ? "▲" : "▼"}
                        </button>
                      </td>
                    </tr>
                    {mostrarDirecciones[cliente.document] && cliente.addresses && (
                      <tr className="direcciones-row">
                        <td colSpan="6">
                          <div className="direcciones-container">
                            <h4>Direcciones:</h4>
                            <div className="direcciones-grid">
                              {cliente.addresses.map(address => (
                                <div key={address.id} className="direccion-card">
                                  <div className="direccion-tipo">{address.description}</div>
                                  <div className="direccion-datos">
                                    <p><strong>Dirección:</strong> {address.address}</p>
                                    <p><strong>Ciudad:</strong> {address.city}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              {busqueda || filtros.ciudad || filtros.tipoId
                ? "No se encontraron clientes que coincidan con los filtros"
                : "No hay clientes para mostrar"
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaClientes;