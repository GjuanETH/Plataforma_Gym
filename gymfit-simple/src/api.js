import axios from 'axios';

// Apuntamos al API Gateway que levantaste en Docker
// La base por defecto es Auth, pero la sobrescribimos para Training
const API_URL = 'http://localhost:8080/api/v1/auth';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Si ya tienes un token guardado, lo agrega a las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gymfit_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    // LOGIN
    login: async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('gymfit_token', response.data.token);
                localStorage.setItem('gymfit_user', JSON.stringify({
                    userId: response.data.userId,
                    role: response.data.role,
                    firstName: response.data.firstName 
                }));
            }
            return response.data;
        } catch (error) {
            console.error("Error en login:", error);
            throw error.response ? error.response.data : { message: 'Error de conexión con el servidor' };
        }
    },

    // REGISTRO
    register: async (userData) => {
        try {
            const response = await api.post('/register', userData);
            if (response.data.token) {
                localStorage.setItem('gymfit_token', response.data.token);
                localStorage.setItem('gymfit_user', JSON.stringify({
                    userId: response.data.userId,
                    role: response.data.role,
                    firstName: userData.firstName 
                }));
            }
            return response.data;
        } catch (error) {
            console.error("Error en registro:", error);
            throw error.response ? error.response.data : { message: 'Error de conexión con el servidor' };
        }
    },

    // CORRECCIÓN: Logout ahora solo borra la sesión, NO el perfil personalizado
    logout: () => {
        localStorage.removeItem('gymfit_token');
        localStorage.removeItem('gymfit_user');
        // NO borramos 'gymfit_avatar' ni 'gymfit_custom_name' para persistencia
    }
};

export const trainingService = {
    // Crear una rutina (Solo Entrenadores)
    createRoutine: async (routineData) => {
        try {
            const response = await api.post('/training', routineData, {
                baseURL: 'http://localhost:8080/api/v1' 
            });
            return response.data;
        } catch (error) {
            console.error("Error creando rutina:", error);
            throw error.response ? error.response.data : { message: 'Error de servidor' };
        }
    },

    // Obtener rutinas de un cliente
    getClientRoutines: async (clientId) => {
        try {
            const response = await api.get(`/training/client/${clientId}`, {
                baseURL: 'http://localhost:8080/api/v1'
            });
            return response.data;
        } catch (error) {
            console.error("Error obteniendo rutinas:", error);
            throw error.response ? error.response.data : { message: 'Error de servidor' };
        }
    },

    // Guardar Progreso
    logProgress: async (data) => {
        try {
            const response = await api.post('/training/progress', data, {
                baseURL: 'http://localhost:8080/api/v1' 
            });
            return response.data;
        } catch (error) {
            console.error("Error guardando progreso:", error);
            throw error.response ? error.response.data : { message: 'Error de servidor' };
        }
    },

    // Obtener historial completo
    getClientHistory: async (clientId) => {
        try {
            const response = await api.get(`/training/progress/${clientId}`, {
                baseURL: 'http://localhost:8080/api/v1'
            });
            return response.data;
        } catch (error) {
            console.error("Error obteniendo historial:", error);
            return []; 
        }
    }
};