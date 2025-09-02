document.addEventListener('DOMContentLoaded', function() {

    // Redirigir si ya está autenticado
    if (isAuthenticated()) {
        window.location.href = '../dashboard/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) {
        console.error('❌ No se encontró el formulario de login');
        return;
    }
    
    // Eliminar action y method para evitar recarga
    loginForm.removeAttribute('action');
    loginForm.removeAttribute('method');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validaciones básicas
        if (!email || !password) {
            showModal('Error', 'Por favor, completa todos los campos');
            return;
        }

        try {
            // Usar publicPost en lugar de fetch directo
            const response = await publicPost('http://localhost:3000/api/login', {
                email: email,
                password: password
            });
            
            const data = await response.json();
            
            if (data.success) {
                showModal('¡Éxito!', 'Inicio de sesión exitoso');
                
                // Guardar token y datos de usuario
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirigir al dashboard después de 2 segundos
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 2000);
            } else {
                showModal('Error', data.message);
            }
        } catch (error) {
            console.error('Error en login:', error);
            showModal('Error', 'Error de conexión con el servidor');
        }
    });
});