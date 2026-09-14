// --- VARIABLES GLOBALES ---
var wolfichas = 0;
var wolfichasPorClic = 1;
var multiplicadorGalleta = 1;
var duracionBuffGalleta = 0;

// Variables globales del QTE de la galleta
var clicksActuales = 0;
var clicksRequeridos = 0;
var tiempoLimiteQTE = 0;
var timerQTE = null;
var timerLoopGalleta = null;
let galletaActiva = false;
let mejoraGalleta = { comprado: false }; // FIX: Sintaxis de objeto corregida
var ultimoTiempoClick = 0;
var esSpeedrunner = true; // Rastreará si mantuviste el ritmo rápido durante todo el QTE

// Configuración de los elementos según el mapa de índices (20 elementos: 0 a 19)
// Actualiza la longitud de tus arreglos de 20 a 21 elementos (índices 0 al 20)
var esMejoraUnica = [true, true, true, false, true, false, false, true, false, true, true, true, false, false, false, true, false, true, true, true, false];
var inventario     = [0,   0,   0,   0,     0,   0,     0,   0,     0,   0,   0,   0,     0,   0,   0,   0,     0,   0,   0,   0,     0];
var wolfichasProduce = [0,  0,   0,   0.1,   0,   0,     1,   0,     5,   0,   0,   0,     0,   0,   0,   0,     50,  0,   0,   0,     200]; 

var precioBase     = [50,  750,  5500, 10,    500,  200,   150,  500,   800,  2000, 3000, 2500, 2000, 5000, 10000, 15000, 30000, 40000, 65000, 9999, 120000];
var precioProducto = [50,  750,  5500, 10,    500,  200,   150,  500,   800,  2000, 3000, 2500, 2000, 5000, 10000, 15000, 30000, 40000, 65000, 9999, 120000];

var probCrit = 0;
var probSuperCrit = 0;
var tiempoHorno = 10; 
var gananciaUltimaHorneada = 0; 
var wolfichasPorSegundo = 0;

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
  { id: "badge-18", titulo: "Mito Confirmado", descripcion: "Encuentra y atrapa un Huesito de Oro de forma natural", condicion: function() { return true; }, completado: false },
  { id: "badge-19", titulo: "Olor Creciente A Papel", descripcion: "Será comestible?, quien sabe. Contrata 1 Worker Wolfy y sube tus stonks", condicion: function() { return (inventario[16] || 0) >= 1; }, completado: false },
  // --- LOGROS ESPECIALES DE LA GALLETA CROCANTE ---
  { 
    id: "badge-20", 
    titulo: "Comegalletas Speedrunner", 
    descripcion: "Haz todos los clics de la galleta con un intervalo inferior a 0.7s por clic", 
    condicion: function() { return false; }, // Se activa manualmente al ganar el QTE rápido
    completado: false 
  },
  { 
    id: "badge-21", 
    titulo: "Comida Tramposa", 
    descripcion: "¡¡QUÉ CERCA!! Cómete una galleta con menos de 2s sobrantes", 
    condicion: function() { return false; }, // Se activa manualmente al ganar al límite
    completado: false 
  }
];  

function clic() {
  let bonoCooperacion = 0;
  if (inventario[10] > 0) {
    bonoCooperacion = inventario[3] * 0.1;
  }
  wolfichas += wolfichasPorClic + bonoCooperacion;
  guardarJuego();
}

