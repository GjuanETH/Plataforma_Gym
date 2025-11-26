import axios from 'axios';

// --- CONFIGURACIÓN CENTRAL ---
// Apuntamos a la raíz del API Gateway.
// El Gateway se encarga de redirigir a /auth o /training según el prefijo.
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
    // LOGIN (Microservicio Auth)
    login: async (email, password) => {
        try {
            // POST http://localhost:8080/api/v1/auth/login
            const response = await api.post('/auth/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('gymfit_token', response.data.token);
                // Guardamos datos básicos del usuario
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

    // REGISTRO (Microservicio Auth)
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

    logout: () => {
        localStorage.removeItem('gymfit_token');
        localStorage.removeItem('gymfit_user');
    }, // <--- ¡AQUÍ ESTABA EL ERROR! Faltaba esta coma

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
    // CREAR RUTINA (Microservicio Training)
    createRoutine: async (routineData) => {
        try {
            // POST http://localhost:8080/api/v1/training
            const response = await api.post('/training', routineData);
            return response.data;
        } catch (error) {
            console.error("Error creando rutina:", error);
            throw error.response ? error.response.data : { message: 'Error al crear rutina' };
        }
    },

    // OBTENER RUTINAS DE UN CLIENTE
    getClientRoutines: async (clientId) => {
        try {
            // GET http://localhost:8080/api/v1/training/client/{clientId}
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
            // DELETE http://localhost:8080/api/v1/training/{routineId}
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
    // Obtener lista de entrenadores
    getTrainers: async () => {
        try {
            // Ajusta la URL base si pusiste el chat en otro microservicio
            // Asumimos que está en el Gateway general bajo /chat
            const response = await api.get('/chat/trainers');
            return response.data;
        } catch (error) {
            console.error("Error obteniendo entrenadores:", error);
            return [];
        }
    },

    // Obtener historial de chat con una persona
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

    getMyClients: async (trainerId) => {
        try {
            const response = await api.get(`/chat/my-clients/${trainerId}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo clientes del chat:", error);
            return [];
        }
    },
    // ----------------------------
};