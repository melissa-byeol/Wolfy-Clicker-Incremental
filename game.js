/* ==========================================================================
   WOLFY CLICKER v4.3 - ADOPTION EDITION
   Economía + Badges + Speedrun + Pesca con Adopción de Lobitos
   ========================================================================== */

// ===== ESTADO DEL JUEGO =====
const GAME = {
    wc: 0,
    wcs: 0,
    clickPower: 1,
    inventory: {}, // Edificios/Mejoras normales
    
    // NUEVO: Recursos de Pesca
    foodStock: { 
        sardine: 0, 
        nugget: 0, 
        pufferfish: 0 // Los globos no son comida segura, pero valen WC
    },
    
    // NUEVO: Herramientas
    tools: { hairDryerCount: 0, salonKitCount: 0 },
    
    // NUEVO: Lobitos Adoptados (Producción Extra)
    adoptedWolfies: 0, 

    buffs: { cookieMult: 1 },
    meta: { unlockedThemes: [], achievements: [], badgesEarned: [] },
    
    // Speedrun Data
    totalClicks: 0,
    records: { fastestRunMs: null, runsCompleted: 0 },
    session: { startTime: null, isRunning: false, targetAmount: 1000 },

    // Fishing State
    fishing: {
        isActive: false,
        phase: 'idle', // idle, waiting, moving, result, rescue_menu
        indicatorPos: 0,
        direction: 1,
        speed: 1.5,
        zones: [],
        lastCaughtItem: null // Para saber qué ofrecemos al lobo
    }
};

// ===== CATÁLOGO DE TIENDA =====
const ITEMS = [
    { id: 'u_heavy', name: 'Heavy Click', type: 'upgrade', cost: 50, effect: () => GAME.clickPower *= 2 },
    { id: 'u_strong', name: 'Stronger Click', type: 'upgrade', cost: 750, effect: () => GAME.clickPower *= 2 },
    { id: 'u_super', name: 'Super Click', type: 'upgrade', cost: 5500, effect: () => GAME.clickPower *= 3 },
    { id: 'b_clicker', name: 'Clicker Wolfy', type: 'building', baseCost: 10, growth: 1.15, prod: 0.1 },
    { id: 'b_streamer', name: 'Streamer Wolfy', type: 'building', baseCost: 120000, growth: 1.15, prod: 200 }
];

// ===== TABLA DE PESCA (ACTUALIZADA) =====
const FISH_TABLE = [
    // Comida (Se guarda en stock)
    { id: 'sardine_small', name: 'Sardina Pequeña', rarity: 'Común', icon: '🐟', desc: "Pequeña pero nutritiva.", type: 'food', valueKey: 'sardine' },
    { id: 'chicken_nugget', name: 'Nugget de Pollo', rarity: 'Común', icon: '🍗', desc: "Salado y delicioso.", type: 'food', valueKey: 'nugget' },
    
    // Venta Directa (WC inmediato)
    { id: 'lost_boot', name: 'Bota Perdida', rarity: 'Basura', rewardWC: 5, icon: '👢', desc: "Empapada.", type: 'junk' },
    { id: 'pufferfish', name: 'Pez Globo', rarity: 'Raro', rewardWC: 150, icon: '🐡', desc: "No comer. Vender caro.", type: 'sellable' },
    { id: 'shiny_coin', name: 'Moneda Brillante', rarity: 'Raro', rewardWC: 200, icon: '🪙', desc: "Antigua reliquia.", type: 'sellable' },
    { id: 'legendary_koi', name: 'Koi Legendario', rarity: 'Épico', rewardWC: 800, icon: '🎏', desc: "Fortuna pura.", type: 'sellable' },
    
    // Herramientas
    { id: 'hair_dryer', name: 'Secador de Pelo', rarity: 'Raro', rewardWC: 50, icon: '💨', desc: "Para pelajes mojados.", type: 'tool', toolKey: 'hairDryerCount' },
    { id: 'salon_kit', name: 'Kit de Peluquería', rarity: 'Legendario', rewardWC: 500, icon: '✂️', desc: "Lujo lupino.", type: 'tool', toolKey: 'salonKitCount' },
    
    // El Objetivo Especial
    { id: 'drowned_clicker', name: 'Clicker Wolfy Ahogado', rarity: 'SECRETO', rewardWC: 0, icon: '🐺💦', desc: "Necesita ayuda urgente.", type: 'npc_rescue' }
];