function comprar(objeto) {
  // 1. Si es única y ya se tiene en inventario, no hacer nada
  if (esMejoraUnica[objeto] && inventario[objeto] > 0) return;

  // 2. Verificar si alcanza el dinero
  if (wolfichas >= precioProducto[objeto]) {
    wolfichas -= precioProducto[objeto];
    inventario[objeto]++;

    // Aplicar efectos según el objeto
    if (objeto <= 2) wolfichasPorClic *= 2;
    if (objeto === 4) probCrit = 15;
    if (objeto === 5) wolfichasProduce[3] += 0.1;
    if (objeto === 7) wolfichasProduce[6] *= 2;
    if (objeto === 9) wolfichasProduce[8] *= 2;

    if (objeto === 13 && (inventario[13] || 0) >= 16) {
      alert("¡Tus patitas ya no pueden amasar más rápido! (Mínimo de 2s alcanzado)");
      return;
    }

    if (objeto === 17) wolfichasProduce[16] *= 2;
    if (objeto === 18) wolfichasProduce[16] *= 2;

    // Efecto de la Galleta (Objeto 19)
    if (objeto === 19) {
      mejoraGalleta.comprado = true;
      if (typeof iniciarLoopGalletas === "function") {
        iniciarLoopGalletas();
      }
      if (typeof aparecerGalletitaCrocante === "function") {
        aparecerGalletitaCrocante();
      }
    }

    if (objeto === 20 && inventario[20] === 1) {
  iniciarChatStreamer();
}
    
    // Actualizar precio si no es única
    if (!esMejoraUnica[objeto]) {
      precioProducto[objeto] = precioBase[objeto] * (1 + 0.15 * inventario[objeto]);
    }

    guardarJuego();
    render();
  }
}

