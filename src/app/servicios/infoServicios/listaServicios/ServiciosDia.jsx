'use client';
import React, { useState, useEffect } from 'react';
import { buscarServicios } from './Servicios';
import DetalleServicioModal from './DetalleServicioModal/DetalleServicioModal';
import '../../../../styles/Servicios/InfoServicios/ServiciosDia/ServiciosDia.css';

/**
 * Componente que muestra la lista de servicios para una fecha seleccionada
 * @param {string} selectedDate - Fecha seleccionada en formato YYYY-MM-DD
 */
const ServiciosDía = ({ selectedDate }) => {
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos', 'programada', 'completada', 'cancelada'
  const [cityFilter, setCityFilter] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  /**
   * Función para transformar los datos de la API al formato esperado por el componente
   */
  const transformApiData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map((serviceObj) => {
      // Formatear la hora de inicio y fin
      const formatTime = (startTime, endTime) => {
        if (!startTime || !endTime) return 'Hora no especificada';

        // Convertir de formato 24h (11:00:00) a formato 12h si es necesario
        const formatHour = (time) => {
          const [hours, minutes] = time.split(':');
          return `${hours}:${minutes}`;
        };

        return `${formatHour(startTime)} - ${formatHour(endTime)}`;
      };

      // Combinar nombres de empleados
      const formatEmployees = (employees) => {
        if (!employees || employees.length === 0) return 'Personal no asignado';

        return employees
          .map(emp => emp.employeeCompleteName || `${emp.employeeName || ''} ${emp.employeeSurname || ''}`.trim())
          .join(', ');
      };

      // Determinar si el servicio está completado basado en el estado
      const isCompleted = (state) => {
        return state === 'COMPLETADA';
      };

      // Construir el objeto de servicio en el formato esperado
      return {
        id: serviceObj.id,
        time: formatTime(serviceObj.startDate, serviceObj.endDate),
        type: serviceObj.serviceDescription || 'Servicio no especificado',
        client: serviceObj.clientCompleteName ||
          `${serviceObj.clientName || ''} ${serviceObj.clientSurname || ''}`.trim() ||
          'Cliente no especificado',
        address: serviceObj.addressService || 'Dirección no especificada',
        city: serviceObj.city || 'Ciudad no especificada',
        staff: formatEmployees(serviceObj.employees),
        completed: isCompleted(serviceObj.state),
        state: serviceObj.state || 'DESCONOCIDO',
        comments: serviceObj.comments || 'Sin comentarios',
        clientDocument: serviceObj.clientDocument
      };
    });
  };

  /**
   * Función para obtener el texto del filtro de estado
   */
  const getStatusFilterText = (status) => {
    switch (status) {
      case 'todos': return 'Todos';
      case 'programada': return 'Programados';
      case 'completada': return 'Completados';
      case 'cancelada': return 'Cancelados';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  useEffect(() => {
    const cargarServicios = async () => {
      setLoading(true);
      try {
        const serviciosResponse = await buscarServicios(selectedDate);

        // Transformar los datos de la API al formato esperado
        const serviciosTransformados = transformApiData(serviciosResponse);

        setServices(serviciosTransformados);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        setServices([]); // En caso de error, mostrar lista vacía
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      cargarServicios();
    }
  }, [selectedDate]);

  // Obtener lista de ciudades únicas
  const cities = ['todas', ...new Set(services.map(service => service.city))];

  // Filtrar servicios según los filtros aplicados
  const filteredServices = services.filter(service => {
    // Filtro por estado
    const statusMatch = (() => {
      switch (statusFilter) {
        case 'todos':
          return true;
        case 'programada':
          return service.state === 'PROGRAMADA';
        case 'completada':
          return service.state === 'COMPLETADA';
        case 'cancelada':
          return service.state === 'CANCELADA';
        default:
          return true;
      }
    })();

    // Filtro por ciudad
    const cityMatch =
      cityFilter === 'todas' ? true :
        service.city === cityFilter;

    // Filtro por búsqueda (cliente, personal o tipo de servicio)
    const searchMatch =
      searchQuery === '' ? true :
        service.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.type.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && cityMatch && searchMatch;
  });

  // Cerrar dropdowns cuando se hace clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown-container')) {
        setShowStatusDropdown(false);
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="service-list-container">
      <div className="filter-controls">
        {/* Barra de búsqueda mejorada */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar cliente, personal o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Filtros */}
        <div className="filters-wrapper">
          {/* Dropdown de Estado */}
          <div className="filter-dropdown-container">
            <button
              className="filter-dropdown-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(!showStatusDropdown);
                setShowCityDropdown(false);
              }}
            >
              Estado: {getStatusFilterText(statusFilter)}
              <span className="dropdown-arrow">▼</span>
            </button>

            {showStatusDropdown && (
              <div className="dropdown-menu">
                <div
                  className={`dropdown-item ${statusFilter === 'todos' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('todos');
                    setShowStatusDropdown(false);
                  }}
                >
                  Todos
                </div>
                <div
                  className={`dropdown-item ${statusFilter === 'programada' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('programada');
                    setShowStatusDropdown(false);
                  }}
                >
                  Programados
                </div>
                <div
                  className={`dropdown-item ${statusFilter === 'completada' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('completada');
                    setShowStatusDropdown(false);
                  }}
                >
                  Completados
                </div>
                <div
                  className={`dropdown-item ${statusFilter === 'cancelada' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('cancelada');
                    setShowStatusDropdown(false);
                  }}
                >
                  Cancelados
                </div>
              </div>
            )}
          </div>

          {/* Dropdown de Ciudad */}
          <div className="filter-dropdown-container">
            <button
              className="filter-dropdown-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowCityDropdown(!showCityDropdown);
                setShowStatusDropdown(false);
              }}
            >
              Ciudad: {cityFilter === 'todas' ? 'Todas' : cityFilter}
              <span className="dropdown-arrow">▼</span>
            </button>

            {showCityDropdown && (
              <div className="dropdown-menu">
                {cities.map(city => (
                  <div
                    key={city}
                    className={`dropdown-item ${cityFilter === city ? 'active' : ''}`}
                    onClick={() => {
                      setCityFilter(city);
                      setShowCityDropdown(false);
                    }}
                  >
                    {city === 'todas' ? 'Todas' : city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="services-list">
        {loading ? (
          <div className="loading-indicator">Cargando servicios...</div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div
              key={service.id}
              className="service-card"
              onClick={() => {
                setSelectedService(service);
                setModalOpen(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="service-header">
                <h3>{service.time} | {service.type + " "}</h3>
                <div className={`status-indicator ${service.state === 'COMPLETADA' ? 'completed' :
                  service.state === 'PROGRAMADA' ? 'scheduled' :
                    service.state === 'CANCELADA' ? 'cancelled' : 'unknown'
                  }`}>
                  {service.state === 'COMPLETADA' ? (
                    <span>✓</span>
                  ) : service.state === 'PROGRAMADA' ? (
                    <span>📅</span>
                  ) : service.state === 'CANCELADA' ? (
                    <span>❌</span>
                  ) : (
                    <span>❓</span>
                  )}
                </div>
              </div>
              <div className="service-details">
                <p><strong>Cliente:</strong> {service.client}</p>
                <p><strong>Dirección:</strong> {service.address}</p>
                <p><strong>Ciudad:</strong> {service.city}</p>
                <p><strong>Personal:</strong> {service.staff}</p>
                <p><strong>Estado:</strong> <span className={`status-text ${service.state.toLowerCase()}`}>{service.state}</span></p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            {selectedDate ?
              'No hay servicios programados para esta fecha.' :
              'Selecciona una fecha para ver los servicios.'
            }
          </div>
        )}
      </div>
      <DetalleServicioModal
        service={selectedService}
        onClose={() => {
          setModalOpen(false);
          setSelectedService(null);
        }}
      />
    </div>
  );
};

export default ServiciosDía;