// Pesos de probabilidad por zona
const RARITY_CHANCES = {
    'perfect': { 'Basura': 0, 'Común': 10, 'Raro': 40, 'Épico': 45, 'SECRETO': 5 },
    'good':      { 'Basura': 5, 'Común': 30, 'Raro': 50, 'Épico': 15, 'SECRETO': 0 },
    'ok':        { 'Basura': 20, 'Común': 60, 'Raro': 20, 'Épico': 0, 'SECRETO': 0 },
    'bad':       { 'Basura': 70, 'Común': 30, 'Raro': 0, 'Épico': 0, 'SECRETO': 0 },
    'danger':    { 'Basura': 90, 'Común': 10, 'Raro': 0, 'Épico': 0, 'SECRETO': 0 },
    'blackout':  { 'Basura': 100,'Común': 0,  'Raro': 0, 'Épico': 0, 'SECRETO': 0 }
};

// ===== UTILIDADES =====
const $ = id => document.getElementById(id);
const fmt = n => Math.floor(n).toLocaleString();

function getCost(item) {
    if (item.type === 'upgrade') return item.cost;
    const count = GAME.inventory[item.id] || 0;
    return Math.floor(item.baseCost * Math.pow(item.growth, count));
}

// ===== MOTOR DE CÁLCULO (CON ADOPCIÓN) =====
function recalc() {
    let rawProd = 0;
    
    // 1. Edificios comprados
    for (const id in GAME.inventory) {
        const item = ITEMS.find(i => i.id === id);
        if (item && item.prod) {
            rawProd += (GAME.inventory[id] * item.prod);
        }
    }
    
    // 2. Lobitos Adoptados (Cada uno da 0.5 WC/s extra, escalable)
    // Esto hace que rescatarlos sea MUY rentable a largo plazo
    const adoptionBonus = GAME.adoptedWolfies * 0.5;
    rawProd += adoptionBonus;

    GAME.wcs = rawProd * GAME.buffs.cookieMult;
}

