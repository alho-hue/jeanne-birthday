// Verrou d'entrée : il faut la date où tout a commencé pour ouvrir le site.
// Une fois débloqué, le navigateur s'en souvient (localStorage).

const UNLOCK_KEY = 'jeanne-unlocked';
const UNLOCK_CODE = '17092026'; // 17 septembre 2026 — la même date que dans countdown.js

document.addEventListener('DOMContentLoaded', function () {
    const lockScreen = document.getElementById('lock-screen');
    if (!lockScreen) return;

    let remembered = null;
    try { remembered = localStorage.getItem(UNLOCK_KEY); } catch (e) { /* stockage indisponible */ }

    if (remembered === UNLOCK_CODE) {
        unlockSite(lockScreen);
        return;
    }

    const form = document.getElementById('lock-form');
    const input = document.getElementById('lock-input');
    const error = document.getElementById('lock-error');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const digits = input.value.replace(/\D/g, '');

        if (digits === UNLOCK_CODE) {
            try { localStorage.setItem(UNLOCK_KEY, UNLOCK_CODE); } catch (err) { /* stockage indisponible */ }
            unlockSite(lockScreen);
            return;
        }

        error.textContent = 'Ce n\'est pas ça… pense à la date où tout a commencé.';
        lockScreen.classList.remove('shake');
        void lockScreen.offsetWidth;
        lockScreen.classList.add('shake');
        input.select();
    });
});

function unlockSite(lockScreen) {
    lockScreen.classList.add('unlocked');
    setTimeout(() => lockScreen.remove(), 700);
}
