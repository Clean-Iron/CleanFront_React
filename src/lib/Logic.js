import { api } from './ApiClient';
import { safeApi } from './ApiErrorHelper';

// ---------- Auth ----------
export const login = (username, password) =>
  safeApi(api.post('/auth/login', { username, password }), 'login');

// ---------- Servicios ----------
export const obtenerServicios = () =>
  safeApi(api.get('/service'), 'obtenerServicios');

export const asignarServicio = (schedule) =>
  safeApi(api.post('/schedule', schedule), 'asignarServicio');

export const reasignarServicios = (req) =>
  safeApi(api.post('/schedule/bulkCopyMonth', req), 'reasignarServicios');

export const buscarServiciosPorMesPorCiudad = (city, year, month) =>
  safeApi(
    api.get(`/schedule/servicesCity/${encodeURIComponent(city)}`, { params: { year, month } }),
    'buscarServiciosPorMes'
  );

export const buscarServiciosPorMesDeEmpleado = (doc, year, month) =>
  safeApi(
    api.get(`/schedule/servicesEmployee/${encodeURIComponent(doc)}`, { params: { year, month } }),
    'buscarServiciosPorMesDeEmpleado'
  );

export const buscarServiciosPorMesDeClientes = (doc, year, month) =>
  safeApi(
    api.get(`/schedule/servicesClient/${encodeURIComponent(doc)}`, { params: { year, month } }),
    'buscarServiciosPorMesDeClientes'
  );

export const buscarServicios = (date) =>
  safeApi(api.get(`/schedule/${date}`), 'buscarServicios');

export const buscarServiciosConParam = (nombre, apellido, selectedCity, date) => {
  const endpoint = `/schedule/${date}/filter`;
  const params = {};
  if (selectedCity) params.city = selectedCity;
  if (nombre) params.name = nombre;
  if (apellido) params.surname = apellido;

  const config = Object.keys(params).length ? { params } : {};
  return safeApi(api.get(endpoint, config), 'buscarServiciosConParam');
};

export const actualizarServicio = (id, datos) =>
  safeApi(api.patch(`/schedule/${id}`, datos), 'actualizarServicio');

export const eliminarServicio = (id) =>
  safeApi(api.delete(`/schedule/${id}`), 'eliminarServicio');

// ---------- Clientes ----------
export const buscarClientes = () =>
  safeApi(api.get('/client'), 'buscarClientes');

export const buscarClientesByCity = (city) =>
  safeApi(
    api.get(`/client/clientsByCity/${encodeURIComponent(city)}`),
    'obtenerClientesConDireccionCiudad'
  );

export const agregarCliente = (cliente) =>
  safeApi(api.post('/client', cliente), 'agregarCliente');

export const buscarClienteById = (id) =>
  safeApi(api.get(`/client/${encodeURIComponent(id)}`), 'buscarClienteById');

export const actualizarCliente = (id, datos) =>
  safeApi(api.patch(`/client/${encodeURIComponent(id)}`, datos), 'actualizarCliente');

export const eliminarCliente = (id) =>
  safeApi(api.delete(`/client/${encodeURIComponent(id)}`), 'eliminarCliente');

// ---------- Empleados ----------
export const buscarEmpleados = () =>
  safeApi(api.get('/employee'), 'buscarEmpleados');

export const buscarEmpleadoById = (id) =>
  safeApi(api.get(`/employee/${encodeURIComponent(id)}`), 'buscarEmpleadoById');

export const agregarEmpleado = (empleado) =>
  safeApi(api.post('/employee', empleado), 'agregarEmpleado');

export const buscarEmpleadosByCity = (city) =>
  safeApi(
    api.get(`/employee/city/${encodeURIComponent(city)}`),
    'buscarEmpleadosByCity'
  );

export const actualizarEmpleado = (id, datosParciales) =>
  safeApi(
    api.patch(`/employee/update/${encodeURIComponent(id)}`, datosParciales),
    'actualizarEmpleado'
  );

export const eliminarEmpleado = (id) =>
  safeApi(api.delete(`/employee/delete/${encodeURIComponent(id)}`), 'eliminarEmpleado');

export const buscarDisponibilidad = (date, startHour, endHour, city) =>
  safeApi(
    api.get('/employee/available', { params: { date, startHour, endHour, city } }),
    'buscarDisponibilidad'
  );