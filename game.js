// ===== UTILIDADES =====
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

function num(value, def = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : def;
}

function formatNum(n) {
  return Math.floor(num(n)).toLocaleString();
}

function normalizarRareza(rareza) {
  return String(rareza || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function rellenarArray(guardado, defecto, tipo = "number") {
  const arr = Array.isArray(guardado) ? guardado.slice(0, defecto.length) : [];

  for (let i = 0; i < defecto.length; i++) {
    if (arr[i] === undefined || arr[i] === null) {
      arr[i] = defecto[i];
    }

    if (tipo === "number") {
      arr[i] = num(arr[i], defecto[i]);
    } else if (tipo === "boolean") {
      arr[i] = Boolean(arr[i]);
    }
  }

  return arr;
}

// ===== ESTADO BASE =====
let wolfichas = 0;
let wolfichasAnteriores = 0;
let wolfichasPorClic = 1;

let multiplicadorGalleta = 1;
let duracionBuffGalleta = 0;
let timerBuffGalleta = null;

let wolfilletes = 0;
let wolfbytes = 0;

let fondoEquipado = 0;
let multiplicadorFondo = 1.0;

const fondosCompradosDefecto = [true, false, false, false];
let fondosComprados = fondosCompradosDefecto.slice();

const catalogoFondos = [
  { nombre: "Default", multiplicador: 1.0, costo: 0 },
  { nombre: "Calma Verdosa", multiplicador: 1.2, costo: 10 },
  { nombre: "Amarillo Energético", multiplicador: 1.5, costo: 25 },
  { nombre: "Azul Fresco", multiplicador: 2.0, costo: 70 }
];

let multiplicadorHueso = 1;
let tiempoBuffHueso = 0;
let esHuesoNatural = false;

let clicksActuales = 0;
let clicksRequeridos = 0;
let tiempoLimiteQTE = 0;
let timerQTE = null;
let timerLoopGalleta = null;
let galletaActiva = false;
let mejoraGalleta = { comprado: false };
let ultimoTiempoClick = 0;
let esSpeedrunner = true;

const nombresMejoras = [
  "Heavy Click",
  "Stronger Click",
  "Super Click",
  "Clicker Wolfy",
  "Precise Hits",
  "Sharp Paws",
  "Farmer Wolfy",
  "Mejor Calidad de Hoz",
  "Miner Wolfy",
  "Picos Reforzados",
  "Cooperación Pata-mano",
  "Picos y Palas [Dúo]",
  "Baker Wolfy",
  "Patas Rápidas",
  "Galletas A Remate",
  "Mineral Comestible",
  "Worker Wolfy",
  "Furpuccino Express",
  "Asiento Cómodo",
  "Galletitas Crocantes",
  "Streamer Wolfy",
  "Galletitas Con Chocolate",
  "Taxist Wolfy",
  "Motor Potenciado",
  "Galletitas de Vainilla",
  "Idol Wolfy"
];

const esMejoraUnica = [
  true, true, true, false, true, true, false, true, false, true,
  true, true, false, false, false, true, false, true, true, true,
  false, true, false, true, true, false
];

const inventarioDefecto = new Array(26).fill(0);
let inventario = inventarioDefecto.slice();

const wolfichasProduceDefecto = [
  0, 0, 0, 0.1, 0, 0, 1, 0, 5, 0,
  0, 0, 0, 0, 0, 0, 50, 0, 0, 0,
  200, 0, 500, 0, 0, 1500
];
let wolfichasProduce = wolfichasProduceDefecto.slice();

const precioBase = [
  50, 750, 5500, 10, 500, 200, 150, 500, 800, 2000,
  3000, 2500, 2000, 5000, 10000, 15000, 30000, 40000, 65000, 9999,
  120000, 150000, 250000, 350000, 500000, 750000
];

const precioProductoDefecto = precioBase.slice();
let precioProducto = precioProductoDefecto.slice();

let probCrit = 0;
let probSuperCrit = 0;
let wolfichasPorSegundo = 0;
let vistaActual = 0; // 0: Streamer Chat, 1: Idol Ritmo

let productorSecuestrado = false;
let penalizacionWCS = 0;

// ===== LOGROS =====
const logros = [
  { id: "badge-1", titulo: "Primer Ahorro", descripcion: "Ten 100 Wolfichas Ahorradas", condicion: () => wolfichas >= 100, completado: false },
  { id: "badge-2", titulo: "Alcancía Llena", descripcion: "Ten 500 Wolfichas Ahorradas", condicion: () => wolfichas >= 500, completado: false },
  { id: "badge-3", titulo: "Woof!!", descripcion: "Contrata 1 Clicker Wolfy", condicion: () => (inventario[3] || 0) >= 1, completado: false },
  { id: "badge-4", titulo: "Familia Creciente", descripcion: "Contrata 10 Clicker Wolfy", condicion: () => (inventario[3] || 0) >= 10, completado: false },
  { id: "badge-5", titulo: "Anillo Peludo", descripcion: "Contrata 50 Clicker Wolfy", condicion: () => (inventario[3] || 0) >= 50, completado: false },
  { id: "badge-6", titulo: "Colonia Lupina", descripcion: "Contrata 250 Clicker Wolfies", condicion: () => (inventario[3] || 0) >= 250, completado: false },
  { id: "badge-7", titulo: "Pelurno", descripcion: "¡Alcanza la disparatada cifra de 1,000 Clicker Wolfies!", condicion: () => (inventario[3] || 0) >= 1000, completado: false },
  { id: "badge-8", titulo: "Organización Creciente", descripcion: "Alcanza una producción de 10 WC/s", condicion: () => wolfichasPorSegundo >= 10, completado: false },
  { id: "badge-9", titulo: "Fuerza Lupina", descripcion: "Alcanza una producción de 100 WC/s", condicion: () => wolfichasPorSegundo >= 100, completado: false },
  { id: "badge-10", titulo: "¿Empresario o Domador? ¿Qué Tal Ambos?", descripcion: "¡Alcanza la colosal cifra de 1,000 WC/s!", condicion: () => wolfichasPorSegundo >= 1000, completado: false },
  { id: "badge-11", titulo: "Recolector Casual", descripcion: "Contrata 1 Farmer Wolfy", condicion: () => (inventario[6] || 0) >= 1, completado: false },
  { id: "badge-12", titulo: "Hacer Crecer un Jardín", descripcion: "Contrata 10 Farmer Wolfies", condicion: () => (inventario[6] || 0) >= 10, completado: false },
  { id: "badge-13", titulo: "Farmeando Wolfichas... Literalmente", descripcion: "Contrata 100 Farmer Wolfies", condicion: () => (inventario[6] || 0) >= 100, completado: false },
  { id: "badge-14", titulo: "Trabajo Duro", descripcion: "Contrata 1 Miner Wolfy", condicion: () => (inventario[8] || 0) >= 1, completado: false },
  { id: "badge-15", titulo: "Mine Pero Sin Craft", descripcion: "Contrata 5 Miner Wolfies", condicion: () => (inventario[8] || 0) >= 5, completado: false },
  { id: "badge-16", titulo: "¡¿Y los Diamantes?!", descripcion: "Contrata 25 Miner Wolfies", condicion: () => (inventario[8] || 0) >= 25, completado: false },
  { id: "badge-17", titulo: "Pastelería Lupina", descripcion: "Contrata 1 Baker Wolfy.", condicion: () => (inventario[12] || 0) >= 1, completado: false },
  { id: "badge-18", titulo: "Mito Confirmado", descripcion: "Encuentra y atrapa un Huesito de Oro de forma natural", condicion: () => false, completado: false },
  { id: "badge-19", titulo: "Olor Creciente A Papel", descripcion: "Contrata 1 Worker Wolfy y sube tus stonks", condicion: () => (inventario[16] || 0) >= 1, completado: false },
  { id: "badge-20", titulo: "Comegalletas Speedrunner", descripcion: "Haz todos los clics de la galleta con un intervalo inferior a 0.7s por clic", condicion: () => false, completado: false },
  { id: "badge-21", titulo: "Comida Tramposa", descripcion: "¡¡QUÉ CERCA!! Cómete una galleta con menos de 2s sobrantes", condicion: () => false, completado: false }
];

// ===== RITMO IDOL WOLFY =====
const mapaCanciones = {
  swim: {
    archivo: "musica/swim (alternative rock ver).mp3",
    mapaNotas: [
      { tiempo: 1.0, carril: 0 }, { tiempo: 2.5, carril: 3 },
      { tiempo: 5.0, carril: 1 }, { tiempo: 5.0, carril: 2 },
      { tiempo: 5.4, carril: 1 }, { tiempo: 5.4, carril: 0 },
      { tiempo: 5.8, carril: 2 }, { tiempo: 5.8, carril: 0 },
      { tiempo: 5.8, carril: 3 }, { tiempo: 6.2, carril: 0 },
      { tiempo: 6.2, carril: 1 }, { tiempo: 6.6, carril: 0 },
      { tiempo: 7.0, carril: 2 }, { tiempo: 7.0, carril: 3 },
      { tiempo: 7.4, carril: 1 }, { tiempo: 7.4, carril: 2 },
      { tiempo: 7.4, carril: 0 }, { tiempo: 7.8, carril: 3 },
      { tiempo: 8.2, carril: 2 }, { tiempo: 8.35, carril: 2 },
      { tiempo: 8.45, carril: 0 }, { tiempo: 8.55, carril: 0 },
      { tiempo: 8.65, carril: 2 }, { tiempo: 8.75, carril: 2 },
      { tiempo: 9.15, carril: 1 }, { tiempo: 9.45, carril: 1 }
    ]
  },
  bed: {
    archivo: "musica/bed.mp3",
    mapaNotas: [
      { tiempo: 0.8, carril: 0 }, { tiempo: 1.5, carril: 2 },
      { tiempo: 2.5, carril: 1 }, { tiempo: 3.8, carril: 3 },
      { tiempo: 5.0, carril: 0 }, { tiempo: 6.2, carril: 1 },
      { tiempo: 7.5, carril: 2 }, { tiempo: 9.0, carril: 3 }
    ]
  },
  gam3bo1: {
    archivo: "musica/gam3_bo1.mp3",
    mapaNotas: [
      { tiempo: 0.5, carril: 0 }, { tiempo: 1.0, carril: 1 },
      { tiempo: 1.5, carril: 2 }, { tiempo: 2.0, carril: 3 },
      { tiempo: 2.5, carril: 0 }, { tiempo: 3.0, carril: 2 },
      { tiempo: 3.5, carril: 1 }, { tiempo: 4.0, carril: 3 },
      { tiempo: 4.5, carril: 0 }, { tiempo: 5.0, carril: 1 },
      { tiempo: 5.5, carril: 2 }, { tiempo: 6.0, carril: 3 }
    ]
  }
};

let cancionSeleccionada = "swim";
let notasActivas = [];
let puntajeRitmo = 0;
let loopRitmoFrame = null;
let tiempoJuegoRitmo = -3.0;
let tiempoFinRitmo = 0;
let juegoPausado = true;
let juegoIniciado = false;
let ultimoTimestamp = 0;
let audioDisponible = false;

const teclasCarriles = {
  "a": 0, "A": 0,
  "s": 1, "S": 1,
  "d": 2, "D": 2,
  "f": 3, "F": 3
};

// ===== COLECCIONES =====
const coleccionConociendoWolfyGo = {
  id: "col_1",
  nombre: "Conociendo Wolfy Go",
  completada: false,
  libros: [
    {
      id: "wolfichas",
      nombre: "Wolfichas",
      rareza: "Común",
      paginasTotales: 10,
      paginasObtenidas: 0,
      completado: false,
      rewardWolfbytes: 50,
      lore: "Las Wolfichas son la moneda base del imperio. Nacieron como simples fichas de madera..."
    },
    {
      id: "mejoras",
      nombre: "Mejoras",
      rareza: "Común",
      paginasTotales: 10,
      paginasObtenidas: 0,
      completado: false,
      rewardWolfbytes: 50,
      lore: "Invertir en ciencia lupina es la clave para automatizar la economía..."
    },
    {
      id: "wolfilletes",
      nombre: "Wolfilletes",
      rareza: "Raro",
      paginasTotales: 10,
      paginasObtenidas: 0,
      completado: false,
      rewardWolfbytes: 100,
      lore: "Billetes respaldados por la reserva oficial de huesos y tecnología..."
    },
    {
      id: "huesitos_dorados",
      nombre: "Huesitos Dorados",
      rareza: "Raro",
      paginasTotales: 10,
      paginasObtenidas: 0,
      completado: false,
      rewardWolfbytes: 100,
      lore: "Reliquias legendarias que caen del cielo y multiplican la producción temporalmente..."
    },
    {
      id: "conoce_a_wolfy",
      nombre: "Conoce a Wolfy",
      rareza: "Épico",
      paginasTotales: 10,
      paginasObtenidas: 0,
      completado: false,
      rewardWolfbytes: 250,
      lore: "Wolfy es un lobito que le encanta conocer nuevos integrantes, es casi un humano en 4 patas que es super versatil a la hora de aprender, ¡¡incluso puede aprender a hablar!!\n\nSu fuerza es baja en temas fisicos, pero su fuerza de voluntad es enorme, por eso su inteligencia y capacidad definitiva de aprendizaje.\n\nSi debe luchar por su supervivencia, trata de evitar ello y hacer las paces, pero a pesar de su aspecto inocente... no significa que no entienda palabrotas."
    },
    {
      id: "clicker_wolfies",
      nombre: "Clicker Wolfies",
      rareza: "Épico",
      paginasTotales: 10,
      paginasObtenidas: 0,
      completado: false,
      rewardWolfbytes: 250,
      lore: "Los trabajadores más leales. Clican incansablemente día y noche para hacer crecer tu imperio..."
    }
  ]
};

const coleccionRecetasMananeras = {
  id: "col_2",
  nombre: "Colección 2: Recetas Mañaneras Deliciosas",
  rewardTema: "Waffles",
  completada: false,
  libros: [
    {
      id: "receta_1",
      nombre: "Huevos Fritos Con Salchichas",
      rareza: "Común",
      paginasTotales: 5,
      paginasObtenidas: 0,
      rewardWolfbytes: 100,
      completado: false,
      lore: "El desayuno clásico de los lobitos madrugadores. Crujiente, salado y perfectamente equilibrado."
    },
    {
      id: "receta_2",
      nombre: "Sandwich Gratinado de Jamón y Queso",
      rareza: "Común",
      paginasTotales: 5,
      paginasObtenidas: 0,
      rewardWolfbytes: 100,
      completado: false,
      lore: "Queso derretido, jamón dorado y pan crujiente. Una obra maestra sencilla pero poderosa."
    },
    {
      id: "receta_3",
      nombre: "Café Espresso",
      rareza: "Raro",
      paginasTotales: 8,
      paginasObtenidas: 0,
      rewardWolfbytes: 350,
      completado: false,
      lore: "Pequeño, intenso y capaz de despertar hasta al Clicker Wolfy más dormilón."
    },
    {
      id: "receta_4",
      nombre: "Galletónes Con Berries",
      rareza: "Raro",
      paginasTotales: 8,
      paginasObtenidas: 0,
      rewardWolfbytes: 350,
      completado: false,
      lore: "La mezcla perfecta entre dulzura y acidez. Wolfy los considera tesoro nacional."
    },
    {
      id: "receta_5",
      nombre: "Panqueques Con Manjar",
      rareza: "Épico",
      paginasTotales: 12,
      paginasObtenidas: 0,
      rewardWolfbytes: 1000,
      completado: false,
      lore: "Suaves, dorados y cubiertos de manjar. Se dice que brillan con luz propia al amanecer."
    },
    {
      id: "receta_6",
      nombre: "Waffles Con Crema",
      rareza: "Épico",
      paginasTotales: 12,
      paginasObtenidas: 0,
      rewardWolfbytes: 1000,
      completado: false,
      lore: "La receta legendaria que desbloquea el tema especial Waffles. Crujientes por fuera, suaves por dentro."
    }
  ]
};

let temaRetroDesbloqueado = false;
let temaRetroEquipado = false;

let temaWafflesDesbloqueado = false;
let temaWafflesEquipado = false;

let coleccionModalActual = "col_1";
let cancionGameBoyDesbloqueada = false;
let paginasRepetidas = 0;

// ===== EASTER EGG FLAGS =====
let helloworldUsado = false;
let thekitchenisopenUsado = false;
let funnyfurrainUsado = false;
let intothemoonUsado = false;
let archivesrevealedUsado = false;
let freewolfycoinsplsUsado = false;
let streamtimeUsado = false;

// ===== TEMAS VISUALES =====
function actualizarMultiplicadorFondo() {
  if (temaRetroEquipado) {
    multiplicadorFondo = 2.5;
  } else if (temaWafflesEquipado) {
    multiplicadorFondo = 3.0;
  } else {
    multiplicadorFondo = catalogoFondos[fondoEquipado]?.multiplicador || 1.0;
  }
}

function aplicarClasesTema() {
  document.body.classList.remove(
    "tema-default",
    "tema-verde",
    "tema-amarillo",
    "tema-azul",
    "tema-retro",
    "tema-waffles"
  );

  if (temaRetroEquipado) {
    temaWafflesEquipado = false;
    document.body.classList.add("tema-retro");
  } else if (temaWafflesEquipado) {
    document.body.classList.add("tema-waffles");
  } else {
    const clases = ["tema-default", "tema-verde", "tema-amarillo", "tema-azul"];
    document.body.classList.add(clases[fondoEquipado] || "tema-default");
  }

  document.body.style.backgroundColor = "";
  actualizarMultiplicadorFondo();
}

function comprarFondo(indexFondo) {
  const fondo = catalogoFondos[indexFondo];
  if (!fondo) return;

  if (fondosComprados[indexFondo]) {
    fondoEquipado = indexFondo;
    aplicarClasesTema();
    alert(`🎨 Fondo "${fondo.nombre}" equipado.`);
  } else if (wolfilletes >= fondo.costo) {
    wolfilletes -= fondo.costo;
    fondosComprados[indexFondo] = true;
    fondoEquipado = indexFondo;
    aplicarClasesTema();
    alert(`🎉 ¡Fondo "${fondo.nombre}" comprado!`);
  } else {
    alert(`No tienes suficientes Wolfilletes. Necesitas 💵 ${fondo.costo}.`);
  }

  guardarJuego();
  render();
}

function alternarTemaRetro() {
  if (!temaRetroDesbloqueado) {
    alert("🔒 Debes completar la colección 'Conociendo Wolfy Go' para desbloquear el Tema Retro.");
    return;
  }

  if (temaRetroEquipado) {
    temaRetroEquipado = false;
    if (temaWafflesDesbloqueado) {
      temaWafflesEquipado = true;
    }
    alert("🎨 Has vuelto al tema visual activo.");
  } else {
    temaRetroEquipado = true;
    temaWafflesEquipado = false;
    alert("🎮 ¡Tema 'Retro Pixel' activado! Multiplicador x2.5 WC aplicado.");
  }

  aplicarClasesTema();
  guardarJuego();
  render();
}

function desbloquearTemaWaffles() {
  temaWafflesDesbloqueado = true;

  if (!temaRetroEquipado) {
    temaWafflesEquipado = true;
    aplicarClasesTema();
  }

  console.log("🥞 ¡COLECCIÓN 2 COMPLETADA! Desbloqueaste el Tema Especial 'Waffles'.");
}

function verificarColeccionRecetas() {
  if (coleccionRecetasMananeras.completada) return;

  const todosCompletados = coleccionRecetasMananeras.libros.every(
    libro => libro.completado || libro.paginasObtenidas >= libro.paginasTotales
  );

  if (todosCompletados) {
    coleccionRecetasMananeras.completada = true;
    desbloquearTemaWaffles();
    alert("🥞 ¡Has completado la colección Recetas Mañaneras! Tema Waffles desbloqueado.");
  }
}

function verificarColeccionCompleta() {
  const todosCompletados = coleccionConociendoWolfyGo.libros.every(
    libro => libro.completado || libro.paginasObtenidas >= libro.paginasTotales
  );

  if (todosCompletados && !coleccionConociendoWolfyGo.completada) {
    coleccionConociendoWolfyGo.completada = true;
    temaRetroDesbloqueado = true;
    temaRetroEquipado = true;
    temaWafflesEquipado = false;
    aplicarClasesTema();

    alert(`🎉 ¡COLECCIÓN COMPLETA: ${coleccionConociendoWolfyGo.nombre}!\n\nHas desbloqueado el Tema Especial 'Retro' (x2.5 WC) con estilo PixelArt 👾.`);
  }
}

// ===== MODAL LIBROS / COLECCIONES =====
function obtenerColeccionModal(idColeccion) {
  if (idColeccion === "col_1") return coleccionConociendoWolfyGo;
  if (idColeccion === "col_2") return coleccionRecetasMananeras;
  return null;
}

function cambiarModalTab(tab) {
  const vistaLibros = $("vista-libros-modal");
  const vistaTienda = $("vista-tienda-modal");

  const btnCol1 = $("tab-btn-col1");
  const btnCol2 = $("tab-btn-col2");
  const btnTienda = $("tab-btn-tienda");

  if (!vistaLibros || !vistaTienda) return;

  [btnCol1, btnCol2, btnTienda].forEach(btn => {
    if (btn) btn.classList.remove("active");
  });

  if (tab === "tienda") {
    vistaLibros.style.display = "none";
    vistaTienda.style.display = "flex";
    if (btnTienda) btnTienda.classList.add("active");

    const visorWB = $("visor-wb-modal");
    if (visorWB) visorWB.innerText = formatNum(wolfbytes);
  } else {
    vistaLibros.style.display = "flex";
    vistaTienda.style.display = "none";

    if (tab === "col_1" && btnCol1) btnCol1.classList.add("active");
    if (tab === "col_2" && btnCol2) btnCol2.classList.add("active");

    coleccionModalActual = tab;
    renderizarListaLibrosModal();
  }
}

function renderizarListaLibrosModal() {
  const listaUI = $("lista-libros-ui");
  if (!listaUI) return;

  const coleccion = obtenerColeccionModal(coleccionModalActual);
  if (!coleccion) return;

  const htmlLibros = coleccion.libros.map((libro, idx) => {
    const completado = libro.completado || libro.paginasObtenidas >= libro.paginasTotales;
    const estadoIcono = completado ? "📖" : "🔒";
    const claseEstado = completado ? "completado" : "";
    const rarezaClase = normalizarRareza(libro.rareza);

    return `
      <div class="item-libro-btn ${claseEstado}" onclick="verDetalleLibro('${coleccionModalActual}', ${idx})">
        <span>${estadoIcono} ${libro.nombre}</span>
        <span class="badge-rareza rareza-${rarezaClase}">${libro.rareza}</span>
        <small>${libro.paginasObtenidas}/${libro.paginasTotales}</small>
      </div>
    `;
  }).join("");

  listaUI.innerHTML = htmlLibros;
}

function verDetalleLibro(coleccionId, idx) {
  const coleccion = obtenerColeccionModal(coleccionId);
  const detalleContainer = $("detalle-libro-ui");

  if (!coleccion || !detalleContainer) return;

  const libro = coleccion.libros[idx];
  if (!libro) return;

  const completado = libro.completado || libro.paginasObtenidas >= libro.paginasTotales;
  const rarezaClase = normalizarRareza(libro.rareza);

  if (!completado) {
    detalleContainer.innerHTML = `
      <div class="bloqueado-info">
        <h3>🔒 ${libro.nombre} <span class="badge-rareza rareza-${rarezaClase}">${libro.rareza}</span></h3>
        <p>Recolecta las <strong>${libro.paginasTotales} páginas</strong> de este libro para desbloquear su lore.</p>
        <p>Progreso actual: <strong>${libro.paginasObtenidas} / ${libro.paginasTotales}</strong> páginas.</p>
        <p><small>Recompensa al completar: +${formatNum(libro.rewardWolfbytes)} Wolfbytes 💾</small></p>
      </div>
    `;
  } else {
    const loreTexto = libro.lore || "Lore pendiente de escritura. Wolfy todavía está investigando esta entrada... 🐺";
    const textoFormateado = String(loreTexto).replace(/\n/g, "<br>");

    detalleContainer.innerHTML = `
      <div class="libro-contenido">
        <h3>📖 ${libro.nombre} <span class="badge-rareza rareza-${rarezaClase}">${libro.rareza}</span></h3>
        <hr>
        <p class="lore-texto">${textoFormateado}</p>
        <hr>
        <div class="reward-info">
          💾 Recompensa entregada: <strong>+${formatNum(libro.rewardWolfbytes)} Wolfbytes</strong>
        </div>
      </div>
    `;
  }
}

function abrirModalLibros() {
  const modal = $("modal-libros");
  if (!modal) return;

  modal.style.display = "flex";
  cambiarModalTab(coleccionModalActual || "col_1");
}

function cerrarModalLibros() {
  const modal = $("modal-libros");
  if (modal) modal.style.display = "none";
}

function agregarPaginaLibro(idLibro) {
  const colecciones = [coleccionConociendoWolfyGo, coleccionRecetasMananeras];

  for (const coleccion of colecciones) {
    const libro = coleccion.libros.find(l => l.id === idLibro);
    if (!libro) continue;

    if (!libro.completado && libro.paginasObtenidas < libro.paginasTotales) {
      libro.paginasObtenidas++;

      if (libro.paginasObtenidas >= libro.paginasTotales) {
        libro.paginasObtenidas = libro.paginasTotales;
        libro.completado = true;
        wolfbytes += libro.rewardWolfbytes;
        alert(`📖 ¡Libro completado: ${libro.nombre}!\nRecompensa: +${formatNum(libro.rewardWolfbytes)} Wolfbytes 💾`);
        verificarColeccionCompleta();
        verificarColeccionRecetas();
      }
    }

    break;
  }

  guardarJuego();
  render();
}

// ===== GACHAPON / MERCADO =====
function abrirPaqueteBasico() {
  const costo = 500;

  if (wolfbytes < costo) {
    alert(`❌ Necesitas ${formatNum(costo)} Wolfbytes para abrir un paquete. Tienes: ${formatNum(wolfbytes)} 💾`);
    return;
  }

  wolfbytes -= costo;

  const resumen = [];
  const todosLibros = [
    ...coleccionConociendoWolfyGo.libros.map(libro => ({ libro, coleccion: coleccionConociendoWolfyGo })),
    ...coleccionRecetasMananeras.libros.map(libro => ({ libro, coleccion: coleccionRecetasMananeras }))
  ];

  for (let i = 0; i < 5; i++) {
    const esGarantizadaNueva = i === 0;
    const librosConPaginasFaltantes = todosLibros.filter(x => x.libro.paginasObtenidas < x.libro.paginasTotales);

    let elegido = null;

    if (esGarantizadaNueva && librosConPaginasFaltantes.length > 0) {
      elegido = librosConPaginasFaltantes[Math.floor(Math.random() * librosConPaginasFaltantes.length)];
    } else {
      const rand = Math.random() * 100;
      const rarezaObjetivo = rand < 10 ? "epico" : (rand < 40 ? "raro" : "comun");

      let candidatos = (librosConPaginasFaltantes.length > 0 ? librosConPaginasFaltantes : todosLibros)
        .filter(x => normalizarRareza(x.libro.rareza) === rarezaObjetivo);

      if (candidatos.length === 0) candidatos = todosLibros;

      elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
    }

    const libro = elegido.libro;

    if (libro.paginasObtenidas < libro.paginasTotales) {
      libro.paginasObtenidas++;
      const etiquetaNueva = esGarantizadaNueva ? "🌟 ¡NUEVA GARANTIZADA!" : "✨ NUEVA";
      resumen.push(`${etiquetaNueva} -> ${libro.nombre} (${libro.rareza})`);

      if (libro.paginasObtenidas >= libro.paginasTotales) {
        libro.paginasObtenidas = libro.paginasTotales;
        libro.completado = true;
        wolfbytes += libro.rewardWolfbytes;
        resumen.push(`   🎉 ¡LIBRO COMPLETADO! +${formatNum(libro.rewardWolfbytes)} WB`);
      }
    } else {
      paginasRepetidas++;
      resumen.push(`🔄 ${libro.nombre} (REPETIDA)`);
    }
  }

  let bonoTxt = "";
  if (paginasRepetidas >= 100) {
    paginasRepetidas -= 100;
    wolfbytes += 2000;
    bonoTxt = `\n\n♻️ ¡ACUMULASTE 100 REPETIDAS! Recibes +2,000 Wolfbytes 💾`;
  }

  console.log(`[GACHA] Paquete Abierto:\n${resumen.join("\n")}${bonoTxt}`);

  verificarColeccionCompleta();
  verificarColeccionRecetas();
  guardarJuego();
  render();
}

function convertirWCAWolfbytes(cantidadWB) {
  const costoPorWB = 10000;
  const costoTotal = cantidadWB * costoPorWB;

  if (wolfichas >= costoTotal) {
    wolfichas -= costoTotal;
    wolfbytes += cantidadWB;
    console.log(`✅ Conversión exitosa: -${formatNum(costoTotal)} WC ➔ +${cantidadWB} Wolfbyte(s) 💾.`);
  } else {
    alert(`❌ Te faltan ${formatNum(costoTotal - wolfichas)} WC para esta conversión.`);
  }

  guardarJuego();
  render();
}

// ===== GAMER WOLFY =====
const costoGamerWolfy = 100000;

const triviasGamerWolfy = [
  {
    pregunta: "I Forgot The Question...",
    correcta: "Woof Woof",
    incorrectas: ["Pick This One", "Pick Me, Pick Me!!", "Don't Pick This One"]
  },
  {
    pregunta: "Pick The Riight Answer",
    correcta: "The Riight Answer",
    incorrectas: ["The Right Answer", "Idk What You Mean, Bro"],
    esTrampaLetra: true
  },
  {
    pregunta: "How many stars are on the sky?",
    correcta: "I Don't Know",
    incorrectas: ["Infinite", "Trillions", "Octillions"]
  },
  {
    pregunta: "La Respuesta Is",
    correcta: "The Answer",
    incorrectas: ["This One", "The First One", "My_Brain.exe Has Stopped Working"]
  }
];

function activarGamerWolfy() {
  if (wolfichas < costoGamerWolfy) {
    alert(`❌ Necesitas ${formatNum(costoGamerWolfy)} WC para activar el desafío de Gamer Wolfy.`);
    return;
  }

  wolfichas -= costoGamerWolfy;

  const minijuegoElegido = Math.random() < 0.5 ? "QUIZ" : "DRAW_OF_FLAW";

  if (minijuegoElegido === "QUIZ") {
    lanzarQuizGamerWolfy();
  } else {
    lanzarDrawOfFlaw();
  }

  guardarJuego();
  render();
}

function lanzarQuizGamerWolfy() {
  const trivia = triviasGamerWolfy[Math.floor(Math.random() * triviasGamerWolfy.length)];
  let opciones = [];

  if (trivia.esTrampaLetra) {
    opciones = [trivia.correcta, ...trivia.incorrectas];
    opciones.sort(() => Math.random() - 0.5);

    const letras = ["A", "B", "C"];
    const idxCorrecto = opciones.indexOf(trivia.correcta);
    const letrasFalsas = letras.filter((_, idx) => idx !== idxCorrecto);
    const letraTrampa = letrasFalsas[Math.floor(Math.random() * letrasFalsas.length)];

    opciones.push(`It's Not Letter ${letraTrampa}`);
  } else {
    opciones = [trivia.correcta, ...trivia.incorrectas];
    opciones.sort(() => Math.random() - 0.5);
  }

  lanzarModalTrivia(trivia.pregunta, opciones, trivia.correcta);
}

function lanzarModalTrivia(pregunta, opciones, respuestaCorrecta) {
  const letras = ["A", "B", "C", "D"];

  const botonesHTML = opciones.map((opcion, idx) => {
    const letra = letras[idx] || "?";
    const opcionLimpia = String(opcion).replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const correctaLimpia = String(respuestaCorrecta).replace(/'/g, "\\'").replace(/"/g, "&quot;");

    return `
      <button class="btn-opcion-trivia" onclick="evaluarRespuestaTrivia('${opcionLimpia}', '${correctaLimpia}')">
        <strong>${letra}.</strong> ${opcion}
      </button>
    `;
  }).join("");

  const modalHTML = `
    <div id="modal-gamer-wolfy" class="modal-overlay">
      <div class="modal-contenido panel-trivia">
        <h2>🎮 Gamer Wolfy Challenge</h2>
        <p class="pregunta-trivia">"${pregunta}"</p>
        <div class="grid-respuestas">
          ${botonesHTML}
        </div>
      </div>
    </div>
  `;

  const modalPrevio = $("modal-gamer-wolfy");
  if (modalPrevio) modalPrevio.remove();

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function evaluarRespuestaTrivia(opcionSeleccionada, respuestaCorrecta) {
  const modal = $("modal-gamer-wolfy");
  if (modal) modal.remove();

  const seleccion = String(opcionSeleccionada).replace(/\\'/g, "'");
  const objetivo = String(respuestaCorrecta).replace(/\\'/g, "'");

  if (seleccion === objetivo) {
    darPremioAlAzarGamerWolfy();
  } else {
    alert("❌ ¡Respuesta incorrecta! Gamer Wolfy rompió el mando. ¡Inténtalo de nuevo!");
    guardarJuego();
    render();
  }
}

let tiempoInicioRojo = 0;
let timerEspera = null;
let timerLimite = null;

function lanzarDrawOfFlaw() {
  clearTimeout(timerEspera);
  clearTimeout(timerLimite);

  const modalHTML = `
    <div id="modal-reflejos" class="modal-overlay">
      <div class="modal-contenido panel-trivia">
        <h2>⚡ Gamer Wolfy: Draw Of Flaw</h2>
        <p>Haz clic en el cuadrado EN CUANTO SE PONGA ROJO.<br><small>¡Tienes menos de 2 segundos!</small></p>

        <div id="cuadrado-reflejos" class="cuadrado-espera" onclick="procesarClicReflejo()">
          PREPÁRATE...
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const tiempoEspera = 1500 + Math.random() * 2500;

  timerEspera = setTimeout(() => {
    const cuadrado = $("cuadrado-reflejos");
    if (cuadrado) {
      cuadrado.className = "cuadrado-rojo";
      cuadrado.innerText = "¡¡¡DRAW!!!";
      tiempoInicioRojo = Date.now();

      timerLimite = setTimeout(() => {
        finalizarMinijuegoReflejos(false, "⏰ ¡Muy lento! Tardaste más de 2 segundos.");
      }, 2000);
    }
  }, tiempoEspera);
}

function procesarClicReflejo() {
  const cuadrado = $("cuadrado-reflejos");
  if (!cuadrado) return;

  if (cuadrado.classList.contains("cuadrado-espera")) {
    clearTimeout(timerEspera);
    finalizarMinijuegoReflejos(false, "❌ ¡Disparaste/clicaste antes de tiempo!");
  } else if (cuadrado.classList.contains("cuadrado-rojo")) {
    clearTimeout(timerLimite);
    const msReaccion = Date.now() - tiempoInicioRojo;
    finalizarMinijuegoReflejos(true, `⚡ ¡Draw impecable! Tiempo de reacción: ${msReaccion} ms.`);
  }
}

function finalizarMinijuegoReflejos(exito, mensaje) {
  const modal = $("modal-reflejos");
  if (modal) modal.remove();

  if (exito) {
    alert(mensaje);
    darPremioAlAzarGamerWolfy();
  } else {
    alert(mensaje + "\n¡Gamer Wolfy te ganó esta ronda!");
    guardarJuego();
    render();
  }
}

function darPremioAlAzarGamerWolfy() {
  const rand = Math.random() * 100;
  const baseWC = 100000;
  let mensaje = "";

  if (rand < 50) {
    const wcBonus = 1000 + Math.floor(Math.random() * 899000);
    const totalWC = baseWC + wcBonus;
    wolfichas += totalWC;

    mensaje = `🎉 ¡CORRECTO!\nRecuperas tus 100,000 WC y ganas +${formatNum(wcBonus)} WC extra.\n(Total ganado: ${formatNum(totalWC)} WC)`;
  } else if (rand < 80) {
    const wolfilletesGanados = 10 + Math.floor(Math.random() * 41);
    wolfichas += baseWC;
    wolfilletes += wolfilletesGanados;

    mensaje = `💵 ¡CORRECTO!\nRecuperas tus 100,000 WC y ganas +${wolfilletesGanados} Wolfilletes.`;
  } else if (rand < 95) {
    const wbGanados = 100 + Math.floor(Math.random() * 9901);
    wolfichas += baseWC;
    wolfbytes += wbGanados;

    mensaje = `💾 ¡CORRECTO!\nRecuperas tus 100,000 WC y ganas +${formatNum(wbGanados)} Wolfbytes.`;
  } else {
    wolfichas += baseWC;
    cancionGameBoyDesbloqueada = true;
    actualizarSelectorCanciones();

    mensaje = `👑 ¡JACKPOT LEGENDARIO!\nRecuperas tus 100,000 WC y has desbloqueado la Canción Especial: 🎵 "GAM3 BO1" para la Gramola / Reproductor.`;
  }

  alert(mensaje);
  guardarJuego();
  render();
}

// ===== TIENDA / COMPRAS =====
function comprar(objeto) {
  if (objeto < 0 || objeto >= 26) return;

  if (esMejoraUnica[objeto] && inventario[objeto] > 0) return;

  if (objeto === 13 && inventario[13] >= 16) {
    alert("¡Tus patitas ya no pueden amasar más rápido! (Mínimo de 2s alcanzado)");
    return;
  }

  const costo = precioProducto[objeto];
  if (wolfichas < costo) return;

  wolfichas -= costo;
  inventario[objeto]++;

  switch (objeto) {
    case 0:
    case 1:
    case 2:
      wolfichasPorClic *= 2;
      break;

    case 4:
      probCrit = 15;
      break;

    case 5:
      wolfichasProduce[3] *= 1.5;
      break;

    case 7:
      wolfichasProduce[6] *= 2;
      break;

    case 9:
      wolfichasProduce[8] *= 2;
      break;

    case 11:
      wolfichasProduce[6] *= 1.25;
      wolfichasProduce[8] *= 1.25;
      break;

    case 17:
      wolfichasProduce[16] *= 2;
      break;

    case 18:
      wolfichasProduce[16] *= 2;
      break;

    case 19:
      mejoraGalleta.comprado = true;
      iniciarLoopGalletas();
      break;

    case 20:
      if (inventario[20] === 1) {
        iniciarChatStreamer();
      }
      break;

    case 23:
      wolfichasProduce[22] *= 1.5;
      break;

    case 24:
      wolfichasProduce[22] *= 2;
      break;
  }

  if (!esMejoraUnica[objeto]) {
    precioProducto[objeto] = precioBase[objeto] * (1 + 0.15 * inventario[objeto]);
  }

  guardarJuego();
  render();
}

function actualizarTiendaUI() {
  for (let i = 0; i < 26; i++) {
    const btn = $(`btn-${i}`);
    if (!btn) continue;

    const nombre = nombresMejoras[i] || `Mejora ${i}`;
    const costo = Math.ceil(precioProducto[i] || 0);
    const cantidad = inventario[i] || 0;

    if (esMejoraUnica[i]) {
      if (cantidad > 0) {
        btn.textContent = `${nombre} ✔`;
        btn.disabled = true;
      } else {
        btn.textContent = `${nombre} - ${formatNum(costo)} WC`;
        btn.disabled = wolfichas < costo;
      }
    } else {
      btn.textContent = `${nombre} x${cantidad} - ${formatNum(costo)} WC`;
      btn.disabled = wolfichas < costo || (i === 13 && cantidad >= 16);
    }
  }

  for (let i = 0; i < catalogoFondos.length; i++) {
    const btn = $(`btn-fondo-${i}`);
    if (!btn) continue;

    const fondo = catalogoFondos[i];
    const comprado = fondosComprados[i];

    if (comprado && fondoEquipado === i && !temaRetroEquipado && !temaWafflesEquipado) {
      btn.textContent = `✔ ${fondo.nombre} (x${fondo.multiplicador})`;
      btn.disabled = false;
    } else if (comprado) {
      btn.textContent = `${fondo.nombre} (x${fondo.multiplicador}) - Equipar`;
      btn.disabled = false;
    } else {
      btn.textContent = `${fondo.nombre} (x${fondo.multiplicador}) - 💵 ${fondo.costo}`;
      btn.disabled = wolfilletes < fondo.costo;
    }
  }

  const btnRetro = $("btn-toggle-retro");
  if (btnRetro) {
    if (!temaRetroDesbloqueado) {
      btnRetro.textContent = "👾 Tema Retro Bloqueado";
      btnRetro.disabled = true;
    } else if (temaRetroEquipado) {
      btnRetro.textContent = "👾 Retro Equipado (x2.5 WC)";
      btnRetro.disabled = false;
    } else {
      btnRetro.textContent = "👾 Activar Tema Retro (x2.5 WC)";
      btnRetro.disabled = false;
    }
  }

  const btnGamer = document.querySelector(".btn-gamer-wolfy");
  if (btnGamer) {
    btnGamer.disabled = wolfichas < costoGamerWolfy;
  }
}

// ===== ECONOMÍA / CLIC / PRODUCCIÓN =====
function girarRuleta() {
  const dado = Math.random() * 100;
  if (dado < probSuperCrit) return 10;
  if (dado < probCrit) return 2;
  return 1;
}

function clic() {
  let base = wolfichasPorClic;

  if ((inventario[10] || 0) > 0) {
    base += (inventario[3] || 0) * 0.1;
  }

  let ganancia = base * multiplicadorFondo * multiplicadorGalleta * multiplicadorHueso;
  const multiplo = girarRuleta();

  if (multiplo > 1) {
    ganancia *= multiplo;
  }

  wolfichas += ganancia;

  const etiqueta = multiplo > 1 ? `¡CRÍTICO x${multiplo}! +${ganancia.toFixed(1)}` : null;
  mostrarCantidadFlotante(ganancia, true, etiqueta);
}

function aplicarBuffGalleta(segundos, multiplicador) {
  if (timerBuffGalleta) {
    clearInterval(timerBuffGalleta);
    timerBuffGalleta = null;
  }

  duracionBuffGalleta = Math.max(0, Math.floor(segundos));
  multiplicadorGalleta = Math.max(1, num(multiplicador, 1));

  if (duracionBuffGalleta <= 0) {
    multiplicadorGalleta = 1;
    return;
  }

  timerBuffGalleta = setInterval(() => {
    duracionBuffGalleta--;

    if (duracionBuffGalleta <= 0) {
      multiplicadorGalleta = 1;
      duracionBuffGalleta = 0;
      clearInterval(timerBuffGalleta);
      timerBuffGalleta = null;
    }
  }, 1000);
}

function producir() {
  if (isNaN(wolfichas)) {
    console.error("⚠️ Se detectó corrupción en tiempo real (NaN). Activando protocolo de rescate...");
    ejecutarAutoreparacion();
    return;
  }

  multiplicadorHueso = tiempoBuffHueso > 0 ? 7 : 1;

  const totalClickers = (inventario[3] || 0) * (wolfichasProduce[3] || 0);
  const totalFarmers = (inventario[6] || 0) * (wolfichasProduce[6] || 0);
  const totalMiners = (inventario[8] || 0) * (wolfichasProduce[8] || 0);
  const totalWorkers = (inventario[16] || 0) * (wolfichasProduce[16] || 0);
  const totalStreamers = (inventario[20] || 0) * (wolfichasProduce[20] || 0);
  const totalTaxists = (inventario[22] || 0) * (wolfichasProduce[22] || 0);
  const totalIdols = (inventario[25] || 0) * (wolfichasProduce[25] || 0);

  const cantBakers = inventario[12] || 0;
  let produccionBakers = 0;

  if (cantBakers > 0) {
    const comprasPatas = inventario[13] || 0;
    const tiempoCiclo = Math.max(2, 10 - (comprasPatas * 0.5));

    const galletasPorCiclo = 5 + (inventario[14] || 0);
    const bonoMineros = ((inventario[15] || 0) > 0)
      ? (1 + ((inventario[8] || 0) * 0.10))
      : 1;

    const valorGalleta = 10 * bonoMineros;
    produccionBakers = (cantBakers * galletasPorCiclo * valorGalleta) / tiempoCiclo;
  }

  const produccionBase =
    totalClickers +
    totalFarmers +
    totalMiners +
    totalWorkers +
    totalStreamers +
    totalTaxists +
    totalIdols +
    produccionBakers;

  let produccionTotal =
    produccionBase *
    multiplicadorGalleta *
    multiplicadorHueso *
    multiplicadorFondo;

  if (productorSecuestrado) {
    produccionTotal *= 0.95;
  }

  produccionTotal = Math.max(0, produccionTotal - penalizacionWCS);

  wolfichasPorSegundo = produccionTotal;
  wolfichas += wolfichasPorSegundo;

  if (tiempoBuffHueso > 0) {
    tiempoBuffHueso--;
  }
}

function comprarWolfilletes() {
  const PRECIO_WOLFILLETE = 100000;

  const cantidadInput = prompt(
    "¿Cuántos Wolfilletes deseas comprar?\nPrecio: 100,000 Wolfichas por 1 Wolfillete",
    "1"
  );

  if (cantidadInput === null) return;

  const cantidad = parseInt(cantidadInput, 10);

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("⚠️ Por favor ingresa un número entero válido mayor a 0.");
    return;
  }

  const costoTotal = cantidad * PRECIO_WOLFILLETE;

  if (wolfichas >= costoTotal) {
    wolfichas -= costoTotal;
    wolfilletes += cantidad;

    alert(`🎉 ¡Intercambio exitoso!\nGastaste ${formatNum(costoTotal)} Wolfichas y obtuviste 💵 ${cantidad} Wolfillete(s).`);
    guardarJuego();
    render();
  } else {
    alert(`❌ No tienes suficientes Wolfichas.\nNecesitas ${formatNum(costoTotal)} WC (te faltan ${formatNum(costoTotal - wolfichas)} WC).`);
  }
}

// ===== QTE GALLETA =====
function iniciarLoopGalletas() {
  if (timerLoopGalleta) clearInterval(timerLoopGalleta);

  timerLoopGalleta = setInterval(() => {
    if (mejoraGalleta.comprado && !galletaActiva && Math.random() < 0.20) {
      aparecerGalletitaCrocante();
    }
  }, 30000);
}

function aparecerGalletitaCrocante() {
  if (timerQTE) clearInterval(timerQTE);

  galletaActiva = true;
  clicksActuales = 0;
  ultimoTiempoClick = Date.now();
  esSpeedrunner = true;
  clicksRequeridos = Math.floor(Math.random() * 5) + 3;
  tiempoLimiteQTE = Math.floor(Math.random() * 9) + 7;

  const cookieElement = $("galleta-crocante");
  const qteInfo = $("qte-info");

  const topPos = Math.floor(Math.random() * 60 + 15);
  const leftPos = Math.floor(Math.random() * 60 + 15);

  if (cookieElement) {
    cookieElement.style.top = topPos + "%";
    cookieElement.style.left = leftPos + "%";
    cookieElement.style.display = "block";
  }

  if (qteInfo) {
    qteInfo.style.top = (topPos - 5) + "%";
    qteInfo.style.left = leftPos + "%";
    qteInfo.style.display = "block";
    qteInfo.innerHTML = `🍪 Faltan: ${clicksRequeridos - clicksActuales}<br>⏱️ ${tiempoLimiteQTE.toFixed(1)}s`;
  }

  timerQTE = setInterval(() => {
    tiempoLimiteQTE -= 0.1;

    if (qteInfo) {
      const faltantes = clicksRequeridos - clicksActuales;
      const tiempoMostrar = Math.max(0, tiempoLimiteQTE).toFixed(1);
      qteInfo.innerHTML = `🍪 Faltan: ${faltantes}<br>⏱️ ${tiempoMostrar}s`;
    }

    if (tiempoLimiteQTE <= 0) {
      ocultarGalleta();
    }
  }, 100);
}

function clickGalletita() {
  if (!galletaActiva) return;

  const ahora = Date.now();
  const tiempoEntreClicks = (ahora - ultimoTiempoClick) / 1000;
  ultimoTiempoClick = ahora;

  if (tiempoEntreClicks > 0.7) {
    esSpeedrunner = false;
  }

  clicksActuales++;

  const qteInfo = $("qte-info");
  if (qteInfo) {
    const faltantes = clicksRequeridos - clicksActuales;
    const tiempoMostrar = Math.max(0, tiempoLimiteQTE).toFixed(1);
    qteInfo.innerHTML = `🍪 Faltan: ${faltantes}<br>⏱️ ${tiempoMostrar}s`;
  }

  if (clicksActuales >= clicksRequeridos) {
    const tiempoGanado = Math.floor(tiempoLimiteQTE);
    const tiempoRestanteExacto = tiempoLimiteQTE;

    ocultarGalleta();

    const nuevoMultiplicador = (inventario[21] > 0) ? 2.0 : 1.5;
    aplicarBuffGalleta(10 + tiempoGanado, nuevoMultiplicador);

    if (tiempoRestanteExacto < 2.0) {
      const logroTramposo = logros.find(l => l.id === "badge-21");
      if (logroTramposo && !logroTramposo.completado) {
        logroTramposo.completado = true;
        alert(`🏆 ¡LOGRO DESBLOQUEADO!: ${logroTramposo.titulo}\n${logroTramposo.descripcion}`);
      }
    }

    if (esSpeedrunner) {
      const logroSpeedrunner = logros.find(l => l.id === "badge-20");
      if (logroSpeedrunner && !logroSpeedrunner.completado) {
        logroSpeedrunner.completado = true;
        alert(`🏆 ¡LOGRO DESBLOQUEADO!: ${logroSpeedrunner.titulo}\n${logroSpeedrunner.descripcion}`);
      }
    }

    if (tiempoRestanteExacto <= 3.0) {
      alert(`¡Esa galleta casi se nos arranca! 🍪💥 Pero lo logramos. ¡Multiplicador x${multiplicadorGalleta} activo por ${10 + tiempoGanado}s!`);
    } else {
      alert(`¡Nuestros lobitos se comieron la galleta a tiempo! 🍪 Multiplicador x${multiplicadorGalleta} activo por ${10 + tiempoGanado}s.`);
    }

    guardarJuego();
    render();
  }
}

function ocultarGalleta() {
  if (timerQTE) clearInterval(timerQTE);
  galletaActiva = false;

  const cookieElement = $("galleta-crocante");
  const qteInfo = $("qte-info");

  if (cookieElement) cookieElement.style.display = "none";
  if (qteInfo) qteInfo.style.display = "none";
}

// ===== HUESO DE ORO =====
function aparecerHuesoOro(esNatural = false) {
  const hueso = $("hueso-oro");
  if (!hueso) return;

  esHuesoNatural = esNatural;

  const top = Math.floor(Math.random() * (window.innerHeight - 100));
  const left = Math.floor(Math.random() * (window.innerWidth - 100));

  hueso.style.top = top + "px";
  hueso.style.left = left + "px";
  hueso.style.display = "block";

  setTimeout(() => {
    hueso.style.display = "none";
  }, 10000);
}

function clickHuesoOro() {
  const hueso = $("hueso-oro");
  if (hueso) hueso.style.display = "none";

  if (esHuesoNatural) {
    const logroMito = logros.find(l => l.id === "badge-18");
    if (logroMito && !logroMito.completado) {
      logroMito.completado = true;
      alert(`🏆 ¡LOGRO DESBLOQUEADO!: ${logroMito.titulo}\n${logroMito.descripcion}`);
    }
  }

  const tipoBono = Math.random() < 0.5;

  if (tipoBono) {
    const minWC = (wolfichas < 100) ? 20 : Math.floor(wolfichas * 0.5);
    const maxWC = (wolfichas < 100) ? 50 : Math.floor(wolfichas * 1.2);
    const premio = Math.floor(Math.random() * (maxWC - minWC + 1)) + minWC;

    wolfichas += premio;
    alert(`¡Huesito de Oro! Has recibido +${formatNum(premio)} Wolfichas.`);
  } else {
    tiempoBuffHueso = 15;
    multiplicadorHueso = 7;
    alert("🦴 ¡Hueso de Oro! Multiplicador x7 activo por 15 segundos.");
  }

  guardarJuego();
  render();
}

// ===== CHAT STREAMER =====
let timerChatStreamer = null;

function iniciarChatStreamer() {
  if (timerChatStreamer) clearInterval(timerChatStreamer);

  timerChatStreamer = setInterval(() => {
    if ((inventario[20] || 0) > 0) {
      const dado = Math.random();
      if (dado < 0.05) {
        generarComentarioEspecial();
      } else if (dado < 0.40) {
        generarComentarioChat();
      }
    }
  }, 20000);
}

function limitarChat(maxMensajes = 50) {
  const contenedorChat = $("comentarios-chat");
  if (!contenedorChat) return;

  while (contenedorChat.children.length > maxMensajes) {
    contenedorChat.removeChild(contenedorChat.firstElementChild);
  }
}

const comentariosPositivos = [
  "¿Cómo se llama el juego? ¡¡Me encanta!!",
  "¡Wolfy Go Studio nunca decepciona! 🔥",
  "¡Esas mecánicas están 10/10!",
  "¡DONACIÓN EN CAMINO! 🪙✨",
  "¡Juegazo supremo!",
  "Digno de un Oscar",
  "Mis ahorros quizás ayuden",
  "Cookie clicker? Mejor Wolfy Clicker Incremental"
];

const comentariosNegativos = [
  "Qué aburrido, grrrrr 😡",
  "Meh, prefiero jugar a perseguir la pelota 🥎",
  "Mucho lag en la transmisión 🔌",
  "¡Hater en el chat detectado!",
  "Porqué tanto hype?",
  "Muy básico",
  "Faltan más cosas, bruh",
  "Donan a alguien que no conocen... qué poco instinto"
];

function obtenerComentarioEspecial() {
  const anioRandom = Math.floor(Math.random() * (2023 - 2006 + 1)) + 2006;
  const anioActual = new Date().getFullYear();
  const wolfichasTexto = formatNum(wolfichas);

  const comentariosEspeciales = [
    `¡No he visto algo tan bueno desde ${anioRandom}!`,
    `#ElMejorJuegoDe${anioActual}`,
    "¿Alguien lo conoce? Porque amo sus accesorios y el orden de todo ✨",
    `¡Cuántas Wolfichas! Ojalá tuviera esas ${wolfichasTexto} Wolfichas 🪙`,
    "🎵 ¡Quién lo diría... que se podía hacer juegos así con mucha armonía~ 🎵",
    "L0L, 3RES EL M3J0R DE ESTA G3N, BR0 🔥"
  ];

  return comentariosEspeciales[Math.floor(Math.random() * comentariosEspeciales.length)];
}

function generarComentarioChat() {
  const esNegativo = Math.random() < 0.30;
  const texto = esNegativo
    ? comentariosNegativos[Math.floor(Math.random() * comentariosNegativos.length)]
    : comentariosPositivos[Math.floor(Math.random() * comentariosPositivos.length)];

  const contenedorChat = $("comentarios-chat");
  if (!contenedorChat) return;

  const chatBox = document.createElement("div");
  chatBox.className = esNegativo ? "chat-stream hater" : "chat-stream vip";

  const tiempoInicio = Date.now();
  let ignoradoEvaluado = false;

  if (!esNegativo) {
    chatBox.innerHTML = `
      <div>💬 <strong>Chat:</strong> "${texto}" <span class="ico-like"></span></div>
      <div class="chat-acciones">
        <button class="btn-chat btn-like">❤️ Like</button>
        <button class="btn-chat btn-dislike">💔 Dislike</button>
      </div>
    `;

    const btnLike = chatBox.querySelector(".btn-like");
    const btnDislike = chatBox.querySelector(".btn-dislike");

    btnLike.onclick = function () {
      const premio = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
      wolfichas += premio;
      chatBox.querySelector(".ico-like").innerText = "❤️";
      chatBox.classList.add("desactivado");
      guardarJuego();
      render();
    };

    btnDislike.onclick = function () {
      const castigo = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
      wolfichas = Math.max(0, wolfichas - castigo);
      chatBox.querySelector(".ico-like").innerText = "💔";
      chatBox.classList.add("desactivado");
      guardarJuego();
      render();
    };
  } else {
    chatBox.innerHTML = `
      <div>🤬 <strong>Hater:</strong> "${texto}"</div>
      <div class="chat-acciones">
        <button class="btn-chat btn-borrar">🗑️ Borrar</button>
        <button class="btn-chat btn-dislike">💔 Dislike</button>
        <button class="btn-chat btn-like">❤️ Like</button>
      </div>
    `;

    const btnBorrar = chatBox.querySelector(".btn-borrar");
    const btnDislike = chatBox.querySelector(".btn-dislike");
    const btnLike = chatBox.querySelector(".btn-like");

    btnBorrar.onclick = function () {
      const duracion = (Date.now() - tiempoInicio) / 1000;

      if (duracion <= 2.0) {
        chatBox.classList.add("efecto-exito");
        setTimeout(() => {
          if (contenedorChat.contains(chatBox)) contenedorChat.removeChild(chatBox);
        }, 400);
      } else {
        if (contenedorChat.contains(chatBox)) contenedorChat.removeChild(chatBox);
      }

      if (productorSecuestrado) {
        productorSecuestrado = false;
        alert("👮 ¡Has moderado al hater! Tu productor ha sido rescatado de las garras del secuestro.");
      }

      guardarJuego();
      render();
    };

    btnDislike.onclick = function () {
      chatBox.classList.add("desactivado");
      const acciones = chatBox.querySelector(".chat-acciones");
      if (acciones) acciones.innerHTML = "<small>💔 Neutralizado</small>";
    };

    btnLike.onclick = function () {
      if (!productorSecuestrado) {
        productorSecuestrado = true;
        const robo = Math.floor(wolfichas * 0.10);
        wolfichas -= robo;
        alert(`🚨 ¡ERROR DE MODERACIÓN! Le diste Like a un Hater.\n¡Se han robado a tu Productor y un 10% de tus ahorros (${formatNum(robo)} WC)! Modéralo (🗑️) para rescatar a tu productor.`);
      }
      chatBox.classList.add("desactivado");
      guardarJuego();
      render();
    };

    const timerPenalty = setInterval(() => {
      if (!ignoradoEvaluado && contenedorChat.contains(chatBox) && !chatBox.classList.contains("desactivado")) {
        const transcurrido = (Date.now() - tiempoInicio) / 1000;
        if (transcurrido > 2.0) {
          ignoradoEvaluado = true;
          penalizacionWCS += 5;
          chatBox.style.border = "2px solid #ff0000";
        }
      } else if (!contenedorChat.contains(chatBox) || chatBox.classList.contains("desactivado")) {
        clearInterval(timerPenalty);
      }
    }, 500);
  }

  contenedorChat.appendChild(chatBox);
  limitarChat(50);
}

function generarComentarioEspecial() {
  const texto = obtenerComentarioEspecial();
  const contenedorChat = $("comentarios-chat");
  if (!contenedorChat) return;

  const chatBox = document.createElement("div");
  chatBox.className = "chat-stream arcoiris";
  chatBox.innerHTML = `🌟 <strong>SUPER FANÁTICO:</strong> "${texto}"`;

  chatBox.style.background = "linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bfd, #7a00ff, #ff00c8)";
  chatBox.style.backgroundSize = "400% 400%";
  chatBox.style.color = "#ffffff";
  chatBox.style.textShadow = "1px 1px 3px #000";

  const tiempoAparicion = Date.now();

  chatBox.onclick = function () {
    const tiempoReaccion = (Date.now() - tiempoAparicion) / 1000;

    if (contenedorChat.contains(chatBox)) {
      contenedorChat.removeChild(chatBox);
    }

    const premioBase = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    wolfichas += premioBase;

    if (tiempoReaccion <= 5.0) {
      wolfilletes += 10;
      alert(`⚡ ¡REFLEJOS DE ACERO! Reaccionaste en ${tiempoReaccion.toFixed(1)}s.\nPremio: +${formatNum(premioBase)} WC y 💵 +10 Wolfilletes.`);
    } else {
      alert(`🎉 ¡Súper Donación reclamada! +${formatNum(premioBase)} Wolfichas.`);
    }

    guardarJuego();
    render();
  };

  contenedorChat.appendChild(chatBox);
  limitarChat(50);
}

// ===== RITMO =====
function actualizarSelectorCanciones() {
  const select = $("cancion-select");
  if (!select) return;

  if (cancionGameBoyDesbloqueada && !select.querySelector('option[value="gam3bo1"]')) {
    const option = document.createElement("option");
    option.value = "gam3bo1";
    option.textContent = '"GAM3 BO1" - Desbloqueada';
    select.appendChild(option);
  }
}

function seleccionarCancion(clave) {
  if (!mapaCanciones[clave]) return;

  cancionSeleccionada = clave;
  const audio = $("audio-player");
  if (audio) {
    audio.src = mapaCanciones[clave].archivo;
  }

  if (juegoIniciado) {
    reiniciarCancionRitmo();
  }
}

function iniciarCancionRitmo() {
  if ((inventario[25] || 0) <= 0) {
    alert("🎤 ¡Necesitas contratar al menos 1 Idol Wolfy en la tienda para jugar!");
    return;
  }

  const audio = $("audio-player");
  document.querySelectorAll(".nota-ritmo").forEach(n => n.remove());

  audioDisponible = false;

  if (audio) {
    audio.pause();
    audio.src = mapaCanciones[cancionSeleccionada].archivo;
    audio.currentTime = 0;

    audio.oncanplaythrough = function () {
      audioDisponible = true;
    };

    audio.onerror = function () {
      audioDisponible = false;
      console.warn("⚠️ No se pudo cargar el audio MP3. El juego correrá en modo silencioso.");
    };

    audio.onended = function () {
      finalizarCancionRitmo();
    };

    audio.load();
  }

  notasActivas = mapaCanciones[cancionSeleccionada].mapaNotas.map(nota => ({
    tiempo: nota.tiempo,
    carril: nota.carril,
    impactado: false,
    elementoHTML: null
  }));

  const ultimaNota = notasActivas.reduce((max, n) => Math.max(max, n.tiempo), 0);
  tiempoFinRitmo = ultimaNota + 2.0;

  puntajeRitmo = 0;
  tiempoJuegoRitmo = -3.0;
  juegoPausado = false;
  juegoIniciado = true;
  ultimoTimestamp = performance.now();

  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  actualizarBucleRitmo();
}

function actualizarBucleRitmo() {
  if (juegoPausado || !juegoIniciado) return;

  const ahora = performance.now();
  const delta = (ahora - ultimoTimestamp) / 1000;
  ultimoTimestamp = ahora;

  const audio = $("audio-player");

  if (tiempoJuegoRitmo < 0) {
    tiempoJuegoRitmo += delta;
    actualizarFeedbackRitmo(`⏳ Preparado... ${Math.abs(tiempoJuegoRitmo).toFixed(1)}s`);

    if (tiempoJuegoRitmo >= 0) {
      tiempoJuegoRitmo = 0;
      if (audio && audioDisponible) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          console.warn("Autoplay bloqueado por el navegador.");
          audioDisponible = false;
        });
      }
    }
  } else {
    if (audio && audioDisponible && !audio.paused && !audio.ended) {
      tiempoJuegoRitmo = audio.currentTime;
    } else {
      tiempoJuegoRitmo += delta;
    }

    actualizarFeedbackRitmo("🎶 ¡A JUGAR!");
  }

  if (tiempoJuegoRitmo >= tiempoFinRitmo) {
    finalizarCancionRitmo();
    return;
  }

  notasActivas.forEach(nota => {
    const diferencia = nota.tiempo - tiempoJuegoRitmo;

    if (diferencia <= 1.5 && diferencia >= -0.3 && !nota.impactado) {
      if (!nota.elementoHTML) {
        const carrilElem = $(`carril-${nota.carril}`);
        if (carrilElem) {
          const el = document.createElement("div");
          el.className = "nota-ritmo";
          carrilElem.appendChild(el);
          nota.elementoHTML = el;
        }
      }

      const porcentajePos = (1 - (diferencia / 1.5)) * 160;
      if (nota.elementoHTML) {
        nota.elementoHTML.style.top = porcentajePos + "px";
      }
    } else if (diferencia < -0.3 && nota.elementoHTML) {
      nota.elementoHTML.remove();
      nota.elementoHTML = null;
    }
  });

  loopRitmoFrame = requestAnimationFrame(actualizarBucleRitmo);
}

function pausarCancionRitmo() {
  if (juegoPausado || !juegoIniciado) return;

  juegoPausado = true;
  const audio = $("audio-player");
  if (audio && !audio.paused) audio.pause();

  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  actualizarFeedbackRitmo("Juego en Pausa ⏸️");
}

function continuarCancionRitmo() {
  if (!juegoPausado || !juegoIniciado) return;

  juegoPausado = false;
  ultimoTimestamp = performance.now();

  const audio = $("audio-player");
  if (tiempoJuegoRitmo >= 0 && audio && audioDisponible && audio.paused) {
    audio.play().catch(() => console.warn("Error al reanudar audio"));
  }

  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  actualizarBucleRitmo();
}

function reiniciarCancionRitmo() {
  juegoPausado = true;
  juegoIniciado = false;

  const audio = $("audio-player");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);

  tiempoJuegoRitmo = -3.0;
  document.querySelectorAll(".nota-ritmo").forEach(n => n.remove());

  notasActivas = mapaCanciones[cancionSeleccionada].mapaNotas.map(nota => ({
    tiempo: nota.tiempo,
    carril: nota.carril,
    impactado: false,
    elementoHTML: null
  }));

  const ultimaNota = notasActivas.reduce((max, n) => Math.max(max, n.tiempo), 0);
  tiempoFinRitmo = ultimaNota + 2.0;

  puntajeRitmo = 0;
  actualizarFeedbackRitmo("Canción reiniciada 🔄. Haz clic en Iniciar.");
}

