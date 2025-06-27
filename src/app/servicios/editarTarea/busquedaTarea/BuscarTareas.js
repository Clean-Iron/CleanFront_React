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

export const buscarServicios = async (nombre, apellido, selectedCity, date) => {
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
