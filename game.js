// --- VARIABLES GLOBALES ---
var wolfichas = 0;
var wolfichasAnteriores = 0;
var wolfichasPorClic = 1;
var multiplicadorGalleta = 1;
var duracionBuffGalleta = 0;
var wolfilletes = 0;

// Sistema de Fondos y Colores (Actualización 2.0)
var fondoEquipado = 0;
var multiplicadorFondo = 1.0; 
var fondosComprados = [true, false, false];

const catalogoFondos = [
  { nombre: "Default", multiplicador: 1.0, costo: 0, color: "#ffffff", colorBoton: "#ffffff", colorTexto: "#222222" },
  { nombre: "Calma Verdosa", multiplicador: 1.2, costo: 10, color: "#e8f5e9", colorBoton: "#a5d6a7", colorTexto: "#1b5e20" },
  { nombre: "Amarillo Energético", multiplicador: 1.5, costo: 25, color: "#fffde7", colorBoton: "#fff59d", colorTexto: "#f57f17" }
];

// Buffs de Hueso
var multiplicadorHueso = 1;
var tiempoBuffHueso = 0;
var esHuesoNatural = false;

// Variables globales del QTE de la galleta
var clicksActuales = 0;
var clicksRequeridos = 0;
var tiempoLimiteQTE = 0;
var timerQTE = null;
var timerLoopGalleta = null;
let galletaActiva = false;
let mejoraGalleta = { comprado: false };
var ultimoTiempoClick = 0;
var esSpeedrunner = true;

// Configuración de elementos
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
var vistaActual = 0;

