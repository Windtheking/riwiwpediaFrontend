document.addEventListener('DOMContentLoaded', function() {
    // Redirigir si ya está autenticado
    if (isAuthenticated()) {
        window.location.href = '../dashboard/dashboard.html';
        return;
    }
    
    const registerForm = document.getElementById('register_form');
    
    if (!registerForm) {
        console.error('❌ No se encontró el formulario de registro');
        return;
    }
    
    // Eliminar action para evitar recarga
    registerForm.removeAttribute('action');
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('conf_pass').value;
        
        // Validaciones
        if (!name || !email || !password || !confirmPassword) {
            showModal('Error', 'Por favor, completa todos los campos');
            return;
        }
        
        if (password !== confirmPassword) {
            showModal('Error', 'Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 6) {
            showModal('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            // Usar publicPost para registro
            const response = await publicPost('http://localhost:3000/api/register', {
                username: name,
                email: email,
                password: password
            });
            
            const data = await response.json();
            
            if (data.success) {
                showModal('¡Éxito!', 'Usuario registrado exitosamente');
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = '../login/login.html';
                }, 2000);
            } else {
                showModal('Error', data.message);
            }
        } catch (error) {
            console.error('Error en registro:', error);
            showModal('Error', 'Error de conexión con el servidor');
        }
    });
});