function finalizarCancionRitmo() {
  if (!juegoIniciado) return;

  juegoPausado = true;
  juegoIniciado = false;

  if (loopRitmoFrame) {
    cancelAnimationFrame(loopRitmoFrame);
    loopRitmoFrame = null;
  }

  const audio = $("audio-player");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  const idols = inventario[25] || 1;
  const premio = Math.floor(puntajeRitmo * 10 * idols);
  wolfichas += premio;

  alert(`🎤 Canción terminada.\nPuntaje: ${puntajeRitmo}\nRecompensa: +${formatNum(premio)} WC`);

  guardarJuego();
  render();
}

function presionarCarril(carril) {
  if (!juegoIniciado || juegoPausado || vistaActual !== 1) return;

  const audio = $("audio-player");
  let tiempoActual = tiempoJuegoRitmo;

  if (audioDisponible && audio && !audio.paused && !audio.ended) {
    tiempoActual = audio.currentTime;
  }

  let notaCandidata = null;
  let mejorDiferencia = Infinity;

  notasActivas.forEach(nota => {
    if (nota.impactado || nota.carril !== carril) return;

    const diferencia = Math.abs(nota.tiempo - tiempoActual);

    if (diferencia <= 0.35 && diferencia < mejorDiferencia) {
      mejorDiferencia = diferencia;
      notaCandidata = nota;
    }
  });

  if (!notaCandidata) {
    actualizarFeedbackRitmo("¡MISS!");
    return;
  }

  notaCandidata.impactado = true;

  let calidad = "GOOD";
  let multiplicadorPuntaje = 1;

  if (mejorDiferencia <= 0.10) {
    calidad = "PERFECT";
    multiplicadorPuntaje = 2;
  } else if (mejorDiferencia <= 0.20) {
    calidad = "GREAT";
    multiplicadorPuntaje = 1.5;
  }

  const bonoWC = Math.floor(1000 * (inventario[25] || 1) * multiplicadorPuntaje);
  const puntos = Math.floor(100 * multiplicadorPuntaje);

  wolfichas += bonoWC;
  puntajeRitmo += puntos;

  if (notaCandidata.elementoHTML) {
    notaCandidata.elementoHTML.remove();
    notaCandidata.elementoHTML = null;
  }

  actualizarFeedbackRitmo(`${calidad}! +${formatNum(bonoWC)} WC 🎵`);
}

