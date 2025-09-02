// Configuración de la aplicación
const APP_CONFIG = {
    CLOUDINARY: {
        cloudName: 'dwpu6kemv',  
        uploadPreset: 'ml_default' 
    },
    API: {
        baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api' 
            : 'https://riwipediabackend.vercel.app/api'
    },
    DEFAULT_IMAGES: {
        bookCover: 'https://via.placeholder.com/200x300/667eea/white?text=Portada',
        avatar: 'https://via.placeholder.com/100/667eea/white?text=U'
    }
};

// Hacer disponible globalmente
window.APP_CONFIG = APP_CONFIG;