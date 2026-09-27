// --- VARIABLES GLOBALES Y SISTEMA BASE ---
var wolfichas = 0;
var wolfichasAnteriores = 0;
var wolfichasPorClic = 1;
var multiplicadorGalleta = 1;
var duracionBuffGalleta = 0;
var wolfilletes = 0;

// Sistema de Fondos y Colores (Actualización 2.0)
var fondoEquipado = 0;
var multiplicadorFondo = 1.0; 
var fondosComprados = [true, false, false, false]; // Default, Calma Verdosa, Amarillo Energético

const catalogoFondos = [
  { nombre: "Default", multiplicador: 1.0, costo: 0, color: "#ffffff", colorBoton: "#ffffff", colorTexto: "#222222" },
  { nombre: "Calma Verdosa", multiplicador: 1.2, costo: 10, color: "#e8f5e9", colorBoton: "#a5d6a7", colorTexto: "#1b5e20" },
  { nombre: "Amarillo Energético", multiplicador: 1.5, costo: 25, color: "#fffde7", colorBoton: "#fff59d", colorTexto: "#f57f17" },
  { nombre: "Azul Fresco", multiplicador: 2.0, costo: 70, color: "#e0f7fa", colorBoton: "#80deea", colorTexto: "#006064" }
];

// Buffs de Hueso
var multiplicadorHueso = 1;
var tiempoBuffHueso = 0;
var esHuesoNatural = false;

// QTE de la Galleta
var clicksActuales = 0;
var clicksRequeridos = 0;
var tiempoLimiteQTE = 0;
var timerQTE = null;
var timerLoopGalleta = null;
let galletaActiva = false;
let mejoraGalleta = { comprado: false };
var ultimoTiempoClick = 0;
var esSpeedrunner = true;

// Configuración de Elementos e Inventario
var esMejoraUnica = [true, true, true, false, true, false, false, true, false, true, true, true, false, false, false, true, false, true, true, true, false, true, false, true, true, false];
var inventario      = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var wolfichasProduce = [0, 0, 0, 0.1, 0, 0, 1, 0, 5, 0, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 200, 0, 500, 0, 0, 1500]; 

var precioBase      = [50, 750, 5500, 10, 500, 200, 150, 500, 800, 2000, 3000, 2500, 2000, 5000, 10000, 15000, 30000, 40000, 65000, 9999, 120000, 150000, 250000, 350000, 500000, 750000];
var precioProducto  = [50, 750, 5500, 10, 500, 200, 150, 500, 800, 2000, 3000, 2500, 2000, 5000, 10000, 15000, 30000, 40000, 65000, 9999, 120000, 150000, 250000, 350000, 500000, 750000];

var probCrit = 0;
var probSuperCrit = 0;
var tiempoHorno = 10; 
var gananciaUltimaHorneada = 0; 
var wolfichasPorSegundo = 0;
var vistaActual = 0; // 0: Streamer Chat, 1: Idol Ritmo

// --- SISTEMA LOGROS COMPLETO ---
var logros = [
  { id: "badge-1", titulo: "Primer Ahorro", descripcion: "Ten 100 Wolfichas Ahorradas", condicion: function() { return wolfichas >= 100; }, completado: false },
  { id: "badge-2", titulo: "Alcancía Llena", descripcion: "Ten 500 Wolfichas Ahorradas", condicion: function() { return wolfichas >= 500; }, completado: false },
  { id: "badge-3", titulo: "Woof!!", descripcion: "Contrata 1 Clicker Wolfy", condicion: function() { return inventario[3] >= 1; }, completado: false },
  { id: "badge-4", titulo: "Familia Creciente", descripcion: "Contrata 10 Clicker Wolfy", condicion: function() { return inventario[3] >= 10; }, completado: false },
  { id: "badge-5", titulo: "Anillo Peludo", descripcion: "Contrata 50 Clicker Wolfy", condicion: function() { return inventario[3] >= 50; }, completado: false },
  { id: "badge-6", titulo: "Colonia Lupina", descripcion: "Contrata 250 Clicker Wolfies", condicion: function() { return inventario[3] >= 250; }, completado: false },
  { id: "badge-7", titulo: "Pelurno", descripcion: "¡Alcanza la disparatada cifra de 1,000 Clicker Wolfies!", condicion: function() { return inventario[3] >= 1000; }, completado: false },
  { id: "badge-8", titulo: "Organización Creciente", descripcion: "Alcanza una producción de 10 WC/s", condicion: function() { return wolfichasPorSegundo >= 10; }, completado: false },
  { id: "badge-9", titulo: "Fuerza Lupina", descripcion: "Alcanza una producción de 100 WC/s", condicion: function() { return wolfichasPorSegundo >= 100; }, completado: false },
  { id: "badge-10", titulo: "¿Empresario o Domador? ¿Qué Tal Ambos?", descripcion: "¡Alcanza la colosal cifra de 1,000 WC/s!", condicion: function() { return wolfichasPorSegundo >= 1000; }, completado: false },
  { id: "badge-11", titulo: "Recolector Casual", descripcion: "Contrata 1 Farmer Wolfy", condicion: function() { return (inventario[6] || 0) >= 1; }, completado: false },
  { id: "badge-12", titulo: "Hacer Crecer un Jardín", descripcion: "Contrata 10 Farmer Wolfies", condicion: function() { return (inventario[6] || 0) >= 10; }, completado: false },
  { id: "badge-13", titulo: "Farmeando Wolfichas... Literalmente", descripcion: "Contrata 100 Farmer Wolfies", condicion: function() { return (inventario[6] || 0) >= 100; }, completado: false },
  { id: "badge-14", titulo: "Trabajo Duro", descripcion: "Contrata 1 Miner Wolfy", condicion: function() { return (inventario[8] || 0) >= 1; }, completado: false },
  { id: "badge-15", titulo: "Mine Pero Sin Craft", descripcion: "Contrata 5 Miner Wolfies", condicion: function() { return (inventario[8] || 0) >= 5; }, completado: false },
  { id: "badge-16", titulo: "¡¿Y los Diamantes?!", descripcion: "Contrata 25 Miner Wolfies", condicion: function() { return (inventario[8] || 0) >= 25; }, completado: false },
  { id: "badge-17", titulo: "Pastelería Lupina", descripcion: "Pastelería a lo lupino, todo amasado a patita... ejem, disculpa. Contrata 1 Baker Wolfy.", condicion: function() { return (inventario[12] || 0) >= 1; }, completado: false },
  { id: "badge-18", titulo: "Mito Confirmado", descripcion: "Encuentra y atrapa un Huesito de Oro de forma natural", condicion: function() { return false; }, completado: false },
  { id: "badge-19", titulo: "Olor Creciente A Papel", descripcion: "Será comestible?, quien sabe. Contrata 1 Worker Wolfy y sube tus stonks", condicion: function() { return (inventario[16] || 0) >= 1; }, completado: false },
  { id: "badge-20", titulo: "Comegalletas Speedrunner", descripcion: "Haz todos los clics de la galleta con un intervalo inferior a 0.7s por clic", condicion: function() { return false; }, completado: false },
  { id: "badge-21", titulo: "Comida Tramposa", descripcion: "¡¡QUÉ CERCA!! Cómete una galleta con menos de 2s sobrantes", condicion: function() { return false; }, completado: false }
];

