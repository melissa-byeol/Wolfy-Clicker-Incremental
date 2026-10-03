// ===== ESTADO DEL JUEGO =====
const GAME = {
    wc: 0,
    wcs: 0,
    clickPower: 1,
    inventory: {}, // { itemId: count }
    buffs: { cookieMult: 1 },
    meta: { unlockedThemes: [], achievements: [] }
};

// ===== CATÁLOGO MÍNIMO =====
const ITEMS = [
    // Mejoras de Clic (Únicas)
    { id: 'u_heavy', name: 'Heavy Click', type: 'upgrade', cost: 50, effect: () => GAME.clickPower *= 2 },
    { id: 'u_strong', name: 'Stronger Click', type: 'upgrade', cost: 750, effect: () => GAME.clickPower *= 2 },
    { id: 'u_super', name: 'Super Click', type: 'upgrade', cost: 5500, effect: () => GAME.clickPower *= 3 },
    
    // Edificios (Repetibles)
    { id: 'b_clicker', name: 'Clicker Wolfy', type: 'building', baseCost: 10, growth: 1.15, prod: 0.1 },
    { id: 'b_streamer', name: 'Streamer Wolfy', type: 'building', baseCost: 120000, growth: 1.15, prod: 200 }
];

// ===== UTILIDADES =====
const $ = id => document.getElementById(id);
const fmt = n => Math.floor(n).toLocaleString();

function getCost(item) {
    if (item.type === 'upgrade') return item.cost;
    const count = GAME.inventory[item.id] || 0;
    return Math.floor(item.baseCost * Math.pow(item.growth, count));
}

// ===== MOTOR DE CÁLCULO =====
function recalc() {
    let rawProd = 0;
    for (const id in GAME.inventory) {
        const item = ITEMS.find(i => i.id === id);
        if (item && item.prod) {
            rawProd += (GAME.inventory[id] * item.prod);
        }
    }
    GAME.wcs = rawProd * GAME.buffs.cookieMult;
}

// ===== ACCIONES PRINCIPALES =====
function doClick() {
    const gain = GAME.clickPower * GAME.buffs.cookieMult;
    GAME.wc += gain;
    createFloatText(`+${gain.toFixed(1)}`);
    updateUI();
}

function buyItem(id) {
    const item = ITEMS.find(i => i.id === id);
    if (!item) return;

    const cost = getCost(item);
    if (GAME.wc < cost) return alert("No tienes suficientes Wolfichas.");

    GAME.wc -= cost;
    GAME.inventory[id] = (GAME.inventory[id] || 0) + 1;
    
    if (item.effect) item.effect();
    
    recalc();
    renderShop();
    updateUI();
    saveGame();
}

// ===== UI RENDERIZADO =====
function renderShop() {
    const upgList = $('list-click-upgrades');
    const bldList = $('list-buildings');
    
    upgList.innerHTML = '';
    bldList.innerHTML = '';

    ITEMS.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'shop-item';
        const count = GAME.inventory[item.id] || 0;
        const cost = getCost(item);
        const isOwned = item.type === 'upgrade' && count > 0;
        
        btn.innerHTML = `
            <span class="item-name">${item.name} ${item.type==='building'?`x${count}`:''}</span>
            <span class="item-cost">${isOwned ? '✔' : fmt(cost) + ' WC'}</span>
        `;
        
        btn.disabled = isOwned || GAME.wc < cost;
        btn.onclick = () => buyItem(item.id);
        
        if (item.type === 'upgrade') upgList.appendChild(btn);
        else bldList.appendChild(btn);
    });
}

function updateUI() {
    $('wc-display').innerText = `${fmt(GAME.wc)} WC`;
    $('wcs-display').innerText = `+${GAME.wcs.toFixed(1)}/s`;
}

function createFloatText(text) {
    const layer = $('float-layer');
    const el = document.createElement('div');
    el.className = 'float-num';
    el.innerText = text;
    // Posición aleatoria cerca del centro
    el.style.left = (Math.random() * 100) + '%';
    el.style.top = (Math.random() * 100) + '%';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// ===== SISTEMA DE TABS DERECHA =====
document.querySelectorAll('.side-tabs button').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.side-tabs button').forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        
        document.querySelectorAll('.side-content').forEach(c => c.classList.add('hidden'));
        $(btn.dataset.view).classList.remove('hidden');
    };
});

// ===== MINI-JUEGO RITMO (BÁSICO CANVAS) =====
const canvas = $('rhythm-canvas');
const ctx = canvas.getContext('2d');
let rhythmActive = false;
let notes = [];
let score = 0;
let lastTime = 0;

// Notas de prueba: [tiempo_segundos, carril(0-3), tipo(tap/hold/flick)]
const DEMO_NOTES = [
    { t: 1, c: 0, type: 'tap' },
    { t: 2, c: 1, type: 'tap' },
    { t: 3, c: 2, type: 'hold', dur: 1.5 },
    { t: 5, c: 3, type: 'flick' },
    { t: 6, c: 0, type: 'tap' }
];

