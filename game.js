/* ==========================================================================
   WOLFY CLICKER INCREMENTAL v3.2 - FULL ENGINE + GAMER WOLFY BALANCED
   Incluye: Catálogo, Colecciones 3&4, Ritmo (Hold/Flick), Temas Secretos,
            Gam3 Bo1 Unlock System
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
  currency: 0,          
  wolfilletes: 0,       
  wolfbytes: 0,         
  inventory: {},        
  stats: {              
    clickMult: 1,
    clickBonus: 0,
    prodMult: 1,
    critChance: 0,
    critMult: 2,
    wcs: 0              
  },
  buffs: {
    cookieMult: 1,
    cookieTime: 0,
    boneMult: 1,
    boneTime: 0,
    bgMult: 1           
  },
  meta: {               
    themeRetroUnlocked: false,
    themeRetroActive: false,
    themeWafflesUnlocked: false,
    themeWafflesActive: false,
    songGam3Bo1Unlocked: false, // <-- NUEVO FLAG
    songHalloweenUnlocked: false,
    codesUsed: {},      
    achievementsDone: [],
    librosProgreso: {} 
  },
  ui: {                 
    viewRight: 0,       
    modalTab: 'col_1',  
    lastClickTime: 0,
    speedrunFlag: true
  }
};

// ===== CATÁLOGO MAESTRO =====
const CATALOG = [
  // Mejoras Únicas
  { id: 0, name: "Heavy Click", type: "unique", cost: 50, cat: "clicks", desc: "Duplica poder base.", effect: (s) => { s.clickMult *= 2; } },
  { id: 1, name: "Stronger Click", type: "unique", cost: 750, cat: "clicks", desc: "Duplica nuevamente.", effect: (s) => { s.clickMult *= 2; } },
  { id: 2, name: "Super Click", type: "unique", cost: 5500, cat: "clicks", desc: "Triplica poder restante.", effect: (s) => { s.clickMult *= 3; } },
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

  // Edificios
  { id: 3, name: "Clicker Wolfy", type: "building", costBase: 10, growth: 1.15, cat: "production", baseProd: 0.1, desc: "Clica por ti." },
  { id: 6, name: "Farmer Wolfy", type: "building", costBase: 150, growth: 1.15, cat: "production", baseProd: 1, desc: "Cultiva recursos." },
  { id: 8, name: "Miner Wolfy", type: "building", costBase: 800, growth: 1.15, cat: "production", baseProd: 5, desc: "Extrae minerales." },
  { id: 12, name: "Baker Wolfy", type: "building", costBase: 2000, growth: 1.15, cat: "production", baseProd: 0, desc: "Hornea galletas (esp)." },
  { id: 16, name: "Worker Wolfy", type: "building", costBase: 30000, growth: 1.15, cat: "production", baseProd: 50, desc: "Trabajador industrial." },
  { id: 20, name: "Streamer Wolfy", type: "building", costBase: 120000, growth: 1.15, cat: "production", baseProd: 200, desc: "Genera chat/donaciones." },
  { id: 22, name: "Taxist Wolfy", type: "building", costBase: 250000, growth: 1.15, cat: "production", baseProd: 500, desc: "Transporte lupino." },
  { id: 25, name: "Idol Wolfy", type: "building", costBase: 750000, growth: 1.15, cat: "production", baseProd: 1500, desc: "Estrella pop. Habilita ritmo." }
];

// Helpers
const getItem = id => CATALOG.find(i => i.id === id);
const getCount = id => STATE.inventory[id] || 0;
const setCount = (id, val) => STATE.inventory[id] = val;

function getCost(item) {
  if (item.type === 'unique') return item.cost;
  const count = getCount(item.id);
  return Math.floor(item.costBase * Math.pow(item.growth, count));
}

// ===== MOTOR DE RECALCULO =====
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
    if (item.effect) item.effect(STATE.stats, STATE.inventory);
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
  if (STATE.ui.haterPenalty) STATE.stats.wcs -= STATE.ui.haterPenalty;
  STATE.stats.wcs = Math.max(0, STATE.stats.wcs);
}

// ===== LÓGICA PRINCIPAL =====
function getPoderClic() {
  return (1 * STATE.stats.clickMult) + STATE.stats.clickBonus;
}

function clic() {
  const basePower = getPoderClic();
  let finalGain = basePower * STATE.buffs.bgMult * STATE.buffs.cookieMult * STATE.buffs.boneMult;
  
  let isCrit = false;
  if (Math.random() < STATE.stats.critChance) {
    finalGain *= STATE.stats.critMult;
    isCrit = true;
  }

  // Efectos Secretos
  if (window.modoBorrachoActivo) {
    const r = Math.random();
    if (r < 0.20) finalGain *= 0.5; 
    else if (r < 0.30) finalGain *= 5; 
  }
  if (window.modoNauseaActivo) {
    finalGain *= 0.8; 
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

// ===== BUFFS =====
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

function clickHuesoOro() { /* Ya manejado en spawnBone */ }
function clickGalletita() { /* Ya manejado en spawnCookie */ }

