// Compte à rebours

// Mois (1-12)
const BIRTHDAY_MONTH = 11;
const BIRTHDAY_DAY = 18;   // Le 18
const BIRTHDAY_YEAR = new Date().getFullYear(); // Année en cours
const COUPLE_START = new Date(2026, 8, 17); // 17 septembre 2026

let countdownInterval;

function initCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    let targetDate = new Date(BIRTHDAY_YEAR, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
    
    // Si l'anniversaire est passé cette année, on vise l'année prochaine
    if (now > targetDate) {
        targetDate = new Date(BIRTHDAY_YEAR + 1, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY);
    }
    
    const diff = targetDate - now;
    
    const countdownTimer = document.getElementById('countdown-timer');
    const countdownLabel = document.querySelector('.countdown-label');
    
    if (!countdownTimer) return;
    
    // On vérifie si c'est aujourd'hui
    const today = new Date();
    if (today.getMonth() === BIRTHDAY_MONTH - 1 && today.getDate() === BIRTHDAY_DAY) {
        if (countdownLabel) {
            countdownLabel.textContent = "C'est aujourd'hui ! Joyeux anniversaire !";
        }
        countdownTimer.textContent = "J-0";
        return;
    }
    
    // Jours restants (jours calendaires : minuit à minuit)
    const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((targetDay - todayDay) / (1000 * 60 * 60 * 24));
    
    // Mise à jour de l'affichage
    countdownTimer.textContent = `J-${days}`;

    const daysTogether = document.getElementById('days-together');
    if (daysTogether) {
        const today = new Date();
        const elapsed = Math.floor((today - COUPLE_START) / (1000 * 60 * 60 * 24));
        if (elapsed >= 0) {
            daysTogether.textContent = elapsed === 0
                ? 'Nous sommes ensemble depuis aujourd’hui'
                : `Nous sommes ensemble depuis ${elapsed} jour${elapsed > 1 ? 's' : ''}`;
        } else {
            daysTogether.textContent = 'Notre histoire officielle commence le 17 septembre 2026';
        }
    }
}

// On arrête le compteur quand l'onglet est caché pour économiser la batterie
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(countdownInterval);
    } else {
        countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }
});