function actualizarFeedbackRitmo(msg) {
  const fb = $("feedback-ritmo");
  if (fb) fb.innerText = `${msg} | Puntaje: ${puntajeRitmo}`;
}

function inicializarEntradasRitmo() {
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    const modalLibros = $("modal-libros");
    if (modalLibros && modalLibros.style.display !== "none") return;
    if ($("modal-gamer-wolfy")) return;
    if ($("modal-reflejos")) return;

    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA")) return;

    if (vistaActual !== 1 || !juegoIniciado || juegoPausado) return;

    const carril = teclasCarriles[e.key];
    if (carril !== undefined) {
      e.preventDefault();
      presionarCarril(carril);
    }
  });

  $$(".carril").forEach(carrilElem => {
    carrilElem.addEventListener("click", () => {
      const idx = Number(String(carrilElem.id).replace("carril-", ""));
      if (!isNaN(idx)) presionarCarril(idx);
    });
  });
}

// ===== NAVEGACIÓN DERECHA =====
function cambiarVistaDerecha(direccion) {
  vistaActual += direccion;
  if (vistaActual < 0) vistaActual = 1;
  if (vistaActual > 1) vistaActual = 0;

  if (vistaActual !== 1 && juegoIniciado && !juegoPausado) {
    pausarCancionRitmo();
  }

  const chatView = $("vista-chat-streamer");
  const idolView = $("vista-idol-ritmo");
  const titulo = $("titulo-vista-derecha");

  if (chatView && idolView && titulo) {
    if (vistaActual === 0) {
      chatView.style.display = "block";
      idolView.style.display = "none";
      titulo.innerText = "Chat Streamer Wolfy";
    } else {
      chatView.style.display = "none";
      idolView.style.display = "block";
      titulo.innerText = "Idol Wolfy: Ritmo";
    }
  }
}

