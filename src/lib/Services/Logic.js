import axios from 'axios';

// URL base de la API, definida en .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Instancia de axios con configuración común
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Servicios
export const obtenerServicios = async () => {
  const { data } = await api.get('/service/all');
  return data;
};

export const asignarServicio = async (schedule) => {
  const { data } = await api.post('/schedule', schedule);
  return data;
};

// Clientes
export const buscarClientes = async () => {
  const { data } = await api.get('/client');
  return data;
};

export const obtenerClientesConDireccionCiudad = async (city) => {
  const { data } = await api.get(`/client/clientsByCity/${encodeURIComponent(city)}`);
  return data;
};

export const agregarCliente = async (cliente) => {
  const { data } = await api.post('/client', cliente);
  return data;
};

export const buscarClienteById = async (id) => {
  const { data } = await api.get(`/client/${id}`);
  return data;
};

export const actualizarCliente = async (id, datos) => {
  await api.put(`/client/${id}`, datos);
};

// Empleados
export const buscarEmpleados = async () => {
  const { data } = await api.get('/employee');
  return data;
};

export const buscarEmpleadoById = async (id) => {
  const { data } = await api.get(`/employee/id/${id}`);
  return data;
};

export const agregarEmpleado = async (empleado) => {
  const { data } = await api.post('/employee/new', empleado);
  return data;
};

export const buscarEmpleadosByCity = async (city) => {
  const { data } = await api.get(`/employee/city/${encodeURIComponent(city)}`);
  return data;
};

export const actualizarEmpleado = async (id, datosParciales) => {
  const { data } = await api.patch(`/employee/update/${id}`, datosParciales);
  return data;
};

export const eliminarEmpleado = async (id) => {
  await api.delete(`/employee/delete/${id}`);
};

// Disponibilidad y agenda
export const buscarDisponibilidad = async (date, startHour, endHour, city) => {
  const { data } = await api.get('/employee/available', {
    params: { date, startHour, endHour, city }
  });
  return data;
};

export const buscarServiciosPorMesDeEmpleado = async (doc, year, month) => {
  const { data } = await api.get(`/schedule/servicesEmployee/${doc}`, {
    params: { year, month }
  });
  return data;
};

export const buscarServicios = async (date) => {
  const { data } = await api.get(`/schedule/${date}`);
  return data;
};

export const buscarServiciosConParam = async (nombre, apellido, selectedCity, date) => {
  const params = { name: nombre, surname: apellido, city: selectedCity };
  // Si sólo hay fecha, no pasamos otros parámetros
  const endpoint = date && !nombre && !apellido && !selectedCity
    ? `/schedule/${date}`
    : `/schedule/${date}`;
  const { data } = await api.get(endpoint, { params });
  return data;
};

export const actualizarServicio = async (id, datos) => {
  const { data } = await api.patch(`/schedule/${id}`, datos);
  return data;
};

export const eliminarServicio = async (id) => {
  await api.delete(`/schedule/${id}`);
};
