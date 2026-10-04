// bruhh

// ===== ESTADO DEL JUEGO =====
const GAME = {
    wc: 0,
    wcs: 0,
    clickPower: 1,
    inventory: {}, // { itemId: count }
    buffs: { cookieMult: 1 },
    meta: { unlockedThemes: [], achievements: [] },
    
    // Speedrun Data
    totalClicks: 0,
    records: { fastestRunMs: null, runsCompleted: 0 },
    session: { startTime: null, isRunning: false, targetAmount: 1000 },

    // Fishing State
    fishing: {
        isActive: false,
        phase: 'idle', // idle, waiting, moving, result
        indicatorPos: 0, // 0 a 100 (%)
        direction: 1, // 1 baja, -1 sube
        speed: 1.5, // Velocidad base
        zones: [], // Configuración de zonas actuales
        fishType: null // Objeto del pez capturado
    }
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

// ===== LISTA DE PECES / ITEMS DE PESCA =====
const FISH_TABLE = [
    { id: 'common_fish', name: 'Pez Común', rarity: 'Común', weight: 50, rewardWC: 50, icon: '🐟' },
    { id: 'golden_fish', name: 'Pez Dorado', rarity: 'Raro', weight: 20, rewardWC: 500, icon: '✨' },
    { id: 'boot', name: 'Bota Vieja', rarity: 'Basura', weight: 15, rewardWC: 10, icon: '👢' },
    { id: 'mystic_bone', name: 'Hueso Místico', rarity: 'Épico', weight: 10, rewardWC: 2000, buff: 'bone_x2_30s', icon: '🦴' },
    { id: 'legendary_koi', name: 'Koi Legendario', rarity: 'Legendario', weight: 5, rewardWC: 10000, icon: '🎏' }
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
    // Speedrun Trigger
    if (GAME.wc === 0 && !GAME.session.isRunning) {
        startSpeedrunTimer();
    }

    GAME.totalClicks++;
    const gain = GAME.clickPower * GAME.buffs.cookieMult;
    GAME.wc += gain;
    
    createFloatText(`+${gain.toFixed(1)}`);
    
    checkSpeedrunCompletion();
    checkBadges(); 
    
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
    $('wcs-display').innerText = `+${GAME.wcs.toFixed(1)}/s | 💵 ${GAME.meta.wolfilletes || 0} | 💾 ${GAME.meta.wolfbytes || 0}`;
    
    // Timer Display
    const timerDisplay = $('speedrun-timer');
    if (timerDisplay) {
        if (GAME.session.isRunning) {
            const now = performance.now();
            const elapsed = now - GAME.session.startTime;
            timerDisplay.innerText = `⏱️ RUN: ${formatMilliseconds(elapsed)}`;
            timerDisplay.style.display = 'block';
        } else {
            timerDisplay.style.display = 'none';
        }
    }
}

function createFloatText(text) {
    const layer = $('float-layer');
    const el = document.createElement('div');
    el.className = 'float-num';
    el.innerText = text;
    el.style.left = (Math.random() * 80 + 10) + '%';
    el.style.top = (Math.random() * 80 + 10) + '%';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// ===== SISTEMA DE BADGES & SPEEDRUN =====
const INITIAL_BADGES = [
    { id: "badge_first_breath", title: "Primer Aliento", desc: "Haz tu primer clic.", cond: () => GAME.totalClicks >= 1, icon: "🌬️" },
    { id: "badge_penny_pincher", title: "Ahorrador", desc: "Acumula 10 WC.", cond: () => GAME.wc >= 10, icon: "🪙" },
    { id: "badge_first_employee", title: "Contratación", desc: "Compra un Clicker Wolfy.", cond: () => (GAME.inventory['b_clicker'] || 0) >= 1, icon: "🐺" },
    { id: "badge_jitter_expert", title: "Experto En Jitterclick", desc: "Alcanza 1,000 WC en <10min.", type: "record", icon: "⚡" }
];

if (!GAME.meta.badgesEarned) GAME.meta.badgesEarned = [];

function checkBadges() {
    INITIAL_BADGES.forEach(badge => {
        if (badge.type === 'record') return; // Los récords se manejan aparte
        
        if (!GAME.meta.badgesEarned.includes(badge.id) && badge.cond()) {
            GAME.meta.badgesEarned.push(badge.id);
            alert(`${badge.icon} ¡LOGRO!\n${badge.title}\n${badge.desc}`);
            renderBadges();
            saveGame();
        }
    });
}

function startSpeedrunTimer() {
    GAME.session.startTime = performance.now();
    GAME.session.isRunning = true;
}

function checkSpeedrunCompletion() {
    if (!GAME.session.isRunning) return;
    
    const currentTime = performance.now();
    const elapsedMs = currentTime - GAME.session.startTime;
    
    if (GAME.wc >= GAME.session.targetAmount) {
        finishSpeedrun(elapsedMs);
    }
    
    if (elapsedMs > 10 * 60 * 1000) { // 10 minutos límite
        cancelSpeedrun("Tiempo agotado");
    }
}

function finishSpeedrun(timeMs) {
    GAME.session.isRunning = false;
    GAME.records.runsCompleted++;
    
    let isNewRecord = false;
    if (GAME.records.fastestRunMs === null || timeMs < GAME.records.fastestRunMs) {
        GAME.records.fastestRunMs = timeMs;
        isNewRecord = true;
    }
    
    const formattedTime = formatMilliseconds(timeMs);
    
    // Desbloquear badge si es primera vez o nuevo récord
    if (!GAME.meta.badgesEarned.includes('badge_jitter_expert')) {
        GAME.meta.badgesEarned.push('badge_jitter_expert');
    }
    
    if (isNewRecord) {
        alert(`🏆 ¡NUEVO RÉCORD!\nTiempo: ${formattedTime}`);
    } else {
        alert(`✅ Run completado.\nTu tiempo: ${formattedTime}\nMejor: ${formatMilliseconds(GAME.records.fastestRunMs)}`);
    }
    
    saveGame();
    renderBadges();
}

function cancelSpeedrun(reason) {
    GAME.session.isRunning = false;
    console.warn(`❌ Run cancelado: ${reason}`);
}

function formatMilliseconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function renderBadges() {
    const container = $('badges-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    INITIAL_BADGES.forEach(badge => {
        const earned = GAME.meta.badgesEarned.includes(badge.id);
        const div = document.createElement('div');
        
        let extraInfo = "";
        if (badge.id === 'badge_jitter_expert' && earned) {
            extraInfo = `<br><small style="color:#e76f51;">RÉCORD: ${formatMilliseconds(GAME.records.fastestRunMs)}</small>`;
        }

        div.className = `badge-card ${earned ? 'earned' : 'locked'}`;
        div.innerHTML = `
            <span class="badge-icon">${earned ? badge.icon : '❓'}</span>
            <div class="badge-info">
                <strong>${earned ? badge.title : '???'}</strong>
                <small>${earned ? badge.desc : 'Condición desconocida...'}</small>
                ${extraInfo}
            </div>
        `;
        
        container.appendChild(div);
    });
}

// ===== MINIJUEGO DE PESCA (TIMING/CLICK) =====

function openFishingModal() {
    $('modal-fishing').classList.remove('hidden');
    resetFishingState();
    startFishingWait();
}

function closeFishingModal() {
    $('modal-fishing').classList.add('hidden');
    GAME.fishing.isActive = false;
}

function resetFishingState() {
    GAME.fishing.phase = 'waiting';
    GAME.fishing.indicatorPos = 0;
    GAME.fishing.direction = 1;
    GAME.fishing.speed = 1.5;
    GAME.fishing.zones = generateRandomZones();
    
    // Resetear UI
    $('fish-status-text').innerText = "Esperando picada...";
    $('fish-result-msg').innerText = "";
    $('fish-result-msg').className = "result-msg";
    
    // Ocultar todas las zonas inicialmente hasta que empiece
    document.querySelectorAll('.zone').forEach(z => z.style.opacity = '0');
    $('fish-indicator').style.top = '0%';
}

function generateRandomZones() {
    // Generamos posiciones aleatorias para las zonas de dificultad
    // Formato: { id, start (%), end (%) }
    const zones = [];
    let currentPos = 0;
    
    // Definimos tamaños relativos (ej: Perfecto es pequeño, Peligro es grande)
    const configs = [
        { id: 'blackout', size: 5, colorClass: 'black' },   // Negro (Perder instantáneo si toca al inicio?) -> Lo ponemos como riesgo alto
        { id: 'danger', size: 15, colorClass: 'red' },      // Rojo (Mal)
        { id: 'bad', size: 20, colorClass: 'orange' },      // Naranja (Meh)
        { id: 'ok', size: 25, colorClass: 'yellow' },       // Amarillo (Bien)
        { id: 'good', size: 20, colorClass: 'green' },      // Verde (Excelente)
        { id: 'perfect', size: 10, colorClass: 'rainbow' }  // Arcoiris (Perfecto)
    ];

    // Mezclamos orden para que no sea siempre igual
    configs.sort(() => Math.random() - 0.5);

    let accumulatedHeight = 0;
    configs.forEach(cfg => {
        const heightPercent = cfg.size; // Porcentaje de altura total
        zones.push({
            ...cfg,
            start: accumulatedHeight,
            end: accumulatedHeight + heightPercent
        });
        accumulatedHeight += heightPercent;
    });
    
    // Normalizar para que sumen 100%
    const total = accumulatedHeight;
    zones.forEach(z => {
        z.start = (z.start / total) * 100;
        z.end = (z.end / total) * 100;
    });

    return zones;
}

function drawZones() {
    const container = $('.bar-container');
    // Limpiar zonas anteriores visuales (opcional, pero bueno para debug)
    // Aquí simplemente aplicamos estilos CSS basados en los datos
    
    GAME.fishing.zones.forEach(zoneData => {
        const el = $(`zone-${zoneData.id}`);
        if(el) {
            el.style.top = zoneData.start + '%';
            el.style.height = (zoneData.end - zoneData.start) + '%';
            el.style.opacity = '0.9'; // Hacer visibles
        }
    });
}

function startFishingWait() {
    GAME.fishing.phase = 'waiting';
    $('fish-status-text').innerText = "Esperando picada...";
    
    // Tiempo aleatorio entre 2 y 5 segundos
    const waitTime = 2000 + Math.random() * 3000;
    
    setTimeout(() => {
        if(GAME.fishing.phase === 'waiting') {
            startFightingPhase();
        }
    }, waitTime);
}

function startFightingPhase() {
    GAME.fishing.phase = 'moving';
    $('fish-status-text').innerText = "¡PELEANDO! ¡CLIC EN LA ZONA CORRECTA!";
    drawZones(); // Mostrar las barras de color
    
    // Iniciar animación del indicador
    animateIndicator();
}

let animFrameId = null;
function animateIndicator() {
    if (GAME.fishing.phase !== 'moving') return;

    // Mover indicador
    GAME.fishing.indicatorPos += GAME.fishing.direction * GAME.fishing.speed;
    
    // Rebote en bordes
    if (GAME.fishing.indicatorPos >= 100) {
        GAME.fishing.indicatorPos = 100;
        GAME.fishing.direction = -1;
    } else if (GAME.fishing.indicatorPos <= 0) {
        GAME.fishing.indicatorPos = 0;
        GAME.fishing.direction = 1;
    }

    // Actualizar posición visual
    $('fish-indicator').style.top = GAME.fishing.indicatorPos + '%';

    // Acelerar ligeramente con el tiempo para aumentar dificultad
    GAME.fishing.speed += 0.005;

    animFrameId = requestAnimationFrame(animateIndicator);
}

function handleFishClick() {
    if (GAME.fishing.phase !== 'moving') return;

    // Detener animación inmediatamente
    cancelAnimationFrame(animFrameId);
    GAME.fishing.phase = 'result';

    const pos = GAME.fishing.indicatorPos;
    let resultZone = null;

    // Encontrar en qué zona cayó el clic
    for (const zone of GAME.fishing.zones) {
        if (pos >= zone.start && pos <= zone.end) {
            resultZone = zone;
            break;
        }
    }

    processCatchResult(resultZone);
}

function processCatchResult(zone) {
    const msgEl = $('fish-result-msg');
    let message = "";
    let className = "";
    let reward = 0;
    let fishIcon = "❓";

    if (!zone) {
        // Cayó fuera de rango (debería ser imposible dada la lógica, pero por seguridad)
        message = "Fallaste el golpe.";
        className = "msg-fail";
    } else {
        switch(zone.id) {
            case 'perfect':
                message = "¡PERFECTO! Captura Legendaria.";
                className = "msg-success";
                // Selección ponderada de peces legendarios/épicos
                fishIcon = pickFishByRarity(['Legendario', 'Épico']);
                reward = calculateReward(fishIcon);
                break;
            case 'good':
                message = "¡EXCELENTE! Buen pez.";
                className = "msg-success";
                fishIcon = pickFishByRarity(['Raro', 'Épico']);
                reward = calculateReward(fishIcon);
                break;
            case 'ok':
                message = "Bien. Pez común.";
                className = "msg-success"; // Consideramos éxito menor
                fishIcon = pickFishByRarity(['Común']);
                reward = calculateReward(fishIcon);
                break;
            case 'bad':
                message = "Meh... Solo basura.";
                className = "msg-lost";
                fishIcon = "👢";
                reward = 10; // Poco dinero
                break;
            case 'danger':
                message = "MAL. La caña crujió.";
                className = "msg-fail";
                fishIcon = "💔";
                reward = 0;
                break;
            case 'blackout':
                message = "NEGRO. Item perdido en el fondo.";
                className = "msg-lost";
                fishIcon = "🕳️";
                reward = 0;
                break;
        }
    }

    msgEl.innerText = `${message} ${fishIcon} (+${fmt(reward)} WC)`;
    msgEl.className = `result-msg ${className}`;
    
    GAME.wc += reward;
    updateUI();
    saveGame();

    // Opción de reintentar después de 2 segundos
    setTimeout(() => {
        if($('modal-fishing').classList.contains('hidden')) return; // Si cerró, no hacer nada
        resetFishingState();
        startFishingWait();
    }, 2000);
}

function pickFishByRarity(rarities) {
    // Filtrar tabla por rarezas permitidas
    const candidates = FISH_TABLE.filter(f => rarities.includes(f.rarity));
    if(candidates.length === 0) return "🐟"; // Fallback
    
    // Elegir uno aleatorio
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    return chosen.icon;
}

function calculateReward(icon) {
    const fish = FISH_TABLE.find(f => f.icon === icon);
    if(!fish) return 50;
    
    // Aplicar multiplicador simple basado en rareza si quieres, o usar el definido
    return fish.rewardWC;
}

// ===== EVENT LISTENERS =====
window.onload = () => {
    loadGame();
    renderShop();
    updateUI();
    renderBadges();
    
    // Setup Tabs Derecha
    document.querySelectorAll('.side-tabs button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.side-tabs button').forEach(b => b.classList.remove('tab-active'));
            btn.classList.add('tab-active');
            
            document.querySelectorAll('.side-content').forEach(c => c.classList.add('hidden'));
            $(btn.dataset.view).classList.remove('hidden');
        };
    });

    // Botón Principal Click
    $('main-coin').onclick = doClick;
    
    // Botón Pesca
    $('btn-start-fishing').onclick = openFishingModal;
    $('btn-cancel-fish').onclick = closeFishingModal;
    $('btn-reel-in').onclick = handleFishClick; // EL CLAVE DE LA MECÁNICA

    // Terminal
    $('btn-terminal').onclick = () => $('modal-term').classList.remove('hidden');
    $('btn-close-term').onclick = () => $('modal-term').classList.add('hidden');
    $('term-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const cmd = e.target.value.toLowerCase();
            logTerm(`> ${cmd}`);
            if(cmd === 'help') logTerm("Comandos: vomitar, medicina, reset, add_wc");
            if(cmd === 'add_wc') { GAME.wc += 10000; updateUI(); logTerm("+10k WC añadido"); }
            if(cmd === 'vomitar') { document.body.style.filter = 'invert(1) hue-rotate(180deg)'; logTerm("MOD CAOS"); }
            if(cmd === 'medicina') { document.body.style.filter = 'none'; logTerm("Curado."); }
            if(cmd === 'reset') { localStorage.clear(); location.reload(); }
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

    // Loop Pasivo
    setInterval(() => {
        GAME.wc += GAME.wcs;
        updateUI();
        if(Math.random() < 0.05) saveGame();
    }, 1000);
};

// ===== GUARDADO =====
function saveGame() {
    localStorage.setItem('wolfy_v4_save', JSON.stringify(GAME));
}

function loadGame() {
    const raw = localStorage.getItem('wolfy_v4_save');
    if (raw) {
        try {
            const loaded = JSON.parse(raw);
            Object.assign(GAME, loaded);
            // Asegurar estructuras anidadas existen
            if(!GAME.records) GAME.records = { fastestRunMs: null, runsCompleted: 0 };
            if(!GAME.meta.badgesEarned) GAME.meta.badgesEarned = [];
            recalc();
        } catch(e) {
            console.error("Save corrupto", e);
        }
    }
}