// ===== UI / RENDER =====
function mostrarCantidadFlotante(monto, esGanancia, etiqueta = null) {
  const header = document.querySelector(".header-top");
  if (!header) return;

  const flotante = document.createElement("div");
  flotante.className = `dinero-flotante ${esGanancia ? "ganancia" : "perdida"}`;
  flotante.innerText = etiqueta || ((esGanancia ? "+" : "") + monto.toFixed(1));

  header.appendChild(flotante);

  setTimeout(() => {
    flotante.style.transform = "translateY(-15px)";
    flotante.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    if (header.contains(flotante)) header.removeChild(flotante);
  }, 650);
}

function actualizarContadorPrincipal() {
  const contadorEl = $("contador");
  const subContadorEl = $("sub-contador");
  const lblWolfilletes = $("lbl-wolfilletes");
  const visorWBModal = $("visor-wb-modal");

  const wcSeguro = isNaN(wolfichas) ? 0 : wolfichas;
  const wcVisible = Math.round(wcSeguro * 10) / 10;

  if (contadorEl) {
    contadorEl.innerText = `${wcVisible.toFixed(1)} Wolfichas`;
  }

  if (subContadorEl) {
    subContadorEl.innerText = `${wolfichasPorSegundo.toFixed(1)} WC/s | Fondo x${multiplicadorFondo} | 💵 ${wolfilletes} | 💾 ${formatNum(wolfbytes)}`;
  }

  if (lblWolfilletes) {
    lblWolfilletes.innerText = wolfilletes;
  }

  if (visorWBModal) {
    visorWBModal.innerText = formatNum(wolfbytes);
  }
}

