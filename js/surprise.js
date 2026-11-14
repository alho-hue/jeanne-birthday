// Surprise

function initSurprise() {
    const giftBox = document.getElementById('gift-box');
    const surpriseInstruction = document.getElementById('surprise-instruction');
    const surpriseContent = document.getElementById('surprise-content');
    
    if (giftBox) {
        giftBox.addEventListener('click', openGiftBox);
        giftBox.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openGiftBox();
            }
        });
    }
    
    // Affiche l'invitation après un délai (sauf si déjà ouverte avant)
    setTimeout(() => {
        if (surpriseInstruction && !giftBox?.classList.contains('opened')) {
            surpriseInstruction.classList.remove('hidden');
        }
    }, 1000);

    restoreOpenedGift();
    initComplimentGenerator();
}

function restoreOpenedGift() {
    if (localStorage.getItem('jeanne-surprise-opened') !== 'yes') return;

    const giftBox = document.getElementById('gift-box');
    const surpriseInstruction = document.getElementById('surprise-instruction');
    const surpriseContent = document.getElementById('surprise-content');
    if (!giftBox || giftBox.classList.contains('opened')) return;

    giftBox.classList.add('opened');
    surpriseInstruction?.classList.add('hidden');
    surpriseContent?.classList.remove('hidden');
}

function openGiftBox() {
    const giftBox = document.getElementById('gift-box');
    const surpriseInstruction = document.getElementById('surprise-instruction');
    const surpriseContent = document.getElementById('surprise-content');
    
    if (!giftBox || giftBox.classList.contains('opened')) return;

    giftBox.classList.add('opened');
    try { localStorage.setItem('jeanne-surprise-opened', 'yes'); } catch (error) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('jeanne:progress-changed'));

    // On cache l'invitation
    if (surpriseInstruction) {
        surpriseInstruction.classList.add('hidden');
    }
    
    // On affiche la surprise après l'animation
    setTimeout(() => {
        if (surpriseContent) {
            surpriseContent.classList.remove('hidden');
            
            // Effet de confettis
            createConfetti();
        }
    }, 1000);
}

// Générateur de compliments

const COMPLIMENTS = [
    'Tu es mon rayon de soleil, même à des kilomètres.',
    'J\'adore ta façon de rendre les journées ordinaires spéciales.',
    'Ton sourire est mon antidote favori.',
    'Tu es plus belle que toutes mes pensées réunies.',
    'Dis-moi que tu vas bien, j\'en ai besoin pour mon cœur.',
    'T\'es la première personne que je cherche dans mes pensées chaque matin.',
    'Ton humour est ma punition préférée : j\'en redemande.',
    'Je tombe amoureux de toi un peu plus chaque jour.',
    'T\'es pas juste ma Chouchou, t\'es mon truc à moi.',
    'Tu fais de moi quelqu\'un de meilleur, rien qu\'en étant là.',
    'Mon cœur bat un peu plus vite chaque fois que tu m\'écris.',
    'T\'es le genre de personne qu\'on n\'oublie jamais.',
    'J\'espère que tu sais que tu es aimée mille fois plus que tu ne le penses.',
    'Ton prénom sur mon écran est mon moment préféré de la journée.',
    'Si la distance était une monnaie, je serais déjà riche à côté de toi.'
];

let lastComplimentIndex = -1;

function initComplimentGenerator() {
    const btn = document.getElementById('compliment-btn');
    const text = document.getElementById('compliment-text');
    if (!btn || !text) return;

    btn.addEventListener('click', () => {
        let index;
        do {
            index = Math.floor(Math.random() * COMPLIMENTS.length);
        } while (index === lastComplimentIndex && COMPLIMENTS.length > 1);
        lastComplimentIndex = index;

        text.classList.add('fading');
        setTimeout(() => {
            text.textContent = COMPLIMENTS[index];
            text.classList.remove('fading');
            burstHeartsAround(text);
        }, 180);
    });
}

function burstHeartsAround(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
        const heart = document.createElement('span');
        heart.className = 'click-heart';
        heart.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-heart"/></svg>';
        heart.style.left = `${rect.left + Math.random() * rect.width}px`;
        heart.style.top = `${rect.top + window.scrollY + Math.random() * rect.height * 0.6}px`;
        document.body.append(heart);
        setTimeout(() => heart.remove(), 1800);
    }
}

function createConfetti() {
    if (localStorage.getItem('jeanne-confetti') === 'off') return;

    const colors = ['#D4AF62', '#F1D99B', '#5B1727', '#F5E9CF'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '3000';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animation = `confetti ${Math.random() * 3 + 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        // On retire chaque confetti après son animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}
