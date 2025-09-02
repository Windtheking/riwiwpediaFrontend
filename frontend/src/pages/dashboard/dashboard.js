let currentUser = null;
let allBooks = [];
let currentBooks = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticación
    if (!await enforceAuth()) return;
    
    // Cargar datos del usuario
    await loadUserData();
    
    // Configurar navegación SPA
    setupNavigation();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar libros
    await loadBooks();
    
    // Configurar Cloudinary
    setupCloudinary();
});

// Cargar datos del usuario
async function loadUserData() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        currentUser = user;
        
        // Mostrar info en header
        document.getElementById('user-email').textContent = user.email;
        
        // Mostrar info en perfil
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-role').textContent = user.rol;
        document.getElementById('profile-id').textContent = user.id;
        
        // Mostrar botón de agregar solo para admin
        if (user.rol === 'admin') {
            document.getElementById('open-modal-btn').style.display = 'flex';
        }
        
    } catch (error) {
        showModal('Error', 'Error al cargar los datos del usuario');
    }
}

// Configurar navegación SPA
function setupNavigation() {
    const navLinks = document.querySelectorAll('.navbar a');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // Ocultar todas las secciones
            sections.forEach(section => section.classList.remove('active'));
            
            // Mostrar sección seleccionada
            document.getElementById(`${targetSection}-section`).classList.add('active');
            
            // Si es favorites, cargar favoritos
            if (targetSection === 'favorites') {
                loadFavorites();
            }
        });
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Modal de agregar libro
    const openModalBtn = document.getElementById('open-modal-btn');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', openAddBookModal);
    }
    
    document.getElementById('add-book-form').addEventListener('submit', handleAddBook);
}

// Cargar libros desde el backend
async function loadBooks() {
    try {
        const response = await authGet('http://localhost:3000/api/books');
        const data = await response.json();
        
        if (data.success) {
            allBooks = data.books;
            currentBooks = [...allBooks];
            renderBooks(currentBooks);
            updateCounters();
            populateCategories();
        } else {
            showModal('Error', 'Error al cargar los libros');
        }
    } catch (error) {
        showModal('Error', 'No se pudieron cargar los libros');
    }
}

