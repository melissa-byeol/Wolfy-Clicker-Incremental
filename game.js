var wolfichas = 0;
var wolfichasPorClic = 1;

// Configuración de los 12 elementos según el mapa de índices
var esMejoraUnica = [true, true, true, false, true, false, false, true, false, true, true, true, false, false, false, true, false, true, true, true];
var inventario     = [0,    0,    0,    0,     0,    0,     0,    0,     0,    0,    0,    0,     0,    0,    0,    0,     0,    0,    0,    0];
var wolfichasProduce = [0,  0,    0,    0.1,   0,    0,     1,    0,     5,    0,    0,    0,     0,    0,    0,    0,     50,    0,     0,    0]; 

var precioBase     = [50,  750,  5500, 10,    500,  200,   150,  500,   800,  2000, 3000, 2500, 2000, 5000, 10000, 15000, 30000, 40000, 65000, 9999];
var precioProducto = [50,  750,  5500, 10,    500,  200,   150,  500,   800,  2000, 3000, 2500, 2000, 5000, 10000, 15000, 30000, 40000, 65000, 9999];

var probCrit = 0;
var probSuperCrit = 0;

var tiempoHorno = 10; // Tiempo restante del ciclo actual (en segundos)
var gananciaUltimaHorneada = 0; // Para mostrar en la interfaz si deseas
let galletaActiva = false
let mejoraGalleta = false
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

  // --- FAMILIA MINER WOLFY ---
  { id: "badge-14", titulo: "Trabajo Duro", descripcion: "Contrata 1 Miner Wolfy", condicion: function() { return (inventario[8] || 0) >= 1; }, completado: false },
  { id: "badge-15", titulo: "Mine Pero Sin Craft", descripcion: "Contrata 5 Miner Wolfies", condicion: function() { return (inventario[8] || 0) >= 5; }, completado: false },
  { id: "badge-16", titulo: "¡¿Y los Diamantes?!", descripcion: "Contrata 25 Miner Wolfies", condicion: function() { return (inventario[8] || 0) >= 25; }, completado: false },
{ 
  id: "badge-17", 
  titulo: "Pastelería Lupina", 
  descripcion: "Pastelería a lo lupino, todo amasado a patita... ejem, disculpa. Contrata 1 Baker Wolfy.", 
  condicion: function() { return (inventario[12] || 0) >= 1; }, 
  completado: false 
},
{ id: "badge-18",  titulo: "Mito Confirmado",  descripcion: "Encuentra y atrapa un Huesito de Oro de forma natural",  condicion: function() { return false; }, completado: false },
  { id: "badge-19", titulo: "Olor Creciente A Papel", descripcion: "Será comestible?, quien sabe. Contrata 1 Worker Wolfy y sube tus stonks", condicion: function() { return (inventario[16] || 0) >= 1; }, completado: false} ];  

function clic() {
  let bonoCooperacion = 0;
  // Índice 10: Cooperación Pata-mano
  if (inventario[10] > 0) {
    bonoCooperacion = inventario[3] * 0.1;
  }
  wolfichas += wolfichasPorClic + bonoCooperacion;
  guardarJuego();
}

function comprar(objeto) {
  if (esMejoraUnica[objeto] && inventario[objeto] > 0) return;

  if (wolfichas >= precioProducto[objeto]) {
    inventario[objeto]++;
    wolfichas -= precioProducto[objeto];
 
    if (objeto <= 2) {
      wolfichasPorClic *= 2;
    }

    if (objeto === 4) {
      probCrit = 15;
    }

    if (objeto === 5) {
      wolfichasProduce[3] += 0.1;
    }

    if (objeto === 7) {
      wolfichasProduce[6] *= 2; // Mejor Calidad de Hoz duplica a Farmer Wolfy
    }

    if (objeto === 9) {
      wolfichasProduce[8] *= 2; // Picos Reforzados duplica a Miner Wolfy
    }


    if (objeto === 13 && (inventario[13] || 0) >= 16) {
    alert("¡Tus patitas ya no pueden amasar más rápido! (Mínimo de 2s alcanzado)");
    return;
  }

    if (objeto === 17 ) {
      wolfichasProduce[16] *= 2; // Picos Reforzados duplica a Miner Wolfy
    }

    if (objeto === 18 ) {
      wolfichasProduce[16] *= 2; // Picos Reforzados duplica a Miner Wolfy
    }

    if (objeto === 19 ) {
      iniciarLoopGalletas();
    }
    
    if (!esMejoraUnica[objeto]) {
      precioProducto[objeto] = precioBase[objeto] * (1 + 0.15 * inventario[objeto]);
    }

    guardarJuego();
  }
}

