// Función para obtener la URL base de forma segura
function getBaseURL() {
    // Si APP_CONFIG está definido, usarlo
    if (window.APP_CONFIG && window.APP_CONFIG.API && window.APP_CONFIG.API.baseURL) {
        return window.APP_CONFIG.API.baseURL;
    }
    
    // Fallback: determinar URL basado en el entorno
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : 'https://riwipediabackend.vercel.app/api';
}

// Función para peticiones públicas (sin token)
async function publicPost(endpoint, data) {
    try {
        const baseURL = getBaseURL();
        const url = `${baseURL}${endpoint}`;
        
        console.log('Haciendo petición a:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return response;
    } catch (error) {
        console.error('Error en petición pública:', error);
        throw error;
    }
}

// También modificar authGet y authPost de la misma manera:
async function authGet(endpoint) {
    try {
        const token = localStorage.getItem('token');
        const baseURL = getBaseURL();
        const url = `${baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response;
    } catch (error) {
        console.error('Error en petición GET:', error);
        throw error;
    }
}

async function authPost(endpoint, data) {
    try {
        const token = localStorage.getItem('token');
        const baseURL = getBaseURL();
        const url = `${baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        return response;
    } catch (error) {
        console.error('Error en petición POST:', error);
        throw error;
    }
}

window.verifyToken = verifyToken;