// ===== CHAT STREAMER =====
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
  const text = isNegative ? textsNeg[Math.floor(Math.random()*textsNeg.length)] : textsPos[Math.floor(Math.random()*textsPos.length)];
    
  const div = document.createElement('div');
  div.className = `chat-stream ${isNegative ? 'hater' : 'vip'}`;
  div.innerHTML = `<strong>${isNegative?'🤬':''}:</strong> "${text}"`;
  
  const btnArea = document.createElement('div');
  btnArea.className = 'chat-acciones';
  
  if(!isNegative) {
    const likeBtn = document.createElement('button');
    likeBtn.textContent = '❤️ Like';
    likeBtn.onclick = () => { STATE.currency += 500; div.classList.add('desactivado'); saveGame(); };
    btnArea.appendChild(likeBtn);
  } else {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Borrar';
    deleteBtn.onclick = () => { container.removeChild(div); saveGame(); };
    btnArea.appendChild(deleteBtn);
  }
  
  div.appendChild(btnArea);
  container.prepend(div);
  while(container.children.length > 20) container.lastChild.remove();
}

// ===== RITMO IDOL WOLFY =====
const SONGS = {
  swim: { file: "musica/swim.mp3", notes: [{t:1,c:0},{t:2.5,c:3}], locked: false },
  scream: { file: "musica/scream_enhypen.mp3", notes: [
    { t: 0.8, c: 0 }, { t: 1.4, c: 2 }, { t: 2.0, c: 1, d: 1.2 },
    { t: 3.5, c: 3, f: true }, { t: 4.0, c: 0, d: 1.0 }
  ], locked: false },
  gam3bo1: { file: "musica/gam3_bo1.mp3", notes: [{t:0.5,c:0},{t:1,c:1},{t:1.5,c:2},{t:2,c:3}], locked: true } // Bloqueada inicialmente
};

let rhythmState = {
  active: false, paused: true, score: 0, time: 0, notes: [], audioReady: false,
  keysDown: [false,false,false,false], arrowUp: false
};

let cancionSel = "swim"; 

function seleccionarCancion(clave) {
  cancionSel = clave;
  const audio = $("audio-player");
  if(audio) audio.src = SONGS[clave].file;
}

function actualizarSelectorCanciones() {
  const select = $("cancion-select");
  if (!select) return;
  select.innerHTML = '';
  
  Object.keys(SONGS).forEach(key => {
    const data = SONGS[key];
    // Mostrar si no está bloqueada O si ya fue desbloqueada en el estado
    if (data.locked && !STATE.meta.songGam3Bo1Unlocked) return; 
    
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `"${key.toUpperCase()}"`;
    select.appendChild(opt);
  });
  
  // Si la selección actual ya no es válida (ej. se bloqueó), resetear a swim
  if (!select.querySelector(`option[value="${cancionSel}"]`)) {
     cancionSel = "swim";
     select.value = "swim";
  } else {
     select.value = cancionSel;
  }
}