function girarRuleta() {
  let dado = Math.random() * 100;
  if (dado < probSuperCrit) return 10;
  if (dado < probCrit)      return 2;
  return 1;
}

var wolfichasPorSegundo = 0;

// Asegúrate de que esta variable esté declarada AFUERA de las funciones
var tiempoHorno = 10; 

// Bucle para spawnear la galleta solo si está comprada
function iniciarLoopGalletas() {
  setInterval(() => {
    // Ejemplo: 20% de probabilidad cada 30 segundos si la mejora fue comprada
    if (mejoraGalleta.comprado && !galletaActiva && Math.random() < 0.20) {
      aparecerGalletitaCrocante();
    }
  }, 30000);
}

function aparecerGalletitaCrocante() {
  galletaActiva = true;
  clicksActuales = 0;
  clicksRequeridos = Math.floor(Math.random() * (7 - 3 + 1)) + 3;
  tiempoLimiteQTE = Math.floor(Math.random() * (15 - 7 + 1)) + 7;

  // Insertar o mostrar el elemento en el DOM usando la imagen
  let cookieElement = document.getElementById("galleta-qte");
  if (!cookieElement) {
    cookieElement = document.createElement("img");
    cookieElement.id = "galleta-crocante";
    cookieElement.src = "plain_cookie.png";
    cookieElement.alt = "Galletita Crocante";
    cookieElement.style.position = "absolute";
    cookieElement.style.cursor = "pointer";
    cookieElement.onclick = clickGalletita;
    document.body.appendChild(cookieElement);
  }

  // Posicionamiento aleatorio en pantalla
  cookieElement.style.top = Math.floor(Math.random() * 70 + 15) + "%";
  cookieElement.style.left = Math.floor(Math.random() * 70 + 15) + "%";
  cookieElement.style.display = "block";

  // Temporizador QTE
  timerQTE = setInterval(() => {
    tiempoLimiteQTE -= 0.1;
    if (tiempoLimiteQTE <= 0) {
      clearInterval(timerQTE);
      galletaActiva = false;
      cookieElement.style.display = "none";
    }
  }, 100);
}

function producir() {
  // 1. Producción continua pasiva
  let totalClickers = (inventario[3] || 0) * wolfichasProduce[3];
  let totalFarmers  = (inventario[6] || 0) * wolfichasProduce[6];
  let totalMiners   = (inventario[8] || 0) * wolfichasProduce[8];
  let totalWorkers = (inventario[16] || 0) * wolfichasProduce[16];
  let produccionPasiva = totalClickers + totalFarmers + totalMiners + totalWorkers;

  // 2. LÓGICA DEL BAKER WOLFY (RELOJ BLINDADO)
  let cantBakers = inventario[12] || 0;
  let gananciaHornoTotal = 0;

  if (cantBakers > 0) {
    let comprasPatas = inventario[13] || 0;
    let tiempoCicloMax = Math.max(2, 10 - (comprasPatas * 0.5));

    // Descuenta exactamente 1 segundo en cada tick
    tiempoHorno--;

    // Solo hornea cuando el reloj llega a 0 o menos
    if (tiempoHorno <= 0) {
      let galletasPorCiclo = 5 + (inventario[14] || 0);
      let cantMineros = inventario[8] || 0;
      let bonoMineros = ((inventario[15] || 0) > 0) ? (1 + (cantMineros * 0.10)) : 1;
      let valorGalleta = 10 * bonoMineros;

      gananciaHornoTotal = cantBakers * (galletasPorCiclo * valorGalleta);

      // ¡AQUÍ ESTÁ EL TRUCO! Reiniciamos al ciclo máximo real, NUNCA a 1 o 0
      tiempoHorno = tiempoCicloMax; 
    }
  } else {
    tiempoHorno = 10; // Si no hay panaderos, el reloj se queda esperando en 10
  }

  // 3. Manejo del Buff del Huesito de Oro (Sin tocar el tiempo del horno)
  let multiplicador = 1;
  if (tiempoBuffHueso > 0) {
    multiplicador = 7;
    tiempoBuffHueso--; // Descuenta el tiempo del buff limpiamente
  }

  // 4. Inyección de dinero (El x7 multiplica tanto la pasiva como la horneada si coincidieron)
  wolfichas += (produccionPasiva + gananciaHornoTotal) * multiplicador;

  // Promedio visual para la pantalla (evita brincos raros en el contador de WC/s)
  let comprasPatas = inventario[13] || 0;
  let tiempoCicloMax = Math.max(2, 10 - (comprasPatas * 0.5));
  let promedioBaker = (cantBakers > 0) ? ((5 + (inventario[14] || 0)) * 10 * cantBakers) / tiempoCicloMax : 0;
  
  wolfichasPorSegundo = (produccionPasiva + promedioBaker) * multiplicador;

  render();
}