function actualizarBadges() {
  const badgeUI = $("contenedor-badges");
  if (!badgeUI) return;

  let htmlAcumulado = "";

  for (let i = 0; i < logros.length; i++) {
    const logro = logros[i];

    if (!logro.completado && logro.condicion()) {
      logro.completado = true;
      alert(`🏆 ¡LOGRO DESBLOQUEADO!: ${logro.titulo}\n${logro.descripcion}`);
    }

    if (logro.completado) {
      htmlAcumulado += `<div class="logro completado"><strong>${logro.titulo}</strong><br><small>${logro.descripcion}</small></div>`;
    } else {
      htmlAcumulado += `<div class="logro bloqueado"><strong>Logro Bloqueado</strong><br><small>???</small></div>`;
    }
  }

  badgeUI.innerHTML = htmlAcumulado;
}

function render() {
  try {
    actualizarContadorPrincipal();
  } catch (e) {
    console.error("Error al actualizar contador principal:", e);
  }

  try {
    actualizarTiendaUI();
  } catch (e) {
    console.error("Error al actualizar tienda:", e);
  }
}

// ===== GUARDADO / CARGA =====
function serializarColeccion(coleccion) {
  if (!coleccion) return null;

  return {
    completada: !!coleccion.completada,
    libros: coleccion.libros.map(libro => ({
      id: libro.id,
      paginasObtenidas: libro.paginasObtenidas || 0,
      completado: !!(libro.completado || libro.paginasObtenidas >= libro.paginasTotales)
    }))
  };
}

