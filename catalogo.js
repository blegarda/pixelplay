const rutaCatalogo = 'PixelPlay_catalogo.json';
const rutaUsuarios = 'usuarios.json';
const numeroWhatsApp = '573246161953';

const catalogo = document.getElementById('catalogo');
const botones = document.querySelectorAll('.menu-categorias button');
const busqueda = document.getElementById('busqueda');
const menuToggle = document.getElementById('menuToggle');
const menuCategorias = document.getElementById('menuCategorias');

let productos = [];
let tipoActivo = 'Todos';

// 🔐 Validación de acceso inmediato
(function validarAccesoPrivado() {
  const paginaActual = window.location.pathname;
  const esAdmin = paginaActual.includes('admin.html');
  const esDistribuidor = paginaActual.includes('distribuidor.html');
  const esIntranet = paginaActual.includes('intranet.html');

  if (esAdmin || esDistribuidor) {
    const sesionActiva = sessionStorage.getItem('usuarioAutenticado');
    const rol = sessionStorage.getItem('rol');

    if (sesionActiva !== 'true' || !rol) {
      window.location.replace('intranet.html');
      return;
    }

    const rolLower = rol.toLowerCase();

    if (esAdmin && rolLower !== 'admin') {
      window.location.replace('intranet.html');
      return;
    }

    if (esDistribuidor && rolLower !== 'vendedor' && rolLower !== 'frecuente') {
      window.location.replace('intranet.html');
      return;
    }

    window.rolUsuario = rolLower;
  } else {
    window.rolUsuario = 'publico';
  }

  // 🧠 Login en intranet.html
  if (esIntranet) {
    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const usuario = document.getElementById('usuario').value.trim();
        const clave = document.getElementById('clave').value.trim();
        const errorMsg = document.getElementById('errorMsg');

        errorMsg.style.display = 'none';

        fetch(rutaUsuarios)
          .then(res => res.json())
          .then(usuarios => {
            const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);

            if (!encontrado) {
              errorMsg.textContent = 'Usuario o contraseña incorrectos';
              errorMsg.style.display = 'block';
              return;
            }

            sessionStorage.setItem('usuarioAutenticado', 'true');
            sessionStorage.setItem('rol', encontrado.rol);
            sessionStorage.setItem('nombreUsuario', encontrado.nombre);

            if (encontrado.rol === 'admin') {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'distribuidor.html';
            }
          })
          .catch(() => {
            errorMsg.textContent = 'Error al validar usuario';
            errorMsg.style.display = 'block';
          });
      });
    }
  }
})();

// 🔎 Normalizar texto para búsqueda
const normalizar = str =>
  str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "");

// 🔀 Mezclar array (Fisher-Yates)
function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 📦 Cargar catálogo desde JSON
if (catalogo) {
  fetch(rutaCatalogo)
    .then(res => res.json())
    .then(data => {
      productos = data;
      renderizarCatalogo();
    })
    .catch(err => {
      console.error('Error al cargar el catálogo:', err);
      catalogo.innerHTML = '<p>Error al cargar los productos.</p>';
    });
}

// 🖼️ Renderizar productos agrupados por tipo
function renderizarCatalogo() {
  catalogo.innerHTML = '';

  const texto = normalizar(busqueda?.value?.trim() || '');
  const rol = window.rolUsuario || 'publico';

  const filtrados = productos.filter(p => {
    const coincideTipo = tipoActivo === 'Todos' || p.tipo === tipoActivo;
    const nombre = normalizar(p.nombre);
    const tipo = normalizar(p.tipo);
    const mensaje = normalizar(p.mensaje || '');

    const coincideTexto =
      nombre.includes(texto) ||
      tipo.includes(texto) ||
      mensaje.includes(texto);

    return coincideTipo && coincideTexto;
  });

  if (filtrados.length === 0) {
    catalogo.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }

  const grupos = {};
  filtrados.forEach(p => {
    const tipo = p.tipo || 'Otros';
    if (!grupos[tipo]) grupos[tipo] = [];
    grupos[tipo].push(p);
  });

  Object.keys(grupos).forEach(tipo => {
    const grupo = mezclarArray(grupos[tipo]);

    grupo.forEach(p => {
      let preciosHTML = '';

      if (rol === 'admin') {
        preciosHTML = `<p><strong>Cliente:</strong> $${p.precios?.cliente || 'Consultar'}</p>`;
      } else if (rol === 'vendedor' || rol === 'frecuente') {
        preciosHTML = `<p><strong>Distribuidor:</strong> $${p.precios?.distribuidor || 'Consultar'}</p>`;
      } else {
        preciosHTML = `<p><strong>Sugerido:</strong> $${p.precios?.sugerido || 'Consultar'}</p>`;
      }

      const item = document.createElement('article');
      item.className = 'item fade-in';
      item.setAttribute('itemscope', '');
      item.setAttribute('itemtype', 'https://schema.org/Product');

      item.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" itemprop="image" />
        <h2 itemprop="name">${p.nombre}</h2>
        ${preciosHTML}
        <div class="cta">
          <span class="tipo">🛒 Tipo: ${p.tipo}</span>
          <a class="btn-whatsapp" href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(p.mensaje)}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-whatsapp fa-lg"></i> Compra aquí
          </a>
        </div>
      `;

      catalogo.appendChild(item);
    });
  });
}

// 🧩 Filtro por categoría
botones?.forEach(btn => {
  btn.addEventListener('click', () => {
    tipoActivo = btn.dataset.tipo;
    botones.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarCatalogo();

    if (window.innerWidth <= 768) {
      menuCategorias?.classList.remove('open');
    }
  });
});

// 🔎 Búsqueda en tiempo real
busqueda?.addEventListener('input', () => {
  renderizarCatalogo();
});

// 📱 Menú hamburguesa
menuToggle?.addEventListener('click', () => {
  menuCategorias?.classList.toggle('open');
});