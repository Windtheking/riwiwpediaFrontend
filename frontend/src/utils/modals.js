function showModal(title, message) {
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    if (modalContainer && modalTitle && modalMessage) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalContainer.style.display = 'flex';
    } else {
        console.error('❌ No se encontraron elementos del modal');
    }
}

function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}

// Cerrar modal al hacer clic fuera del contenido
document.addEventListener('DOMContentLoaded', function() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal();
            }
        });
    }
});

