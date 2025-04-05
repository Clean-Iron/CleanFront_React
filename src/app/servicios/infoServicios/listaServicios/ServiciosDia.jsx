'use client';
import React, { useState, useEffect } from 'react';
import '../../../../styles/Servicios/InfoServicios/ServiciosDia/ServiciosDia.css';

/**
 * Componente que muestra la lista de servicios para una fecha seleccionada
 * @param {string} selectedDate - Fecha seleccionada en formato YYYY-MM-DD
 */
const ServiciosDía = ({ selectedDate }) => {
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos', 'pendientes', 'completados'
  const [cityFilter, setCityFilter] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Ejemplo de datos de servicios (en una aplicación real, esto vendría de una API)
  const MOCK_SERVICES = {
    '2025-04-03': [
      {
        id: 1,
        time: '08:00 - 10:30',
        type: 'Limpieza de Oficinas',
        client: 'Corporativo ABC',
        address: 'Av. Principal #123',
        city: 'Madrid',
        staff: 'Juan G., Maria L.',
        completed: true
      }
    ],
    '2025-04-04': [
      {
        id: 2,
        time: '11:00 - 13:30',
        type: 'Limpieza de Oficinas',
        client: 'Tecnología XYZ',
        address: 'Calle Comercial #45',
        city: 'Barcelona',
        staff: 'Ana M., Carlos P.',
        completed: false
      }
    ],
    '2025-04-15': [
      {
        id: 4,
        time: '08:00 - 10:30',
        type: 'Limpieza de Oficinas',
        client: 'Corporativo ABC',
        address: 'Av. Principal #123',
        city: 'Madrid',
        staff: 'Juan G., Maria L.',
        completed: true
      },
      {
        id: 5,
        time: '11:00 - 13:30',
        type: 'Limpieza de Oficinas',
        client: 'Tecnología XYZ',
        address: 'Calle Comercial #45',
        city: 'Barcelona',
        staff: 'Ana M., Carlos P.',
        completed: false
      },
      {
        id: 6,
        time: '14:30 - 16:00',
        type: 'Limpieza de Oficinas',
        client: 'Consultores 123',
        address: 'Plaza Central #78',
        city: 'Valencia',
        staff: 'Pedro S., Lucia T.',
        completed: false
      },
      {
        id: 7,
        time: '17:00 - 18:30',
        type: 'Limpieza de Oficinas',
        client: 'Seguros Eficaces',
        address: 'Av. Central #290',
        city: 'Sevilla',
        staff: 'Roberto L., Diana V.',
        completed: false
      }
    ]
  };
  
  // Cargar servicios cuando cambia la fecha seleccionada
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // Simulación de una llamada a API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // En una aplicación real, aquí harías una llamada fetch a tu API
        // const response = await fetch(`/api/services?date=${selectedDate}`);
        // const data = await response.json();
        
        const data = MOCK_SERVICES[selectedDate] || [];
        setServices(data);
      } catch (error) {
        console.error("Error al cargar servicios:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [selectedDate]);

  // Obtener lista de ciudades únicas
  const cities = ['todas', ...new Set(services.map(service => service.city))];

  // Filtrar servicios según los filtros aplicados
  const filteredServices = services.filter(service => {
    // Filtro por estado
    const statusMatch = 
      statusFilter === 'todos' ? true : 
      statusFilter === 'completados' ? service.completed : 
      !service.completed;
    
    // Filtro por ciudad
    const cityMatch = 
      cityFilter === 'todas' ? true : 
      service.city === cityFilter;
    
    // Filtro por búsqueda (cliente o personal)
    const searchMatch = 
      searchQuery === '' ? true : 
      service.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
      service.staff.toLowerCase().includes(searchQuery.toLowerCase());
    
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
            placeholder="Buscar cliente o personal..."
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
              Estado: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
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
                  className={`dropdown-item ${statusFilter === 'pendientes' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('pendientes');
                    setShowStatusDropdown(false);
                  }}
                >
                  Pendientes
                </div>
                <div 
                  className={`dropdown-item ${statusFilter === 'completados' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('completados');
                    setShowStatusDropdown(false);
                  }}
                >
                  Completados
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
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.time} | {service.type}</h3>
                <div className={`status-indicator ${service.completed ? 'completed' : 'pending'}`}>
                  {service.completed && <span>✓</span>}
                </div>
              </div>
              <div className="service-details">
                <p><strong>Cliente:</strong> {service.client}</p>
                <p><strong>Dirección:</strong> {service.address}</p>
                <p><strong>Ciudad:</strong> {service.city}</p>
                <p><strong>Personal:</strong> {service.staff}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-services">
            No hay servicios con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiciosDía;