let currentUser = null;
let allBooks = [];
let currentBooks = [];

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard cargado');
    
    // Verificar autenticación
    if (!await enforceAuth()) return;
    
    // Verificar que Cloudinary está cargado
    if (typeof cloudinary === 'undefined') {
        console.warn('Cloudinary no cargado, intentando recargar...');
        // Podrías cargar el script dinámicamente aquí si es necesario
    }
    
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
    
    console.log('Dashboard completamente inicializado');
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
        const response = await authGet('/books');
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
        let imageUrl = APP_CONFIG.DEFAULT_IMAGES.bookCover;
        if (book.portrait_url && book.portrait_url.startsWith('http')) {
            imageUrl = book.portrait_url;
        }
        return `
        <div class="book-card">
            ${book.is_favorite ? `<div class="favorite-badge" title="Favorito">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFA500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>` : ''}
            <div class="book-cover">
                <img src="${imageUrl}" alt="${book.title || 'Libro'}" style="object-fit:cover;width:100%;height:100%;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
            </div>
            <div class="book-info">
                <h3>${book.title || 'Sin título'}</h3>
                <p class="book-author">Por: ${book.author_name || 'Autor desconocido'}</p>
                <span class="book-category">${book.category_name || 'Sin categoría'}</span>
                <p class="book-language">Idioma: ${book.book_language || 'No especificado'}</p>
                <p class="book-downloads">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    ${book.download_count || 0} descargas
                </p>
                <div class="book-actions">
                    <button class="btn-download" onclick="downloadBook('${book.book_url}', ${book.id})" title="Descargar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button class="btn-favorite" onclick="toggleFavorite(${book.id})" title="${book.is_favorite ? 'Quitar favorito' : 'Agregar favorito'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                    ${currentUser && currentUser.rol === 'admin' ? `
                        <button class="btn-delete" onclick="deleteBook(${book.id})" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                        </button>
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
    try {
        // Verificar que Cloudinary está cargado
        if (typeof cloudinary === 'undefined') {
            console.error('Cloudinary no está cargado');
            showModal('Error', 'El sistema de carga de imágenes no está disponible');
            return;
        }

        // Verificar la configuración
        if (!APP_CONFIG.CLOUDINARY.cloudName || !APP_CONFIG.CLOUDINARY.uploadPreset) {
            console.error('Configuración de Cloudinary incompleta');
            return;
        }

        window.cloudinaryWidget = cloudinary.createUploadWidget({
            cloudName: APP_CONFIG.CLOUDINARY.cloudName,
            uploadPreset: APP_CONFIG.CLOUDINARY.uploadPreset,
            sources: APP_CONFIG.CLOUDINARY.sources,
            multiple: APP_CONFIG.CLOUDINARY.multiple,
            maxFileSize: APP_CONFIG.CLOUDINARY.maxFileSize,
            clientAllowedFormats: APP_CONFIG.CLOUDINARY.clientAllowedFormats,
            styles: APP_CONFIG.CLOUDINARY.styles,
            cropping: false, // Desactivar cropping para simplificar
            showAdvancedOptions: false,
            showPoweredBy: false,
            autoMinimize: true
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Imagen subida exitosamente:', result.info);
                
                const imageUrl = result.info.secure_url;
                document.getElementById('book-image-url').value = imageUrl;
                
                // Mostrar previsualización
                const previewImg = document.getElementById('preview-img');
                previewImg.src = imageUrl;
                document.getElementById('image-preview').style.display = 'block';
                document.getElementById('cover-file-name').textContent = 'Imagen subida correctamente';
                
                showModal('Éxito', 'Imagen subida correctamente');
            } else if (error) {
                console.error('Error en Cloudinary:', error);
                showModal('Error', 'Error al subir la imagen: ' + error.message);
            }
        });

        console.log('Cloudinary configurado correctamente');

    } catch (error) {
        console.error('Error al configurar Cloudinary:', error);
        showModal('Error', 'Error al configurar el sistema de imágenes');
    }
}

// Abrir widget de Cloudinary
function openCloudinaryWidget() {
    try {
        if (window.cloudinaryWidget) {
            window.cloudinaryWidget.open();
        } else {
            // Intentar reconfigurar si no está disponible
            setupCloudinary();
            if (window.cloudinaryWidget) {
                setTimeout(() => window.cloudinaryWidget.open(), 500);
            } else {
                showModal('Error', 'El sistema de carga de imágenes no está disponible');
            }
        }
    } catch (error) {
        console.error('Error al abrir Cloudinary:', error);
        showModal('Error', 'No se pudo abrir el selector de imágenes');
    }
}