// --- SISTEMA RITMO IDOL WOLFY ---
var mapaCanciones = {
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
  }
};

var cancionSeleccionada = "swim";
var notasActivas = [];
var puntajeRitmo = 0;
var loopRitmoFrame = null;
var tiempoJuegoRitmo = -3.0;
var juegoPausado = true;
var juegoIniciado = false;
var ultimoTimestamp = 0;
var audioDisponible = false;

const teclasCarriles = {
  'a': 0, 'A': 0,
  's': 1, 'S': 1,
  'd': 2, 'D': 2,
  'f': 3, 'F': 3
};

// --- VARIABLES GLOBALES ---
var wolfbytes = 0;

// Definición de la primera colección
var coleccionConociendoWolfyGo = {
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

var temaRetroDesbloqueado = false;
var temaRetroEquipado = false;

// ==========================================
// --- EDIFICIO / MINIJUEGO: GAMER WOLFY ---
// ==========================================

var costoGamerWolfy = 100000;

// Catálogo de Trivias Tramposas de Gamer Wolfy
var triviasGamerWolfy = [
  {
    pregunta: "I Forgot The Question...",
    correcta: "Woof Woof",
    incorrectas: ["Pick This One", "Pick Me, Pick Me!!", "Don't Pick This One"]
  },
  {
    pregunta: "Pick The Riight Answer",
    correcta: "The Riight Answer",
    incorrectas: ["The Right Answer", "Idk What You Mean, Bro"],
    esTrampaLetra: true // Activa la opción especial con letra dinámica
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
  // Verificar saldo de Wolfichas (ajusta 'wolfichas' a tu variable si usas inventario[0])
  let saldoActual = typeof wolfichas !== "undefined" ? wolfichas : (typeof inventario !== "undefined" ? inventario[0] : 0);

  if (saldoActual < costoGamerWolfy) {
    alert(`❌ Necesitas ${costoGamerWolfy.toLocaleString()} WC para activar el desafío de Gamer Wolfy.`);
    return;
  }

  // Cobrar costo
  if (typeof wolfichas !== "undefined") wolfichas -= costoGamerWolfy;
  else if (typeof inventario !== "undefined") inventario[0] -= costoGamerWolfy;

  // Elegir pregunta al azar
  let trivia = triviasGamerWolfy[Math.floor(Math.random() * triviasGamerWolfy.length)];

  // Preparar opciones
  let opciones = [trivia.correcta, ...trivia.incorrectas];
  opciones.sort(() => Math.random() - 0.5); // Mezclar orden

  // Si es la pregunta trampa de la letra, agregar la opción tramposa de forma segura
  if (trivia.esTrampaLetra) {
    let letras = ["A", "B", "C", "D"];
    let idxCorrecto = opciones.indexOf(trivia.correcta);
    
    // Elegimos una letra falsa que NO sea la correcta
    let letrasFalsas = letras.filter((_, idx) => idx !== idxCorrecto);
    let letraFalsaElegida = letrasFalsas[Math.floor(Math.random() * letrasFalsas.length)];

    opciones.push(`It's Not Letter ${letraFalsaElegida}`);
    opciones.sort(() => Math.random() - 0.5); // Volver a mezclar con las 4 opciones
  }

  lanzarModalTrivia(trivia.pregunta, opciones, trivia.correcta);

  if (typeof guardarJuego === "function") guardarJuego();
  if (typeof render === "function") render();
}

function lanzarModalTrivia(pregunta, opciones, respuestaCorrecta) {
  let letras = ["A", "B", "C", "D"];

  let botonesHTML = opciones.map((opcion, idx) => {
    let letra = letras[idx] || "";
    // Escapar comillas para evitar errores en el evento onclick
    let opcionEscapada = opcion.replace(/'/g, "\\'");
    let correctaEscapada = respuestaCorrecta.replace(/'/g, "\\'");

    return `
      <button class="btn-opcion-trivia" onclick="evaluarRespuestaTrivia('${opcionEscapada}', '${correctaEscapada}')">
        <strong>${letra}.</strong> ${opcion}
      </button>
    `;
  }).join("");

  let modalHTML = `
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

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function evaluarRespuestaTrivia(opcionSeleccionada, respuestaCorrecta) {
  let modal = document.getElementById("modal-gamer-wolfy");
  if (modal) modal.remove();

  if (opcionSeleccionada === respuestaCorrecta) {
    darPremioAlAzarGamerWolfy();
  } else {
    alert("❌ ¡Respuesta incorrecta! Gamer Wolfy rompió el mando y regresó a su juego. ¡Inténtalo de nuevo!");
  }
}

function darPremioAlAzarGamerWolfy() {
  let rand = Math.random() * 100;
  let mensaje = "";

  if (rand < 50) {
    // 50% Probabilidad: Super bote de Wolfichas (200k a 500k)
    let ganancia = 200000 + Math.floor(Math.random() * 300000);
    if (typeof wolfichas !== "undefined") wolfichas += ganancia;
    else if (typeof inventario !== "undefined") inventario[0] += ganancia;
    
    mensaje = `🎉 ¡CORRECTO! Ganaste un super bote de ${ganancia.toLocaleString()} WC.`;
  } else if (rand < 80) {
    // 30% Probabilidad: Wolfbytes (15 a 35 WB)
    let wbGanados = 15 + Math.floor(Math.random() * 20);
    if (typeof wolfbytes !== "undefined") wolfbytes += wbGanados;
    
    mensaje = `💾 ¡CORRECTO! Gamer Wolfy te regaló +${wbGanados} Wolfbytes.`;
  } else {
    // 20% Probabilidad: Sobre de Páginas gratis
    mensaje = `📖 ¡CORRECTO! Has ganado un Sobre Básico de Páginas gratis.`;
    if (typeof abrirPaqueteBasicoGratis === "function") {
      abrirPaqueteBasicoGratis();
    } else if (typeof abrirPaqueteBasico === "function") {
      // Si no existe la versión gratis, le abonamos 500 WB y abrimos
      if (typeof wolfbytes !== "undefined") wolfbytes += 500;
      abrirPaqueteBasico();
    }
  }

  alert(mensaje);
  if (typeof guardarJuego === "function") guardarJuego();
  if (typeof render === "function") render();
}
// --- FUNCIONES DE APERTURA DE MODAL ---
function abrirModalLibros() {
  let modal = document.getElementById("modal-libros");
  if (modal) {
    modal.style.display = "flex";
    renderizarListaLibrosUI();
  }
}

function cerrarModalLibros() {
  let modal = document.getElementById("modal-libros");
  if (modal) modal.style.display = "none";
}

function renderizarListaLibrosUI() {
  let listaContainer = document.getElementById("lista-libros-ui");
  if (!listaContainer) return;

  let html = "";
  coleccionConociendoWolfyGo.libros.forEach((libro) => {
    let estadoClase = libro.completado ? "completado" : "bloqueado";
    let icono = libro.completado ? "📖" : "🔒";
    
    html += `
      <div class="item-libro-btn ${estadoClase}" onclick="verDetalleLibro('${libro.id}')">
        <span>${icono} ${libro.nombre}</span>
        <small>${libro.paginasObtenidas}/${libro.paginasTotales}</small>
      </div>
    `;
  });

  listaContainer.innerHTML = html;
}

function verDetalleLibro(idLibro) {
  let libro = coleccionConociendoWolfyGo.libros.find(l => l.id === idLibro);
  let detalleContainer = document.getElementById("detalle-libro-ui");
  if (!libro || !detalleContainer) return;

  if (!libro.completado) {
    detalleContainer.innerHTML = `
      <div class="bloqueado-info">
        <h3>🔒 ${libro.nombre} (${libro.rareza})</h3>
        <p>Recolecta las <strong>${libro.paginasTotales} páginas</strong> de este libro para desbloquear su lore.</p>
        <p>Progreso actual: <strong>${libro.paginasObtenidas} / ${libro.paginasTotales}</strong> páginas.</p>
      </div>
    `;
  } else {
    let textoFormateado = libro.lore.replace(/\n/g, "<br>");
    detalleContainer.innerHTML = `
      <div class="libro-contenido">
        <h3>📖 ${libro.nombre} <span class="badge-rareza rareza-${libro.rareza.toLowerCase()}">${libro.rareza}</span></h3>
        <hr>
        <p class="lore-texto">${textoFormateado}</p>
        <hr>
        <div class="reward-info">💾 Recompensa entregada: <strong>+${libro.rewardWolfbytes} Wolfbytes</strong></div>
      </div>
    `;
  }
}

// --- FUNCIÓN PARA AGREGAR PÁGINAS Y ENTREGAR RECOMPENSAS ---
function agregarPaginaLibro(idLibro) {
  let libro = coleccionConociendoWolfyGo.libros.find(l => l.id === idLibro);
  if (libro && !libro.completado) {
    libro.paginasObtenidas++;

    if (libro.paginasObtenidas >= libro.paginasTotales) {
      libro.paginasObtenidas = libro.paginasTotales;
      libro.completado = true;
      
      wolfbytes += libro.rewardWolfbytes;
      alert(`📖 ¡Libro completado: ${libro.nombre}!\nRecompensa: +${libro.rewardWolfbytes} Wolfbytes 💾`);
      
      verificarColeccionCompleta();
    }
  }
  if (typeof guardarJuego === "function") guardarJuego();
  if (typeof render === "function") render();
}

function alternarTemaRetro() {
  if (!temaRetroDesbloqueado) {
    alert("🔒 Debes completar la colección 'Conociendo Wolfy Go' para desbloquear el Tema Retro.");
    return;
  }

  temaRetroEquipado = !temaRetroEquipado;

  if (temaRetroEquipado) {
    // Aplicar la clase Retro y fijar el multiplicador
    document.body.classList.add("tema-retro");
    multiplicadorFondo = 2.5; 
    alert("🎮 ¡Tema 'Retro Pixel' activado! Multiplicador x2.5 WC aplicado.");
  } else {
    // Remover la clase Retro y volver al multiplicador base o anterior
    document.body.classList.remove("tema-retro");
    multiplicadorFondo = 1.0; 
    alert("🎨 Has vuelto al tema por defecto.");
  }

  if (typeof guardarJuego === "function") guardarJuego();
  if (typeof render === "function") render();
}

function verificarColeccionCompleta() {
  let todosCompletados = coleccionConociendoWolfyGo.libros.every(l => l.completado);

  if (todosCompletados && !coleccionConociendoWolfyGo.completada) {
    coleccionConociendoWolfyGo.completada = true;
    temaRetroDesbloqueado = true;
    
    // Activa automáticamente el tema al ganar
    alternarTemaRetro();

    alert(`🎉 ¡COLECCIÓN COMPLETA: ${coleccionConociendoWolfyGo.nombre}!\n\nHas desbloqueado el Tema Especial 'Retro' (x2.5 WC) con estilo PixelArt 👾.`);
  }
}

// --- FUNCIONES INTERACTIVAS Y UI ---
function clic() {
  let bonoCooperacion = 0;
  if (inventario[10] > 0) {
    bonoCooperacion = inventario[3] * 0.1;
  }
  wolfichas += (wolfichasPorClic + bonoCooperacion) * multiplicadorFondo;
  guardarJuego();
}

function comprar(objeto) {
  if (esMejoraUnica[objeto] && inventario[objeto] > 0) return;

  if (wolfichas >= precioProducto[objeto]) {
    wolfichas -= precioProducto[objeto];
    inventario[objeto]++;

    if (objeto <= 2) wolfichasPorClic *= 2;
    if (objeto === 4) probCrit = 15;
    if (objeto === 5) wolfichasProduce[3] += 0.1;
    if (objeto === 7) wolfichasProduce[6] *= 2;
    if (objeto === 9) wolfichasProduce[8] *= 2;
    if (objeto === 17) wolfichasProduce[16] *= 2;
    if (objeto === 18) wolfichasProduce[16] *= 2;

    if (objeto === 19) {
      mejoraGalleta.comprado = true;
      if (typeof iniciarLoopGalletas === "function") iniciarLoopGalletas();
      if (typeof aparecerGalletitaCrocante === "function") aparecerGalletitaCrocante();
    }

    if (objeto === 20 && inventario[20] === 1) {
      iniciarChatStreamer();
    }

    if (objeto === 24) {
      wolfichasProduce[22] *= 2;
    }

    if (!esMejoraUnica[objeto]) {
      precioProducto[objeto] = precioBase[objeto] * (1 + 0.15 * inventario[objeto]);
    }

    if (objeto === 13 && (inventario[13] || 0) >= 16) {
      alert("¡Tus patitas ya no pueden amasar más rápido! (Mínimo de 2s alcanzado)");
    }

    guardarJuego();
    render();
  }
}

// --- LÓGICA DE JUEGO DE RITMO ---
function seleccionarCancion(clave) {
  cancionSeleccionada = clave;
  let audio = document.getElementById("audio-player");
  if (audio) {
    audio.src = mapaCanciones[clave].archivo;
  }
}

function iniciarCancionRitmo() {
  if ((inventario[25] || 0) <= 0) {
    alert("🎤 ¡Necesitas contratar al menos 1 Idol Wolfy en la tienda para jugar!");
    return;
  }

  let audio = document.getElementById("audio-player");
  document.querySelectorAll('.nota-ritmo').forEach(n => n.remove());

  audioDisponible = false;
  if (audio) {
    audio.pause();
    audio.src = mapaCanciones[cancionSeleccionada].archivo;
    audio.currentTime = 0;

    audio.oncanplaythrough = function() {
      audioDisponible = true;
    };
    audio.onerror = function() {
      audioDisponible = false;
      console.warn("⚠️ No se pudo cargar el audio MP3. El juego correrá en modo silencioso.");
    };
    audio.load();
  }

  notasActivas = mapaCanciones[cancionSeleccionada].mapaNotas.map(nota => ({
    tiempo: nota.tiempo,
    carril: nota.carril,
    impactado: false,
    elementoHTML: null
  }));

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

  let ahora = performance.now();
  let delta = (ahora - ultimoTimestamp) / 1000;
  ultimoTimestamp = ahora;

  let audio = document.getElementById("audio-player");

  if (tiempoJuegoRitmo < 0) {
    tiempoJuegoRitmo += delta;
    actualizarFeedbackRitmo(`⏳ Preparado... ${Math.abs(tiempoJuegoRitmo).toFixed(1)}s`);

    if (tiempoJuegoRitmo >= 0) {
      tiempoJuegoRitmo = 0;
      if (audio && audioDisponible) {
        audio.currentTime = 0;
        audio.play().catch(e => {
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

  notasActivas.forEach(nota => {
    let diferencia = nota.tiempo - tiempoJuegoRitmo;

    if (diferencia <= 1.5 && diferencia >= -0.3 && !nota.impactado) {
      if (!nota.elementoHTML) {
        let carrilElem = document.getElementById(`carril-${nota.carril}`);
        if (carrilElem) {
          let el = document.createElement("div");
          el.className = "nota-ritmo";
          carrilElem.appendChild(el);
          nota.elementoHTML = el;
        }
      }

      let porcentajePos = (1 - (diferencia / 1.5)) * 160;
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
  let audio = document.getElementById("audio-player");
  if (audio && !audio.paused) audio.pause();
  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  actualizarFeedbackRitmo("Juego en Pausa ⏸️");
}

function continuarCancionRitmo() {
  if (!juegoPausado || !juegoIniciado) return;
  juegoPausado = false;
  ultimoTimestamp = performance.now();
  let audio = document.getElementById("audio-player");
  if (tiempoJuegoRitmo >= 0 && audio && audioDisponible && audio.paused) {
    audio.play().catch(e => console.warn("Error al reanudar audio"));
  }
  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  actualizarBucleRitmo();
}

function reiniciarCancionRitmo() {
  juegoPausado = true;
  juegoIniciado = false;
  let audio = document.getElementById("audio-player");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  tiempoJuegoRitmo = -3.0;
  document.querySelectorAll('.nota-ritmo').forEach(n => n.remove());

  notasActivas = mapaCanciones[cancionSeleccionada].mapaNotas.map(nota => ({
    tiempo: nota.tiempo,
    carril: nota.carril,
    impactado: false,
    elementoHTML: null
  }));

  puntajeRitmo = 0;
  actualizarFeedbackRitmo("Canción reiniciada 🔄. Haz clic en Iniciar.");
}

function presionarCarril(carril) {
  let audio = document.getElementById("audio-player");
  if (!audio || audio.paused) return;

  let tActual = audio.currentTime;
  let acierto = false;

  notasActivas.forEach(nota => {
    if (!nota.impactado && nota.carril === carril) {
      let diff = Math.abs(nota.tiempo - tActual);
      if (diff <= 0.35) {
        nota.impactado = true;
        acierto = true;

        let bonoWC = 1000 * (inventario[25] || 1);
        wolfichas += bonoWC;
        puntajeRitmo += 100;

        if (nota.elementoHTML) {
          nota.elementoHTML.remove();
          nota.elementoHTML = null;
        }

        actualizarFeedbackRitmo(`¡HIT! +${bonoWC} WC 🎵`);
      }
    }
  });

  if (!acierto) {
    actualizarFeedbackRitmo("¡MISS!");
  }
}

function actualizarFeedbackRitmo(msg) {
  let fb = document.getElementById("feedback-ritmo");
  if (fb) fb.innerText = `${msg} | Puntaje: ${puntajeRitmo}`;
}

// --- FONDOS Y TEMAS ---
function aplicarTemaVisual(indexFondo) {
  document.body.classList.remove('tema-default', 'tema-verde', 'tema-amarillo', 'tema-azul');
  
  if (indexFondo === 1) document.body.classList.add('tema-verde');
  else if (indexFondo === 2) document.body.classList.add('tema-amarillo');
  else if (indexFondo === 3) document.body.classList.add('tema-azul');
  else document.body.classList.add('tema-default');

  if (catalogoFondos[indexFondo]) {
    document.body.style.backgroundColor = catalogoFondos[indexFondo].color;
  }
}

function comprarFondo(indexFondo) {
  let fondo = catalogoFondos[indexFondo];
  if (!fondo) return;

  if (fondosComprados[indexFondo]) {
    fondoEquipado = indexFondo;
    multiplicadorFondo = fondo.multiplicador;
    aplicarTemaVisual(indexFondo);
    alert(`🎨 Fondo "${fondo.nombre}" equipado.`);
  } else if (wolfilletes >= fondo.costo) {
    wolfilletes -= fondo.costo;
    fondosComprados[indexFondo] = true;
    fondoEquipado = indexFondo;
    multiplicadorFondo = fondo.multiplicador;
    aplicarTemaVisual(indexFondo);
    alert(`🎉 ¡Fondo "${fondo.nombre}" comprado!`);
  } else {
    alert(`No tienes suficientes Wolfilletes. Necesitas 💵 ${fondo.costo}.`);
  }

  guardarJuego();
  render();
}

function girarRuleta() {
  let dado = Math.random() * 100;
  if (dado < probSuperCrit) return 10;
  if (dado < probCrit)      return 2;
  return 1;
}

// --- QTE GALLETA CROCANTE ---
function iniciarLoopGalletas() {
  if (timerLoopGalleta) clearInterval(timerLoopGalleta);
  timerLoopGalleta = setInterval(function() {
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

  let cookieElement = document.getElementById("galleta-crocante");
  let qteInfo = document.getElementById("qte-info");

  let topPos = Math.floor(Math.random() * 60 + 15);
  let leftPos = Math.floor(Math.random() * 60 + 15);

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
      let faltantes = clicksRequeridos - clicksActuales;
      let tiempoMostrar = Math.max(0, tiempoLimiteQTE).toFixed(1);
      qteInfo.innerHTML = `🍪 Faltan: ${faltantes}<br>⏱️ ${tiempoMostrar}s`;
    }

    if (tiempoLimiteQTE <= 0) {
      ocultarGalleta();
    }
  }, 100);
}

function clickGalletita() {
  if (!galletaActiva) return;

  let ahora = Date.now();
  let tiempoEntreClicks = (ahora - ultimoTiempoClick) / 1000;
  ultimoTiempoClick = ahora;

  if (clicksActuales > 0 && tiempoEntreClicks > 0.7) {
    esSpeedrunner = false;
  }

  clicksActuales++;
  let qteInfo = document.getElementById("qte-info");

  if (qteInfo) {
    let faltantes = clicksRequeridos - clicksActuales;
    let tiempoMostrar = Math.max(0, tiempoLimiteQTE).toFixed(1);
    qteInfo.innerHTML = `🍪 Faltan: ${faltantes}<br>⏱️ ${tiempoMostrar}s`;
  }

  if (clicksActuales >= clicksRequeridos) {
    let tiempoGanado = Math.floor(tiempoLimiteQTE);
    let tiempoRestanteExacto = tiempoLimiteQTE;

    ocultarGalleta();

    duracionBuffGalleta = 10 + tiempoGanado; 
    multiplicadorGalleta = (inventario[21] > 0) ? 2.0 : 1.5;

    let timerBuff = setInterval(() => {
      duracionBuffGalleta--;
      if (duracionBuffGalleta <= 0) {
        multiplicadorGalleta = 1;
        clearInterval(timerBuff);
      }
    }, 1000);

    if (tiempoRestanteExacto < 2.0) {
      let logroTramposo = logros.find(l => l.id === "badge-21");
      if (logroTramposo && !logroTramposo.completado) {
        logroTramposo.completado = true;
        alert("🏆 ¡LOGRO DESBLOQUEADO!: Comida Tramposa (¡¡QUÉ CERCA!! Cómete una galleta con menos de 2s sobrantes)");
      }
    }

    if (esSpeedrunner) {
      let logroSpeedrunner = logros.find(l => l.id === "badge-20");
      if (logroSpeedrunner && !logroSpeedrunner.completado) {
        logroSpeedrunner.completado = true;
        alert("🏆 ¡LOGRO DESBLOQUEADO!: Comegalletas Speedrunner (¡Clics súper rápidos!)");
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
  
  let cookieElement = document.getElementById("galleta-crocante");
  let qteInfo = document.getElementById("qte-info");

  if (cookieElement) cookieElement.style.display = "none";
  if (qteInfo) qteInfo.style.display = "none";
}

// --- CHAT DE STREAMER WOLFY ---
var timerChatStreamer = null;
var penalizacionWCS = 0;
var productorSecuestrado = false;

function iniciarChatStreamer() {
  if (timerChatStreamer) clearInterval(timerChatStreamer);
  
  timerChatStreamer = setInterval(() => {
    if ((inventario[20] || 0) > 0) {
      let dado = Math.random();
      if (dado < 0.05) {
        generarComentarioEspecial();
      } else if (dado < 0.40) {
        generarComentarioChat();
      }
    }
  }, 20000);
}

var comentariosPositivos = [
  "¿Cómo se llama el juego? ¡¡Me encanta!!",
  "¡Wolfy Go Studio nunca dececciona! 🔥",
  "¡Esas mecánicas están 10/10!",
  "¡DONACIÓN EN CAMINO! 🪙✨",
  "¡Juegazo supremo!",
  "Digno de un Oscar",
  "Mis ahorros quizás ayuden",
  "Cookie clicker? Mejor Wolfy Clicker Incremental"
];

var comentariosNegativos = [
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
  let anioRandom = Math.floor(Math.random() * (2023 - 2006 + 1)) + 2006;
  let anioActual = new Date().getFullYear();
  let wolfichasTexto = Math.floor(wolfichas).toLocaleString();

  let comentariosEspeciales = [
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
  let esNegativo = Math.random() < 0.30;
  let texto = esNegativo 
    ? comentariosNegativos[Math.floor(Math.random() * comentariosNegativos.length)]
    : comentariosPositivos[Math.floor(Math.random() * comentariosPositivos.length)];

  let contenedorChat = document.getElementById("comentarios-chat");
  if (!contenedorChat) return;

  let chatBox = document.createElement("div");
  chatBox.className = esNegativo ? "chat-stream hater" : "chat-stream vip";
  chatBox.style.backgroundColor = esNegativo ? "#e63946" : "#2a9d8f";
  chatBox.style.color = "#ffffff";

  let tiempoInicio = Date.now();
  let ignoradoEvaluado = false;

  if (!esNegativo) {
    chatBox.innerHTML = `
      <div>💬 <strong>Chat:</strong> "${texto}" <span class="ico-like"></span></div>
      <div class="chat-acciones">
        <button class="btn-chat btn-like">❤️ Like</button>
        <button class="btn-chat btn-dislike">💔 Dislike</button>
      </div>
    `;

    let btnLike = chatBox.querySelector(".btn-like");
    let btnDislike = chatBox.querySelector(".btn-dislike");

    btnLike.onclick = function() {
      let premio = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
      wolfichas += premio;
      chatBox.querySelector(".ico-like").innerText = "❤️";
      chatBox.classList.add("desactivado");
      guardarJuego();
      render();
    };

    btnDislike.onclick = function() {
      let castigo = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
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

    let btnBorrar = chatBox.querySelector(".btn-borrar");
    let btnDislike = chatBox.querySelector(".btn-dislike");
    let btnLike = chatBox.querySelector(".btn-like");

    btnBorrar.onclick = function() {
      let duracion = (Date.now() - tiempoInicio) / 1000;

      if (duracion <= 2.0) {
        chatBox.classList.add("efecto-exito");
        setTimeout(() => { if (contenedorChat.contains(chatBox)) contenedorChat.removeChild(chatBox); }, 400);
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

    btnDislike.onclick = function() {
      chatBox.classList.add("desactivado");
      chatBox.querySelector(".chat-acciones").innerHTML = "<small>💔 Neutralizado</small>";
    };

    btnLike.onclick = function() {
      if (!productorSecuestrado) {
        productorSecuestrado = true;
        let robo = Math.floor(wolfichas * 0.10);
        wolfichas -= robo;
        alert(`🚨 ¡ERROR DE MODERACIÓN! Le diste Like a un Hater.\n¡Se han robado a tu Productor y un 10% de tus ahorros (${robo.toLocaleString()} WC)! Modéralo (🗑️) para rescatar a tu productor.`);
      }
      chatBox.classList.add("desactivado");
      guardarJuego();
      render();
    };

    let timerPenalty = setInterval(() => {
      if (!ignoradoEvaluado && contenedorChat.contains(chatBox) && !chatBox.classList.contains("desactivado")) {
        let transcurrido = (Date.now() - tiempoInicio) / 1000;
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
}

function generarComentarioEspecial() {
  let texto = obtenerComentarioEspecial();
  let contenedorChat = document.getElementById("comentarios-chat");
  if (!contenedorChat) return;

  let chatBox = document.createElement("div");
  chatBox.className = "chat-stream arcoiris";
  chatBox.innerHTML = `🌟 <strong>SUPER FANÁTICO:</strong> "${texto}"`;
  
  chatBox.style.background = "linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bfd, #7a00ff, #ff00c8)";
  chatBox.style.backgroundSize = "400% 400%";
  chatBox.style.color = "#ffffff";
  chatBox.style.textShadow = "1px 1px 3px #000";

  let tiempoAparicion = Date.now();

  chatBox.onclick = function() {
    let tiempoReaccion = (Date.now() - tiempoAparicion) / 1000;
    
    if (contenedorChat.contains(chatBox)) {
      contenedorChat.removeChild(chatBox);
    }

    let premioBase = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    wolfichas += premioBase;

    if (tiempoReaccion <= 5.0) {
      wolfilletes += 10;
      alert(`⚡ ¡REFLEJOS DE ACERO! Reaccionaste en ${tiempoReaccion.toFixed(1)}s.\nPremio: +${premioBase.toLocaleString()} WC y 💵 +10 Wolfilletes.`);
    } else {
      alert(`🎉 ¡Súper Donación reclamada! +${premioBase.toLocaleString()} Wolfichas.`);
    }

    guardarJuego();
    render();
  };

  contenedorChat.appendChild(chatBox);
}

// --- NAVEGACIÓN Y RENDER ---
function cambiarVistaDerecha(direccion) {
  vistaActual += direccion;
  if (vistaActual < 0) vistaActual = 1;
  if (vistaActual > 1) vistaActual = 0;

  let chatView = document.getElementById("vista-chat-streamer");
  let idolView = document.getElementById("vista-idol-ritmo");
  let titulo = document.getElementById("titulo-vista-derecha");

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

function actualizarContadorConEfectos(diferencia) {
  let contadorEl = document.getElementById("contador");
  let subContadorEl = document.getElementById("sub-contador");
  let lblWolfilletes = document.getElementById("lbl-wolfilletes");

  if (lblWolfilletes) lblWolfilletes.innerText = wolfilletes;

  if (contadorEl) {
    let limpio = Math.round(wolfichas * 10) / 10;
    contadorEl.innerText = `${limpio.toFixed(1)} Wolfichas`;

    if (Math.abs(diferencia) >= 0.1) {
      let esGanancia = diferencia > 0;
      let claseParpadeo = esGanancia ? "flash-ganar" : "flash-perder";
      
      contadorEl.classList.add(claseParpadeo);
      mostrarCantidadFlotante(diferencia, esGanancia);

      setTimeout(() => {
        contadorEl.classList.remove("flash-ganar", "flash-perder");
      }, 200);
    }
  }

  if (subContadorEl) {
    subContadorEl.innerText = `${wolfichasPorSegundo.toFixed(1)} WC/s (x${multiplicadorFondo} Color) | Wolfilletes: ${wolfilletes} 💵`;
  }
}

function mostrarCantidadFlotante(monto, esGanancia) {
  let header = document.querySelector(".header-top");
  if (!header) return;

  let flotante = document.createElement("div");
  flotante.className = `dinero-flotante ${esGanancia ? 'ganancia' : 'perdida'}`;
  flotante.innerText = (esGanancia ? "+" : "") + monto.toFixed(1);

  header.appendChild(flotante);

  setTimeout(() => {
    flotante.style.transform = "translateY(-15px)";
    flotante.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    if (header.contains(flotante)) header.removeChild(flotante);
  }, 650);
}

function producir() {
  if (isNaN(wolfichas)) {
    console.error("⚠️ Se detectó corrupción en tiempo real (NaN). Activando protocolo de rescate...");
    ejecutarAutoreparacion();
    return;
  }

  // Producción pasiva
  let totalClickers   = (inventario[3] || 0) * wolfichasProduce[3];
  let totalFarmers    = (inventario[6] || 0) * wolfichasProduce[6];
  let totalMiners     = (inventario[8] || 0) * wolfichasProduce[8];
  let totalWorkers    = (inventario[16] || 0) * wolfichasProduce[16];
  let totalStreamers  = (inventario[20] || 0) * wolfichasProduce[20];
  let totalTaxists    = (inventario[22] || 0) * wolfichasProduce[22];
  let totalIdols      = (inventario[25] || 0) * wolfichasProduce[25];

  let produccionPasiva = (totalClickers + totalFarmers + totalMiners + totalWorkers + totalStreamers + totalTaxists + totalIdols) * multiplicadorGalleta;

  // Pastelería
  let cantBakers = inventario[12] || 0;
  let gananciaHornoTotal = 0;

  if (cantBakers > 0) {
    let comprasPatas = inventario[13] || 0;
    let tiempoCicloMax = Math.max(2, 10 - (comprasPatas * 0.5));

    tiempoHorno--;

    if (tiempoHorno <= 0) {
      let galletasPorCiclo = 5 + (inventario[14] || 0);
      let cantMineros = inventario[8] || 0;
      let bonoMineros = ((inventario[15] || 0) > 0) ? (1 + (cantMineros * 0.10)) : 1;
      let valorGalleta = 10 * bonoMineros;

      gananciaHornoTotal = cantBakers * (galletasPorCiclo * valorGalleta);
      tiempoHorno = tiempoCicloMax; 
    }
  } else {
    tiempoHorno = 10;
  }

  // Buff de Hueso de Oro
  if (tiempoBuffHueso > 0) {
    multiplicadorHueso = 7;
    tiempoBuffHueso--;
  } else {
    multiplicadorHueso = 1;
  }

  let produccionBruta = (produccionPasiva + gananciaHornoTotal) * multiplicadorHueso * multiplicadorFondo;

  if (productorSecuestrado) {
    produccionBruta *= 0.95;
  }

  let comprasPatas = inventario[13] || 0;
  let tiempoCicloMax = Math.max(2, 10 - (comprasPatas * 0.95));
  let promedioBaker = (cantBakers > 0) ? ((5 + (inventario[14] || 0)) * 10 * cantBakers) / tiempoCicloMax : 0;
  
  let wcPorSegundoCalculado = (produccionPasiva + promedioBaker) * multiplicadorHueso * multiplicadorFondo;
  if (productorSecuestrado) wcPorSegundoCalculado *= 0.95;

  wolfichasPorSegundo = Math.max(0, wcPorSegundoCalculado - penalizacionWCS);
  wolfichas += wolfichasPorSegundo;
}

// --- SISTEMA DE CONVERSIÓN DE CURRENCY ---
function comprarWolfilletes() {
  const PRECIO_WOLFILLETE = 100000;

  // Preguntar al usuario cuántos Wolfilletes desea comprar
  let cantidadInput = prompt("¿Cuántos Wolfilletes deseas comprar?\nPrecio: 100,000 Wolfichas por 1 Wolfillete", "1");

  // Si el usuario cancela o no ingresa nada
  if (cantidadInput === null) return;

  let cantidad = parseInt(cantidadInput, 10);

  // Validaciones
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("⚠️ Por favor ingresa un número entero válido mayor a 0.");
    return;
  }

  let costoTotal = cantidad * PRECIO_WOLFILLETE;

  if (wolfichas >= costoTotal) {
    wolfichas -= costoTotal;
    wolfilletes += cantidad;

    alert(`🎉 ¡Intercambio exitoso!\nGastaste ${costoTotal.toLocaleString()} Wolfichas y obtuviste 💵 ${cantidad} Wolfillete(s).`);

    guardarJuego();
    render();
  } else {
    let faltantes = costoTotal - wolfichas;
    alert(`❌ No tienes suficientes Wolfichas.\nNecesitas ${costoTotal.toLocaleString()} WC (te faltan ${faltantes.toLocaleString()} WC).`);
  }
}

function render() {
  let diferencia = wolfichas - wolfichasAnteriores;
  actualizarContadorConEfectos(diferencia);
  wolfichasAnteriores = wolfichas;

  let inventarioEl = document.getElementById("inventario");
  if (inventarioEl) {
    inventarioEl.innerHTML = 
      `Clickers: ${inventario[3]} | Farmers: ${inventario[6]} | Mineros: ${inventario[8]} | Bakers: ${inventario[12]} | Workers: ${inventario[16]} | Streamers: ${inventario[20]} | Taxists: ${inventario[22]} | Idols: ${inventario[25]}`;
  }

  for (let i = 0; i < esMejoraUnica.length; i++) {
    let btn = document.getElementById(`btn-${i}`);
    if (btn) {
      if (esMejoraUnica[i] && inventario[i] > 0) {
        btn.disabled = true;
      } else {
        btn.disabled = wolfichas < precioProducto[i];
      }
    }
  }

  actualizarBadges();
}

function actualizarBadges() {
  let badgeUI = document.getElementById("contenedor-badges");
  if (!badgeUI) return;

  let htmlAcumulado = "";
  for (let i = 0; i < logros.length; i++) {
    let logro = logros[i];
    if (logro.condicion()) logro.completado = true;

    if (logro.completado) {
      htmlAcumulado += `<div class="logro completado"><strong>${logro.titulo}</strong><br><small>${logro.descripcion}</small></div>`;
    } else {
      htmlAcumulado += `<div class="logro bloqueado"><strong>Logro Bloqueado</strong><br><small>???</small></div>`;
    }
  }
  badgeUI.innerHTML = htmlAcumulado;
}

// --- GUARDA, CARGA Y AUTO-REPARACIÓN ---
function guardarJuego() {
  if (isNaN(wolfichas)) {
    console.error("⚠️ Se detectó NaN en vivo. Restaurando valor seguro...");
    wolfichas = 0;
  }

  let datos = {
    wolfichas: wolfichas,
    wolfichasPorClic: wolfichasPorClic,
    inventario: inventario,
    precioProducto: precioProducto,
    probCrit: probCrit,
    probSuperCrit: probSuperCrit,
    wolfichasProduce: wolfichasProduce,
    wolfilletes: wolfilletes,
    fondoEquipado: fondoEquipado,
    multiplicadorFondo: multiplicadorFondo,
    fondosComprados: fondosComprados,
    codes: {
      helloworld: helloworldUsado,
      thekitchenisopen: thekitchenisopenUsado,
      funnyfurrain: funnyfurrainUsado,
      intothemoon: intothemoonUsado,
      archivesrevealed: archivesrevealedUsado,
      freewolfycoinspls: freewolfycoinsplsUsado,
      streamtime: streamtimeUsado
    },
    logrosCompletados: logros.map(l => l.completado)
  };
  localStorage.setItem("wolfyClickerSave", JSON.stringify(datos));
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

  let datosGuardados = localStorage.getItem("wolfyClickerSave");
  if (!datosGuardados) return;

  try {
    let datos = JSON.parse(datosGuardados);

    if (isNaN(datos.wolfichas) || !Array.isArray(datos.inventario)) {
      console.warn("Save corrupto detectado. Reiniciando valores por defecto...");
      return;
    }

    wolfichas = datos.wolfichas ?? wolfichas;
    wolfichasPorClic = datos.wolfichasPorClic ?? wolfichasPorClic;
    inventario = datos.inventario ?? inventario;
    precioProducto = datos.precioProducto ?? precioProducto;
    probCrit = datos.probCrit ?? probCrit;
    probSuperCrit = datos.probSuperCrit ?? probSuperCrit;
    wolfichasProduce = datos.wolfichasProduce ?? wolfichasProduce;
    wolfilletes = datos.wolfilletes ?? wolfilletes;
    fondoEquipado = datos.fondoEquipado ?? 0;
    multiplicadorFondo = datos.multiplicadorFondo ?? 1.0;
    fondosComprados = datos.fondosComprados ?? [true, false, false];

    aplicarTemaVisual(fondoEquipado);

    if (datos.codes) {
      helloworldUsado = datos.codes.helloworld ?? false;
      thekitchenisopenUsado = datos.codes.thekitchenisopen ?? false;
      funnyfurrainUsado = datos.codes.funnyfurrain ?? false;
      intothemoonUsado = datos.codes.intothemoon ?? false;
      archivesrevealedUsado = datos.codes.archivesrevealed ?? false;
      freewolfycoinsplsUsado = datos.codes.freewolfycoinspls ?? false;
      streamtimeUsado = datos.codes.streamtime ?? false;
    }

    if (datos.logrosCompletados) {
      for (let i = 0; i < logros.length; i++) {
        if (datos.logrosCompletados[i]) logros[i].completado = true;
      }
    }
  } catch (e) {
    console.error("Error al cargar la partida:", e);
  }

  if (inventario[19] > 0) {
    mejoraGalleta.comprado = true;
    iniciarLoopGalletas();
  }
  if ((inventario[20] || 0) > 0) {
    iniciarChatStreamer();
  }
}

function ejecutarAutoreparacion() {
  localStorage.setItem("wolfyCompensacion", "true");
  localStorage.removeItem("wolfyClickerSave");
  wolfichas = 0;
  location.reload();
}

// --- HUESO DE ORO ---
function aparecerHuesoOro(esNatural = false) {
  let hueso = document.getElementById("hueso-oro");
  if (!hueso) return;

  esHuesoNatural = esNatural;

  let top = Math.floor(Math.random() * (window.innerHeight - 100));
  let left = Math.floor(Math.random() * (window.innerWidth - 100));

  hueso.style.top = top + "px";
  hueso.style.left = left + "px";
  hueso.style.display = "block";

  setTimeout(() => { hueso.style.display = "none"; }, 10000);
}

function clickHuesoOro() {
  let hueso = document.getElementById("hueso-oro");
  if (hueso) hueso.style.display = "none";

  if (esHuesoNatural) {
    let logroMito = logros.find(l => l.id === "badge-18");
    if (logroMito && !logroMito.completado) {
      logroMito.completado = true;
    }
  }

  let tipoBono = Math.random() < 0.5;

  if (tipoBono) {
    let minWC = (wolfichas < 100) ? 20 : Math.floor(wolfichas * 0.5);
    let maxWC = (wolfichas < 100) ? 50 : Math.floor(wolfichas * 1.2);
    let premio = Math.floor(Math.random() * (maxWC - minWC + 1)) + minWC;
    
    wolfichas += premio;
    alert(`¡Huesito de Oro! Has recibido +${premio.toLocaleString()} Wolfichas.`);
  } else {
    multiplicadorHueso = 7;
    tiempoBuffHueso = 15;
  }

  guardarJuego();
  render();
}

// --- EASTER EGGS DE CONSOLA ---
var helloworldUsado = false;
var thekitchenisopenUsado = false;
var funnyfurrainUsado = false;
var intothemoonUsado = false;
var archivesrevealedUsado = false;
var freewolfycoinsplsUsado = false;
var streamtimeUsado = false;

Object.defineProperty(window, 'helloworld', {
  get: function() {
    if (helloworldUsado) return "⚠️ Este código ya fue reclamado.";
    helloworldUsado = true;
    wolfichas += 100;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'helloworld' activado: +100 Wolfichas. 🐺✨";
  }
});

Object.defineProperty(window, 'goldensurprise', {
  get: function() {
    aparecerHuesoOro(false);
    return "✨ ¡Un Huesito de Oro ha aparecido en la pantalla! 🦴💛";
  }
});

Object.defineProperty(window, 'funnyfurrain', {
  get: function() {
    if (funnyfurrainUsado) return "⚠️ ¡La lluvia de pelaje ya ocurrió!";
    funnyfurrainUsado = true;
    inventario[3] = (inventario[3] || 0) + 10;
    precioProducto[3] = precioBase[3] * (1 + 0.15 * inventario[3]);
    guardarJuego();
    render();
    return "🐾 ¡Lluvia Peluda! +10 Clicker Wolfies añadidos. 🐺✨";
  }
});

Object.defineProperty(window, 'thekitchenisopen', {
  get: function() {
    if (thekitchenisopenUsado) return "⚠️ Este código ya fue reclamado.";
    thekitchenisopenUsado = true;
    wolfichas += 2000;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'thekitchenisopen' activado: +2000 Wolfichas. 🐺✨";
  }
});

Object.defineProperty(window, 'archivesrevealed', {
  get: function() {
    if (archivesrevealedUsado) return "⚠️ Este código ya fue reclamado.";
    archivesrevealedUsado = true;
    wolfichas += 30000;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'archivesrevealed' activado: +30000 Wolfichas. 🐺✨";
  }
});

Object.defineProperty(window, 'intothemoon', {
  get: function() {
    if (intothemoonUsado) return "⚠️ ¡La torre de lobitos ya llegó a la luna!";
    intothemoonUsado = true;
    inventario[3] = (inventario[3] || 0) + 1000;
    precioProducto[3] = precioBase[3] * (1 + 0.15 * inventario[3]);
    guardarJuego();
    render();
    return "🐾 ¡Hora de respirar aire lunar! +1000 Clicker Wolfies añadidos. 🐺✨";
  }
});

Object.defineProperty(window, 'freewolfycoins', {
  get: function() {
    wolfichas += 1;
    guardarJuego();
    render();
    return "🤑 ¡Felicidades! Has reclamado tu RECOMPENSA SUPREMA: +1 Wolficha. (No la gastes toda en un solo lugar 🐺🪙)";
  }
});

Object.defineProperty(window, 'freewolfycoinspls', {
  get: function() {
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

Object.defineProperty(window, 'streamtime', {
  get: function() {
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

// --- BUCLES Y EVENTOS DE INICIALIZACIÓN ---
setInterval(() => {
  if (Math.random() < 0.01) aparecerHuesoOro(true);
}, 1000);

var produceFPS = 1;
var gameFPS = 60;

setInterval(function() { producir(); }, 1000 / produceFPS);
setInterval(function() { render(); }, 1000 / gameFPS);

window.addEventListener("DOMContentLoaded", () => {
  cargarJuego();
  seleccionarCancion("swim");
  setInterval(guardarJuego, 5000);
});