function aplicarColeccionGuardada(data, coleccionBase) {
  if (!data || !coleccionBase) return;

  coleccionBase.completada = !!data.completada;

  if (!Array.isArray(data.libros)) return;

  data.libros.forEach(libroGuardado => {
    const libroOriginal = coleccionBase.libros.find(l => l.id === libroGuardado.id);
    if (!libroOriginal) return;

    libroOriginal.paginasObtenidas = num(libroGuardado.paginasObtenidas, 0);

    if (libroOriginal.paginasObtenidas >= libroOriginal.paginasTotales) {
      libroOriginal.paginasObtenidas = libroOriginal.paginasTotales;
      libroOriginal.completado = true;
    } else {
      libroOriginal.completado = false;
    }
  });
}

function guardarJuego() {
  if (isNaN(wolfichas)) {
    console.error("⚠️ Se detectó NaN en vivo. Restaurando valor seguro...");
    wolfichas = 0;
  }

  const datos = {
    version: 2,
    timestamp: Date.now(),

    wolfichas,
    wolfichasAnteriores,
    wolfichasPorClic,

    inventario,
    precioProducto,
    wolfichasProduce,

    probCrit,
    probSuperCrit,

    wolfilletes,
    wolfbytes,

    fondoEquipado,
    multiplicadorFondo,
    fondosComprados,

    temaRetroDesbloqueado,
    temaRetroEquipado,

    temaWafflesDesbloqueado,
    temaWafflesEquipado,

    cancionGameBoyDesbloqueada,
    paginasRepetidas,

    codes: {
      helloworld: helloworldUsado,
      thekitchenisopen: thekitchenisopenUsado,
      funnyfurrain: funnyfurrainUsado,
      intothemoon: intothemoonUsado,
      archivesrevealed: archivesrevealedUsado,
      freewolfycoinspls: freewolfycoinsplsUsado,
      streamtime: streamtimeUsado
    },

    logrosCompletados: logros.map(l => l.completado),

    colecciones: {
      col_1: serializarColeccion(coleccionConociendoWolfyGo),
      col_2: serializarColeccion(coleccionRecetasMananeras)
    },

    buffs: {
      multiplicadorGalleta,
      duracionBuffGalleta,
      tiempoBuffHueso
    }
  };

  try {
    localStorage.setItem("wolfyClickerSave", JSON.stringify(datos));
  } catch (e) {
    console.warn("No se pudo guardar el juego:", e);
  }
}

