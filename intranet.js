document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('loginView');
  const catalogoView = document.getElementById('catalogoView');
  const errorMsg = document.getElementById('errorMsg');
  const loginForm = document.getElementById('loginForm');

  // Verificar si ya hay sesión activa
  const rolActivo = sessionStorage.getItem('rol');
  const nombreActivo = sessionStorage.getItem('nombre');

  if (rolActivo && nombreActivo) {
    document.body.classList.add('catalogo-activo');
    loginView.style.display = 'none';
    catalogoView.style.display = 'block';
    mostrarBienvenida(nombreActivo, rolActivo);
  }

  // Validación con JSON externo
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value.trim();
    const clave = document.getElementById('clave').value.trim();

    try {
      const res = await fetch('usuarios.json');
      const usuarios = await res.json();

      const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);

      if (encontrado) {
        sessionStorage.setItem('rol', encontrado.rol);
        sessionStorage.setItem('nombre', encontrado.nombre);
        document.body.classList.add('catalogo-activo');
        loginView.style.display = 'none';
        catalogoView.style.display = 'block';
        errorMsg.style.display = 'none';
        mostrarBienvenida(encontrado.nombre, encontrado.rol);
      } else {
        errorMsg.style.display = 'block';
      }
    } catch (err) {
      console.error('Error al cargar usuarios.json', err);
      errorMsg.textContent = 'Error de conexión. Intenta más tarde.';
      errorMsg.style.display = 'block';
    }
  });
});

// Cierre de sesión
function cerrarSesion() {
  sessionStorage.removeItem('rol');
  sessionStorage.removeItem('nombre');
  document.body.classList.remove('catalogo-activo');
  location.reload();
}

// Mostrar bienvenida en el catálogo (opcional)
function mostrarBienvenida(nombre, rol) {
  const header = document.querySelector('.navbar');
  if (!header) return;

  const bienvenida = document.createElement('div');
  bienvenida.className = 'bienvenida-usuario';
  bienvenida.innerHTML = `<span>👋 Bienvenido, <strong>${nombre}</strong> (${rol})</span>`;
  header.appendChild(bienvenida);
}