// Renderizar libros en grid
function renderBooks(booksArray) {
    const container = document.getElementById('books-container');
    
    if (booksArray.length === 0) {
        container.innerHTML = '<div class="no-books">No hay libros disponibles</div>';
        return;
    }
    
    container.innerHTML = booksArray.map(book => {
        // Determinar la URL de la imagen
        let imageUrl = APP_CONFIG.DEFAULT_IMAGES.bookCover;
        if (book.portrait_url && book.portrait_url.startsWith('http')) {
            imageUrl = book.portrait_url;
        }
        
        return `
        <div class="book-card">
            ${book.is_favorite ? '<div class="favorite-badge">⭐</div>' : ''}
            <div class="book-cover">
                <img src="${imageUrl}" alt="${book.title || 'Libro'}">
            </div>
            <div class="book-info">
                <h3>${book.title || 'Sin título'}</h3>
                <p class="book-author">Por: ${book.author_name || 'Autor desconocido'}</p>
                <span class="book-category">${book.category_name || 'Sin categoría'}</span>
                <p class="book-language">Idioma: ${book.book_language || 'No especificado'}</p>
                <p class="book-downloads">📥 ${book.download_count || 0} descargas</p>
                <div class="book-actions">
                    <button class="btn-download" onclick="downloadBook('${book.book_url}', ${book.id})">
                        📥 Descargar
                    </button>
                    <button class="btn-favorite" onclick="toggleFavorite(${book.id})">
                        ${book.is_favorite ? '❤️ Quitar Favorito' : '🤍 Agregar Favorito'}
                    </button>
                    ${currentUser && currentUser.rol === 'admin' ? `
                        <button class="btn-delete" onclick="deleteBook(${book.id})">🗑️ Eliminar</button>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Actualizar contadores
function updateCounters() {
    document.getElementById('total-books').textContent = allBooks.length;
    document.getElementById('total-favorites').textContent = allBooks.filter(b => b.is_favorite).length;
    document.getElementById('total-downloads').textContent = allBooks.reduce((sum, book) => sum + (book.download_count || 0), 0);
    
    // Contar categorías únicas
    const uniqueCategories = new Set(allBooks.map(book => book.category_name));
    document.getElementById('total-categories').textContent = uniqueCategories.size;
}

// Poblar categorías en el filtro
function populateCategories() {
    const categoryFilter = document.getElementById('category-filter');
    const uniqueCategories = [...new Set(allBooks.map(book => book.category_name).filter(Boolean))];
    
    // Limpiar opciones existentes (excepto la primera)
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filtrar libros
function filterBooks() {
    const searchTerm = document.getElementById('book-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-filter').value;
    
    let filtered = allBooks.filter(book => {
        const matchesSearch = (book.title && book.title.toLowerCase().includes(searchTerm)) || 
                             (book.author_name && book.author_name.toLowerCase().includes(searchTerm));
        const matchesCategory = category === '' || book.category_name === category;
        return matchesSearch && matchesCategory;
    });
    
    // Ordenar
    switch(sortBy) {
        case 'newest':
            filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            break;
        case 'oldest':
            filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
            break;
        case 'downloads':
            filtered.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
            break;
        case 'title':
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            break;
    }
    
    currentBooks = filtered;
    renderBooks(filtered);
}

// Configurar Cloudinary
function setupCloudinary() {
    window.cloudinaryWidget = cloudinary.createUploadWidget({
        cloudName: APP_CONFIG.CLOUDINARY.cloudName,
        uploadPreset: APP_CONFIG.CLOUDINARY.uploadPreset,
        sources: ['local', 'url'],
        multiple: false,
        maxFileSize: 5000000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            document.getElementById('book-image-url').value = imageUrl;
            
            // Mostrar previsualización
            const previewImg = document.getElementById('preview-img');
            previewImg.src = imageUrl;
            document.getElementById('image-preview').style.display = 'block';
            document.getElementById('cover-file-name').textContent = 'Imagen subida correctamente';
        } else if (error) {
            showModal('Error', 'Error al subir la imagen');
        }
    });
}

// Abrir widget de Cloudinary
function openCloudinaryWidget() {
    if (window.cloudinaryWidget) {
        window.cloudinaryWidget.open();
    } else {
        showModal('Error', 'El sistema de carga de imágenes no está disponible');
    }
}

// Abrir modal de agregar libro
function openAddBookModal() {
    document.getElementById('add-book-modal').style.display = 'flex';
}

// Cerrar modal de agregar libro
function closeAddBookModal() {
    document.getElementById('add-book-modal').style.display = 'none';
    document.getElementById('add-book-form').reset();
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('cover-file-name').textContent = '';
    document.getElementById('book-image-url').value = '';
}

// Manejar envío de formulario de libro
async function handleAddBook(e) {
    e.preventDefault();
    
    const bookData = {
        title: document.getElementById('book-title').value,
        author_name: document.getElementById('book-author').value,
        category_name: document.getElementById('book-category').value,
        book_language: document.getElementById('book-language').value,
        book_url: document.getElementById('book-url').value,
        portrait_url: document.getElementById('book-image-url').value || APP_CONFIG.DEFAULT_IMAGES.bookCover
    };
    
    try {
        const response = await authPost('http://localhost:3000/api/books', bookData);
        const data = await response.json();
        
        if (data.success) {
            showModal('Éxito', 'Libro agregado correctamente');
            closeAddBookModal();
            await loadBooks(); // Recargar libros
        } else {
            showModal('Error', data.message || 'Error al agregar el libro');
        }
    } catch (error) {
        showModal('Error', 'Error al agregar el libro');
    }
}

// Funciones para libros
async function downloadBook(bookUrl, bookId) {
    if (bookUrl && bookUrl.startsWith('http')) {
        try {
            // Incrementar contador de descargas
            await authPost('http://localhost:3000/api/books/download', { bookId });
            
            // Abrir en nueva pestaña
            window.open(bookUrl, '_blank');
            
            // Recargar para actualizar contadores
            await loadBooks();
        } catch (error) {
            // Si falla la actualización, aún así abrir el enlace
            window.open(bookUrl, '_blank');
        }
    } else {
        showModal('Error', 'Enlace de descarga no disponible');
    }
}

async function toggleFavorite(bookId) {
    try {
        const response = await authPost('http://localhost:3000/api/books/favorite', { bookId });
        const data = await response.json();
        
        if (data.success) {
            await loadBooks(); // Recargar libros
        } else {
            showModal('Error', data.message || 'Error al actualizar favoritos');
        }
    } catch (error) {
        showModal('Error', 'Error al actualizar favoritos');
    }
}

async function deleteBook(bookId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro?')) return;
    
        try {
            const response = await fetch(`http://localhost:3000/api/books/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId })
            });
            const data = await response.json();
        
            if (data.success) {
                showModal('Éxito', 'Libro eliminado correctamente');
                await loadBooks(); // Recargar libros
            } else {
                showModal('Error', data.message || 'Error al eliminar el libro');
            }
        } catch (error) {
            showModal('Error', 'Error al eliminar el libro');
        }
}

// Cargar favoritos
async function loadFavorites() {
    const favorites = allBooks.filter(book => book.is_favorite);
    const container = document.getElementById('favorites-container');
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="no-books">No tienes libros favoritos aún</div>';
        return;
    }
    
    // Crear un contenedor temporal para renderizar
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = favorites.map(book => {
        let imageUrl = APP_CONFIG.DEFAULT_IMAGES.bookCover;
        if (book.portrait_url && book.portrait_url.startsWith('http')) {
            imageUrl = book.portrait_url;
        }
        
        return `
        <div class="book-card">
            ${book.is_favorite ? '<div class="favorite-badge">⭐</div>' : ''}
            <div class="book-cover">
                <img src="${imageUrl}" alt="${book.title || 'Libro'}">
            </div>
            <div class="book-info">
                <h3>${book.title || 'Sin título'}</h3>
                <p class="book-author">Por: ${book.author_name || 'Autor desconocido'}</p>
                <span class="book-category">${book.category_name || 'Sin categoría'}</span>
                <p class="book-language">Idioma: ${book.book_language || 'No especificado'}</p>
                <p class="book-downloads">📥 ${book.download_count || 0} descargas</p>
                <div class="book-actions">
                    <button class="btn-download" onclick="downloadBook('${book.book_url}', ${book.id})">
                        📥 Descargar
                    </button>
                    <button class="btn-favorite" onclick="toggleFavorite(${book.id})">
                        ❤️ Quitar Favorito
                    </button>
                    ${currentUser && currentUser.rol === 'admin' ? `
                        <button class="btn-delete" onclick="deleteBook(${book.id})">🗑️ Eliminar</button>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML = tempContainer.innerHTML;
}

// Hacer funciones globales
window.openCloudinaryWidget = openCloudinaryWidget;
window.downloadBook = downloadBook;
window.toggleFavorite = toggleFavorite;
window.deleteBook = deleteBook;
window.filterBooks = filterBooks;
window.logout = logout;
window.closeAddBookModal = closeAddBookModal;