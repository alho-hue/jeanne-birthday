document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSettingsPanel();
    initInstallApp();
    initVoicePlayers();
    initStarfield();
    initCinemaExit();
    refreshProgressSummary();
    document.addEventListener('jeanne:progress-changed', refreshProgressSummary);

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(() => { /* hors ligne ou non supporté */ });
    }

    const hour = new Date().getHours();
    document.documentElement.dataset.daypart = hour < 12 ? 'matin' : hour < 18 ? 'apres-midi' : 'soir';

    document.querySelectorAll('.voice-item audio').forEach(audio => {
        audio.addEventListener('error', () => {
            const item = audio.closest('.voice-item');
            item?.classList.add('hidden');
            const wrap = item?.closest('.voice-messages');
            if (wrap && !wrap.querySelector('.voice-item:not(.hidden)')) {
                wrap.closest('.feature-card')?.classList.add('hidden');
            }
        });
    });
    const particles = document.getElementById('particles');
    window.addEventListener('pointermove', event => {
        particles?.style.setProperty('--pointer-x', `${event.clientX}px`);
        particles?.style.setProperty('--pointer-y', `${event.clientY}px`);
    }, { passive: true });

    // Rend les cartes de la page d'accueil cliquables
    document.querySelectorAll('.feature-highlight.clickable').forEach(feature => {
        const openFeature = function() {
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                navigateTo(targetPage);
            }
        };
        feature.addEventListener('click', openFeature);
        feature.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFeature.call(this);
            }
        });
    });
});

function initTheme() {
    let savedTheme = localStorage.getItem('jeanne-theme') || 'noir';
    if (savedTheme === 'nuit' || savedTheme === 'soir') {
        savedTheme = 'noir';
        localStorage.setItem('jeanne-theme', savedTheme);
    }
    document.documentElement.dataset.theme = savedTheme;

    document.querySelectorAll('[data-theme]').forEach(button => {
        button.setAttribute('aria-pressed', button.dataset.theme === savedTheme ? 'true' : 'false');
        button.addEventListener('click', () => {
            document.documentElement.dataset.theme = button.dataset.theme;
            localStorage.setItem('jeanne-theme', button.dataset.theme);
            document.querySelectorAll('[data-theme]').forEach(item => {
                item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
            });
            syncStarfield();
        });
    });
}