// ===== ACCIONES PRINCIPALES =====
function doClick() {
    if (GAME.wc === 0 && !GAME.session.isRunning) startSpeedrunTimer();
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
    if (GAME.wc < cost) return alert("Fondos insuficientes.");
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
        
        btn.innerHTML = `<span class="item-name">${item.name} ${item.type==='building'?`x${count}`:''}</span><span class="item-cost">${isOwned ? '✔' : fmt(cost) + ' WC'}</span>`;
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
    if(wcsDisp) wcsDisp.innerText = `+${GAME.wcs.toFixed(1)}/s | 🐺 Adoptados: ${GAME.adoptedWolfies}`;
    
    const timerDisplay = $('speedrun-timer');
    if (timerDisplay) {
        if (GAME.session.isRunning) {
            const elapsed = performance.now() - GAME.session.startTime;
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
    { id: "badge_jitter_expert", title: "Experto En Jitterclick", desc: "Alcanza 1,000 WC en <10min.", type: "record", icon: "⚡" },
    { id: "badge_angel_saver", title: "Ángel Guardián", desc: "Rescata a tu primer Clicker Wolfy del lago.", cond: () => GAME.adoptedWolfies >= 1, icon: "👼" }
];

function checkBadges() {
    INITIAL_BADGES.forEach(badge => {
        if (badge.type === 'record') return;
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
    const elapsedMs = performance.now() - GAME.session.startTime;
    if (GAME.wc >= GAME.session.targetAmount) finishSpeedrun(elapsedMs);
    if (elapsedMs > 10 * 60 * 1000) cancelSpeedrun("Tiempo agotado");
}

function finishSpeedrun(timeMs) {
    GAME.session.isRunning = false;
    GAME.records.runsCompleted++;
    let isNewRecord = false;
    if (GAME.records.fastestRunMs === null || timeMs < GAME.records.fastestRunMs) {
        GAME.records.fastestRunMs = timeMs;
        isNewRecord = true;
    }
    if (!GAME.meta.badgesEarned.includes('badge_jitter_expert')) GAME.meta.badgesEarned.push('badge_jitter_expert');
    if (isNewRecord) alert(`🏆 ¡NUEVO RÉCORD!\nTiempo: ${formatMilliseconds(timeMs)}`);
    else alert(`✅ Run completado.\nTu tiempo: ${formatMilliseconds(timeMs)}`);
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

// ===== MINIJUEGO DE PESCA Y ADOPCIÓN =====

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
    GAME.fishing.lastCaughtItem = null;
    
    const statusEl = $('fish-status-text');
    if(statusEl) statusEl.innerText = "Esperando picada...";
    
    const msgEl = $('fish-result-msg');
    if(msgEl) {
        msgEl.innerText = "";
        msgEl.className = "result-msg";
    }
    
    document.querySelectorAll('.zone').forEach(z => z.style.opacity = '0');
    const ind = $('fish-indicator');
    if(ind) ind.style.top = '0%';
}

function generateRandomZones() {
    const zones = [];
    const configs = [
        { id: 'blackout', size: 5, colorClass: 'black' },   
        { id: 'danger', size: 15, colorClass: 'red' },      
        { id: 'bad', size: 20, colorClass: 'orange' },      
        { id: 'ok', size: 25, colorClass: 'yellow' },       
        { id: 'good', size: 20, colorClass: 'green' },      
        { id: 'perfect', size: 10, colorClass: 'rainbow' }  
    ];
    configs.sort(() => Math.random() - 0.5);
    let accumulatedHeight = 0;
    configs.forEach(cfg => {
        const heightPercent = cfg.size; 
        zones.push({ ...cfg, start: accumulatedHeight, end: accumulatedHeight + heightPercent });
        accumulatedHeight += heightPercent;
    });
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
    const waitTime = 2000 + Math.random() * 3000;
    setTimeout(() => {
        if(GAME.fishing.phase === 'waiting') startFightingPhase();
    }, waitTime);
}

function startFightingPhase() {
    GAME.fishing.phase = 'moving';
    const statusEl = $('fish-status-text');
    if(statusEl) statusEl.innerText = "¡PELEANDO! ¡CLIC EN LA ZONA CORRECTA!";
    drawZones();
    animateIndicator();
}

let animFrameId = null;
function animateIndicator() {
    if (GAME.fishing.phase !== 'moving') return;
    GAME.fishing.indicatorPos += GAME.fishing.direction * GAME.fishing.speed;
    if (GAME.fishing.indicatorPos >= 100) {
        GAME.fishing.indicatorPos = 100;
        GAME.fishing.direction = -1;
    } else if (GAME.fishing.indicatorPos <= 0) {
        GAME.fishing.indicatorPos = 0;
        GAME.fishing.direction = 1;
    }
    const ind = $('fish-indicator');
    if(ind) ind.style.top = GAME.fishing.indicatorPos + '%';
    GAME.fishing.speed += 0.005;
    animFrameId = requestAnimationFrame(animateIndicator);
}

function handleFishClick() {
    if (GAME.fishing.phase !== 'moving') return;
    cancelAnimationFrame(animFrameId);
    GAME.fishing.phase = 'result';
    const pos = GAME.fishing.indicatorPos;
    let resultZone = null;
    for (const zone of GAME.fishing.zones) {
        if (pos >= zone.start && pos <= zone.end) {
            resultZone = zone;
            break;
        }
    }
    processCatchResult(resultZone);
}

function rollFish(zoneId) {
    const chances = RARITY_CHANCES[zoneId] || {};
    let rolledRarity = null;
    const rand = Math.random() * 100;
    let cumulativeWeight = 0;
    for (const [rarity, weight] of Object.entries(chances)) {
        cumulativeWeight += weight;
        if (rand <= cumulativeWeight) {
            rolledRarity = rarity;
            break;
        }
    }
    if (!rolledRarity) rolledRarity = 'Basura';
    const candidates = FISH_TABLE.filter(item => item.rarity === rolledRarity);
    if (candidates.length === 0) return null;
    const chosenIndex = Math.floor(Math.random() * candidates.length);
    return candidates[chosenIndex];
}

function processCatchResult(zone) {
    const msgEl = $('fish-result-msg');
    let message = "";
    let className = "";
    let caughtItem = null;
    let reward = 0;

    if (!zone) {
        message = "Fallaste el golpe.";
        className = "msg-fail";
    } else {
        caughtItem = rollFish(zone.id);
        GAME.fishing.lastCaughtItem = caughtItem; // Guardar para referencia

        if (!caughtItem) {
            message = "El anzuelo volvió vacío...";
            className = "msg-lost";
        } else {
            // --- LÓGICA DE MANEJO POR TIPO ---
            
            if (caughtItem.type === 'npc_rescue') {
                // Entra en menú de rescate
                showRescueMenu(msgEl);
                return; // Sale de aquí, no continua el flujo normal
            } 
            
            if (caughtItem.type === 'food') {
                // Guarda en stock
                GAME.foodStock[caughtItem.valueKey]++;
                message = `Guardaste: ${caughtItem.name}`;
                className = "msg-success";
                reward = 0; // No da WC directo, es recurso
            } 
            else if (caughtItem.type === 'tool') {
                // Guarda herramienta
                GAME.tools[caughtItem.toolKey]++;
                reward = caughtItem.rewardWC;
                message = `¡Conseguiste ${caughtItem.name}!`;
                className = "msg-success";
            }
            else {
                // Junk o Sellable -> Da WC directo
                reward = caughtItem.rewardWC;
                message = `Atrapaste ${caughtItem.name}.`;
                className = "msg-success";
            }

            // Renderizar resultado estándar
            let rarityColor = "#fff";
            if(caughtItem.rarity === 'Basura') rarityColor = "#94a3b8";
            if(caughtItem.rarity === 'Común') rarityColor = "#4ade80";
            if(caughtItem.rarity === 'Raro') rarityColor = "#60a5fa";
            if(caughtItem.rarity === 'Épico') rarityColor = "#c084fc";
            if(caughtItem.rarity === 'Legendario') rarityColor = "#fbbf24";
            if(caughtItem.rarity === 'SECRETO') rarityColor = "#ff00ff";

            msgEl.innerHTML = `
                ${message}<br>
                <span style="font-size:2rem; display:block; margin:5px 0;">${caughtItem.icon}</span>
                <small style="color:#cbd5e1; font-style:italic;">"${caughtItem.desc}"</small><br>
                <strong>+${fmt(reward)} WC</strong>
            `;
            msgEl.className = `result-msg ${className}`;
            
            GAME.wc += reward;
            updateUI();
            saveGame();
        }
    }
    
    // Reintentar después de 2 segundos
    setTimeout(() => {
        const modal = $('modal-fishing');
        if(modal && !modal.classList.contains('hidden')) {
            resetFishingState();
            startFishingWait();
        }
    }, 2000);
}

// ===== MENÚ DE RESCATE Y ALIMENTACIÓN =====
function showRescueMenu(msgEl) {
    GAME.fishing.phase = 'rescue_menu';
    
    const hasFood = (GAME.foodStock.sardine > 0) || (GAME.foodStock.nugget > 0);
    const hasTool = (GAME.tools.hairDryerCount > 0) || (GAME.tools.salonKitCount > 0);
    
    let html = `
        <div class="rescue-options">
            <h3>🆘 ¡ALERTA DE RESCATE!</h3>
            <p>Has encontrado a un <strong>Clicker Wolfy Ahogado</strong>.<br>Está temblando y necesita calor y comida.</p>
    `;

    if (!hasTool) {
        html += `<p style="color:#ef4444;">❌ No tienes herramientas para secarlo.<br>Pesca un Secador o Kit primero.</p>`;
        html += `<button onclick="failRescue()" class="btn-rescue danger">Dejarlo ir (Triste 😢)</button>`;
    } else {
        html += `<p>Tienes herramientas. ¿Qué quieres hacer?</p>`;
        
        // Opción 1: Solo secar (Recupera WC menores)
        if (GAME.tools.hairDryerCount > 0) {
             html += `<button onclick="dryOnlyWithDryer()" class="btn-rescue rare">💨 Solo Secar (+100 WC)</button>`;
        }
        
        // Opción 2: Alimentar y Secar (La verdadera recompensa)
        if (hasFood) {
            html += `<button onclick="feedAndSaveWolfy()" class="btn-rescue legendary">🍽️ Alimentar y Salvar<br><small>(Gana un Lobito Adoptado Permanente)</small></button>`;
        } else {
            html += `<p style="color:#fbbf24;">⚠️ Necesitas comida (Sardina/Nugget) para salvarlo completamente.</p>`;
        }
    }

    html += `</div>`;
    msgEl.innerHTML = html;
    msgEl.className = "result-msg rescue-mode";
}

window.dryOnlyWithDryer = function() {
    if (GAME.tools.hairDryerCount <= 0) return;
    GAME.tools.hairDryerCount--;
    GAME.wc += 100;
    alert("💨 Lo sequé con esfuerzo. Se fue nadando agradecido.\n+100 WC");
    finishRescueSequence(false);
};

window.feedAndSaveWolfy = function() {
    // Verificar recursos
    if (GAME.tools.hairDryerCount <= 0 && GAME.tools.salonKitCount <= 0) return alert("Sin herramientas.");
    if (GAME.foodStock.sardine <= 0 && GAME.foodStock.nugget <= 0) return alert("Sin comida.");

    // Consumir recursos
    if (GAME.tools.salonKitCount > 0) GAME.tools.salonKitCount--; // Prioriza el kit mejor
    else GAME.tools.hairDryerCount--;
    
    if (GAME.foodStock.nugget > 0) GAME.foodStock.nugget--;
    else GAME.foodStock.sardine--;

    // ¡ÉXITO!
    GAME.adoptedWolfies++;
    recalc(); // Actualizar producción inmediatamente
    
    alert(`🐺❤️ ¡RESCATADO CON ÉXITO!\nEl Clicker Wolfy está seco, alimentado y feliz.\nAhora trabaja para ti.\n\n+1 Producción Pasiva Permanente.`);
    
    unlockAchievement('badge_angel_saver');
    finishRescueSequence(true);
};

window.failRescue = function() {
    alert("😢 Dejaste al pobre Wolfy volver al agua...\nTal vez otro día tenga suerte.");
    finishRescueSequence(false);
};

function finishRescueSequence(isSuccess) {
    const msgEl = $('fish-result-msg');
    
    if (isSuccess) {
        msgEl.innerHTML = `
            <h3>✅ ¡ADOPCIÓN EXITOSA!</h3>
            <p>Total de lobitos adoptados: <strong>${GAME.adoptedWolfies}</strong></p>
            <span style="font-size:3rem;">🐺❤️</span>
        `;
        msgEl.className = "result-msg msg-success";
        document.body.style.animation = "shakeScreen 0.5s";
        setTimeout(() => document.body.style.animation = "", 500);
    } else {
        msgEl.innerHTML = `
            <h3>💔 Oportunidad Perdida</h3>
            <p>Sin recursos, el lobo se hundió lentamente...</p>
            <span style="font-size:3rem; filter:grayscale(1);">🐺💀</span>
        `;
        msgEl.className = "result-msg msg-lost";
    }
    
    saveGame();
    updateUI();
    
    setTimeout(() => {
        resetFishingState();
        startFishingWait();
    }, 3000);
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

    const coin = $('main-coin');
    if(coin) coin.onclick = doClick;
    
    const fishBtn = $('btn-start-fishing');
    if(fishBtn) fishBtn.onclick = openFishingModal;
    
    const cancelFish = $('btn-cancel-fish');
    if(cancelFish) cancelFish.onclick = closeFishingModal;
    
    const reelIn = $('btn-reel-in');
    if(reelIn) reelIn.onclick = handleFishClick;

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
                if(cmd === 'help') logTerm("Comandos: vomitar, medicina, reset, add_wc, give_food");
                if(cmd === 'add_wc') { GAME.wc += 10000; updateUI(); logTerm("+10k WC añadido"); }
                if(cmd === 'give_food') { GAME.foodStock.sardine += 5; GAME.foodStock.nugget += 5; logTerm("+5 Sardinas, +5 Nuggets"); }
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
            if(!GAME.records) GAME.records = { fastestRunMs: null, runsCompleted: 0 };
            if(!GAME.meta.badgesEarned) GAME.meta.badgesEarned = [];
            if(!GAME.foodStock) GAME.foodStock = { sardine: 0, nugget: 0, pufferfish: 0 };
            if(!GAME.tools) GAME.tools = { hairDryerCount: 0, salonKitCount: 0 };
            if(typeof GAME.adoptedWolfies === 'undefined') GAME.adoptedWolfies = 0;
            recalc();
        } catch(e) {
            console.error("Save corrupto", e);
        }
    }
}