function cargarJuego() {
  if (localStorage.getItem("wolfyCompensacion") === "true") {
    wolfichas += 1000;
    inventario[3] = (inventario[3] || 0) + 10;
    inventario[8] = (inventario[8] || 0) + 1;

    precioProducto[3] = precioBase[3] * (1 + 0.15 * inventario[3]);
    precioProducto[8] = precioBase[8] * (1 + 0.15 * inventario[8]);

    localStorage.removeItem("wolfyCompensacion");
    guardarJuego();

    alert("Sorry por tu save avanzado, resulta que un Wolfy detectó una anomalía ahí y decidió borrarlo... ¡pero te dejamos compensación!");
  }

  const datosGuardados = localStorage.getItem("wolfyClickerSave");
  if (!datosGuardados) return;

  try {
    const datos = JSON.parse(datosGuardados);

    if (isNaN(datos.wolfichas) || !Array.isArray(datos.inventario)) {
      console.warn("Save corrupto detectado. Reiniciando valores por defecto...");
      return;
    }

    wolfichas = num(datos.wolfichas, 0);
    wolfichasAnteriores = num(datos.wolfichasAnteriores, wolfichas);
    wolfichasPorClic = num(datos.wolfichasPorClic, 1);

    inventario = rellenarArray(datos.inventario, inventarioDefecto, "number");
    precioProducto = rellenarArray(datos.precioProducto, precioProductoDefecto, "number");
    wolfichasProduce = rellenarArray(datos.wolfichasProduce, wolfichasProduceDefecto, "number");

    for (let i = 0; i < 26; i++) {
      if (esMejoraUnica[i] && inventario[i] > 1) {
        inventario[i] = 1;
      }
    }

    probCrit = num(datos.probCrit, 0);
    probSuperCrit = num(datos.probSuperCrit, 0);

    wolfilletes = num(datos.wolfilletes, 0);
    wolfbytes = num(datos.wolfbytes, 0);

    fondoEquipado = num(datos.fondoEquipado, 0);
    multiplicadorFondo = num(datos.multiplicadorFondo, 1.0);
    fondosComprados = rellenarArray(datos.fondosComprados, fondosCompradosDefecto, "boolean");

    temaRetroDesbloqueado = !!datos.temaRetroDesbloqueado;
    temaRetroEquipado = !!datos.temaRetroEquipado;

    temaWafflesDesbloqueado = !!datos.temaWafflesDesbloqueado;
    temaWafflesEquipado = !!datos.temaWafflesEquipado;

    if (temaRetroEquipado) {
      temaWafflesEquipado = false;
    }

    cancionGameBoyDesbloqueada = !!datos.cancionGameBoyDesbloqueada;
    paginasRepetidas = num(datos.paginasRepetidas, 0);

    if (datos.codes) {
      helloworldUsado = !!datos.codes.helloworld;
      thekitchenisopenUsado = !!datos.codes.thekitchenisopen;
      funnyfurrainUsado = !!datos.codes.funnyfurrain;
      intothemoonUsado = !!datos.codes.intothemoon;
      archivesrevealedUsado = !!datos.codes.archivesrevealed;
      freewolfycoinsplsUsado = !!datos.codes.freewolfycoinspls;
      streamtimeUsado = !!datos.codes.streamtime;
    }

    if (Array.isArray(datos.logrosCompletados)) {
      for (let i = 0; i < logros.length; i++) {
        if (datos.logrosCompletados[i]) {
          logros[i].completado = true;
        }
      }
    }

    if (datos.colecciones) {
      aplicarColeccionGuardada(datos.colecciones.col_1, coleccionConociendoWolfyGo);
      aplicarColeccionGuardada(datos.colecciones.col_2, coleccionRecetasMananeras);
    }

    if (datos.buffs) {
      multiplicadorGalleta = num(datos.buffs.multiplicadorGalleta, 1);
      duracionBuffGalleta = num(datos.buffs.duracionBuffGalleta, 0);
      tiempoBuffHueso = num(datos.buffs.tiempoBuffHueso, 0);
    }

    aplicarClasesTema();

    if (inventario[19] > 0) {
      mejoraGalleta.comprado = true;
      iniciarLoopGalletas();
    }

    if ((inventario[20] || 0) > 0) {
      iniciarChatStreamer();
    }

    if (duracionBuffGalleta > 0) {
      aplicarBuffGalleta(duracionBuffGalleta, multiplicadorGalleta);
    }

  } catch (e) {
    console.error("Error al cargar la partida:", e);
  }
}