// SISTEMA RITMO IDOL WOLFY (4 CARRILES CON TECLAS A, S, D, F)
var mapaCanciones = {
  swim: {
    archivo: "musica/swim.mp3",
    // Formato: { tiempo: en segundos, carril: 0 a 3 }
    mapaNotas: [
      { tiempo: 1.2, carril: 0 }, { tiempo: 2.0, carril: 1 },
      { tiempo: 2.8, carril: 2 }, { tiempo: 3.5, carril: 3 },
      { tiempo: 4.5, carril: 1 }, { tiempo: 5.5, carril: 0 },
      { tiempo: 6.8, carril: 2 }, { tiempo: 8.0, carril: 3 },
      { tiempo: 9.5, carril: 1 }, { tiempo: 11.0, carril: 0 },
      { tiempo: 12.5, carril: 2 }, { tiempo: 14.0, carril: 3 }
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

// Mapa de teclas asignadas por índice de carril
const teclasCarriles = {
  'a': 0, 'A': 0,
  's': 1, 'S': 1,
  'd': 2, 'D': 2,
  'f': 3, 'F': 3
};

var logros = [
  { id: "badge-1", titulo: "Primer Ahorro", descripcion: "Ten 100 Wolfichas Ahorradas", condicion: function() { return wolfichas >= 100; }, completado: false },
  { id: "badge-2", titulo: "Alcancía Llena", descripcion: "Ten 500 Wolfichas Ahorradas", condicion: function() { return wolfichas >= 500; }, completado: false },
  { id: "badge-3", titulo: "Woof!!", descripcion: "Contrata 1 Clicker Wolfy", condicion: function() { return inventario[3] >= 1; }, completado: false }
];  

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

    guardarJuego();
    render();
  }
}

// --- MINIJUEGO RITMO IDOL WOLFY (4 CARRILES Y TECLADO) ---
function seleccionarCancion(clave) {
  cancionSeleccionada = clave;
  let audio = document.getElementById("audio-player");
  if (audio) {
    audio.src = mapaCanciones[clave].archivo;
  }
}

// --- VARIABLES ADICIONALES PARA EL CONTROL DE PAUSA Y DELAY ---
var timeoutInicioAudio = null;
var tiempoDelayRestante = 0;
var timestampInicioDelay = 0;
var juegoPausado = false; // Estado para frenar la animación de las notas

// 1. INICIAR CANCIÓN CON DELAY DE 3 SEGUNDOS
// --- VARIABLES DEL MINIJUEGO DE RITMO CON PAUSA EXACTA ---
var timeoutInicioAudio = null;
var tiempoDelayRestante = 0;
var timestampInicioDelay = 0;
var juegoPausado = false;
var enPeriodoDelay = false;

// 1. INICIAR CANCIÓN (3s DELAY)
function iniciarCancionRitmo() {
  if ((inventario[25] || 0) <= 0) {
    alert("🎤 ¡Necesitas contratar al menos 1 Idol Wolfy en la tienda para jugar!");
    return;
  }

  let audio = document.getElementById("audio-player");
  if (!audio) return;

  // Limpiar estados y timeouts
  if (timeoutInicioAudio) clearTimeout(timeoutInicioAudio);
  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  
  juegoPausado = false;
  enPeriodoDelay = true;

  document.querySelectorAll('.nota-ritmo').forEach(n => n.remove());

  audio.pause();
  audio.src = mapaCanciones[cancionSeleccionada].archivo;
  audio.currentTime = 0;

  notasActivas = mapaCanciones[cancionSeleccionada].mapaNotas.map(nota => ({
    tiempo: nota.tiempo,
    carril: nota.carril,
    impactado: false,
    elementoHTML: null
  }));

  puntajeRitmo = 0;
  tiempoDelayRestante = 3.0;
  timestampInicioDelay = Date.now();

  actualizarFeedbackRitmo("⏳ Preparado... 3.0s");

  actualizarBucleRitmo();

  timeoutInicioAudio = setTimeout(() => {
    if (!juegoPausado) {
      enPeriodoDelay = false;
      audio.play().catch(e => console.log("Audio en reproducción o sin archivo local."));
      actualizarFeedbackRitmo("🎶 ¡A JUGAR!");
    }
  }, 3000);
}

// 2. BUCLE DE ANIMACIÓN
function actualizarBucleRitmo() {
  if (juegoPausado) return; // Si está en pausa, NO ejecuta nada y congela la pantalla

  let audio = document.getElementById("audio-player");
  let tActual = 0;

  if (audio) {
    if (enPeriodoDelay) {
      let transcurrido = (Date.now() - timestampInicioDelay) / 1000;
      tiempoDelayRestante = Math.max(0, 3.0 - transcurrido);
      tActual = transcurrido - 3.0; // tActual va de -3.0 a 0.0
      
      if (tiempoDelayRestante > 0) {
        actualizarFeedbackRitmo(`⏳ Preparado... ${tiempoDelayRestante.toFixed(1)}s`);
      }
    } else {
      tActual = audio.currentTime;
    }

    notasActivas.forEach(nota => {
      let diferencia = nota.tiempo - tActual;

      if (diferencia <= 2.0 && diferencia >= -0.3 && !nota.impactado) {
        if (!nota.elementoHTML) {
          let carrilElem = document.getElementById(`carril-${nota.carril}`);
          if (carrilElem) {
            let el = document.createElement("div");
            el.className = "nota-ritmo";
            carrilElem.appendChild(el);
            nota.elementoHTML = el;
          }
        }

        let porcentajePos = (1 - (diferencia / 2.0)) * 160;
        if (nota.elementoHTML) {
          nota.elementoHTML.style.top = porcentajePos + "px";
        }
      } else if (diferencia < -0.3 && nota.elementoHTML) {
        nota.elementoHTML.remove();
        nota.elementoHTML = null;
      }
    });
  }

  loopRitmoFrame = requestAnimationFrame(actualizarBucleRitmo);
}

// 3. ⏸️ PAUSAR (CONGELAMIENTO INMEDIATO)
function pausarCancionRitmo() {
  if (juegoPausado) return;

  juegoPausado = true;
  let audio = document.getElementById("audio-player");

  if (enPeriodoDelay) {
    // Si pausamos durante la cuenta regresiva, guardamos exactamente cuánto tiempo quedaba
    let transcurrido = (Date.now() - timestampInicioDelay) / 1000;
    tiempoDelayRestante = Math.max(0, 3.0 - transcurrido);
    if (timeoutInicioAudio) clearTimeout(timeoutInicioAudio);
  } else if (audio && !audio.paused) {
    audio.pause();
  }

  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  actualizarFeedbackRitmo("Juego en Pausa ⏸️");
}

// 4. ▶️ CONTINUAR (REANUDACIÓN SIN LUZ VERDE DE ESPERA)
function continuarCancionRitmo() {
  if (!juegoPausado) return;

  juegoPausado = false;
  let audio = document.getElementById("audio-player");

  if (enPeriodoDelay) {
    // Reanudamos el conteo regresivo desde el punto exacto donde se pausó
    timestampInicioDelay = Date.now() - ((3.0 - tiempoDelayRestante) * 1000);
    timeoutInicioAudio = setTimeout(() => {
      if (!juegoPausado) {
        enPeriodoDelay = false;
        audio.play().catch(e => console.log("Error al reanudar audio."));
        actualizarFeedbackRitmo("🎶 ¡A JUGAR!");
      }
    }, tiempoDelayRestante * 1000);
  } else if (audio && audio.currentTime > 0) {
    audio.play().catch(e => console.log("Error al reanudar audio."));
    actualizarFeedbackRitmo("Reanudado ▶️");
  }

  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);
  actualizarBucleRitmo();
}