function initSettingsPanel() {
    const toggle = document.getElementById('settings-toggle');
    const panel = document.getElementById('settings-panel');
    const close = document.getElementById('settings-close');
    if (!toggle || !panel) return;

    const motionToggle = document.getElementById('setting-motion');
    const particlesToggle = document.getElementById('setting-particles');
    const confettiToggle = document.getElementById('setting-confetti');

    const reduceMotion = localStorage.getItem('jeanne-motion') === 'on';
    if (reduceMotion) document.documentElement.dataset.motion = 'reduce';
    if (motionToggle) motionToggle.checked = reduceMotion;

    const particlesEnabled = localStorage.getItem('jeanne-particles') !== 'off';
    if (particlesToggle) particlesToggle.checked = particlesEnabled;
    applyParticles(particlesEnabled);

    const confettiEnabled = localStorage.getItem('jeanne-confetti') !== 'off';
    if (confettiToggle) confettiToggle.checked = confettiEnabled;

    const setPanelOpen = open => {
        panel.classList.toggle('hidden', !open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('settings-open', open);
    };

    toggle.addEventListener('click', () => setPanelOpen(panel.classList.contains('hidden')));
    close?.addEventListener('click', () => setPanelOpen(false));

    document.addEventListener('click', event => {
        if (!panel.classList.contains('hidden') && !panel.contains(event.target) && !toggle.contains(event.target)) {
            setPanelOpen(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.classList.contains('hidden')) {
            setPanelOpen(false);
        }
    });

    motionToggle?.addEventListener('change', () => {
        const enabled = motionToggle.checked;
        localStorage.setItem('jeanne-motion', enabled ? 'on' : 'off');
        if (enabled) document.documentElement.dataset.motion = 'reduce';
        else delete document.documentElement.dataset.motion;
        syncStarfield();
    });

    particlesToggle?.addEventListener('change', () => {
        const enabled = particlesToggle.checked;
        localStorage.setItem('jeanne-particles', enabled ? 'on' : 'off');
        applyParticles(enabled);
    });

    confettiToggle?.addEventListener('change', () => {
        localStorage.setItem('jeanne-confetti', confettiToggle.checked ? 'on' : 'off');
    });

    const volumeSlider = document.getElementById('setting-volume');
    const volumeValue = document.getElementById('volume-value');
    if (volumeSlider) {
        const syncVolumeUi = () => {
            const pct = `${volumeSlider.value}%`;
            volumeSlider.style.setProperty('--vol', pct);
            if (volumeValue) volumeValue.textContent = pct;
        };
        try {
            const saved = parseFloat(localStorage.getItem('jeanne-volume'));
            volumeSlider.value = Number.isFinite(saved) ? Math.round(saved * 100) : 35;
        } catch (e) { /* stockage indisponible */ }
        syncVolumeUi();
        volumeSlider.addEventListener('input', () => {
            syncVolumeUi();
            if (typeof setMusicVolume === 'function') {
                setMusicVolume(volumeSlider.value / 100);
            }
        });
    }

    initResetProgress();
}

function initResetProgress() {
    const btn = document.getElementById('reset-progress-btn');
    if (!btn) return;

    let armed = false;
    let armTimer = null;

    btn.addEventListener('click', () => {
        if (!armed) {
            armed = true;
            btn.classList.add('is-armed');
            btn.dataset.original = btn.innerHTML;
            btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-x"/></svg>Confirmer ?';
            armTimer = setTimeout(() => {
                armed = false;
                btn.classList.remove('is-armed');
                btn.innerHTML = btn.dataset.original;
            }, 3000);
            return;
        }

        clearTimeout(armTimer);
        [
            'jeanne-letters-read',
            'jeanne-memory-done',
            'jeanne-memory-best',
            'jeanne-truth-done',
            'jeanne-truth-best',
            'jeanne-surprise-opened',
            'jeanne-promise-tree',
            'jeanne-answers-draft'
        ].forEach(key => {
            try { localStorage.removeItem(key); } catch (e) { /* stockage indisponible */ }
        });
        location.reload();
    });
}

// Installation de l'app (PWA)
function initInstallApp() {
    const btn = document.getElementById('install-app-btn');
    const hint = document.getElementById('install-app-hint');
    if (!btn) return;

    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredPrompt = event;
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        btn.classList.add('hidden');
        if (hint) hint.textContent = 'C\'est installé — le site est maintenant dans tes applications.';
    });

    btn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (outcome === 'accepted' && hint) {
                hint.textContent = 'Installation en cours…';
            }
            return;
        }

        if (!hint) return;
        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        hint.textContent = isIos
            ? 'Sur iPhone : touche le bouton Partager, puis « Sur l\'écran d\'accueil ».'
            : 'Ton navigateur doit proposer l\'installation depuis sa barre d\'adresse ou son menu.';
    });
}

function applyParticles(enabled) {
    const particles = document.getElementById('particles');
    if (!particles) return;

    if (enabled) {
        particles.classList.remove('hidden');
        particles.innerHTML = '';
        if (typeof initParticles === 'function') initParticles();
    } else {
        particles.innerHTML = '';
        particles.classList.add('hidden');
    }
    syncStarfield();
}

// Lecteurs vocaux

let voiceAudioCtx = null;
const voiceGraphs = new WeakMap();
const voicePlayers = [];
let waveRafId = null;

