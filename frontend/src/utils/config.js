// Configuración de la aplicación
const APP_CONFIG = {
    CLOUDINARY: {
        cloudName: 'dwpu6kemv',  
        uploadPreset: 'ml_default' 
    },
    API: {
        baseURL: import.meta.env.VITE_API_BASE_URL || 'https://riwipediabackend.vercel.app/api'
    },
    DEFAULT_IMAGES: {
        bookCover: 'https://via.placeholder.com/200x300/667eea/white?text=Portada',
        avatar: 'https://via.placeholder.com/100/667eea/white?text=U'
    }
};

// Hacer disponible globalmente
window.APP_CONFIG = APP_CONFIG;