// Abrir modal de agregar libro
function openAddBookModal() {
    if (currentUser && currentUser.rol === 'admin') {
        document.getElementById('add-book-modal').style.display = 'flex';
    } else {
        showModal('Error', 'Solo los administradores pueden agregar libros');
    }
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
    
    // Verificar que el usuario es admin
    if (!currentUser || currentUser.rol !== 'admin') {
        showModal('Error', 'No tienes permisos para agregar libros');
        return;
    }
    
    const bookData = {
        title: document.getElementById('book-title').value,
        author_name: document.getElementById('book-author').value,
        category_name: document.getElementById('book-category').value,
        book_language: document.getElementById('book-language').value,
        book_url: document.getElementById('book-url').value,
        portrait_url: document.getElementById('book-image-url').value
    };
    
    // Validación básica
    if (!bookData.title || !bookData.author_name || !bookData.category_name || !bookData.book_url) {
        showModal('Error', 'Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Si no hay imagen, usar una por defecto
    if (!bookData.portrait_url) {
        bookData.portrait_url = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop';
    }
    
    try {
        console.log('Enviando datos:', bookData);
        const response = await authPost('/books', bookData);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            showModal('Éxito', 'Libro agregado correctamente');
            closeAddBookModal();
            await loadBooks();
        } else {
            showModal('Error', data.message || 'Error al agregar el libro');
        }
    } catch (error) {
        console.error('Error al agregar libro:', error);
        showModal('Error', 'No se pudo agregar el libro. Verifica la consola para más detalles.');
    }
}

// Funciones para libros
async function downloadBook(bookUrl, bookId) {
    if (bookUrl && bookUrl.startsWith('http')) {
        try {
            // Solo incrementar contador si el libro tiene ID válido
            if (bookId) {
                await authPost('/books/download', { bookId });
            }
            
            // Abrir en nueva pestaña
            window.open(bookUrl, '_blank');
            
            // Recargar para actualizar contadores
            await loadBooks();
        } catch (error) {
            console.error('Error al incrementar descargas:', error);
            // Si falla la actualización, aún así abrir el enlace
            window.open(bookUrl, '_blank');
        }
    } else {
        showModal('Error', 'Enlace de descarga no disponible');
    }
}

async function toggleFavorite(bookId) {
    try {
        const response = await authPost('/books/favorite', { bookId });
        const data = await response.json();
        if (data.success) {
            // Si estamos en la pantalla de favoritos, recargar solo favoritos
            const favoritesSection = document.getElementById('favorites-section');
            if (favoritesSection && favoritesSection.classList.contains('active')) {
                await loadFavorites();
            } else {
                await loadBooks();
            }
        } else {
            showModal('Error', data.message || 'Error al actualizar favoritos');
        }
    } catch (error) {
        showModal('Error', 'Error al actualizar favoritos');
    }
}

async function deleteBook(bookId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer.')) {
        return;
    }

    console.log('Intentando eliminar libro ID:', bookId);
    
    try {
        const response = await fetch(`${APP_CONFIG.API.baseURL}/books/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ bookId: bookId })
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        const data = await response.json();
        console.log('Datos de respuesta:', data);

        if (data.success) {
            showModal('Éxito', 'Libro eliminado correctamente');
            // Recargar los libros después de eliminar
            await loadBooks();
        } else {
            showModal('Error', data.message || 'Error al eliminar el libro');
        }
    } catch (error) {
        console.error('Error completo al eliminar:', error);
        showModal('Error', 'No se pudo eliminar el libro: ' + error.message);
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
    
    container.innerHTML = favorites.map(book => {
        let imageUrl = APP_CONFIG.DEFAULT_IMAGES.bookCover;
        if (book.portrait_url && book.portrait_url.startsWith('http')) {
            imageUrl = book.portrait_url;
        }
        return `
        <div class="book-card">
            <div class="favorite-badge" title="Favorito">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFA500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="book-cover">
                <img src="${imageUrl}" alt="${book.title || 'Libro'}" style="object-fit:cover;width:100%;height:100%;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
            </div>
            <div class="book-info">
                <h3>${book.title || 'Sin título'}</h3>
                <p class="book-author">Por: ${book.author_name || 'Autor desconocido'}</p>
                <span class="book-category">${book.category_name || 'Sin categoría'}</span>
                <p class="book-language">Idioma: ${book.book_language || 'No especificado'}</p>
                <p class="book-downloads">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    ${book.download_count || 0} descargas
                </p>
                <div class="book-actions">
                    <button class="btn-download" onclick="downloadBook('${book.book_url}', ${book.id})" title="Descargar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button class="btn-favorite" onclick="toggleFavorite(${book.id})" title="Quitar favorito">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    ${currentUser && currentUser.rol === 'admin' ? `
                        <button class="btn-delete" onclick="deleteBook(${book.id})" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Hacer funciones globales
window.openCloudinaryWidget = openCloudinaryWidget;
window.downloadBook = downloadBook;
window.toggleFavorite = toggleFavorite;
window.deleteBook = deleteBook;
window.filterBooks = filterBooks;
window.logout = logout;
window.closeAddBookModal = closeAddBookModal;