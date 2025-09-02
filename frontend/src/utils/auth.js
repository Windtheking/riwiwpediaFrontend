// Verificar si el usuario está autenticado (solo frontend)
function isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
}

// Redirigir basado en autenticación
function redirectBasedOnAuth() {
    if (!isAuthenticated()) return false;
    
    const currentPath = window.location.pathname;
    const publicRoutes = ['/login.html', '/register.html', '/index.html'];
    const isPublicRoute = publicRoutes.some(route => currentPath.includes(route));
    
    if (isPublicRoute) {
        // Si está autenticado y trata de acceder a login/register
        window.location.href = '/frontend/src/pages/dashboard/dashboard.html';
        return false;
    }
    
    return true;
}

// Forzar verificación de autenticación con backend
async function enforceAuth() {
    if (!isAuthenticated()) {
        // Si no hay token, redirigir a login
        if (window.location.pathname.includes('/dashboard.html')) {
            window.location.href = '../login/login.html';
        }
        return false;
    }
    
    // Verificar token con el backend
    const isValid = await verifyToken();
    
    if (!isValid) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname.includes('/dashboard.html')) {
            window.location.href = '../login/login.html';
        }
        return false;
    }
    
    return redirectBasedOnAuth();
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../../../../index.html';
}

// Bloquear navegación manual
function blockManualNavigation() {
    let currentPath = window.location.pathname;
    
    window.addEventListener('popstate', function(event) {
        if (!redirectBasedOnAuth()) {
            // Prevenir que cambie la URL
            history.pushState(null, null, currentPath);
        }
    });
}

// Inicializar protección
function initAuth() {
    redirectBasedOnAuth();
    blockManualNavigation();
    
    // Verificar autenticación cada 30 segundos
    setInterval(async () => {
        if (isAuthenticated()) {
            await enforceAuth();
        }
    }, 30000);
}

// Hacer funciones globales
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.enforceAuth = enforceAuth;

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', initAuth);