function startRhythm() {
    if (rhythmActive) return;
    rhythmActive = true;
    notes = DEMO_NOTES.map(n => ({ ...n, hit: false, spawned: false }));
    score = 0;
    lastTime = performance.now();
    requestAnimationFrame(gameLoopRhythm);
}

function stopRhythm() {
    rhythmActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoopRhythm(timestamp) {
    if (!rhythmActive) return;
    
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    // Limpiar canvas
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar líneas de lanes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    for(let i=1; i<4; i++) {
        ctx.moveTo((canvas.width/4)*i, 0);
        ctx.lineTo((canvas.width/4)*i, canvas.height);
    }
    ctx.stroke();
    
    // Dibujar zona de impacto
    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 4);

    // Actualizar y dibujar notas
    notes.forEach(note => {
        if (note.hit) return;
        
        // Calcular posición Y basada en tiempo restante
        const timeUntilHit = note.t - (performance.now()/1000 % 10); // Loop simple para demo
        // Nota: Esto es una simplificación extrema. En un juego real usarías audio.currentTime
        
        // Para esta demo visual rápida, usamos un contador global simulado
        // Reemplazaremos esto por sincronización real si añades MP3
        
        const yPos = (note.t - getCurrentSimulatedTime()) * 100; 
        
        if (yPos > -50 && yPos < canvas.height + 50) {
            const laneWidth = canvas.width / 4;
            const x = note.c * laneWidth;
            const w = laneWidth * 0.8;
            const h = note.type === 'hold' ? 40 : 20;
            
            ctx.fillStyle = note.type === 'flick' ? 'gold' : (note.type === 'hold' ? '#00ffc8' : '#ff007f');
            ctx.fillRect(x + (laneWidth-w)/2, yPos, w, h);
        }
        
        // Check Miss
        if (getCurrentSimulatedTime() > note.t + 0.5 && !note.hit) {
            note.hit = true; // Marcar como fallada para no dibujarla más
        }
    });

    requestAnimationFrame(gameLoopRhythm);
}

// Helper simulado para la demo visual (sin audio real aún)
let simTime = 0;
setInterval(() => { if(rhythmActive) simTime += 0.1; }, 100);
function getCurrentSimulatedTime() { return simTime; }

$('btn-play-song').onclick = startRhythm;
$('btn-stop-song').onclick = stopRhythm;

// Input Ritmo (Teclado)
window.addEventListener('keydown', e => {
    if (!rhythmActive) return;
    const map = {'a':0, 's':1, 'd':2, 'f':3};
    const lane = map[e.key.toLowerCase()];
    if (lane !== undefined) checkHit(lane);
});

function checkHit(laneIdx) {
    const now = getCurrentSimulatedTime();
    const candidate = notes.find(n => n.c === laneIdx && !n.hit && Math.abs(n.t - now) < 0.3);
    
    if (candidate) {
        candidate.hit = true;
        score += 100;
        $('score-display').innerText = `Score: ${score}`;
        GAME.wc += 100; // Recompensa directa
        updateUI();
    }
}

// ===== CHAT STREAMER SIMULADO =====
const chatMsgs = ["¡Hola!", "Genial el juego", "Donación enviada", "Wolfy best boy"];
setInterval(() => {
    if ((GAME.inventory['b_streamer'] || 0) > 0) {
        const box = $('chat-box');
        const msg = document.createElement('div');
        msg.className = Math.random() > 0.8 ? 'msg-hater' : 'msg-vip';
        msg.innerText = chatMsgs[Math.floor(Math.random()*chatMsgs.length)];
        box.prepend(msg);
        if(box.children.length > 10) box.lastChild.remove();
    }
}, 5000);

// ===== TERMINAL SECRETA =====
$('btn-terminal').onclick = () => $('modal-term').classList.remove('hidden');
$('btn-close-term').onclick = () => $('modal-term').classList.add('hidden');

$('term-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const cmd = e.target.value.toLowerCase();
        logTerm(`> ${cmd}`);
        
        if (cmd === 'help') logTerm("Comandos: vomitar, medicina, reset");
        if (cmd === 'vomitar') { document.body.style.filter = 'invert(1) hue-rotate(180deg)'; logTerm("MODO CAOS ACTIVADO"); }
        if (cmd === 'medicina') { document.body.style.filter = 'none'; logTerm("Curado."); }
        if (cmd === 'reset') { localStorage.clear(); location.reload(); }
        
        e.target.value = "";
    }
});

function logTerm(txt) {
    const log = $('term-log');
    const div = document.createElement('div');
    div.innerText = txt;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

// ===== GUARDADO =====
function saveGame() {
    localStorage.setItem('wolfy_v4_save', JSON.stringify(GAME));
}

function loadGame() {
    const raw = localStorage.getItem('wolfy_v4_save');
    if (raw) {
        Object.assign(GAME, JSON.parse(raw));
        recalc();
    }
}

// ===== INICIO =====
window.onload = () => {
    loadGame();
    renderShop();
    updateUI();
    
    // Loop de producción pasiva
    setInterval(() => {
        GAME.wc += GAME.wcs;
        updateUI();
        if(Math.random() < 0.05) saveGame(); // Guardado ocasional
    }, 1000);
};

// Evento Click Principal
$('main-coin').onclick = doClick;