function initVoicePlayers() {
    document.querySelectorAll('.voice-item').forEach(item => {
        const audio = item.querySelector('.voice-audio');
        const playBtn = item.querySelector('.voice-play');
        const wave = item.querySelector('.voice-wave');
        const time = item.querySelector('.voice-time');
        if (!audio || !playBtn || !wave) return;

        const bars = buildWaveBars(wave, 36);
        const player = { audio, playBtn, wave, time, bars };
        voicePlayers.push(player);

        playBtn.addEventListener('click', () => toggleVoicePlayer(player));
        wave.addEventListener('click', event => seekVoiceTo(player, event));
        audio.addEventListener('play', () => {
            updateVoiceButton(player);
            updateVoiceProgress(player);
            startWaveLoop();
        });
        audio.addEventListener('pause', () => {
            updateVoiceButton(player);
            resetVoiceWave(player);
            updateVoiceProgress(player);
        });
        audio.addEventListener('ended', () => {
            updateVoiceButton(player);
            resetVoiceWave(player);
            updateVoiceTime(player);
        });
        audio.addEventListener('timeupdate', () => updateVoiceTime(player));
        audio.addEventListener('loadedmetadata', () => updateVoiceTime(player));
        audio.addEventListener('durationchange', () => updateVoiceTime(player));
        audio.addEventListener('seeked', () => updateVoiceProgress(player));
    });
}

function buildWaveBars(wave, count) {
    wave.innerHTML = '';
    const bars = [];
    for (let i = 0; i < count; i++) {
        const bar = document.createElement('span');
        const restHeight = `${18 + Math.random() * 55}%`;
        bar.style.height = restHeight;
        bar.dataset.restHeight = restHeight;
        wave.appendChild(bar);
        bars.push(bar);
    }
    return bars;
}

async function toggleVoicePlayer(player) {
    if (player.audio.paused || player.audio.ended) {
        await playVoice(player);
    } else {
        player.audio.pause();
    }
}

async function playVoice(player) {
    ensureVoiceGraph(player.audio);
    if (voiceAudioCtx && voiceAudioCtx.state === 'suspended') {
        try { await voiceAudioCtx.resume(); } catch (error) { console.warn('Voice audio context failed:', error); }
    }

    try {
        await player.audio.play();
    } catch (error) {
        console.warn('Voice playback failed:', error);
    }
}

function seekVoiceTo(player, event) {
    const audio = player.audio;
    const duration = audio.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const rect = player.wave.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    updateVoiceTime(player);
}

function updateVoiceProgress(player) {
    if (!player.bars || !player.bars.length) return;
    const duration = player.audio.duration;
    const ratio = Number.isFinite(duration) && duration > 0
        ? Math.max(0, Math.min(1, player.audio.currentTime / duration))
        : 0;
    player.bars.forEach((bar, index) => {
        bar.classList.toggle('played', (index + 1) / player.bars.length <= ratio + 0.001);
    });
}

function ensureVoiceGraph(audio) {
    if (voiceGraphs.has(audio)) return voiceGraphs.get(audio);

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    try {
        if (!voiceAudioCtx) {
            voiceAudioCtx = new AudioContextClass();
        }
        const source = voiceAudioCtx.createMediaElementSource(audio);
        const analyser = voiceAudioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.78;
        source.connect(analyser);
        analyser.connect(voiceAudioCtx.destination);

        const graph = {
            analyser,
            freq: new Uint8Array(analyser.frequencyBinCount)
        };
        voiceGraphs.set(audio, graph);
        return graph;
    } catch (error) {
        console.warn('Voice visualizer failed:', error);
        return null;
    }
}

function updateVoiceButton(player) {
    const playing = !player.audio.paused && !player.audio.ended;
    player.playBtn.innerHTML = playing
        ? '<svg class="icon" aria-hidden="true"><use href="#icon-pause"/></svg>'
        : '<svg class="icon" aria-hidden="true"><use href="#icon-play"/></svg>';
    player.playBtn.setAttribute('aria-label', playing ? 'Mettre le message en pause' : 'Écouter le message');
}

function updateVoiceTime(player) {
    const audio = player.audio;
    if (player.time) {
        const current = formatVoiceTime(audio.currentTime || 0);
        const duration = Number.isFinite(audio.duration) ? formatVoiceTime(audio.duration) : '--:--';
        player.time.textContent = `${current} / ${duration}`;
    }
    updateVoiceProgress(player);
}

function formatVoiceTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function startWaveLoop() {
    if (waveRafId === null) {
        waveRafId = requestAnimationFrame(tickVoiceWaves);
    }
}

function tickVoiceWaves() {
    waveRafId = null;
    const anyPlaying = voicePlayers.some(updateVoiceWave);
    if (anyPlaying) {
        waveRafId = requestAnimationFrame(tickVoiceWaves);
    }
}

function updateVoiceWave(player) {
    const playing = !player.audio.paused && !player.audio.ended;
    const graph = voiceGraphs.get(player.audio);

    if (!playing || !graph) {
        resetVoiceWave(player);
        return false;
    }

    graph.analyser.getByteFrequencyData(graph.freq);
    const bars = player.bars;
    const step = Math.max(1, Math.floor(graph.freq.length / bars.length));

    for (let i = 0; i < bars.length; i++) {
        let sum = 0;
        const start = i * step;
        for (let j = 0; j < step; j++) {
            sum += graph.freq[start + j] || 0;
        }
        const value = sum / step / 255;
        const height = 12 + value * 88;
        bars[i].style.height = `${height}%`;
        bars[i].classList.toggle('hot', value > 0.52);
    }

    return true;
}

function resetVoiceWave(player) {
    player.bars.forEach(bar => {
        bar.style.height = bar.dataset.restHeight || '40%';
        bar.classList.remove('hot');
    });
}

// Mode cinéma

function isCinemaActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function requestCinemaMode() {
    if (isCinemaActive()) return;
    const element = document.documentElement;
    const request = element.requestFullscreen || element.webkitRequestFullscreen;
    if (!request) return;
    try {
        const result = request.call(element);
        if (result && typeof result.catch === 'function') {
            result.catch(() => { /* le plein écran demande un geste utilisateur */ });
        }
    } catch (error) { /* plein écran indisponible */ }
}

function exitCinemaMode() {
    try {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
    } catch (error) { /* ignore */ }
}

function initCinemaExit() {
    const exitBtn = document.getElementById('cinema-exit-btn');
    const update = () => exitBtn?.classList.toggle('hidden', !isCinemaActive());

    exitBtn?.addEventListener('click', exitCinemaMode);
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
    update();
}

// Progression

function readLettersRead() {
    try {
        const value = JSON.parse(localStorage.getItem('jeanne-letters-read') || '[]');
        return Array.isArray(value) ? value : [];
    } catch (error) {
        return [];
    }
}

function refreshProgressSummary() {
    const summary = document.getElementById('progress-summary');
    if (!summary) return;

    const lettersRead = Math.min(readLettersRead().length, 7);
    const parts = [`${lettersRead}/7 lettres lues`];
    if (localStorage.getItem('jeanne-memory-done') === 'yes') parts.push('Jeu réussi');
    if (localStorage.getItem('jeanne-truth-done') === 'yes') parts.push('Vrai ou faux réussi');
    if (localStorage.getItem('jeanne-surprise-opened') === 'yes') parts.push('Cadeau ouvert');

    summary.textContent = parts.length
        ? parts.join(' • ')
        : 'Explore le site pour faire grandir notre histoire.';
}

// Champ d'étoiles

const starfield = {
    canvas: null,
    ctx: null,
    stars: [],
    shooters: [],
    raf: null,
    nextShoot: 4,
    width: 0,
    height: 0
};

function initStarfield() {
    starfield.canvas = document.getElementById('starfield');
    if (!starfield.canvas) return;
    starfield.ctx = starfield.canvas.getContext('2d');
    resizeStarfield();
    window.addEventListener('resize', resizeStarfield);
    syncStarfield();
}

