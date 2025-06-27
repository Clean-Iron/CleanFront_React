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

// employeePatch.js

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
