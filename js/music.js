// Musique
// Musique de fond chargée depuis un fichier audio local.
// Le fichier attendu : assets/audio/musique-de-fond.mp3

const MUSIC_PATH = 'assets/audio/musique-de-fond.mp3';
const MUSIC_VOLUME = 0.35;
const MUSIC_VOLUME_KEY = 'jeanne-volume';
const MUSIC_PROMPT_KEY = 'jeanne-music-asked';

let audio = null;
let musicVolume = readStoredVolume();

function readStoredVolume() {
    try {
        const value = parseFloat(localStorage.getItem(MUSIC_VOLUME_KEY));
        return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : MUSIC_VOLUME;
    } catch (e) {
        return MUSIC_VOLUME;
    }
}

function setMusicVolume(value) {
    musicVolume = Math.min(1, Math.max(0, value));
    if (audio) audio.volume = musicVolume;
    try { localStorage.setItem(MUSIC_VOLUME_KEY, String(musicVolume)); } catch (e) { /* stockage indisponible */ }
}
let audioAvailable = true;
let missingNotified = false;
let voiceMusicState = null;

function initMusic() {
    initVoiceMusicBridge();

    const musicToggle = document.getElementById('music-toggle');
    if (!musicToggle) return;

    musicToggle.addEventListener('click', toggleMusic);

    document.addEventListener('jeanne:site-opened', promptMusicOnEntry);

    document.getElementById('music-prompt-yes')?.addEventListener('click', () => {
        hideMusicPrompt();
        startMusic();
    });
    document.getElementById('music-prompt-no')?.addEventListener('click', hideMusicPrompt);
}

function ensureAudio() {
    if (audio) return;

    audio = new Audio(MUSIC_PATH);
    audio.loop = true;
    audio.volume = musicVolume;
    audio.preload = 'auto';

    audio.addEventListener('play', updateMusicButton);
    audio.addEventListener('pause', updateMusicButton);
    audio.addEventListener('ended', updateMusicButton);
    audio.addEventListener('error', () => {
        audioAvailable = false;
        notifyMissingMusic();
        updateMusicButton();
    });
}

async function toggleMusic() {
    if (isMusicPlaying()) {
        pauseMusic();
    } else if (anyVoiceAudioPlaying()) {
        if (typeof showNotification === 'function') {
            showNotification('La musique reprend après le message vocal.', 'info', 2800);
        }
    } else {
        await startMusic();
    }
}

async function startMusic() {
    ensureAudio();
    if (!audioAvailable) {
        notifyMissingMusic();
        return;
    }

    try {
        await audio.play();
    } catch (error) {
        if (error && error.name === 'NotAllowedError') {
            if (typeof showNotification === 'function') {
                showNotification('Clique d’abord sur le site pour autoriser le son.', 'info', 3500);
            }
        } else {
            console.error('Lecture de la musique impossible :', error);
        }
    }

    updateMusicButton();
}

function pauseMusic() {
    if (!audio) return;
    audio.pause();
    updateMusicButton();
}

function isMusicPlaying() {
    return !!audio && !audio.paused && !audio.ended;
}

function initVoiceMusicBridge() {
    document.querySelectorAll('.voice-item audio').forEach(voice => {
        voice.addEventListener('play', handleVoicePlay);
        voice.addEventListener('pause', scheduleVoiceResumeCheck);
        voice.addEventListener('ended', scheduleVoiceResumeCheck);
    });
}

function handleVoicePlay(event) {
    const currentVoice = event.currentTarget;
    document.querySelectorAll('.voice-item audio').forEach(other => {
        if (other !== currentVoice && !other.paused) {
            other.pause();
        }
    });
    suspendMusicForVoice();
}

function scheduleVoiceResumeCheck() {
    setTimeout(() => {
        if (!anyVoiceAudioPlaying()) {
            resumeMusicAfterVoice();
        }
    }, 90);
}

function anyVoiceAudioPlaying() {
    return Array.from(document.querySelectorAll('.voice-item audio')).some(voice => !voice.paused && !voice.ended);
}

function suspendMusicForVoice() {
    ensureAudio();
    if (!audio || voiceMusicState) return;

    const wasPlaying = isMusicPlaying();
    voiceMusicState = {
        wasPlaying,
        time: audio.currentTime || 0
    };

    if (wasPlaying) {
        audio.pause();
        updateMusicButton();
    }
}

function resumeMusicAfterVoice() {
    if (!voiceMusicState || !audio) return;

    const state = voiceMusicState;
    voiceMusicState = null;

    if (!state.wasPlaying || !audioAvailable) return;

    try {
        if (state.time > 0) {
            audio.currentTime = state.time;
        }
        audio.play().catch(error => console.warn('Reprise de la musique impossible :', error));
    } catch (error) {
        console.warn('Reprise de la musique impossible :', error);
    }

    updateMusicButton();
}

function promptMusicOnEntry() {
    if (sessionStorage.getItem(MUSIC_PROMPT_KEY) === 'yes') {
        startMusic();
        return;
    }
    if (sessionStorage.getItem(MUSIC_PROMPT_KEY)) return;

    sessionStorage.setItem(MUSIC_PROMPT_KEY, 'asked');
    showMusicPrompt();
}

function showMusicPrompt() {
    const prompt = document.getElementById('music-prompt');
    if (!prompt) return;
    prompt.classList.remove('hidden');
    prompt.classList.add('show');
}

function hideMusicPrompt() {
    const prompt = document.getElementById('music-prompt');
    if (!prompt) return;
    prompt.classList.remove('show');
    prompt.classList.add('hidden');
}

function notifyMissingMusic() {
    if (missingNotified) return;
    missingNotified = true;
    if (typeof showNotification === 'function') {
        showNotification('Musique introuvable : ajoute assets/audio/musique-de-fond.mp3', 'info', 5000);
    }
}

function updateMusicButton() {
    const musicToggle = document.getElementById('music-toggle');
    if (!musicToggle) return;

    if (isMusicPlaying()) {
        musicToggle.classList.add('playing');
        musicToggle.innerHTML = '<svg class="icon icon-lg" aria-hidden="true"><use href="#icon-pause"/></svg>';
        musicToggle.setAttribute('aria-label', 'Mettre la musique en pause');
    } else {
        musicToggle.classList.remove('playing');
        musicToggle.innerHTML = '<svg class="icon icon-lg" aria-hidden="true"><use href="#icon-music"/></svg>';
        musicToggle.setAttribute('aria-label', 'Lecture musique');
    }
}

window.addEventListener('beforeunload', function() {
    if (audio) {
        audio.pause();
    }
});
