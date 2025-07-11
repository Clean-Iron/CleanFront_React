import axios from "axios";

const getApiBaseUrl = () => {
    if (typeof window !== "undefined") {
        // Detectar si estamos en desarrollo o producción
        const isDevelopment =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

        if (isDevelopment) {
            return "http://localhost:8080";
        }

        return window.location.hostname === "192.168.84.17"
            ? "http://192.168.84.17:8080"
            : `${window.location.protocol}//${window.location.hostname}:8080`;
    }

    // En entorno de servidor (SSR), retorna una URL por defecto o lanza un error controlado
    return "http://localhost:8080"; // o una URL de producción por defecto
};

const API_URL = getApiBaseUrl();

export const obtenerServicios = async () => {
    const response = await axios.get(`${API_URL}/service/all`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const obtenerClientesConDireccionCiudad = async (city) => {
    const response = await axios.get(`${API_URL}/client/clientsByCity/${city}`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const asignarServicio = async (schedule) => {
    console.log(schedule);
    try {
        const response = await axios.post(`${API_URL}/schedule/new`, schedule, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al guardar la agenda:", error);
        throw error;
    }
};

export const agregarCliente = async (empleado) => {
    const response = await axios.post(`${API_URL}/client`, empleado, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const buscarClienteById = async (id) => {
    const response = await axios.get(`${API_URL}/client/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const actualizarCliente = async (id, datos) => {
    try {
        await axios.put(`${API_URL}/client/${id}`, datos, {
            headers: {
                "Content-Type": "application/json",
            }
        });
    } catch (error) {
        console.error("Error al actualizar el cliente:", error);
        throw error;
    }
};

export const buscarClientes = async () => {
    const response = await axios.get(`${API_URL}/client/clients`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const agregarEmpleado = async (empleado) => {
    const response = await axios.post(`${API_URL}/employee/new`, empleado, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const buscarEmpleadoById = async (id) => {
    const response = await axios.get(`${API_URL}/employee/get/${id}`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const actualizarEmpleado = async (id, datosParciales) => {
    try {
        const response = await axios.patch(`${API_URL}/employee/update/${id}`, {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datosParciales)
        });

        if (!response.ok) {
            throw new Error(`Error al actualizar empleado: ${response.status}`);
        }

        const empleadoActualizado = await response.json();
        return empleadoActualizado;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export const buscarEmpleados = async () => {
    const response = await axios.get(`${API_URL}/employee`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const eliminarEmpleado = async (id) => {
    await axios.delete(`${API_URL}/employee/delete/${id}`, {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export const buscarDisponibilidad = async (date, startHour, endHour, city) => {
    const response = await axios.get(`${API_URL}/employee/available`, {
        params: {
            date,
            startHour,
            endHour,
            city
        },
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const buscarServicios = async (date) => {
    console.log(date);
    const response = await axios.get(`${API_URL}/schedule/${date}`, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const buscarServiciosConParam = async (nombre, apellido, selectedCity, date) => {
    // Si solo date está presente (los otros campos están vacíos)
    if (date && (!nombre || nombre.trim() === '') && (!apellido || apellido.trim() === '') && (!selectedCity || selectedCity.trim() === '')) {
        const response = await axios.get(`${API_URL}/schedule/${date}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }

    // Si hay otros parámetros además de date, usar la búsqueda con params
    const response = await axios.get(`${API_URL}/schedule/${date}`, {
        params: {
            city: selectedCity,
            name: nombre,
            surname: apellido
        },
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const actualizarServicio = async (id, datos) => {
    try {
        const response = await axios.patch(`${API_URL}/schedule/${id}`, datos);
        console.log('Servicio actualizado:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el servicio:', error.response?.data || error.message);
        throw error;
    }
};

export const eliminarServicio = async (id) => {
    try {
        await axios.delete(`${API_URL}/schedule/${id}`);
    } catch (error) {
        console.error('Error al actualizar el servicio:', error.response?.data || error.message);
        throw error;
    }
};

