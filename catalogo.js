const rutaCatalogo = 'PixelPlay_catalogo.json';
const numeroWhatsApp = '573246161953';

const catalogo = document.getElementById('catalogo');
const botones = document.querySelectorAll('.menu-categorias button');
const busqueda = document.getElementById('busqueda');
const menuToggle = document.getElementById('menuToggle');
const menuCategorias = document.getElementById('menuCategorias');

let productos = [];
let tipoActivo = 'Todos';

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

// Renderizar productos filtrados
function renderizarCatalogo() {
  const texto = busqueda.value.toLowerCase();

  const filtrados = productos.filter(p => {
    const coincideTipo = tipoActivo === 'Todos' || p.tipo === tipoActivo;
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    return coincideTipo && coincideTexto;
  });

  // Transición de salida
  catalogo.querySelectorAll('.item').forEach(el => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 200);
  });

  setTimeout(() => {
    catalogo.innerHTML = '';

    if (filtrados.length === 0) {
      catalogo.innerHTML = '<p>No se encontraron productos.</p>';
      return;
    }

    filtrados.forEach(p => {
      const item = document.createElement('article');
      item.className = 'item fade-in';
      item.setAttribute('itemscope', '');
      item.setAttribute('itemtype', 'https://schema.org/Product');

      item.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" itemprop="image" />
        <h2 itemprop="name">${p.nombre}</h2>
        <p itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <span itemprop="priceCurrency" content="COP">$</span>
          <span itemprop="price">${p.precio.replace(/\D/g, '')}</span>
        </p>
        <div class="cta">
          <span class="tipo">🛒 Tipo: ${p.tipo}</span>
          <a class="whatsapp" href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(p.mensaje)}" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-whatsapp fa-lg"></i> Compra aquí
          </a>
        </div>
      `;
      catalogo.appendChild(item);
    });
  }, 200);
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
busqueda.addEventListener('input', renderizarCatalogo);

// Menú hamburguesa en móviles
menuToggle.addEventListener('click', () => {
  menuCategorias.classList.toggle('open');
});