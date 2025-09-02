// Configuración de la aplicación
const APP_CONFIG = {
    CLOUDINARY: {
        cloudName: 'dwpu6kemv',  
        uploadPreset: 'ml_default',
        apiKey: '937517786656645', 
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        styles: {
            palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
            }
        }
    },
    API: {
        baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api' 
            : 'https://riwipediabackend.vercel.app/api'
    },
    DEFAULT_IMAGES: {
        bookCover: 'https://res.cloudinary.com/dwpu6kemv/image/upload/v1700000000/placeholder-book_cover.png',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHg9IjIwIiB5PSIyMCIgZmlsbD0id2hpdGUiPgogIDxwYXRoIGQ9Ik01MCAyNWMxMy44IDAgMjUgMTEuMiAyNSAyNVM2My44IDc1IDUwIDc1IDI1IDYzLjggMjUgNTAgMzYuMiAyNSA1MCAyNXptMCA0MGM4LjMgMCAxNS02LjcgMTUtMTVzLTYuNy0xNS0xNS0xNS0xNSA2LjctMTUgMTUgNi43IDE1IDE1IDE1eiIvPgogIDxwYXRoIGQ9Ik01MCAzMGM1LjUgMCAxMCA0LjUgMTAgMTBzLTQuNSAxMC0xMCAxMC0xMC00LjUtMTAtMTAgNC41LTEwIDEwLTEwem0wLTMwYzEzLjggMCAyNSAxMS4yIDI1IDI1UzYzLjggNzUgNTAgNzUgMjUgNjMuOCAyNSA1MCAzNi4yIDI1IDUwIDI1eiIvPgo8L3N2Zz4KPC9zdmc+'
    }
};

// Hacer disponible globalmente
window.APP_CONFIG = APP_CONFIG;