function render() {
  let limpio = Math.round(wolfichas * 100) / 100;
  let wolfichasMostrar = (limpio % 1 === 0) ? limpio : limpio.toFixed(2);

  document.getElementById("contador").innerHTML = `${wolfichasMostrar} Wolfichas <br><small>(${wolfichasPorSegundo.toFixed(1)} WC/s)</small>`;
  document.getElementById("inventario").innerHTML = 
    `Clickers: ${inventario[3]} | Farmers: ${inventario[6]} | Mineros: ${inventario[8]} | Bakers: ${inventario[12]} | Workers: ${inventario[16]}`;

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
}

cargarJuego();
setInterval(guardarJuego, 5000);

var multiplicadorHueso = 1;
var tiempoBuffHueso = 0;

var esHuesoNatural = false;

function aparecerHuesoOro(esNatural = false) {
  let hueso = document.getElementById("hueso-oro");
  if (!hueso) return;

  esHuesoNatural = esNatural; // Guardamos si vino del evento aleatorio

  let top = Math.floor(Math.random() * (window.innerHeight - 100));
  let left = Math.floor(Math.random() * (window.innerWidth - 100));

  hueso.style.top = top + "px";
  hueso.style.left = left + "px";
  hueso.style.display = "block";

  setTimeout(() => { hueso.style.display = "none"; }, 10000);
}

function clickHuesoOro() {
  document.getElementById("hueso-oro").style.display = "none";
  
  // --- VERIFICACIÓN DEL LOGRO "MITO CONFIRMADO" ---
  if (esHuesoNatural) {
    let logroMito = logros.find(l => l.id === "badge-18");
    if (logroMito && !logroMito.completado) {
      logroMito.completado = true;
      console.log("🏆 Logro Desbloqueado: ¡Mito Confirmado!");
    }
  }

  // --- LÓGICA DE RECOMPENSAS (RECOMPENSA O FRENESÍ) ---
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

// 1. HELLOWORLD
Object.defineProperty(window, 'helloworld', {
  get: function() {
    if (helloworldUsado) {
      return "⚠️ Este código ya fue reclamado. ¡Reinicia tu partida desde cero para usarlo de nuevo!";
    }
    helloworldUsado = true;
    wolfichas += 100;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'helloworld' activado: +100 Wolfichas de inicio rápido. 🐺✨";
  }
});

// 2. GOLDENSURPRISE
Object.defineProperty(window, 'goldensurprise', {
  get: function() {
    aparecerHuesoOro(false);
    return "✨ ¡Un Huesito de Oro ha aparecido en la pantalla! 🦴💛";
  }
});

// 3. FUNNYFURRAIN
Object.defineProperty(window, 'funnyfurrain', {
  get: function() {
    if (funnyfurrainUsado) {
      return "⚠️ ¡La lluvia de pelaje ya ocurrió en esta partida!";
    }
    funnyfurrainUsado = true;
    inventario[3] = (inventario[3] || 0) + 10;
    precioProducto[3] = precioBase[3] * (1 + 0.15 * inventario[3]);
    guardarJuego();
    render();
    return "🐾 ¡Lluvia Peluda! +10 Clicker Wolfies añadidos. 🐺✨";
  }
});

// 4. THEKITCHENISOPEN
Object.defineProperty(window, 'thekitchenisopen', {
  get: function() {
    if (thekitchenisopenUsado) {
      return "⚠️ Este código ya fue reclamado.";
    }
    thekitchenisopenUsado = true;
    wolfichas += 2000;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'thekitchenisopen' activado: +2000 Wolfichas. 🐺✨";
  }
});

// 5. ARCHIVESREVEALED
Object.defineProperty(window, 'archivesrevealed', {
  get: function() {
    if (archivesrevealedUsado) {
      return "⚠️ Este código ya fue reclamado.";
    }
    archivesrevealedUsado = true;
    wolfichas += 30000;
    guardarJuego();
    render();
    return "🚀 ¡Boom! Código 'archivesrevealed' activado: +30000 Wolfichas. 🐺✨";
  }
});

// 6. INTOTHEMOON
Object.defineProperty(window, 'intothemoon', {
  get: function() {
    if (intothemoonUsado) {
      return "⚠️ ¡La torre de lobitos ya llegó a la luna!";
    }
    intothemoonUsado = true;
    inventario[3] = (inventario[3] || 0) + 1000;
    precioProducto[3] = precioBase[3] * (1 + 0.15 * inventario[3]);
    guardarJuego();
    render();
    return "🐾 ¡Hora de respirar aire lunar! +1000 Clicker Wolfies añadidos. 🐺✨";
  }
});
