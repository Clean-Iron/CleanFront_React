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