// 5. 🔄 RESET
function reiniciarCancionRitmo() {
  juegoPausado = false;
  enPeriodoDelay = false;
  
  let audio = document.getElementById("audio-player");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  if (timeoutInicioAudio) clearTimeout(timeoutInicioAudio);
  if (loopRitmoFrame) cancelAnimationFrame(loopRitmoFrame);

  tiempoDelayRestante = 0;

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
      if (diff <= 0.35) { // Ventana de acierto
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

// --- FONDOS Y TEMA ---
function aplicarTemaVisual(indexFondo) {
  document.body.classList.remove('tema-default', 'tema-verde', 'tema-amarillo');
  if (indexFondo === 1) document.body.classList.add('tema-verde');
  else if (indexFondo === 2) document.body.classList.add('tema-amarillo');
  else document.body.classList.add('tema-default');
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

// --- SISTEMA DE GALLETA CROCANTE (QTE) ---
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
  "¡DONACIÓN EN CAMINO! 🪙✨"
];

var comentariosNegativos = [
  "Qué aburrido, grrrrr 😡",
  "Mucho lag en la transmisión 🔌",
  "¡Hater en el chat detectado!"
];

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

  chatBox.innerHTML = `<div>💬 <strong>Chat:</strong> "${texto}"</div>`;
  contenedorChat.appendChild(chatBox);
}

function generarComentarioEspecial() {
  let contenedorChat = document.getElementById("comentarios-chat");
  if (!contenedorChat) return;

  let chatBox = document.createElement("div");
  chatBox.className = "chat-stream arcoiris";
  chatBox.innerHTML = `🌟 <strong>SUPER FANÁTICO:</strong> "¡Wolfy Clicker es el mejor juego!"`;
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

function producir() {
  let totalClickers   = (inventario[3] || 0) * wolfichasProduce[3];
  let totalFarmers    = (inventario[6] || 0) * wolfichasProduce[6];
  let totalMiners     = (inventario[8] || 0) * wolfichasProduce[8];
  let totalWorkers    = (inventario[16] || 0) * wolfichasProduce[16];
  let totalStreamers  = (inventario[20] || 0) * wolfichasProduce[20];
  let totalTaxists    = (inventario[22] || 0) * wolfichasProduce[22];
  let totalIdols      = (inventario[25] || 0) * wolfichasProduce[25];

  let produccionPasiva = (totalClickers + totalFarmers + totalMiners + totalWorkers + totalStreamers + totalTaxists + totalIdols) * multiplicadorGalleta;

  wolfichasPorSegundo = produccionPasiva * multiplicadorHueso * multiplicadorFondo;
  wolfichas += wolfichasPorSegundo;
}

function render() {
  let contadorEl = document.getElementById("contador");
  let subContadorEl = document.getElementById("sub-contador");

  if (contadorEl) {
    contadorEl.innerText = `${wolfichas.toFixed(1)} Wolfichas`;
  }
  if (subContadorEl) {
    subContadorEl.innerText = `${wolfichasPorSegundo.toFixed(1)} WC/s | Wolfilletes: ${wolfilletes} 💵`;
  }

  let inventarioEl = document.getElementById("inventario");
  if (inventarioEl) {
    inventarioEl.innerHTML = 
      `Clickers: ${inventario[3]} | Farmers: ${inventario[6]} | Mineros: ${inventario[8]} | Idols: ${inventario[25]}`;
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
}

// --- SAVE Y LOAD ---
function guardarJuego() {
  let datos = {
    wolfichas: wolfichas,
    inventario: inventario,
    precioProducto: precioProducto,
    wolfilletes: wolfilletes,
    fondoEquipado: fondoEquipado,
    multiplicadorFondo: multiplicadorFondo,
    fondosComprados: fondosComprados
  };
  localStorage.setItem("wolfyClickerSave", JSON.stringify(datos));
}

function cargarJuego() {
  let datosGuardados = localStorage.getItem("wolfyClickerSave");
  if (!datosGuardados) return;

  try {
    let datos = JSON.parse(datosGuardados);
    wolfichas = datos.wolfichas ?? wolfichas;
    inventario = datos.inventario ?? inventario;
    precioProducto = datos.precioProducto ?? precioProducto;
    wolfilletes = datos.wolfilletes ?? wolfilletes;
    fondoEquipado = datos.fondoEquipado ?? 0;
    multiplicadorFondo = datos.multiplicadorFondo ?? 1.0;
    fondosComprados = datos.fondosComprados ?? [true, false, false];
  } catch (e) {
    console.error("Error al cargar la partida:", e);
  }
}

function clickHuesoOro() {
  let hueso = document.getElementById("hueso-oro");
  if (hueso) hueso.style.display = "none";
  wolfichas += 500;
  guardarJuego();
  render();
}

// Ciclos de Juego
setInterval(producir, 1000);
setInterval(render, 1000 / 60);

window.addEventListener("DOMContentLoaded", () => {
  cargarJuego();
  seleccionarCancion("swim");
  setInterval(guardarJuego, 5000);
});
