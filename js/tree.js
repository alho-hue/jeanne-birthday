// Arbre à promesses

const TREE_STORAGE_KEY = 'jeanne-promise-tree';
const WATER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // un arrosage par semaine

const TREE_STAGES = [
    { max: 0,    message: "Une graine est plantée en terre. Elle attend son premier rayon d'amour…" },
    { max: 2,    message: "Une petite pousse pointe ! Le sol est encore froid, mais elle grandit." },
    { max: 5,    message: "Un jeune arbre prend racine. Ses branches dessinent peu à peu notre futur." },
    { max: 9,    message: "L'arbre fleurit doucement. Chaque fleur est une promesse tenue." },
    { max: 14,   message: "Il porte nos promesses, nos rires et nos doutes traversés ensemble." },
    { max: Infinity, message: "Un arbre à promesses, pour toujours. Merci d'avoir cru en nous." }
];

let treeState = loadTreeState();
let treeBound = false;

function loadTreeState() {
    try {
        const raw = localStorage.getItem(TREE_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed.waterings === 'number') return parsed;
        }
    } catch (e) { /* noop */ }
    return { waterings: 0, lastWatered: 0 };
}

function saveTreeState() {
    try {
        localStorage.setItem(TREE_STORAGE_KEY, JSON.stringify(treeState));
    } catch (e) { /* noop */ }
}

function initTreePage() {
    if (!treeBound) {
        treeBound = true;
        const waterBtn = document.getElementById('water-tree-btn');
        if (waterBtn) {
            waterBtn.addEventListener('click', waterTree);
        }
    }
    renderTree();
}

function treeStageIndex() {
    for (let i = 0; i < TREE_STAGES.length; i++) {
        if (treeState.waterings <= TREE_STAGES[i].max) return i;
    }
    return TREE_STAGES.length - 1;
}

function canWater() {
    return !treeState.lastWatered || (Date.now() - treeState.lastWatered) >= WATER_COOLDOWN_MS;
}

function renderTree() {
    const stageEl = document.getElementById('tree-stage');
    const messageEl = document.getElementById('tree-message');
    const wateringsEl = document.getElementById('tree-waterings');
    const nextEl = document.getElementById('tree-next');
    const progressEl = document.getElementById('tree-progress');
    const fillEl = document.getElementById('tree-progress-fill');
    const waterBtn = document.getElementById('water-tree-btn');
    const hintEl = document.getElementById('tree-hint');
    if (!stageEl) return;

    const stageIndex = treeStageIndex();
    stageEl.dataset.stage = String(Math.min(stageIndex, 5));
    if (messageEl) messageEl.textContent = TREE_STAGES[stageIndex].message;
    if (wateringsEl) wateringsEl.textContent = treeState.waterings;

    const now = Date.now();
    const elapsed = treeState.lastWatered ? now - treeState.lastWatered : WATER_COOLDOWN_MS;
    const ready = canWater();

    if (nextEl) {
        if (ready && treeState.lastWatered) {
            nextEl.textContent = 'maintenant';
        } else if (ready) {
            nextEl.textContent = 'dès maintenant';
        } else {
            const nextDate = new Date(treeState.lastWatered + WATER_COOLDOWN_MS);
            nextEl.textContent = nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        }
    }

    const pct = ready ? 100 : Math.min(100, Math.round((elapsed / WATER_COOLDOWN_MS) * 100));
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (progressEl) progressEl.setAttribute('aria-valuenow', String(pct));

    if (waterBtn) {
        waterBtn.disabled = !ready;
        waterBtn.classList.toggle('tree-btn-ready', ready);
    }

    const overdueDays = treeState.lastWatered ? Math.floor(elapsed / WATER_COOLDOWN_MS) : 0;
    if (hintEl) {
        if (!ready) {
            hintEl.textContent = "L'arbre a besoin de temps pour grandir. Reviens la semaine prochaine !";
        } else if (overdueDays >= 1) {
            hintEl.textContent = `Ça fait ${overdueDays} semaine${overdueDays > 1 ? 's' : ''} — l'arbre a un peu soif d'amour, arrose-le quand tu peux !`;
        } else {
            hintEl.textContent = treeState.lastWatered
                ? "C'est le moment ! Un petit arrosage et l'arbre grandit encore."
                : "Chaque arrosage fait grandir notre arbre — commence par planter cette graine !";
        }
    }
}

function waterTree() {
    if (!canWater()) return;

    treeState.waterings += 1;
    treeState.lastWatered = Date.now();

    // Célébration la première fois qu'on atteint le stade final
    const reachedFinal = treeStageIndex() === TREE_STAGES.length - 1;
    if (reachedFinal && !treeState.celebrated) {
        treeState.celebrated = true;
    }

    saveTreeState();
    renderTree();
    updateTreeBadge();

    // Animation d'arrosage
    const stageEl = document.getElementById('tree-stage');
    if (stageEl) {
        stageEl.classList.remove('just-watered');
        void stageEl.offsetWidth;
        stageEl.classList.add('just-watered');
        setTimeout(() => stageEl.classList.remove('just-watered'), 1800);
    }

    spawnTreeHearts(reachedFinal && treeState.celebrated ? 18 : 8);
}

function spawnTreeHearts(count) {
    const card = document.querySelector('.tree-stage');
    if (!card) return;
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'click-heart';
        heart.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.6 2.3 5 5.7 5c2 0 3.4 1.1 4.3 2.4h4c.9-1.3 2.3-2.4 4.3-2.4 3.4 0 5.3 3.6 3.7 6.7C19.5 16.4 12 21 12 21Z"/></svg>';
        heart.style.left = `${15 + Math.random() * 70}%`;
        heart.style.top = `${25 + Math.random() * 50}%`;
        heart.style.animationDelay = `${Math.random() * 0.5}s`;
        card.appendChild(heart);
        setTimeout(() => heart.remove(), 2400);
    }
}

// Badge "Prêt à arroser" sur la carte d'accueil
function updateTreeBadge() {
    const badge = document.getElementById('tree-ready-badge');
    if (badge) badge.classList.toggle('hidden', !canWater());
}

updateTreeBadge();