function resizeStarfield() {
    const canvas = starfield.canvas;
    if (!canvas || !starfield.ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    starfield.width = window.innerWidth;
    starfield.height = window.innerHeight;
    canvas.width = Math.floor(starfield.width * dpr);
    canvas.height = Math.floor(starfield.height * dpr);
    canvas.style.width = `${starfield.width}px`;
    canvas.style.height = `${starfield.height}px`;
    starfield.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (starMotionReduced()) drawStarsStatic();
}

function buildStars() {
    const count = Math.min(170, Math.max(70, Math.floor((starfield.width * starfield.height) / 11000)));
    starfield.stars = [];
    for (let i = 0; i < count; i++) {
        const speed = 0.4 + Math.random() * 1.4;
        starfield.stars.push({
            x: Math.random() * starfield.width,
            y: Math.random() * starfield.height,
            r: Math.random() * 1.1 + 0.35,
            alpha: 0.35 + Math.random() * 0.6,
            speed,
            phase: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.015,
            vy: (Math.random() - 0.5) * 0.01,
            color: Math.random() > 0.82 ? 'rgba(190,210,255,1)' : 'rgba(255,255,255,1)'
        });
    }
}

function starfieldActive() {
    return document.documentElement.dataset.theme === 'noir' && localStorage.getItem('jeanne-particles') !== 'off';
}

function starMotionReduced() {
    return document.documentElement.dataset.motion === 'reduce' || localStorage.getItem('jeanne-motion') === 'on';
}

function syncStarfield() {
    const canvas = starfield.canvas;
    if (!canvas) return;

    const active = starfieldActive();
    canvas.classList.toggle('hidden', !active);
    if (!active) {
        stopStarfield();
        return;
    }

    if (starMotionReduced()) {
        stopStarfield();
        drawStarsStatic();
        return;
    }

    if (!starfield.raf) {
        starfield.raf = requestAnimationFrame(tickStarfield);
    }
}

function stopStarfield() {
    if (starfield.raf) {
        cancelAnimationFrame(starfield.raf);
        starfield.raf = null;
    }
    if (starfield.ctx) {
        starfield.ctx.clearRect(0, 0, starfield.width, starfield.height);
    }
}

function tickStarfield(time) {
    starfield.raf = null;
    if (!starfieldActive()) {
        stopStarfield();
        return;
    }

    drawStarfield(time / 1000);
    starfield.raf = requestAnimationFrame(tickStarfield);
}

function drawStarfield(time) {
    const ctx = starfield.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, starfield.width, starfield.height);

    for (const star of starfield.stars) {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < -2) star.x = starfield.width + 2;
        if (star.x > starfield.width + 2) star.x = -2;
        if (star.y < -2) star.y = starfield.height + 2;
        if (star.y > starfield.height + 2) star.y = -2;

        const twinkle = 0.55 + 0.45 * Math.sin(time * star.speed + star.phase);
        ctx.globalAlpha = Math.max(0.08, star.alpha * twinkle);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
    }

    if (time > starfield.nextShoot) {
        starfield.nextShoot = time + 5 + Math.random() * 7;
        starfield.shooters.push({
            x: starfield.width * (0.25 + Math.random() * 0.6),
            y: starfield.height * Math.random() * 0.35,
            vx: -(3.5 + Math.random() * 3),
            vy: 1.6 + Math.random() * 1.4,
            life: 0
        });
    }

    starfield.shooters = starfield.shooters.filter(shooter => shooter.life < 1);
    for (const shooter of starfield.shooters) {
        shooter.life += 0.012;
        shooter.x += shooter.vx;
        shooter.y += shooter.vy;
        const alpha = Math.max(0, 0.9 * (1 - shooter.life));
        const tailX = shooter.x - shooter.vx * 9;
        const tailY = shooter.y - shooter.vy * 9;
        const gradient = ctx.createLinearGradient(tailX, tailY, shooter.x, shooter.y);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(1, `rgba(255,255,255,${alpha})`);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shooter.x, shooter.y);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function drawStarsStatic() {
    const ctx = starfield.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, starfield.width, starfield.height);
    for (const star of starfield.stars) {
        ctx.globalAlpha = Math.max(0.12, star.alpha * 0.75);
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
