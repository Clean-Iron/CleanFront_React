import React, { useState, useEffect, useMemo } from "react";
import { buscarEmpleados } from "./Buscar";
import "../../../styles/Empleados/ListaEmpleados/ListaEmpleados.css";

const ListaEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Estados para filtros específicos
  const [filtros, setFiltros] = useState({
    ciudad: "",
    ordenamiento: "nombre" // nombre, documento, email
  });

  useEffect(() => {
    handleConsulta();
  }, []);

  const handleConsulta = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buscarEmpleados();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al buscar empleados:", error);
      setError("Error al cargar los empleados");
      setEmpleados([]);
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

  // Obtener ciudades únicas para el filtro
  const ciudadesUnicas = useMemo(() => {
    const ciudades = empleados
      .map(emp => emp.city)
      .filter(ciudad => ciudad && ciudad.trim() !== "")
      .filter((ciudad, index, arr) => arr.indexOf(ciudad) === index)
      .sort();
    return ciudades;
  }, [empleados]);

  // Filtrar y ordenar empleados
  const empleadosFiltrados = useMemo(() => {
    let resultado = empleados.filter(empleado => {
      // Filtro de búsqueda general
      const terminoBusqueda = busqueda.toLowerCase().trim();
      const nombreCompleto = `${empleado.name || ''} ${empleado.surname || ''}`.toLowerCase();
      const email = (empleado.email || '').toLowerCase();
      const ciudad = (empleado.city || '').toLowerCase();
      const documento = (empleado.document || '').toString();
      const telefono = (empleado.phone || '').toString();

      const coincideBusqueda = terminoBusqueda === '' || 
        nombreCompleto.includes(terminoBusqueda) ||
        email.includes(terminoBusqueda) ||
        ciudad.includes(terminoBusqueda) ||
        documento.includes(terminoBusqueda) ||
        telefono.includes(terminoBusqueda);

      // Filtro por ciudad
      const coincideCiudad = !filtros.ciudad || empleado.city === filtros.ciudad;

      return coincideBusqueda && coincideCiudad;
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
  }, [empleados, busqueda, filtros]);

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

  // Renderizar opciones de dropdown
  const renderDropdownOptions = (filtro) => {
    switch (filtro) {
      case 'Ciudad':
        return (
          <>
            <button onClick={() => aplicarFiltro('ciudad', '')}>
              Todas las ciudades
            </button>
            {ciudadesUnicas.map(ciudad => (
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
        <div className="lista-clientes-content">
          <div className="loading">Cargando empleados...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="lista-clientes-content">
          <div className="error">
            {error}
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
          {/* Barra de búsqueda mejorada */}
          <div className="container-input">
            <input
              type="text"
              value={busqueda}
              onChange={handleBusquedaChange}
              placeholder="Buscar empleados por nombre, email, ciudad, documento..."
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

          {/* Botón de Filtrar */}
          {!mostrarFiltros && (
            <button className="menu-btn-listaclientes filter-btn" onClick={toggleFiltros}>
              <span className="filter-icon">🔍</span> Filtrar
            </button>
          )}

          {/* Opciones de Filtro */}
          {mostrarFiltros && (
            <div className="filter-buttons">
              {["Ciudad", "Ordenar"].map((filtro) => (
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

              {/* Botón de Cerrar */}
              <button className="close-btn" onClick={toggleFiltros}>✖</button>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        <div className="results-info">
          {empleadosFiltrados.length === empleados.length 
            ? `Mostrando ${empleados.length} empleados`
            : `Mostrando ${empleadosFiltrados.length} de ${empleados.length} empleados`
          }
        </div>

        {/* Tabla de empleados */}
        <div className="tabla-clientes-container">
          {empleadosFiltrados.length > 0 ? (
            <table className="tabla-clientes">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Número Contacto</th>
                  <th>Documento</th>
                  <th>Email</th>
                  <th>Dirección</th>
                  <th>Ciudad</th>
                </tr>
              </thead>
              <tbody>
                {empleadosFiltrados.map(empleado => (
                  <tr key={`${empleado.document}-${empleado.email}`} className="cliente-row">
                    <td>{empleado.name} {empleado.surname}</td>
                    <td>{empleado.phone || "—"}</td>
                    <td>{empleado.document || "—"}</td>
                    <td>{empleado.email || "—"}</td>
                    <td>{empleado.addressResidence || "—"}</td>
                    <td>{empleado.city || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              {busqueda || filtros.ciudad 
                ? "No se encontraron empleados que coincidan con los filtros"
                : "No hay empleados para mostrar"
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListaEmpleados;