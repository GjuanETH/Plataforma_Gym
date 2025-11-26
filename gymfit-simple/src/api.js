import axios from 'axios';

// --- CONFIGURACIÓN CENTRAL ---
// Apuntamos a la raíz del API Gateway.
const API_GATEWAY_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR ---
// Agrega el token a CADA petición si el usuario está logueado
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gymfit_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authService = {
    // LOGIN
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
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
            throw error.response ? error.response.data : { message: 'Error de conexión con Auth' };
        }
    },

    // REGISTRO
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
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
            throw error.response ? error.response.data : { message: 'Error de conexión con Auth' };
        }
    },

    // LOGOUT
    logout: () => {
        localStorage.removeItem('gymfit_token');
        localStorage.removeItem('gymfit_user');
    },

    // ACTUALIZAR AVATAR
    updateAvatar: async (userId, avatarUrl) => {
        try {
            const response = await api.put('/auth/update-avatar', { userId, avatarUrl });
            return response.data;
        } catch (error) {
            console.error("Error actualizando avatar:", error);
            throw error;
        }
    }
};

export const trainingService = {
    // CREAR RUTINA
    createRoutine: async (routineData) => {
        try {
            const response = await api.post('/training', routineData);
            return response.data;
        } catch (error) {
            console.error("Error creando rutina:", error);
            throw error.response ? error.response.data : { message: 'Error al crear rutina' };
        }
    },

    // OBTENER RUTINAS
    getClientRoutines: async (clientId) => {
        try {
            const response = await api.get(`/training/client/${clientId}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo rutinas:", error);
            throw error.response ? error.response.data : { message: 'Error al obtener rutinas' };
        }
    },

    // ELIMINAR RUTINA
    deleteRoutine: async (routineId) => {
        try {
            const response = await api.delete(`/training/${routineId}`);
            return response.data;
        } catch (error) {
            console.error("Error eliminando rutina:", error);
            throw error.response ? error.response.data : { message: 'Error al eliminar rutina' };
        }
    },

    // GUARDAR PROGRESO
    logProgress: async (data) => {
        try {
            const response = await api.post('/training/progress', data);
            return response.data;
        } catch (error) {
            console.error("Error guardando progreso:", error);
            throw error.response ? error.response.data : { message: 'Error al guardar progreso' };
        }
    },

    // OBTENER HISTORIAL
    getClientHistory: async (clientId) => {
        try {
            const response = await api.get(`/training/progress/${clientId}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo historial:", error);
            return []; 
        }
    }
};

export const chatService = {
    // Obtener lista de entrenadores (Para clientes)
    getTrainers: async () => {
        try {
            const response = await api.get('/chat/trainers');
            return response.data;
        } catch (error) {
            console.error("Error obteniendo entrenadores:", error);
            return [];
        }
    },

    // Obtener historial de chat
    getChatHistory: async (myId, otherId) => {
        try {
            const response = await api.get(`/chat/history/${myId}/${otherId}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo chat:", error);
            return [];
        }
    },

    // Enviar mensaje
    sendMessage: async (messageData) => {
        try {
            const response = await api.post('/chat/send', messageData);
            return response.data;
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            throw error;
        }
    },

    // Obtener mis clientes del chat (Para entrenadores)
    getMyClients: async (trainerId) => {
        try {
            const response = await api.get(`/chat/my-clients/${trainerId}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo clientes del chat:", error);
            return [];
        }
    },
};

export const clientService = {
    // Entrenador envía solicitud
    sendRequest: async (trainerId, clientId) => {
        try {
            const res = await api.post('/clients/request', { trainerId, clientId });
            return res.data;
        } catch (error) {
            console.error("Error enviando solicitud:", error);
            throw error.response ? error.response.data : {message: 'Error de conexión'};
        }
    },
    // Cliente ve solicitudes pendientes
    getPendingRequests: async (clientId) => {
        try {
            const res = await api.get(`/clients/pending/${clientId}`);
            return res.data;
        } catch (error) {
            console.error("Error obteniendo solicitudes pendientes:", error);
            return [];
        }
    },
    // Cliente responde (status: 'accepted' | 'rejected')
    respondRequest: async (requestId, status) => {
        try {
            const res = await api.put('/clients/respond', { requestId, status });
            return res.data;
        } catch (error) {
            console.error("Error respondiendo solicitud:", error);
            throw error.response ? error.response.data : {message: 'Error de conexión'};
        }
    },
    // Entrenador ve sus clientes vinculados
    getMyClientsList: async (trainerId) => {
        try {
            const res = await api.get(`/clients/my-list/${trainerId}`);
            return res.data;
        } catch (error) {
            console.error("Error obteniendo lista de clientes:", error);
            return [];
        }
    }
};