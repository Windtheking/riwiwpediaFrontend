// Función para hacer peticiones GET autenticadas
async function authGet(url) {
    try {
        const token = localStorage.getItem('token');
        
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

// Función para hacer peticiones POST autenticadas
async function authPost(url, data) {
    try {
        const token = localStorage.getItem('token');
        
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

// Función para peticiones públicas (sin token)
async function publicPost(url, data) {
    try {
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

// Verificar token con el backend
async function verifyToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return false;

        const response = await authGet('http://localhost:3000/api/profile');
        return response.ok;
    } catch (error) {
        console.error('Error verificando token:', error);
        return false;
    }
}

// Hacer funciones globales
window.authGet = authGet;
window.authPost = authPost;
window.publicPost = publicPost;
window.verifyToken = verifyToken;