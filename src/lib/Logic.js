import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

export const buscarServiciosPorMes = async (ciudad, year, month) => {
  const { data } = await api.get(`/schedule/servicesCity/${ciudad}`, {
    params: { year, month }
  });
  return data;
};

export const buscarServiciosPorMesDeEmpleado = async (doc, year, month) => {
  const { data } = await api.get(`/schedule/servicesEmployee/${doc}`, {
    params: { year, month }
  });
  return data;
};

export const buscarServiciosPorMesDeClientes = async (doc, year, month) => {
  const { data } = await api.get(`/schedule/servicesClient/${doc}`, {
    params: { year, month }
  });
  console.log(data);
  return data;
};

export const buscarServicios = async (date) => {
  const { data } = await api.get(`/schedule/${date}`);
  return data;
};

export const buscarServiciosConParam = async (nombre, apellido, selectedCity, date) => {
  const endpoint = `/schedule/${date}/filter`;

  const params = {};
  if (selectedCity) params.city = selectedCity;
  if (nombre) params.name = nombre;
  if (apellido) params.surname = apellido;

  const config = Object.keys(params).length ? { params } : {};

  const { data } = await api.get(endpoint, config);
  return data;
};

export const actualizarServicio = async (id, datos) => {
  const { data } = await api.patch(`/schedule/${id}`, datos);
  return data;
};

export const eliminarServicio = async (id) => {
  await api.delete(`/schedule/${id}`);
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

export const eliminarCliente = async (id) => {
  await api.delete(`/client/${id}`);
};

// Empleados
export const buscarEmpleados = async () => {
  const { data } = await api.get('/employee');
  return data;
};

export const buscarEmpleadoById = async (id) => {
  const { data } = await api.get(`/employee/${id}`);
  return data;
};

export const agregarEmpleado = async (empleado) => {
  const { data } = await api.post('/employee', empleado);
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

export const buscarDisponibilidad = async (date, startHour, endHour, city) => {
  const { data } = await api.get('/employee/available', {
    params: { date, startHour, endHour, city }
  });
  return data;
};