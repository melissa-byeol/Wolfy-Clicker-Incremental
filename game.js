/* ==========================================================================
   WOLFY CLICKER INCREMENTAL v3.0 - CORE ENGINE
   Arquitectura: Catálogo + Estado Central + Recálculo Dinámico
   Incluye: Ritmo (Holds/Flicks), Colecciones 3&4, Temas Secretos
   ========================================================================== */

// ===== UTILIDADES =====
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const fmt = n => Math.floor(num(n)).toLocaleString();
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function normalizarRareza(r) {
  return String(r || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
}

// ===== ESTADO GLOBAL DEL JUEGO =====
const STATE = {
  currency: 0,          // Wolfichas (WC)
  wolfilletes: 0,       // Billetes ($)
  wolfbytes: 0,         // Bytes (WB)
  
  inventory: {},        // { itemId: cantidad }
  
  stats: {              // Valores derivados, recalculados constantemente
    clickMult: 1,
    clickBonus: 0,
    prodMult: 1,
    critChance: 0,
    critMult: 2,
    wcs: 0              // Wolfichas por segundo (calculado)
  },

  buffs: {
    cookieMult: 1,
    cookieTime: 0,
    boneMult: 1,
    boneTime: 0,
    bgMult: 1           // Multiplicador de fondo/tema
  },

  meta: {               // Desbloqueos permanentes y flags
    themeRetroUnlocked: false,
    themeRetroActive: false,
    themeWafflesUnlocked: false,
    themeWafflesActive: false,
    songGam3Bo1Unlocked: false,
    songHalloweenUnlocked: false,
    codesUsed: {},      // { codeName: true/false }
    achievementsDone: [] // Array de IDs completados
  },

  ui: {                 // Estado visual efímero
    viewRight: 0,       // 0: Chat, 1: Ritmo
    modalTab: 'col_1',
    lastClickTime: 0,
    speedrunFlag: true
  }
};

// ===== CATÁLOGO MAESTRO (LA FUENTE DE VERDAD) =====
const CATALOG = [
  // --- MEJORAS ÚNICAS (CLICK POWER) ---
  { id: 0, name: "Heavy Click", type: "unique", cost: 50, cat: "clicks", desc: "Duplica el poder base.", effect: (s) => { s.clickMult *= 2; } },
  { id: 1, name: "Stronger Click", type: "unique", cost: 750, cat: "clicks", desc: "Duplica nuevamente.", effect: (s) => { s.clickMult *= 2; } },
  { id: 2, name: "Super Click", type: "unique", cost: 5500, cat: "clicks", desc: "Triplica el poder restante.", effect: (s) => { s.clickMult *= 3; } },
  { id: 4, name: "Precise Hits", type: "unique", cost: 500, cat: "synergies", desc: "+15% Crítico.", effect: (s) => { s.critChance += 0.15; } },
  { id: 5, name: "Sharp Paws", type: "unique", cost: 200, cat: "synergies", desc: "Boost Clickers.", effect: (s, inv) => { if(inv[3] > 0) s.prodMult *= 1.1; } },
  { id: 7, name: "Mejor Calidad de Hoz", type: "unique", cost: 500, cat: "synergies", desc: "Boost Farmers.", effect: (s, inv) => { if(inv[6] > 0) s.prodMult *= 1.2; } },
  { id: 9, name: "Picos Reforzados", type: "unique", cost: 2000, cat: "synergies", desc: "Boost Miners.", effect: (s, inv) => { if(inv[8] > 0) s.prodMult *= 1.2; } },
  { id: 10, name: "Cooperación Pata-mano", type: "unique", cost: 3000, cat: "synergies", desc: "Bonus plano basado en Clickers.", effect: (s, inv) => { s.clickBonus += (inv[3] || 0) * 0.5; } },
  { id: 11, name: "Picos y Palas [Dúo]", type: "unique", cost: 2500, cat: "synergies", desc: "Sinergia Farmer+Miner.", effect: (s, inv) => { if((inv[6]||0)>0 && (inv[8]||0)>0) s.prodMult *= 1.25; } },
  { id: 13, name: "Patas Rápidas", type: "repeatable", costBase: 5000, growth: 1.15, max: 16, cat: "synergies", desc: "Reduce tiempo Baker." },
  { id: 14, name: "Galletas A Remate", type: "repeatable", costBase: 10000, growth: 1.15, cat: "synergies", desc: "+1 Galleta/ciclo." },
  { id: 15, name: "Mineral Comestible", type: "unique", cost: 15000, cat: "synergies", desc: "Baker bonifica con Miners." },
  { id: 17, name: "Furpuccino Express", type: "unique", cost: 40000, cat: "synergies", desc: "Duplica Workers.", effect: (s, inv) => { if(inv[16]>0) s.prodMult *= 1.5; } },
  { id: 18, name: "Asiento Cómodo", type: "unique", cost: 65000, cat: "synergies", desc: "Duplica Workers extra.", effect: (s, inv) => { if(inv[16]>0) s.prodMult *= 1.5; } },
  { id: 19, name: "Galletitas Crocantes", type: "unique", cost: 9999, cat: "events", desc: "Desbloquea QTE Galleta.", unlockEvent: 'cookie' },
  { id: 21, name: "Galletitas Con Chocolate", type: "unique", cost: 150000, cat: "events", desc: "Buff Galleta x2." },
  { id: 23, name: "Motor Potenciado", type: "unique", cost: 350000, cat: "vehicles", desc: "Boost Taxists.", effect: (s, inv) => { if(inv[22]>0) s.prodMult *= 1.5; } },
  { id: 24, name: "Galletitas de Vainilla", type: "unique", cost: 500000, cat: "vehicles", desc: "Double boost Taxists.", effect: (s, inv) => { if(inv[22]>0) s.prodMult *= 2; } },

  // --- EDIFICIOS REPETIBLES (PRODUCCIÓN PASIVA) ---
  { id: 3, name: "Clicker Wolfy", type: "building", costBase: 10, growth: 1.15, cat: "production", baseProd: 0.1, desc: "Clica por ti." },
  { id: 6, name: "Farmer Wolfy", type: "building", costBase: 150, growth: 1.15, cat: "production", baseProd: 1, desc: "Cultiva recursos." },
  { id: 8, name: "Miner Wolfy", type: "building", costBase: 800, growth: 1.15, cat: "production", baseProd: 5, desc: "Extrae minerales." },
  { id: 12, name: "Baker Wolfy", type: "building", costBase: 2000, growth: 1.15, cat: "production", baseProd: 0, desc: "Hornea galletas (esp)." },
  { id: 16, name: "Worker Wolfy", type: "building", costBase: 30000, growth: 1.15, cat: "production", baseProd: 50, desc: "Trabajador industrial." },
  { id: 20, name: "Streamer Wolfy", type: "building", costBase: 120000, growth: 1.15, cat: "production", baseProd: 200, desc: "Genera chat/donaciones." },
  { id: 22, name: "Taxist Wolfy", type: "building", costBase: 250000, growth: 1.15, cat: "production", baseProd: 500, desc: "Transporte lupino." },
  { id: 25, name: "Idol Wolfy", type: "building", costBase: 750000, growth: 1.15, cat: "production", baseProd: 1500, desc: "Estrella pop. Habilita ritmo." }
];

// Helpers de Catálogo
const getItem = id => CATALOG.find(i => i.id === id);
const getCount = id => STATE.inventory[id] || 0;
const setCount = (id, val) => STATE.inventory[id] = val;

function getCost(item) {
  if (item.type === 'unique') return item.cost;
  const count = getCount(item.id);
  return Math.floor(item.costBase * Math.pow(item.growth, count));
}

// ===== MOTOR DE RECALCULO (THE BRAIN) =====
function recalculateStats() {
  STATE.stats.clickMult = 1;
  STATE.stats.clickBonus = 0;
  STATE.stats.prodMult = 1;
  STATE.stats.critChance = 0;
  STATE.stats.critMult = 2;

  for (const idStr in STATE.inventory) {
    const id = parseInt(idStr);
    const count = STATE.inventory[idStr];
    if (count <= 0) continue;

    const item = getItem(id);
    if (!item) continue;

    if (item.effect) {
      item.effect(STATE.stats, STATE.inventory);
    }
  }

  let rawProduction = 0;
  
  CATALOG.filter(i => i.type === 'building').forEach(building => {
    const count = getCount(building.id);
    if (count === 0) return;

    let prodPerUnit = building.baseProd;

    if (building.id === 12) { // BAKERS
      const patasRapidas = getCount(13);
      const galletasRemate = getCount(14);
      const mineralComestible = getCount(15);
      
      const tiempoCiclo = Math.max(2, 10 - (patasRapidas * 0.5));
      const galletasPorCiclo = 5 + galletasRemate;
      const bonoMineros = mineralComestible > 0 ? (1 + (getCount(8) * 0.1)) : 1;
      const valorGalleta = 10 * bonoMineros;
      
      prodPerUnit = (galletasPorCiclo * valorGalleta) / tiempoCiclo;
    }

    rawProduction += count * prodPerUnit;
  });

  STATE.stats.wcs = rawProduction * STATE.stats.prodMult * STATE.buffs.bgMult * STATE.buffs.cookieMult * STATE.buffs.boneMult;
  
  if (STATE.ui.haterPenalty) {
     STATE.stats.wcs -= STATE.ui.haterPenalty;
  }
  STATE.stats.wcs = Math.max(0, STATE.stats.wcs);
}

// ===== LÓGICA DE JUEGO PRINCIPAL =====

function getPoderClic() {
  return (1 * STATE.stats.clickMult) + STATE.stats.clickBonus;
}

function onPlayerClick() {
  const basePower = getPoderClic();
  let finalGain = basePower * STATE.buffs.bgMult * STATE.buffs.cookieMult * STATE.buffs.boneMult;
  
  let isCrit = false;
  if (Math.random() < STATE.stats.critChance) {
    finalGain *= STATE.stats.critMult;
    isCrit = true;
  }

  // Efectos Secretos (Drunk/Nausea)
  if (window.modoBorrachoActivo) {
    const r = Math.random();
    if (r < 0.20) finalGain *= 0.5; // Golpe flojo
    else if (r < 0.30) finalGain *= 5; // Suerte ebria
  }
  if (window.modoNauseaActivo) {
    finalGain *= 0.8; // Mareado
  }

  STATE.currency += finalGain;
  
  showFloatingText(finalGain, isCrit);
}

function buyItem(id) {
  const item = getItem(id);
  if (!item) return;

  const currentCount = getCount(id);
  
  if (item.type === 'unique' && currentCount > 0) return;
  if (item.max && currentCount >= item.max) return;
  
  const cost = getCost(item);
  if (STATE.currency < cost) return;

  STATE.currency -= cost;
  setCount(id, currentCount + 1);
  
  recalculateStats();
  
  if (item.unlockEvent === 'cookie') initCookieLoop();
  if (id === 20 && currentCount === 0) initChatStream(); 
  
  saveGame();
  renderShop();
}

// ===== SISTEMA DE BUFFS TEMPORALES =====
let buffTimers = {};

function applyBuff(type, duration, multiplier) {
  if (type === 'cookie') {
    STATE.buffs.cookieMult = multiplier;
    STATE.buffs.cookieTime = duration;
    clearInterval(buffTimers.cookie);
    buffTimers.cookie = setInterval(() => {
      STATE.buffs.cookieTime--;
      if (STATE.buffs.cookieTime <= 0) {
        STATE.buffs.cookieMult = 1;
        clearInterval(buffTimers.cookie);
        recalculateStats();
      }
    }, 1000);
  } else if (type === 'bone') {
    STATE.buffs.boneMult = multiplier;
    STATE.buffs.boneTime = duration;
    clearInterval(buffTimers.bone);
    buffTimers.bone = setInterval(() => {
      STATE.buffs.boneTime--;
      if (STATE.buffs.boneTime <= 0) {
        STATE.buffs.boneMult = 1;
        clearInterval(buffTimers.bone);
        recalculateStats();
      }
    }, 1000);
  }
  recalculateStats();
}

// ===== EVENTOS FLOTANTES =====

// --- GALLETAS ---
let cookieTimer = null;
function initCookieLoop() {
  if (cookieTimer) clearInterval(cookieTimer);
  cookieTimer = setInterval(() => {
    if (getCount(19) > 0 && Math.random() < 0.2) spawnCookie();
  }, 30000);
}

function spawnCookie() {
  const el = $('galleta-crocante');
  if (!el) return;
  
  const top = Math.floor(Math.random() * 60 + 15);
  const left = Math.floor(Math.random() * 60 + 15);
  
  el.style.top = top + '%';
  el.style.left = left + '%';
  el.style.display = 'block';
  
  let clicksNeeded = Math.floor(Math.random() * 5) + 3;
  let timeLimit = Math.floor(Math.random() * 9) + 7;
  let startTime = Date.now();
  let lastClick = startTime;
  let success = true;
  
  const info = $('qte-info');
  if(info) {
    info.style.display = 'block';
    info.innerHTML = `🍪 Faltan: ${clicksNeeded}<br>⏱️ ${timeLimit.toFixed(1)}s`;
  }

  const interval = setInterval(() => {
    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    const remaining = timeLimit - elapsed;
    
    if (remaining <= 0) {
      clearInterval(interval);
      hideCookie();
      alert("❌ ¡Se enfrió!");
      return;
    }
    
    if(info) info.innerHTML = `🍪 Faltan: ${clicksNeeded}<br>⏱️ ${remaining.toFixed(1)}s`;
  }, 100);

  el.onclick = () => {
    const now = Date.now();
    if ((now - lastClick) > 700) success = false;
    lastClick = now;
    clicksNeeded--;
    
    if(clicksNeeded <= 0) {
      clearInterval(interval);
      hideCookie();
      
      const mult = getCount(21) > 0 ? 2.0 : 1.5;
      applyBuff('cookie', 10 + Math.floor(timeLimit - (Date.now()-startTime)/1000), mult);
      
      if(success) unlockAchievement('badge-20');
      if((Date.now()-startTime)/1000 < timeLimit - 2) unlockAchievement('badge-21');
      
      alert(`🍪 ¡Delicioso! Buff activo.`);
    }
  };
}

function hideCookie() {
  const el = $('galleta-crocante');
  const info = $('qte-info');
  if(el) el.style.display = 'none';
  if(info) info.style.display = 'none';
}

// --- HUESO DE ORO ---
function spawnBone(isNatural = false) {
  const el = $('hueso-oro');
  if (!el) return;
  
  el.style.top = Math.floor(Math.random() * (window.innerHeight - 100)) + 'px';
  el.style.left = Math.floor(Math.random() * (window.innerWidth - 100)) + 'px';
  el.style.display = 'block';
  
  setTimeout(() => { if(el) el.style.display = 'none'; }, 10000);
  
  el.onclick = () => {
    el.style.display = 'none';
    if (isNatural) unlockAchievement('badge-18');
    
    if (Math.random() < 0.5) {
      const gain = Math.floor(STATE.currency * 0.5) + 20;
      STATE.currency += gain;
      alert(`🦴 ¡Hueso! +${fmt(gain)} WC`);
    } else {
      applyBuff('bone', 15, 7);
      alert("🦴 ¡Multiplicador x7 activo!");
    }
    saveGame();
  };
}

// ===== CHAT STREAMER SIMPLIFICADO =====
let chatInterval = null;
function initChatStream() {
  if(chatInterval) clearInterval(chatInterval);
  chatInterval = setInterval(() => {
    if(getCount(20) > 0 && Math.random() < 0.3) generateChatMessage();
  }, 20000);
}

function generateChatMessage() {
  const container = $('comentarios-chat');
  if(!container) return;
  
  const isNegative = Math.random() < 0.3;
  const textsPos = ["¡Genial!", "Donación incoming", "Best game ever"];
  const textsNeg = ["Aburrido", "Lag", "Hater detected"];
  
  const text = isNegative 
    ? textsNeg[Math.floor(Math.random()*textsNeg.length)]
    : textsPos[Math.floor(Math.random()*textsPos.length)];
    
  const div = document.createElement('div');
  div.className = `chat-stream ${isNegative ? 'hater' : 'vip'}`;
  div.innerHTML = `<strong>${isNegative?'🤬':''}:</strong> "${text}"`;
  
  const btnArea = document.createElement('div');
  btnArea.className = 'chat-acciones';
  
  if(!isNegative) {
    const likeBtn = document.createElement('button');
    likeBtn.textContent = '❤️ Like';
    likeBtn.onclick = () => {
      STATE.currency += 500;
      div.classList.add('desactivado');
      saveGame();
    };
    btnArea.appendChild(likeBtn);
  } else {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Borrar';
    deleteBtn.onclick = () => {
      container.removeChild(div);
      saveGame();
    };
    btnArea.appendChild(deleteBtn);
  }
  
  div.appendChild(btnArea);
  container.prepend(div);
  
  while(container.children.length > 20) container.lastChild.remove();
}

// ===== RITMO IDOL WOLFY (INTEGRADO COMPACTO) =====
const SONGS = {
  swim: { file: "musica/swim.mp3", notes: [{t:1,c:0},{t:2.5,c:3}] },
  scream: { file: "musica/scream_enhypen.mp3", notes: [
    { t: 0.8, c: 0 }, { t: 1.4, c: 2 }, { t: 2.0, c: 1, d: 1.2 },
    { t: 3.5, c: 3, f: true }, { t: 4.0, c: 0, d: 1.0 }
  ]},
  gam3bo1: { file: "musica/gam3_bo1.mp3", notes: [{t:0.5,c:0},{t:1,c:1}] }
};

let rhythmState = {
  active: false, paused: true, score: 0, time: 0, notes: [], audioReady: false,
  keysDown: [false,false,false,false], arrowUp: false
};

function startSong(key) {
  if(getCount(25) <= 0) return alert("Necesitas Idol Wolfy");
  
  const song = SONGS[key];
  if(!song) return;
  
  const audio = $('audio-player');
  audio.src = song.file;
  audio.load();
  
  rhythmState.notes = song.notes.map(n => ({
    ...n, hit: false, elem: null, state: 'pending'
  }));
  rhythmState.score = 0;
  rhythmState.time = 0;
  rhythmState.active = true;
  rhythmState.paused = false;
  rhythmState.audioReady = false;
  
  audio.oncanplaythrough = () => rhythmState.audioReady = true;
  audio.onended = () => endSong();
  
  requestAnimationFrame(updateRhythmLoop);
}

function updateRhythmLoop(ts) {
  if(!rhythmState.active || rhythmState.paused) return;
  
  const audio = $('audio-player');
  if(rhythmState.audioReady && !audio.paused) {
    rhythmState.time = audio.currentTime;
  } else {
    rhythmState.time += 0.016;
  }
  
  rhythmState.notes.forEach(note => {
    if(note.state === 'done') return;
    
    const diff = note.t - rhythmState.time;
    
    if(diff < -0.3) {
      note.state = 'missed';
      if(note.elem) note.elem.remove();
      return;
    }
    
    if(diff <= 1.5 && diff >= -0.3 && !note.elem) {
      const lane = $(`carril-${note.c}`);
      if(lane) {
        const el = document.createElement('div');
        el.className = `nota-ritmo ${note.d ? 'hold' : (note.f ? 'flick' : 'tap')}`;
        if(note.f) el.innerHTML = '<span class="flick-icon">↑</span>';
        lane.appendChild(el);
        note.elem = el;
      }
    }
    
    if(note.elem) {
      const pos = (1 - (diff / 1.5)) * 160;
      note.elem.style.top = pos + 'px';
      
      if(note.d) {
        const endDiff = (note.t + note.d) - rhythmState.time;
        const endPos = (1 - (endDiff / 1.5)) * 160;
        const h = Math.abs(pos - endPos);
        note.elem.style.height = Math.max(12, h) + 'px';
        
        if(endDiff <= 0.1 && rhythmState.keysDown[note.c]) {
          completeHold(note);
        }
      }
    }
  });
  
  if(rhythmState.time > (SONGS[cancionSel]?.notes.slice(-1)[0]?.t || 0) + 2) {
    endSong();
    return;
  }
  
  requestAnimationFrame(updateRhythmLoop);
}

function pressLane(c) {
  if(!rhythmState.active || rhythmState.paused) return;
  rhythmState.keysDown[c] = true;
  
  const candidate = rhythmState.notes.find(n => 
    n.c === c && n.state === 'pending' && Math.abs(n.t - rhythmState.time) <= 0.35
  );
  
  if(candidate) {
    if(candidate.f) {
       if(rhythmState.arrowUp) hitNote(candidate);
       else feedback("Mantén ↑");
    } else if(candidate.d) {
       startHold(candidate);
    } else {
       hitNote(candidate);
    }
  } else {
    feedback("MISS");
  }
}

function releaseLane(c) {
  rhythmState.keysDown[c] = false;
  const holding = rhythmState.notes.find(n => n.c===c && n.state==='holding');
  if(holding) failHold(holding);
}

function startHold(n) {
  n.state = 'holding';
  n.startTime = rhythmState.time;
  if(n.elem) n.elem.classList.add('activo');
}

function completeHold(n) {
  n.state = 'done';
  if(n.elem) n.elem.remove();
  STATE.currency += 1500;
  rhythmState.score += 150;
  feedback("HOLD OK");
}

function failHold(n) {
  n.state = 'missed';
  if(n.elem) n.elem.remove();
  feedback("HOLD FAIL");
}

function hitNote(n) {
  n.state = 'done';
  if(n.elem) n.elem.remove();
  STATE.currency += 1000;
  rhythmState.score += 100;
  feedback("PERFECT");
}

function endSong() {
  rhythmState.active = false;
  $('audio-player').pause();
  alert(`Fin. Score: ${rhythmState.score}. Bonus WC aplicado.`);
  saveGame();
}

function feedback(msg) {
  const fb = $('feedback-ritmo');
  if(fb) fb.innerText = msg;
}

window.addEventListener('keydown', e => {
  if(e.key === 'ArrowUp') rhythmState.arrowUp = true;
  const map = {'a':0,'s':1,'d':2,'f':3};
  const c = map[e.key.toLowerCase()];
  if(c !== undefined) pressLane(c);
});
window.addEventListener('keyup', e => {
  if(e.key === 'ArrowUp') rhythmState.arrowUp = false;
  const map = {'a':0,'s':1,'d':2,'f':3};
  const c = map[e.key.toLowerCase()];
  if(c !== undefined) releaseLane(c);
});


// ===== GUARDADO Y CARGA =====
function saveGame() {
  const data = {
    v: 3,
    cur: STATE.currency,
    wil: STATE.wolfilletes,
    wb: STATE.wolfbytes,
    inv: STATE.inventory,
    meta: STATE.meta,
    ts: Date.now()
  };
  localStorage.setItem('wolfySave_v3', JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem('wolfySave_v3');
  if(!raw) return;
  
  try {
    const data = JSON.parse(raw);
    STATE.currency = num(data.cur);
    STATE.wolfilletes = num(data.wil);
    STATE.wolfbytes = num(data.wb);
    STATE.inventory = data.inv || {};
    STATE.meta = data.meta || STATE.meta;
    
    STATE.buffs = { cookieMult:1, cookieTime:0, boneMult:1, boneTime:0, bgMult:1 };
    
    recalculateStats();
    applyThemeFromMeta();
    
  } catch(e) {
    console.error("Save corrupto", e);
  }
}

// ===== UI RENDERING DINÁMICA =====
function renderShop() {
  const groups = {};
  
  CATALOG.forEach(item => {
    if(!groups[item.cat]) groups[item.cat] = [];
    groups[item.cat].push(item);
  });
  
  // Mejoras Únicas
  const uniqueContainer = $('lista-mejoras-unica');
  if(uniqueContainer) {
    uniqueContainer.innerHTML = '';
    CATALOG.filter(i => i.type === 'unique' || i.type === 'repeatable').forEach(b => {
      const count = getCount(b.id);
      const cost = getCost(b);
      const btn = document.createElement('button');
      btn.id = `btn-shop-${b.id}`;
      btn.textContent = `${b.name} ${b.type==='repeatable'?`x${count}`:''} - ${fmt(cost)} WC`;
      btn.disabled = STATE.currency < cost || (b.type==='unique' && count>0);
      btn.onclick = () => buyItem(b.id);
      uniqueContainer.appendChild(btn);
    });
  }
  
  // Edificios
  const buildContainer = $('lista-edificios');
  if(buildContainer) {
    buildContainer.innerHTML = '';
    CATALOG.filter(i => i.type === 'building').forEach(b => {
      const count = getCount(b.id);
      const cost = getCost(b);
      const btn = document.createElement('button');
      btn.id = `btn-shop-${b.id}`;
      btn.textContent = `${b.name} x${count} - ${fmt(cost)} WC`;
      btn.disabled = STATE.currency < cost;
      btn.onclick = () => buyItem(b.id);
      buildContainer.appendChild(btn);
    });
  }
}

function updateUI() {
  $('contador').innerText = `${num(STATE.currency).toFixed(1)} Wolfichas`;
  $('sub-contador').innerText = `${STATE.stats.wcs.toFixed(1)} WC/s`;
  $('lbl-wolfilletes').innerText = STATE.wolfilletes;
  
  CATALOG.forEach(item => {
    const btn = $(`btn-shop-${item.id}`);
    if(btn) {
      btn.disabled = STATE.currency < getCost(item) || (item.type==='unique' && getCount(item.id)>0);
    }
  });
}

function showFloatingText(monto, isCrit, customColor = null) {
  const header = document.querySelector(".header-top");
  if (!header) return;

  const flotante = document.createElement("div");
  flotante.className = `dinero-flotante ganancia`;
  flotante.innerText = (isCrit ? "CRÍTICO! +" : "+") + monto.toFixed(1);
  if(customColor) flotante.style.color = customColor;

  header.appendChild(flotante);

  setTimeout(() => {
    flotante.style.transform = "translateY(-15px)";
    flotante.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    if (header.contains(flotante)) header.removeChild(flotante);
  }, 650);
}

// ===== LOOP PRINCIPAL =====
setInterval(() => {
  STATE.currency += STATE.stats.wcs;
  
  // Eventos aleatorios
  if(Math.random() < 0.01) spawnBone(true);
  
  updateUI();
}, 1000);

setInterval(saveGame, 5000);

// Inicio
window.onload = () => {
  loadGame();
  renderShop();
  updateUI();
  initCookieLoop();
  initChatStream();
  
  // Aplicar tema inicial
  if(STATE.meta.themeRetroActive) document.body.classList.add('tema-retro');
  else if(STATE.meta.themeWafflesActive) document.body.classList.add('tema-waffles');
};

// ===== COLECCIONES Y LORE (EXTENSIÓN) =====
const COLECCIONES_DEF = [
  {
    id: "col_innovaciones",
    nombre: "Colección 3: Innovaciones Extraordinarias",
    descripcion: "Artefactos creados por la R&D de Wolfy Inc.",
    libros: [
      { id: "inn_com_1", nombre: "Impresora De Objetos", rareza: "Común", paginasTotales: 5, rewardWolfbytes: 80, lore: "Capaz de imprimir huesos... o gatos?" },
      { id: "inn_com_2", nombre: "Computador Portátil", rareza: "Común", paginasTotales: 5, rewardWolfbytes: 80, lore: "Modelo Laptop-Lobo. Resistente a mordidas." },
      { id: "inn_com_3", nombre: "Cañón De Pelotas De Tennis", rareza: "Común", paginasTotales: 5, rewardWolfbytes: 90, lore: "Para entrenamiento o aburrir vecinos." },
      { id: "inn_com_4", nombre: "TNT De Shampoo Lupino", rareza: "Común", paginasTotales: 5, rewardWolfbytes: 100, lore: "Limpia mientras destruye. No inhalar vapores morados." },
      { id: "inn_rare_1", nombre: "Lentes de Contacto NV", rareza: "Raro", paginasTotales: 8, rewardWolfbytes: 250, lore: "Visión nocturna. Ve esqueletos. Perturbador." },
      { id: "inn_rare_2", nombre: "Visor RLV (Realidad Lupina Virtual)", rareza: "Raro", paginasTotales: 8, rewardWolfbytes: 280, lore: "Proyecta rastros de aroma neón. Precaución: sombras de gatos." },
      { id: "inn_rare_3", nombre: "Linterna Cinética", rareza: "Raro", paginasTotales: 8, rewardWolfbytes: 300, lore: "Se carga moviendo la cola. Más emoción, más luz." },
      { id: "inn_epic_1", nombre: "Spray Anti-Garrapatas Perfumado", rareza: "Épico", paginasTotales: 12, rewardWolfbytes: 600, lore: "Mata parásitos con lavanda. Las garrapatas mueren confundidas." },
      { id: "inn_epic_2", nombre: "Consola BallStation 6", rareza: "Épico", paginasTotales: 12, rewardWolfbytes: 750, lore: "Juegas lanzando pelotas reales. Gráficos de sudor." },
      { id: "inn_epic_3", nombre: "Tableta De Recetas", rareza: "Épico", paginasTotales: 12, rewardWolfbytes: 800, lore: "Recetas prohibidas. Requiere ladrido biométrico." },
      { id: "inn_leg_1", nombre: "Maquina de Escribir", rareza: "Legendario", paginasTotales: 20, rewardWolfbytes: 2000, lore: "Artefacto antiguo. Escribe sola cuando nadie mira." },
      { id: "inn_leg_2", nombre: "Telefonos Moviles", rareza: "Legendario", paginasTotales: 20, rewardWolfbytes: 2500, lore: "Habla sin boca. Efecto secundario: hambre de pizza fría." }
    ]
  },
  {
    id: "col_paletas",
    nombre: "Colección 4: Paletas De Colores",
    descripcion: "El departamento de Diseño Gráfico presenta sus creaciones cuestionables.",
    libros: [
      { id: "pal_com_1", nombre: "RGB Básico", rareza: "Común", paginasTotales: 5, rewardWolfbytes: 60, lore: "La trinidad sagrada. Los senior lloran." },
      { id: "pal_com_2", nombre: "Monocromático Lobo Gris", rareza: "Común", paginasTotales: 5, rewardWolfbytes: 70, lore: "Blanco, negro y 50 sombras de gris peludo." },
      { id: "pal_rare_1", nombre: "Tonos Chocolatosos", rareza: "Raro", paginasTotales: 8, rewardWolfbytes: 200, lore: "Provoca antojos inmediatos y ladridos felices." },
      { id: "pal_rare_2", nombre: "Verdes Vomitivos", rareza: "Raro", paginasTotales: 8, rewardWolfbytes: 250, lore: "El diseñador renunció al día siguiente. Nadie la usa. Ni su creador." },
      { id: "pal_epic_1", nombre: "Unicornio de Marshmallow", rareza: "Épico", paginasTotales: 12, rewardWolfbytes: 500, lore: "Tan cursi que hace ruborizarse a los Clicker Wolfies." },
      { id: "pal_epic_2", nombre: "Acid Bubblegum", rareza: "Épico", paginasTotales: 12, rewardWolfbytes: 550, lore: "Neón rosado vs verde ácido. Dolor de cabeza estilizado." }
    ]
  }
];

// Funciones auxiliares para Colecciones/Gacha
function abrirPaqueteBasico() {
  const costo = 500;
  if (STATE.wolfbytes < costo) return alert(`Necesitas ${costo} WB.`);
  
  STATE.wolfbytes -= costo;
  
  // Lógica simplificada de gacha: randomly pick books from all collections
  // En una implementación completa, iterarías sobre COLECCIONES_DEF.libros
  alert("📦 ¡Has abierto un paquete! (Lógica de gacha pendiente de integración completa con UI de libros)");
  saveGame();
}

function convertirWCAWolfbytes(cantidadWB) {
  const costoTotal = cantidadWB * 10000;
  if (STATE.currency >= costoTotal) {
    STATE.currency -= costoTotal;
    STATE.wolfbytes += cantidadWB;
    saveGame();
    updateUI();
  } else {
    alert("Fondos insuficientes.");
  }
}

function comprarWolfilletes() {
  const PRECIO = 100000;
  const input = prompt("¿Cuántos Wolfilletes?", "1");
  const cant = parseInt(input);
  if (isNaN(cant) || cant <= 0) return;
  
  const total = cant * PRECIO;
  if (STATE.currency >= total) {
    STATE.currency -= total;
    STATE.wolfilletes += cant;
    saveGame();
    updateUI();
  } else {
    alert("Fondos insuficientes.");
  }
}

function cambiarVistaDerecha(dir) {
  STATE.ui.viewRight += dir;
  if (STATE.ui.viewRight < 0) STATE.ui.viewRight = 1;
  if (STATE.ui.viewRight > 1) STATE.ui.viewRight = 0;
  
  const chatView = $("vista-chat-streamer");
  const idolView = $("vista-idol-ritmo");
  const titulo = $("titulo-vista-derecha");
  
  if (STATE.ui.viewRight === 0) {
    chatView.style.display = "block";
    idolView.style.display = "none";
    titulo.innerText = "Chat Streamer";
  } else {
    chatView.style.display = "none";
    idolView.style.display = "block";
    titulo.innerText = "Idol Wolfy: Ritmo";
  }
}

function seleccionarCancion(clave) {
  cancionSel = clave; // Variable global implícita para el loop de ritmo
  const audio = $("audio-player");
  if(audio) audio.src = SONGS[clave].file;
}

// Variables globales necesarias para el scope del ritmo/chat
let cancionSel = "swim";
let modoNauseaActivo = false;
let modoBorrachoActivo = false;

// ===== EASTER EGGS SECRETOS (NÁUSEA Y BORRACHO) =====
(function () {
  const SECRET_THEME_KEY = "wolfy_secret_theme";

  function guardarModoSecreto(modo) {
    try {
      if (!modo) localStorage.removeItem(SECRET_THEME_KEY);
      else localStorage.setItem(SECRET_THEME_KEY, modo);
    } catch (e) {}
  }

  function desactivarTemaNauseabundo(silent = false) {
    modoNauseaActivo = false;
    document.body.classList.remove("tema-nauseabundo");
  }

  function desactivarDrunkMode(silent = false) {
    modoBorrachoActivo = false;
    document.body.classList.remove("tema-drunk");
  }

  function activarTemaNauseabundo(silent = false) {
    if (modoNauseaActivo) return;
    desactivarDrunkMode(true);
    modoNauseaActivo = true;
    document.body.classList.add("tema-nauseabundo");
    guardarModoSecreto("nausea");
    if (!silent) alert("🤮 Modo Náusea Activado. Escribe 'medicina' para parar.");
  }

  function activarDrunkMode(silent = false) {
    if (modoBorrachoActivo) return;
    desactivarTemaNauseabundo(true);
    modoBorrachoActivo = true;
    document.body.classList.add("tema-drunk");
    guardarModoSecreto("drunk");
    if (!silent) alert("🍻 Modo Borracho Activado. Escribe 'sobrio' para parar.");
  }

  Object.defineProperty(window, "vomitar", {
    configurable: true,
    get: function () { activarTemaNauseabundo(); return "🤮 Modo Náusea."; }
  });

  Object.defineProperty(window, "green_screen_of_death", {
    configurable: true,
    get: function () { activarTemaNauseabundo(); return "💀 Pantalla Verde."; }
  });

  Object.defineProperty(window, "medicina", {
    configurable: true,
    get: function () {
      desactivarTemaNauseabundo(true);
      desactivarDrunkMode(true);
      guardarModoSecreto(null);
      return "💊 Curado.";
    }
  });

  Object.defineProperty(window, "antidoto", {
    configurable: true,
    get: function () { return window.medicina; }
  });

  Object.defineProperty(window, "borracho", {
    configurable: true,
    get: function () { activarDrunkMode(); return "🍺 Modo Borracho."; }
  });

  Object.defineProperty(window, "drunk", {
    configurable: true,
    get: function () { activarDrunkMode(); return "🍷 Cheers."; }
  });

  Object.defineProperty(window, "sobrio", {
    configurable: true,
    get: function () {
      desactivarTemaNauseabundo(true);
      desactivarDrunkMode(true);
      guardarModoSecreto(null);
      return "☕ Sobrio.";
    }
  });

  Object.defineProperty(window, "cafe", {
    configurable: true,
    get: function () { return window.sobrio; }
  });

  // Restaurar al cargar
  const savedMode = localStorage.getItem(SECRET_THEME_KEY);
  if (savedMode === "nausea") activarTemaNauseabundo(true);
  else if (savedMode === "drunk") activarDrunkMode(true);
})();

// Placeholder functions para no dar error si se llaman antes de definir
function unlockAchievement(id) { /* TODO */ }
function applyThemeFromMeta() { /* TODO */ }
function abrirModalLibros() { /* TODO */ }
function cerrarModalLibros() { /* TODO */ }
function alternarTemaRetro() { /* TODO */ }
function alternarTemaWaffles() { /* TODO */ }
function activarGamerWolfy() { /* TODO */ }
function iniciarCancionRitmo() { startSong(cancionSel); }
function pausarCancionRitmo() { rhythmState.paused = true; }
function continuarCancionRitmo() { rhythmState.paused = false; }
function reiniciarCancionRitmo() { rhythmState.active = false; }
