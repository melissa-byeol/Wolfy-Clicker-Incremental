/* ==========================================================================
   WOLFY CLICKER v4.2 - ANGLER EDITION (FULL CODE)
   Incluye: Economía, Badges, Speedrun y Minijuego de Pesca Customizado
   ========================================================================== */

// ===== ESTADO DEL JUEGO =====
const GAME = {
    wc: 0,
    wcs: 0,
    clickPower: 1,
    inventory: {}, // { itemId: count }
    buffs: { cookieMult: 1 },
    meta: { 
        unlockedThemes: [], 
        achievements: [],
        badgesEarned: [] 
    },
    
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
        zones: [] // Configuración de zonas actuales
    }
};

// ===== CATÁLOGO DE TIENDA =====
const ITEMS = [
    // Mejoras de Clic (Únicas)
    { id: 'u_heavy', name: 'Heavy Click', type: 'upgrade', cost: 50, effect: () => GAME.clickPower *= 2 },
    { id: 'u_strong', name: 'Stronger Click', type: 'upgrade', cost: 750, effect: () => GAME.clickPower *= 2 },
    { id: 'u_super', name: 'Super Click', type: 'upgrade', cost: 5500, effect: () => GAME.clickPower *= 3 },
    
    // Edificios (Repetibles)
    { id: 'b_clicker', name: 'Clicker Wolfy', type: 'building', baseCost: 10, growth: 1.15, prod: 0.1 },
    { id: 'b_streamer', name: 'Streamer Wolfy', type: 'building', baseCost: 120000, growth: 1.15, prod: 200 }
];

// ===== LISTA DE PECES / ITEMS DE PESCA (TU HUMOR INTEGRADO) =====
const FISH_TABLE = [
    { 
        id: 'lost_boot', 
        name: 'Bota Perdida', 
        rarity: 'Basura', 
        rewardWC: 5, 
        icon: '👢',
        desc: "No vale mucho... y está empapada."
    },
    { 
        id: 'chicken_nugget', 
        name: 'Nugget de Pollo', 
        rarity: 'Común', 
        rewardWC: 25, 
        icon: '🍗',
        desc: "Es delicioso si tu cuerpo soporta montones invisibles de sal de mar."
    },
    { 
        id: 'pufferfish', 
        name: 'Pez Globo', 
        rarity: 'Raro', 
        rewardWC: 150, 
        icon: '🐡',
        desc: "EWWWWWW, NO LO COMAS ASÍ. (Pero da mucha XP)"
    },
    { 
        id: 'sardine', 
        name: 'Sardina', 
        rarity: 'Épico', // Premio mayor por precisión
        rewardWC: 500, 
        icon: '🐟',
        desc: "Es común y pequeño... pero al menos es comestible."
    }
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
    
    if(upgList) upgList.innerHTML = '';
    if(bldList) bldList.innerHTML = '';

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
        
        if (item.type === 'upgrade' && upgList) upgList.appendChild(btn);
        else if (bldList) bldList.appendChild(btn);
    });
}

function updateUI() {
    const wcDisp = $('wc-display');
    const wcsDisp = $('wcs-display');
    
    if(wcDisp) wcDisp.innerText = `${fmt(GAME.wc)} WC`;
    if(wcsDisp) wcsDisp.innerText = `+${GAME.wcs.toFixed(1)}/s | 💵 0 | 💾 0`;
    
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
    if(!layer) return;
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
    const modal = $('modal-fishing');
    if(modal) modal.classList.remove('hidden');
    resetFishingState();
    startFishingWait();
}

function closeFishingModal() {
    const modal = $('modal-fishing');
    if(modal) modal.classList.add('hidden');
    GAME.fishing.isActive = false;
}

function resetFishingState() {
    GAME.fishing.phase = 'waiting';
    GAME.fishing.indicatorPos = 0;
    GAME.fishing.direction = 1;
    GAME.fishing.speed = 1.5;
    GAME.fishing.zones = generateRandomZones();
    
    // Resetear UI
    const statusEl = $('fish-status-text');
    if(statusEl) statusEl.innerText = "Esperando picada...";
    
    const msgEl = $('fish-result-msg');
    if(msgEl) {
        msgEl.innerText = "";
        msgEl.className = "result-msg";
    }
    
    // Ocultar todas las zonas inicialmente hasta que empiece
    document.querySelectorAll('.zone').forEach(z => z.style.opacity = '0');
    const ind = $('fish-indicator');
    if(ind) ind.style.top = '0%';
}

