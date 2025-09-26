const rutaCatalogo = 'PixelPlay_catalogo.json';
const numeroWhatsApp = '573246161953';

const catalogo = document.getElementById('catalogo');
const botones = document.querySelectorAll('.menu-categorias button');
const busqueda = document.getElementById('busqueda');
const menuToggle = document.getElementById('menuToggle');
const menuCategorias = document.getElementById('menuCategorias');

let productos = [];
let tipoActivo = 'Todos';
const rol = sessionStorage.getItem('rol') || 'publico'; // 'admin', 'vendedor', 'frecuente', or null

// Normalizar texto para búsqueda
const normalizar = str =>
  str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "");

// Mezclar array (Fisher-Yates)
function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Cargar catálogo desde JSON
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

// Renderizar productos agrupados por tipo y mezclados internamente
function renderizarCatalogo() {
  catalogo.innerHTML = ''; // Limpieza segura

  const texto = normalizar(busqueda?.value?.trim() || '');

  // Filtrar productos por texto y tipo activo
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

  // Agrupar por tipo
  const grupos = {};
  filtrados.forEach(p => {
    const tipo = p.tipo || 'Otros';
    if (!grupos[tipo]) grupos[tipo] = [];
    grupos[tipo].push(p);
  });

  // Renderizar cada grupo mezclado
  Object.keys(grupos).forEach(tipo => {
    const grupo = mezclarArray(grupos[tipo]);

    grupo.forEach(p => {
      let preciosHTML = '';

      if (rol === 'admin') {
        preciosHTML = Object.entries(p.precios || {}).map(([clave, valor]) => {
          return `<p><strong>${clave.charAt(0).toUpperCase() + clave.slice(1)}:</strong> ${valor}</p>`;
        }).join('');
      } else if (rol === 'vendedor' || rol === 'frecuente') {
        preciosHTML = `<p><strong>Distribuidor:</strong> ${p.precios?.distribuidor || 'Consultar'}</p>`;
      } else {
        preciosHTML = `<p><strong>Sugerido:</strong> ${p.precios?.sugerido || 'Consultar'}</p>`;
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
          <a class="whatsapp" href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(p.mensaje)}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-whatsapp fa-lg"></i> Compra aquí
          </a>
        </div>
      `;

      catalogo.appendChild(item);
    });
  });
}

// Filtro por categoría
botones.forEach(btn => {
  btn.addEventListener('click', () => {
    tipoActivo = btn.dataset.tipo;
    botones.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarCatalogo();

    // Cerrar menú en móviles
    if (window.innerWidth <= 768) {
      menuCategorias.classList.remove('open');
    }
  });
});

// Búsqueda en tiempo real
busqueda.addEventListener('input', () => {
  renderizarCatalogo();
});

// Menú hamburguesa en móviles
menuToggle.addEventListener('click', () => {
  menuCategorias.classList.toggle('open');
});