function iniciarCancionRitmo() {
  if(getCount(25) <= 0) return alert("Necesitas Idol Wolfy");
  const song = SONGS[cancionSel];
  if(!song) return;
  
  const audio = $('audio-player');
  audio.src = song.file;
  audio.load();
  
  rhythmState.notes = song.notes.map(n => ({ ...n, hit: false, elem: null, state: 'pending' }));
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

// ===== UI RENDERING =====
function renderShop() {
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

// ===== COLECCIONES Y LORE =====
const COLECCIONES_DEF = [
  {
    id: "col_innovaciones",
    nombre: "Colección 3: Innovaciones Extraordinarias",
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

function abrirPaqueteBasico() {
  const costo = 500;
  if (STATE.wolfbytes < costo) return alert(`Necesitas ${costo} WB.`);
  
  STATE.wolfbytes -= costo;
  
  const todosLibros = [];
  COLECCIONES_DEF.forEach(col => {
    col.libros.forEach(libro => {
      todosLibros.push({ ...libro, coleccionId: col.id });
    });
  });

  for(let i=0; i<5; i++) {
    const randomIdx = Math.floor(Math.random() * todosLibros.length);
    const libroElegido = todosLibros[randomIdx];
    
    if (!STATE.meta.librosProgreso[libroElegido.id]) {
      STATE.meta.librosProgreso[libroElegido.id] = 0;
    }
    
    if (STATE.meta.librosProgreso[libroElegido.id] < libroElegido.paginasTotales) {
      STATE.meta.librosProgreso[libroElegido.id]++;
      
      if (STATE.meta.librosProgreso[libroElegido.id] >= libroElegido.paginasTotales) {
        STATE.wolfbytes += libroElegido.rewardWolfbytes;
        alert(`📖 ¡COMPLETADO: ${libroElegido.nombre}!\nRecompensa: +${libroElegido.rewardWolfbytes} WB`);
      }
    } else {
      alert(`🔄 Página repetida: ${libroElegido.nombre}`);
    }
  }
  
  saveGame();
  renderizarListaLibrosModal();
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

// ===== MODAL LIBROS UI =====
function abrirModalLibros() {
  const modal = $("modal-libros");
  if (!modal) return;
  modal.style.display = "flex";
  cambiarModalTab(STATE.ui.modalTab || 'col_1');
}

function cerrarModalLibros() {
  const modal = $("modal-libros");
  if (modal) modal.style.display = "none";
}

function cambiarModalTab(tab) {
  STATE.ui.modalTab = tab;
  
  const tabsContainer = $("tabs-colecciones");
  if(tabsContainer) {
    tabsContainer.innerHTML = '';
    COLECCIONES_DEF.forEach(col => {
      const btn = document.createElement('button');
      btn.className = `btn-pestana ${tab === col.id ? 'active' : ''}`;
      btn.textContent = col.nombre.split(':')[0]; 
      btn.onclick = () => cambiarModalTab(col.id);
      tabsContainer.appendChild(btn);
    });
    
    const btnTienda = document.createElement('button');
    btnTienda.className = `btn-pestana ${tab === 'tienda' ? 'active' : ''}`;
    btnTienda.textContent = "📦 Mercado";
    btnTienda.onclick = () => cambiarModalTab('tienda');
    tabsContainer.appendChild(btnTienda);
  }

  const vistaLibros = $("vista-libros-modal");
  const vistaTienda = $("vista-tienda-modal");
  
  if (tab === 'tienda') {
    if(vistaLibros) vistaLibros.style.display = "none";
    if(vistaTienda) vistaTienda.style.display = "flex";
    const visorWB = $("visor-wb-modal");
    if(visorWB) visorWB.innerText = fmt(STATE.wolfbytes);
  } else {
    if(vistaLibros) vistaLibros.style.display = "flex";
    if(vistaTienda) vistaTienda.style.display = "none";
    renderizarListaLibrosModal();
  }
}

function renderizarListaLibrosModal() {
  const listaUI = $("lista-libros-ui");
  const detalleUI = $("detalle-libro-ui");
  if (!listaUI || !detalleUI) return;

  const coleccion = COLECCIONES_DEF.find(c => c.id === STATE.ui.modalTab);
  if (!coleccion) return;

  listaUI.innerHTML = '';
  detalleUI.innerHTML = '<p class="placeholder-text">Selecciona un libro...</p>';

  coleccion.libros.forEach(libro => {
    const progreso = STATE.meta.librosProgreso[libro.id] || 0;
    const completado = progreso >= libro.paginasTotales;
    
    const item = document.createElement('div');
    item.className = `item-libro-btn ${completado ? 'completado' : ''}`;
    item.innerHTML = `
      <span>${completado ? '📖' : '🔒'} ${libro.nombre}</span>
      <span class="badge-rareza rareza-${normalizarRareza(libro.rareza)}">${libro.rareza}</span>
      <small>${progreso}/${libro.paginasTotales}</small>
    `;
    
    item.onclick = () => {
      if (completado) {
        detalleUI.innerHTML = `
          <div class="libro-contenido">
            <h3>📖 ${libro.nombre}</h3>
            <hr>
            <p class="lore-texto">${libro.lore}</p>
            <hr>
            <div class="reward-info">💾 Recompensa: +${libro.rewardWolfbytes} WB</div>
          </div>
        `;
      } else {
        detalleUI.innerHTML = `
          <div class="bloqueado-info">
            <h3>🔒 ${libro.nombre}</h3>
            <p>Necesitas ${libro.paginasTotales - progreso} páginas más.</p>
            <small>Abre paquetes en el Mercado para conseguirlas.</small>
          </div>
        `;
      }
    };
    
    listaUI.appendChild(item);
  });
}

// ===== LOGROS =====
const LOGROS_DEFS = [
  { id: "badge-1", titulo: "Primer Ahorro", cond: () => STATE.currency >= 100 },
  { id: "badge-2", titulo: "Alcancía Llena", cond: () => STATE.currency >= 500 },
  { id: "badge-3", titulo: "Woof!!", cond: () => getCount(3) >= 1 },
  { id: "badge-4", titulo: "Familia Creciente", cond: () => getCount(3) >= 10 },
  { id: "badge-5", titulo: "Anillo Peludo", cond: () => getCount(3) >= 50 },
  { id: "badge-6", titulo: "Colonia Lupina", cond: () => getCount(3) >= 250 },
  { id: "badge-7", titulo: "Pelurno", cond: () => getCount(3) >= 1000 },
  { id: "badge-8", titulo: "Organización Creciente", cond: () => STATE.stats.wcs >= 10 },
  { id: "badge-9", titulo: "Fuerza Lupina", cond: () => STATE.stats.wcs >= 100 },
  { id: "badge-10", titulo: "Empresario Domador", cond: () => STATE.stats.wcs >= 1000 },
  { id: "badge-11", titulo: "Recolector Casual", cond: () => getCount(6) >= 1 },
  { id: "badge-12", titulo: "Jardín", cond: () => getCount(6) >= 10 },
  { id: "badge-13", titulo: "Farmeando", cond: () => getCount(6) >= 100 },
  { id: "badge-14", titulo: "Trabajo Duro", cond: () => getCount(8) >= 1 },
  { id: "badge-15", titulo: "Mine Sin Craft", cond: () => getCount(8) >= 5 },
  { id: "badge-16", titulo: "Diamantes?", cond: () => getCount(8) >= 25 },
  { id: "badge-17", titulo: "Pastelería Lupina", cond: () => getCount(12) >= 1 },
  { id: "badge-18", titulo: "Mito Confirmado", cond: () => false }, 
  { id: "badge-19", titulo: "Olor Papel", cond: () => getCount(16) >= 1 },
  { id: "badge-20", titulo: "Speedrunner", cond: () => false }, 
  { id: "badge-21", titulo: "Comegalletas", cond: () => false } 
];

function unlockAchievement(id) {
  if (!STATE.meta.achievementsDone.includes(id)) {
    STATE.meta.achievementsDone.push(id);
    const logro = LOGROS_DEFS.find(l => l.id === id);
    if(logro) alert(`🏆 ¡LOGRO DESBLOQUEADO!: ${logro.titulo}`);
    saveGame();
    actualizarBadges();
  }
}

function actualizarBadges() {
  const badgeUI = $("contenedor-badges");
  if (!badgeUI) return;
  
  let html = "";
  LOGROS_DEFS.forEach(logro => {
    const completado = STATE.meta.achievementsDone.includes(logro.id);
    if (completado) {
      html += `<div class="logro completado"><strong>${logro.titulo}</strong></div>`;
    } else {
      html += `<div class="logro bloqueado"><strong>???</strong></div>`;
    }
  });
  badgeUI.innerHTML = html;
}

setInterval(() => {
  LOGROS_DEFS.forEach(logro => {
    if (!STATE.meta.achievementsDone.includes(logro.id) && logro.cond()) {
      unlockAchievement(logro.id);
    }
  });
}, 1000);

// ===== TEMAS VISUALES =====
function aplicarClasesTema() {
  document.body.classList.remove("tema-default","tema-verde","tema-amarillo","tema-azul","tema-retro","tema-waffles");
  
  if (STATE.meta.themeRetroActive) {
    document.body.classList.add("tema-retro");
    STATE.buffs.bgMult = 2.5;
  } else if (STATE.meta.themeWafflesActive) {
    document.body.classList.add("tema-waffles");
    STATE.buffs.bgMult = 3.0;
  } else {
    document.body.classList.add("tema-default");
    STATE.buffs.bgMult = 1.0;
  }
  recalculateStats();
}

function alternarTemaRetro() {
  if (!STATE.meta.themeRetroUnlocked) return alert("🔒 Completa la colección para desbloquear.");
  STATE.meta.themeRetroActive = !STATE.meta.themeRetroActive;
  if (STATE.meta.themeRetroActive) STATE.meta.themeWafflesActive = false;
  aplicarClasesTema();
  saveGame();
}

function alternarTemaWaffles() {
  if (!STATE.meta.themeWafflesUnlocked) return alert("🔒 Completa la colección para desbloquear.");
  STATE.meta.themeWafflesActive = !STATE.meta.themeWafflesActive;
  if (STATE.meta.themeWafflesActive) STATE.meta.themeRetroActive = false;
  aplicarClasesTema();
  saveGame();
}

function applyThemeFromMeta() {
  aplicarClasesTema();
}

// ===== GAMER WOLFY (ACTUALIZADO CON TUS PROBABILIDADES) =====
function activarGamerWolfy() {
  const COSTO = 100000;
  if (STATE.currency < COSTO) return alert(`Necesitas ${fmt(COSTO)} WC`);
  
  STATE.currency -= COSTO;
  
  // Generar número aleatorio entre 0 y 100 para determinar el premio
  const roll = Math.random() * 100;
  let mensaje = "";
  let premioTexto = "";

  // Distribución sugerida:
  // 0-40: Wolfichas (Común)
  // 40-70: Wolfilletes (Raro)
  // 70-95: Wolfbytes (Épico)
  // 95-100: Canción GAM3 BO1 (Legendario)

  if (roll < 40) {
    // Premios de Wolfichas: 101,000 a 999,999
    const minWC = 101000;
    const maxWC = 999999;
    const ganancia = Math.floor(Math.random() * (maxWC - minWC + 1)) + minWC;
    STATE.currency += ganancia;
    mensaje = `💰 ¡Premio en efectivo! Ganaste ${fmt(ganancia)} Wolfichas.`;
    premioTexto = `${fmt(ganancia)} WC`;
  } 
  else if (roll < 70) {
    // Premios de Wolfilletes: 10 a 100
    const minWL = 10;
    const maxWL = 100;
    const ganancia = Math.floor(Math.random() * (maxWL - minWL + 1)) + minWL;
    STATE.wolfilletes += ganancia;
    mensaje = `💵 ¡Billetes frescos! Ganaste ${ganancia} Wolfilletes.`;
    premioTexto = `${ganancia} WL`;
  }
  else if (roll < 95) {
    // Premios de Wolfbytes: 100 a 5000
    const minWB = 100;
    const maxWB = 5000;
    const ganancia = Math.floor(Math.random() * (maxWB - minWB + 1)) + minWB;
    STATE.wolfbytes += ganancia;
    mensaje = `💾 ¡Datos valiosos! Ganaste ${fmt(ganancia)} Wolfbytes.`;
    premioTexto = `${fmt(ganancia)} WB`;
  }
  else {
    // JACKPOT: Canción GAM3 BO1
    if (!STATE.meta.songGam3Bo1Unlocked) {
      STATE.meta.songGam3Bo1Unlocked = true;
      mensaje = `🎵 ¡JACKPOT LEGENDARIO! Has desbloqueado la canción secreta: "GAM3 BO1" de SEVENTEEN para el modo Idol Wolfy.`;
      premioTexto = "🎶 GAM3 BO1 Unlocked";
      
      // Refrescar el selector de canciones inmediatamente
      actualizarSelectorCanciones();
    } else {
      // Si ya la tiene, dar un consolación grande de WC
      const consolation = 500000;
      STATE.currency += consolation;
      mensaje = `🎁 Ya tenías la canción, pero Gamer Wolfy te dio una compensación: +${fmt(consolation)} WC.`;
      premioTexto = `${fmt(consolation)} WC`;
    }
  }

  alert(mensaje);
  saveGame();
  updateUI();
}

// ===== LOOP PRINCIPAL =====
setInterval(() => {
  STATE.currency += STATE.stats.wcs;
  if(Math.random() < 0.01) spawnBone(true);
  updateUI();
}, 1000);

setInterval(saveGame, 5000);

// ===== INICIO =====
window.onload = () => {
  loadGame();
  renderShop();
  updateUI();
  actualizarBadges();
  actualizarSelectorCanciones(); // Importante para mostrar Gam3Bo1 si ya estaba desbloqueada
  initCookieLoop();
  initChatStream();
  aplicarClasesTema();
  
  // Aplicar temas secretos guardados
  const savedSecret = localStorage.getItem("wolfy_secret_theme");
  if(savedSecret === "nausea") window.modoNauseaActivo = true;
  if(savedSecret === "drunk") window.modoBorrachoActivo = true;
  
  if(window.modoNauseaActivo) document.body.classList.add("tema-nauseabundo");
  if(window.modoBorrachoActivo) document.body.classList.add("tema-drunk");
};

// ===== EASTER EGGS SECRETOS (NÁUSEA Y BORRACHO) =====
(function () {
  const SECRET_THEME_KEY = "wolfy_secret_theme";
  
  function guardarModoSecreto(modo) {
    try {
      if (!modo) localStorage.removeItem(SECRET_THEME_KEY);
      else localStorage.setItem(SECRET_THEME_KEY, modo);
    } catch (e) {}
  }

  Object.defineProperty(window, "vomitar", {
    configurable: true,
    get: function () { 
      window.modoNauseaActivo = true;
      window.modoBorrachoActivo = false;
      document.body.classList.remove("tema-drunk");
      document.body.classList.add("tema-nauseabundo");
      guardarModoSecreto("nausea");
      alert("🤮 Modo Náusea Activado. Escribe 'medicina' para parar.");
      return "🤮 Modo Náusea."; 
    }
  });

  Object.defineProperty(window, "green_screen_of_death", {
    configurable: true,
    get: function () { return window.vomitar; }
  });

  Object.defineProperty(window, "medicina", {
    configurable: true,
    get: function () {
      window.modoNauseaActivo = false;
      window.modoBorrachoActivo = false;
      document.body.classList.remove("tema-nauseabundo");
      document.body.classList.remove("tema-drunk");
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
    get: function () { 
      window.modoBorrachoActivo = true;
      window.modoNauseaActivo = false;
      document.body.classList.remove("tema-nauseabundo");
      document.body.classList.add("tema-drunk");
      guardarModoSecreto("drunk");
      alert("🍻 Modo Borracho Activado. Escribe 'sobrio' para parar.");
      return "🍺 Modo Borracho."; 
    }
  });

  Object.defineProperty(window, "drunk", {
    configurable: true,
    get: function () { return window.borracho; }
  });

  Object.defineProperty(window, "sobrio", {
    configurable: true,
    get: function () {
      window.modoNauseaActivo = false;
      window.modoBorrachoActivo = false;
      document.body.classList.remove("tema-nauseabundo");
      document.body.classList.remove("tema-drunk");
      guardarModoSecreto(null);
      return "☕ Sobrio.";
    }
  });

  Object.defineProperty(window, "cafe", {
    configurable: true,
    get: function () { return window.sobrio; }
  });
})();