function ejecutarAutoreparacion() {
  localStorage.setItem("wolfyCompensacion", "true");
  localStorage.removeItem("wolfyClickerSave");
  wolfichas = 0;
  location.reload();
}

// ===== EASTER EGGS =====
Object.defineProperty(window, "helloworld", {
  configurable: true,
  get: function () {
    if (helloworldUsado) return "⚠️ Este código ya fue reclamado.";
    helloworldUsado = true;
    wolfichas += 100;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'helloworld' activado: +100 Wolfichas. 🐺✨";
  }
});

Object.defineProperty(window, "goldensurprise", {
  configurable: true,
  get: function () {
    aparecerHuesoOro(false);
    return "✨ ¡Un Huesito de Oro ha aparecido en la pantalla! 🦴💛";
  }
});

Object.defineProperty(window, "funnyfurrain", {
  configurable: true,
  get: function () {
    if (funnyfurrainUsado) return "⚠️ ¡La lluvia de pelaje ya ocurrió!";
    funnyfurrainUsado = true;
    inventario[3] = (inventario[3] || 0) + 10;
    precioProducto[3] = precioBase[3] * (1 + 0.15 * inventario[3]);
    guardarJuego();
    render();
    return "🐾 ¡Lluvia Peluda! +10 Clicker Wolfies añadidos. 🐺✨";
  }
});

Object.defineProperty(window, "thekitchenisopen", {
  configurable: true,
  get: function () {
    if (thekitchenisopenUsado) return "⚠️ Este código ya fue reclamado.";
    thekitchenisopenUsado = true;
    wolfichas += 2000;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'thekitchenisopen' activado: +2000 Wolfichas. 🐺✨";
  }
});

Object.defineProperty(window, "archivesrevealed", {
  configurable: true,
  get: function () {
    if (archivesrevealedUsado) return "⚠️ Este código ya fue reclamado.";
    archivesrevealedUsado = true;
    wolfichas += 30000;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'archivesrevealed' activado: +30000 Wolfichas. 🐺✨";
  }
});

Object.defineProperty(window, "intothemoon", {
  configurable: true,
  get: function () {
    if (intothemoonUsado) return "⚠️ ¡La torre de lobitos ya llegó a la luna!";
    intothemoonUsado = true;
    inventario[3] = (inventario[3] || 0) + 1000;
    precioProducto[3] = precioBase[3] * (1 + 0.15 * inventario[3]);
    guardarJuego();
    render();
    return "🐾 ¡Hora de respirar aire lunar! +1000 Clicker Wolfies añadidos. 🐺✨";
  }
});

Object.defineProperty(window, "freewolfycoins", {
  configurable: true,
  get: function () {
    wolfichas += 1;
    guardarJuego();
    render();
    return "🤑 ¡Felicidades! Has reclamado tu RECOMPENSA SUPREMA: +1 Wolficha. (No la gastes toda en un solo lugar 🐺🪙)";
  }
});

Object.defineProperty(window, "freewolfycoinspls", {
  configurable: true,
  get: function () {
    if (freewolfycoinsplsUsado) return "⚠️ Las buenas costumbres se aprecian, pero este regalo es de un solo uso.";

    freewolfycoinsplsUsado = true;
    wolfichas += 10000;
    inventario[6] = (inventario[6] || 0) + 2;
    inventario[8] = (inventario[8] || 0) + 1;

    precioProducto[6] = precioBase[6] * (1 + 0.15 * inventario[6]);
    precioProducto[8] = precioBase[8] * (1 + 0.15 * inventario[8]);

    guardarJuego();
    render();

    return "✨ ¡Pedir 'por favor' siempre funciona! Recompensa VIP reclamada: +10,000 Wolfichas, +2 Farmers y +1 Miner. 🐺🎁";
  }
});

Object.defineProperty(window, "streamtime", {
  configurable: true,
  get: function () {
    if (streamtimeUsado) return "⚠️ El stream ya empezó, haz un archivo nuevo para reiniciarlo";

    streamtimeUsado = true;
    inventario[20] = (inventario[20] || 0) + 1;
    precioProducto[20] = precioBase[20] * (1 + 0.15 * inventario[20]);

    if (typeof iniciarChatStreamer === "function") {
      iniciarChatStreamer();
    }

    guardarJuego();
    render();

    return "✨ ¡Preparen sus palomitas, que el stream 24/7 empezó! +1 Streamer Wolfy. 🐺🎁";
  }
});

// ===== INICIALIZACIÓN =====
window.addEventListener("DOMContentLoaded", () => {
  cargarJuego();
  seleccionarCancion(cancionSeleccionada);
  inicializarEntradasRitmo();
  actualizarSelectorCanciones();
  render();
  actualizarBadges();

  setInterval(() => {
    if (Math.random() < 0.01) {
      aparecerHuesoOro(true);
    }
  }, 1000);

  setInterval(() => {
    producir();
  }, 1000);

  setInterval(() => {
    render();
  }, 100);

  setInterval(() => {
    actualizarBadges();
  }, 1000);

  setInterval(() => {
    guardarJuego();
  }, 5000);

  window.addEventListener("beforeunload", guardarJuego);
});