function generateRandomZones() {
    const zones = [];
    let currentPos = 0;
    
    // Definimos tamaños relativos (ej: Perfecto es pequeño, Peligro es grande)
    const configs = [
        { id: 'blackout', size: 5, colorClass: 'black' },   
        { id: 'danger', size: 15, colorClass: 'red' },      
        { id: 'bad', size: 20, colorClass: 'orange' },      
        { id: 'ok', size: 25, colorClass: 'yellow' },       
        { id: 'good', size: 20, colorClass: 'green' },      
        { id: 'perfect', size: 10, colorClass: 'rainbow' }  
    ];

    // Mezclamos orden para que no sea siempre igual
    configs.sort(() => Math.random() - 0.5);

    let accumulatedHeight = 0;
    configs.forEach(cfg => {
        const heightPercent = cfg.size; 
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
    GAME.fishing.zones.forEach(zoneData => {
        const el = $(`zone-${zoneData.id}`);
        if(el) {
            el.style.top = zoneData.start + '%';
            el.style.height = (zoneData.end - zoneData.start) + '%';
            el.style.opacity = '0.9'; 
        }
    });
}

function startFishingWait() {
    GAME.fishing.phase = 'waiting';
    const statusEl = $('fish-status-text');
    if(statusEl) statusEl.innerText = "Esperando picada...";
    
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
    const statusEl = $('fish-status-text');
    if(statusEl) statusEl.innerText = "¡PELEANDO! ¡CLIC EN LA ZONA CORRECTA!";
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
    const ind = $('fish-indicator');
    if(ind) ind.style.top = GAME.fishing.indicatorPos + '%';

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
    let caughtItem = null;

    if (!zone) {
        message = "Fallaste el golpe.";
        className = "msg-fail";
    } else {
        switch(zone.id) {
            case 'perfect': // Arcoiris -> Sardina (La joya oculta)
                caughtItem = FISH_TABLE.find(f => f.id === 'sardine');
                message = `¡PERFECTO! Capturaste una ${caughtItem.name}!`;
                className = "msg-success";
                break;
                
            case 'good': // Verde -> Pez Globo
                caughtItem = FISH_TABLE.find(f => f.id === 'pufferfish');
                message = `¡EXCELENTE! Un ${caughtItem.name}.`;
                className = "msg-success";
                break;
                
            case 'ok': // Amarillo -> Nugget de Pollo
                caughtItem = FISH_TABLE.find(f => f.id === 'chicken_nugget');
                message = `Bien. Encontraste un ${caughtItem.name}.`;
                className = "msg-success";
                break;
                
            case 'bad': // Naranja -> Bota Perdida
                caughtItem = FISH_TABLE.find(f => f.id === 'lost_boot');
                message = `Meh... Sacaste una ${caughtItem.name}.`;
                className = "msg-lost";
                break;
                
            case 'danger': // Rojo -> Nada/Basura extra
                message = "MAL. La caña crujió y perdiste el anzuelo.";
                className = "msg-fail";
                reward = 0;
                break;
                
            case 'blackout': // Negro -> Item perdido en el fondo
                message = "NEGRO. Algo se hundió en la oscuridad...";
                className = "msg-lost";
                reward = 0;
                break;
        }
    }

    // Si capturamos algo válido, calculamos recompensa
    if (caughtItem) {
        reward = caughtItem.rewardWC;
        // Mostrar descripción graciosa en consola
        console.log(`[PESCA] ${caughtItem.icon} ${caughtItem.name}: ${caughtItem.desc}`);
        
        // Actualizar mensaje visual incluyendo el ícono y la WC
        if(msgEl) {
            msgEl.innerHTML = `${message}<br><span style="font-size:1.5rem;">${caughtItem.icon}</span> +${fmt(reward)} WC`;
            msgEl.className = `result-msg ${className}`;
        }
    } else {
        if(msgEl) {
            msgEl.innerText = message;
            msgEl.className = `result-msg ${className}`;
        }
    }
    
    GAME.wc += reward;
    updateUI();
    saveGame();

    // Reintentar después de 2 segundos
    setTimeout(() => {
        const modal = $('modal-fishing');
        if(modal && modal.classList.contains('hidden')) return; // Si cerró, no hacer nada
        resetFishingState();
        startFishingWait();
    }, 2000);
}

// ===== EVENT LISTENERS Y INICIO =====
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
            const view = $(btn.dataset.view);
            if(view) view.classList.remove('hidden');
        };
    });

    // Botón Principal Click
    const coin = $('main-coin');
    if(coin) coin.onclick = doClick;
    
    // Botón Pesca
    const fishBtn = $('btn-start-fishing');
    if(fishBtn) fishBtn.onclick = openFishingModal;
    
    const cancelFish = $('btn-cancel-fish');
    if(cancelFish) cancelFish.onclick = closeFishingModal;
    
    const reelIn = $('btn-reel-in');
    if(reelIn) reelIn.onclick = handleFishClick; // EL CLAVE DE LA MECÁNICA

    // Terminal
    const termOpen = $('btn-terminal');
    if(termOpen) termOpen.onclick = () => $('modal-term').classList.remove('hidden');
    
    const termClose = $('btn-close-term');
    if(termClose) termClose.onclick = () => $('modal-term').classList.add('hidden');
    
    const termInput = $('term-input');
    if(termInput) {
        termInput.addEventListener('keydown', e => {
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
    }

    function logTerm(txt) {
        const log = $('term-log');
        if(log) {
            const div = document.createElement('div');
            div.innerText = txt;
            log.appendChild(div);
            log.scrollTop = log.scrollHeight;
        }
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
