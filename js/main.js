// Initialisation

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des modules
    initParticles();
    initNavigation();
    initCountdown();
    initMusic();
    initTimeline();
    initLetters();
    initGallery();
    initSurprise();
});

// Notifications

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = 'notification show ' + type;

    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Particules

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = window.matchMedia('(max-width: 575px)').matches ? 12 : 24;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Position aléatoire
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Taille aléatoire
    const size = Math.random() * 3 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Délai d'animation aléatoire
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 18) + 's';
    
    container.appendChild(particle);
}

// Gestion des erreurs

window.addEventListener('error', function(e) {
    console.error('Global error:', e.message);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});