function girarRuleta() {
  let dado = Math.random() * 100;
  if (dado < probSuperCrit) return 10;
  if (dado < probCrit)      return 2;
  return 1;
}

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
  clicksRequeridos = Math.floor(Math.random() * 5) + 3; // 3 a 7 clics
  tiempoLimiteQTE = Math.floor(Math.random() * 9) + 7;   // 7 a 15 segundos

  let cookieElement = document.getElementById("galleta-crocante");
  if (!cookieElement) {
    cookieElement = document.createElement("img");
    cookieElement.id = "galleta-crocante";
    cookieElement.src = "imagenes-wolfy/plain_cookie.png";
    cookieElement.alt = "Galletita Crocante";
    cookieElement.style.position = "absolute";
    cookieElement.style.cursor = "pointer";
    cookieElement.style.zIndex = "9999";
    cookieElement.style.width = "75px";
    cookieElement.onclick = clickGalletita;
    document.body.appendChild(cookieElement);
  }

  // 🍪 CREAR O REUTILIZAR EL ELEMENTO DE TEXTO DEL QTE
  let qteInfo = document.getElementById("qte-info");
  if (!qteInfo) {
    qteInfo = document.createElement("div");
    qteInfo.id = "qte-info";
    qteInfo.style.position = "absolute";
    qteInfo.style.zIndex = "10000";
    qteInfo.style.fontWeight = "bold";
    qteInfo.style.color = "#ffffff";
    qteInfo.style.fontSize = "16px";
    qteInfo.style.textShadow = "2px 2px 4px #000000, -1px -1px 0 #000";
    qteInfo.style.pointerEvents = "none"; // Evita interferir con los clics
    qteInfo.style.textAlign = "center";
    document.body.appendChild(qteInfo);
  }

  // Posicionar galleta y texto aleatoriamente
  let topPos = Math.floor(Math.random() * 60 + 15);
  let leftPos = Math.floor(Math.random() * 60 + 15);

  cookieElement.style.top = topPos + "%";
  cookieElement.style.left = leftPos + "%";
  cookieElement.style.display = "block";

  qteInfo.style.top = (topPos - 5) + "%";
  qteInfo.style.left = leftPos + "%";
  qteInfo.style.display = "block";
  qteInfo.innerHTML = `🍪 Faltan: ${clicksRequeridos - clicksActuales}<br>⏱️ ${tiempoLimiteQTE.toFixed(1)}s`;

  // Temporizador de actualización rápida
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

  // Si pasaron más de 0.7s desde el último clic (después del primero), pierde el speedrun
  if (clicksActuales > 0 && tiempoEntreClicks > 0.7) {
    esSpeedrunner = false;
  }

  clicksActuales++;
  let qteInfo = document.getElementById("qte-info");

  // Actualización inmediata al hacer clic
  if (qteInfo) {
    let faltantes = clicksRequeridos - clicksActuales;
    let tiempoMostrar = Math.max(0, tiempoLimiteQTE).toFixed(1);
    qteInfo.innerHTML = `🍪 Faltan: ${faltantes}<br>⏱️ ${tiempoMostrar}s`;
  }

  // Verificar si se completó el desafío
  if (clicksActuales >= clicksRequeridos) {
    let tiempoGanado = Math.floor(tiempoLimiteQTE);
    let tiempoRestanteExacto = tiempoLimiteQTE;

    ocultarGalleta();

    duracionBuffGalleta = 10 + tiempoGanado; 
    multiplicadorGalleta = 1.5; 

    let timerBuff = setInterval(() => {
      duracionBuffGalleta--;
      if (duracionBuffGalleta <= 0) {
        multiplicadorGalleta = 1;
        clearInterval(timerBuff);
      }
    }, 1000);

    // 🏆 EVALUACIÓN DE LOS NUEVOS LOGROS
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
 // 💬 MENSAJE PERSONALIZADO SEGÚN EL TIEMPO RESTANTE
    if (tiempoRestanteExacto <= 3.0) {
  alert(`¡Esa galleta casi se nos arranca! 🍪💥 Pero lo logramos. ¡Multiplicador x1.5 activo por ${10 + tiempoGanado}s!`);
} else {
  alert(`¡Nuestros lobitos se comieron la galleta a tiempo! 🍪 Multiplicador x1.5 activo por ${10 + tiempoGanado}s.`);
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

// --- SISTEMA DE CHAT DE STREAMER WOLFY ---
var timerChatStreamer = null;

var comentariosPositivos = [
  "¿Cómo se llama el juego? ¡¡Me encanta!!",
  "¡Wolfy Go Studio nunca decepciona! 🔥",
  "¡Esas mecánicas están 10/10!",
  "¡DONACIÓN EN CAMINO! 🪙✨",
  "¡Juegazo supremo!"
];

var comentariosNegativos = [
  "Qué aburrido, grrrrr 😡",
  "Meh, prefiero jugar a perseguir la pelota 🥎",
  "Mucho lag en la transmisión 🔌",
  "¡Hater en el chat detectado!"
];

function iniciarChatStreamer() {
  if (timerChatStreamer) clearInterval(timerChatStreamer);
  
  // Cada 20 segundos hay probabilidad de que aparezca un comentario si tienes al menos 1 Streamer
  timerChatStreamer = setInterval(() => {
    if ((inventario[20] || 0) > 0 && Math.random() < 0.40) {
      generarComentarioChat();
    }
  }, 20000);
}

function generarComentarioChat() {
  let esNegativo = Math.random() < 0.30; // 30% de probabilidad de comentario Hater
  let texto = esNegativo 
    ? comentariosNegativos[Math.floor(Math.random() * comentariosNegativos.length)]
    : comentariosPositivos[Math.floor(Math.random() * comentariosPositivos.length)];

  let chatBox = document.createElement("div");
  chatBox.className = esNegativo ? "chat-stream hater" : "chat-stream vip";
  chatBox.innerHTML = `💬 <strong>Chat:</strong> "${texto}"`;
  
  // Posición aleatoria en pantalla
  let topPos = Math.floor(Math.random() * 60 + 20);
  let leftPos = Math.floor(Math.random() * 60 + 10);
  
  chatBox.style.position = "absolute";
  chatBox.style.top = topPos + "%";
  chatBox.style.left = leftPos + "%";
  chatBox.style.padding = "10px 15px";
  chatBox.style.borderRadius = "8px";
  chatBox.style.cursor = "pointer";
  chatBox.style.zIndex = "10000";
  chatBox.style.fontWeight = "bold";
  chatBox.style.boxShadow = "0px 4px 8px rgba(0,0,0,0.3)";
  chatBox.style.backgroundColor = esNegativo ? "#ff4d4d" : "#4caf50";
  chatBox.style.color = "#ffffff";

  let timerDesaparicion = setTimeout(() => {
    // Si pasaron los 7s sin hacer nada:
    if (document.body.contains(chatBox)) {
      document.body.removeChild(chatBox);
      // El comentario positivo expira sin pena ni gloria, el hater desaparece sin daño
    }
  }, 7000);

  chatBox.onclick = function() {
    clearTimeout(timerDesaparicion);
    if (document.body.contains(chatBox)) {
      document.body.removeChild(chatBox);
    }

    if (esNegativo) {
      // Si le haces clic a un Hater, pierdes 200 WC
      let perdida = Math.min(wolfichas, 200);
      wolfichas -= perdida;
      alert(`❌ ¡Le diste atención al Hater! Perdiste ${perdida} Wolfichas.`);
    } else {
      // Premio positivo entre 200 y 1000 WC (números aleatorios exactos)
      let premio = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
      wolfichas += premio;
      alert(`🎉 ¡Comentario moderado a tiempo! Ganaste +${premio} Wolfichas de donación.`);
    }
    
    guardarJuego();
    render();
  };

  document.body.appendChild(chatBox);
}

function producir() {
  let totalClickers = (inventario[3] || 0) * wolfichasProduce[3];
  let totalFarmers  = (inventario[6] || 0) * wolfichasProduce[6];
  let totalMiners   = (inventario[8] || 0) * wolfichasProduce[8];
  let totalWorkers  = (inventario[16] || 0) * wolfichasProduce[16];
let totalStreamers = (inventario[20] || 0) * wolfichasProduce[20];
let produccionPasiva = (totalClickers + totalFarmers + totalMiners + totalWorkers + totalStreamers) * multiplicadorGalleta;
  
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

  let multiplicador = 1;
  if (tiempoBuffHueso > 0) {
    multiplicador = 7;
    tiempoBuffHueso--;
  }

  wolfichas += (produccionPasiva + gananciaHornoTotal) * multiplicador;

  let comprasPatas = inventario[13] || 0;
  let tiempoCicloMax = Math.max(2, 10 - (comprasPatas * 0.5));
  let promedioBaker = (cantBakers > 0) ? ((5 + (inventario[14] || 0)) * 10 * cantBakers) / tiempoCicloMax : 0;
  
  wolfichasPorSegundo = (produccionPasiva + promedioBaker) * multiplicador;
}

function render() {
  let limpio = Math.round(wolfichas * 100) / 100;
  let wolfichasMostrar = (limpio % 1 === 0) ? limpio : limpio.toFixed(2);

  let contadorEl = document.getElementById("contador");
  if (contadorEl) {
    contadorEl.innerHTML = `${wolfichasMostrar} Wolfichas <br><small>(${wolfichasPorSegundo.toFixed(1)} WC/s)</small>`;
  }

  let inventarioEl = document.getElementById("inventario");
  if (inventarioEl) {
    inventarioEl.innerHTML = 
      `Clickers: ${inventario[3]} | Farmers: ${inventario[6]} | Mineros: ${inventario[8]} | Bakers: ${inventario[12]} | Workers: ${inventario[16]}`;
  }

  for (let i = 0; i < esMejoraUnica.length; i++) {
    if (esMejoraUnica[i] && inventario[i] > 0) {
      let btn = document.getElementById(`btn-${i}`);
      if (btn) btn.disabled = true;
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

function guardarJuego() {
  let datos = {
    wolfichas: wolfichas,
    wolfichasPorClic: wolfichasPorClic,
    inventario: inventario,
    precioProducto: precioProducto,
    probCrit: probCrit,
    probSuperCrit: probSuperCrit,
    wolfichasProduce: wolfichasProduce,
    logrosCompletados: logros.map(l => l.completado)
  };
  localStorage.setItem("wolfyClickerSave", JSON.stringify(datos));
}

function cargarJuego() {
  let datosGuardados = localStorage.getItem("wolfyClickerSave");
  if (!datosGuardados) return;

  try {
    let datos = JSON.parse(datosGuardados);
    wolfichas = datos.wolfichas ?? wolfichas;
    wolfichasPorClic = datos.wolfichasPorClic ?? wolfichasPorClic;
    inventario = datos.inventario ?? inventario;
    precioProducto = datos.precioProducto ?? precioProducto;
    probCrit = datos.probCrit ?? probCrit;
    probSuperCrit = datos.probSuperCrit ?? probSuperCrit;
    wolfichasProduce = datos.wolfichasProduce ?? wolfichasProduce;

    if (datos.logrosCompletados) {
      for (let i = 0; i < logros.length; i++) {
        if (datos.logrosCompletados[i]) logros[i].completado = true;
      }
    }
  } catch (e) {
    console.error("Error al cargar la partida guardada", e);
  }

  if (inventario[19] > 0) {
    mejoraGalleta.comprado = true;
    iniciarLoopGalletas();
  }
  if ((inventario[20] || 0) > 0) {
  iniciarChatStreamer();
}
}

cargarJuego();
setInterval(guardarJuego, 5000);

var multiplicadorHueso = 1;
var tiempoBuffHueso = 0;
var esHuesoNatural = false;

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

setInterval(() => {
  if (Math.random() < 0.01) aparecerHuesoOro(true);
}, 1000);

var produceFPS = 1;
var gameFPS = 60;

setInterval(function(){ producir(); }, 1000/produceFPS);
setInterval(function(){ render(); }, 1000/gameFPS);

// --- EASTER EGGS DE CONSOLA ---
var helloworldUsado = false;
var thekitchenisopenUsado = false;
var funnyfurrainUsado = false;
var intothemoonUsado = false;
var archivesrevealedUsado = false;

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

// --- EASTER EGG TROLL: FREE WOLFY COINS ---
Object.defineProperty(window, 'freewolfycoins', {
  get: function() {
    wolfichas += 1;
    guardarJuego();
    render();
    return "🤑 ¡Felicidades! Has reclamado tu RECOMPENSA SUPREMA: +1 Wolficha. (No la gastes toda en un solo lugar 🐺🪙)";
  }
});

// --- EASTER EGG: FREE WOLFY COINS PLS ---
var freewolfycoinsplsUsado = false;

Object.defineProperty(window, 'freewolfycoinspls', {
  get: function() {
    if (freewolfycoinsplsUsado) return "⚠️ Las buenas costumbres se aprecian, pero este regalo es de un solo uso.";
    
    freewolfycoinsplsUsado = true;
    wolfichas += 10000;
    inventario[6] = (inventario[6] || 0) + 2; // +2 Farmers
    inventario[8] = (inventario[8] || 0) + 1; // +1 Miner
    
    // Recalcular precios de los edificios regalados
    precioProducto[6] = precioBase[6] * (1 + 0.15 * inventario[6]);
    precioProducto[8] = precioBase[8] * (1 + 0.15 * inventario[8]);
    
    guardarJuego();
    render();
    
    return "✨ ¡Pedir 'por favor' siempre funciona! Recompensa VIP reclamada: +10,000 Wolfichas, +2 Farmers y +1 Miner. 🐺🎁";
  }
});

var streamtimeUsado = false;

Object.defineProperty(window, 'streamtime', {
  get: function() {
    if (streamtimeUsado) return "⚠️ El stream ya empezó, haz un archivo nuevo para reiniciarlo";
    
    streamtimeusado = true;
    inventario[20] = 1;
    
    // Recalcular precios de los edificios regalados
    precioProducto[20] = precioBase[20] * (1 + 0.15 * inventario[20]);
    
    guardarJuego();
    render();
    
    return "✨ ¡preparen sus palomitas, que el stream 24/7 empezó!. +1 streamer wolfy 🐺🎁";
  }
});
