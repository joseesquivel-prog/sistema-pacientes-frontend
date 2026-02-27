// src/config/api.js
// Este archivo maneja la URL de la API según el entorno

const getApiUrl = () => {
    // Si estamos en producción (Vercel, Netlify, etc.)
    if (process.env.NODE_ENV === 'production') {
        // Usa la variable de entorno que configuraremos en Vercel
        return process.env.REACT_APP_API_URL || 'https://tu-backend.onrender.com';
    }
    // En desarrollo local
    return 'http://localhost:8080';
};

export const API_BASE_URL = getApiUrl();

// Función helper para hacer llamadas a la API
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    
    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return response.json();
};