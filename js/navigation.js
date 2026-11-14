// Navigation

let currentPage = 'page-entry';

function initNavigation() {
    // Enveloppe et bouton d'entrée
    const entryEnvelope = document.querySelector('.envelope');
    const entryBtn = document.getElementById('entry-btn');

    if (entryEnvelope) {
        entryEnvelope.addEventListener('click', handleEntry);
        entryEnvelope.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleEntry();
            }
        });
    }

    if (entryBtn) {
        entryBtn.addEventListener('click', handleEntry);
    }

    // Au premier clic : on tente d'entrer en mode cinéma (plein écran)
    const tryCinema = () => {
        if (typeof requestCinemaMode === 'function' && currentPage === 'page-entry') {
            requestCinemaMode();
        }
    };
    document.addEventListener('click', tryCinema, { once: true });
    document.addEventListener('keydown', tryCinema, { once: true });
    
    // Bouton « découvrir »
    const discoverBtn = document.getElementById('discover-btn');
    if (discoverBtn) {
        discoverBtn.addEventListener('click', () => navigateTo('page-timeline'));
    }
    
    // Du récit vers la grande lettre
    const toLoveLetterBtn = document.getElementById('to-love-letter-btn');
    if (toLoveLetterBtn) {
        toLoveLetterBtn.addEventListener('click', () => navigateTo('page-love-letter'));
    }

    // De la chronologie vers les lettres
    const timelineToLettersBtn = document.getElementById('timeline-to-letters-btn');
    if (timelineToLettersBtn) {
        timelineToLettersBtn.addEventListener('click', () => navigateTo('page-letters'));
    }

    // De la chronologie vers la galerie
    const timelineToGalleryBtn = document.getElementById('timeline-to-gallery-btn');
    if (timelineToGalleryBtn) {
        timelineToGalleryBtn.addEventListener('click', () => navigateTo('page-gallery'));
    }

    // De la chronologie vers l'accueil
    const timelineToHomeBtn = document.getElementById('timeline-to-home-btn');
    if (timelineToHomeBtn) {
        timelineToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }

    // Boutons de la grande lettre
    const toGalleryBtn = document.getElementById('to-gallery-btn');
    if (toGalleryBtn) {
        toGalleryBtn.addEventListener('click', () => navigateTo('page-gallery'));
    }

    const loveLetterToLettersBtn = document.getElementById('love-letter-to-letters-btn');
    if (loveLetterToLettersBtn) {
        loveLetterToLettersBtn.addEventListener('click', () => navigateTo('page-letters'));
    }

    const loveLetterToHomeBtn = document.getElementById('love-letter-to-home-btn');
    if (loveLetterToHomeBtn) {
        loveLetterToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }

    // Boutons de la galerie
    const toLettersBtn = document.getElementById('to-letters-btn');
    if (toLettersBtn) {
        toLettersBtn.addEventListener('click', () => navigateTo('page-letters'));
    }

    const galleryToQuizBtn = document.getElementById('gallery-to-quiz-btn');
    if (galleryToQuizBtn) {
        galleryToQuizBtn.addEventListener('click', () => navigateTo('page-quiz'));
    }

    const galleryToHomeBtn = document.getElementById('gallery-to-home-btn');
    if (galleryToHomeBtn) {
        galleryToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }

    // Boutons des lettres
    const lettersToGalleryBtn = document.getElementById('letters-to-gallery-btn');
    if (lettersToGalleryBtn) {
        lettersToGalleryBtn.addEventListener('click', () => navigateTo('page-gallery'));
    }

    const lettersToQuizBtn = document.getElementById('letters-to-quiz-btn');
    if (lettersToQuizBtn) {
        lettersToQuizBtn.addEventListener('click', () => navigateTo('page-quiz'));
    }

    const lettersToHomeBtn = document.getElementById('letters-to-home-btn');
    if (lettersToHomeBtn) {
        lettersToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }
    
    // Boutons des jeux : direction la surprise
    const toSurpriseBtn = document.getElementById('to-surprise-btn');
    if (toSurpriseBtn) {
        toSurpriseBtn.addEventListener('click', () => navigateTo('page-surprise'));
    }

    const quizToHomeBtn = document.getElementById('quiz-to-home-btn');
    if (quizToHomeBtn) {
        quizToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }

    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    if (restartQuizBtn) {
        restartQuizBtn.addEventListener('click', restartQuiz);
    }

    // Boutons de la page questions
    const quizToQuestionsBtn = document.getElementById('quiz-to-questions-btn');
    if (quizToQuestionsBtn) {
        quizToQuestionsBtn.addEventListener('click', () => navigateTo('page-questions'));
    }

    const truthToQuestionsBtn = document.getElementById('truth-to-questions-btn');
    if (truthToQuestionsBtn) {
        truthToQuestionsBtn.addEventListener('click', () => navigateTo('page-questions'));
    }

    const truthToHomeBtn = document.getElementById('truth-to-home-btn');
    if (truthToHomeBtn) {
        truthToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }

    const questionsToQuizBtn = document.getElementById('questions-to-quiz-btn');
    if (questionsToQuizBtn) {
        questionsToQuizBtn.addEventListener('click', () => navigateTo('page-quiz'));
    }

    const questionsToHomeBtn = document.getElementById('questions-to-home-btn');
    if (questionsToHomeBtn) {
        questionsToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }

    // Raccourcis génériques : *-to-home-btn / *-to-surprise-btn
    document.querySelectorAll('[id$="-to-home-btn"], [id="go-home-btn"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('page-home'));
    });
    document.querySelectorAll('[id$="-to-surprise-btn"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('page-surprise'));
    });

    // Raccourcis vers l'arbre (*-to-tree-btn)
    document.querySelectorAll('[id$="-to-tree-btn"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('page-tree'));
    });

    // Raccourcis vers la page distance
    document.querySelectorAll('[id$="-to-distance-btn"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('page-distance'));
    });

    const distanceToQuestionsBtn = document.getElementById('distance-to-questions-btn');
    if (distanceToQuestionsBtn) {
        distanceToQuestionsBtn.addEventListener('click', () => navigateTo('page-questions'));
    }

    const distanceToSurpriseBtn = document.getElementById('distance-to-surprise-btn');
    if (distanceToSurpriseBtn) {
        distanceToSurpriseBtn.addEventListener('click', () => navigateTo('page-surprise'));
    }

    const distanceToHomeBtn = document.getElementById('distance-to-home-btn');
    if (distanceToHomeBtn) {
        distanceToHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }

    // Boutons de la surprise
    const replayTimelineBtn = document.getElementById('replay-timeline-btn');
    if (replayTimelineBtn) {
        replayTimelineBtn.addEventListener('click', () => navigateTo('page-timeline'));
    }
    
    const replayLetterBtn = document.getElementById('replay-letter-btn');
    if (replayLetterBtn) {
        replayLetterBtn.addEventListener('click', () => navigateTo('page-love-letter'));
    }

    const surpriseToLettersBtn = document.getElementById('surprise-to-letters-btn');
    if (surpriseToLettersBtn) {
        surpriseToLettersBtn.addEventListener('click', () => navigateTo('page-letters'));
    }

    const goHomeBtn = document.getElementById('go-home-btn');
    if (goHomeBtn) {
        goHomeBtn.addEventListener('click', () => navigateTo('page-home'));
    }
    
    // Navigation au clavier
    document.addEventListener('keydown', handleKeyboard);

    // Navigation par les points de progression
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const targetPage = dot.getAttribute('data-page');
            if (targetPage) {
                navigateTo(targetPage);
            }
        });
    });
}

function handleEntry() {
    const envelope = document.querySelector('.envelope');
    if (envelope && !envelope.classList.contains('opened')) {
        envelope.classList.add('opened');
        
        // On attend la fin de l'animation avant de naviguer
        setTimeout(() => {
            navigateTo('page-home');
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('jeanne:site-opened'));
            }, 350);
        }, 1500);
    }
}

function navigateTo(pageId) {
    const newPageElement = document.getElementById(pageId);
    if (!currentPage || !newPageElement || currentPage === pageId) return;

    // On masque la page actuelle
    const currentPageElement = document.getElementById(currentPage);
    if (currentPageElement) {
        currentPageElement.classList.remove('active');
    }

    // On affiche la nouvelle page
    newPageElement.classList.add('active');
    newPageElement.classList.remove('page-enter');
    void newPageElement.offsetWidth;
    newPageElement.classList.add('page-enter');
    onPageLoad(pageId);

    // On met à jour la page courante
    currentPage = pageId;

    // On met à jour l'indicateur de progression
    updateProgressIndicator(pageId);

    // On garde le site en mode cinéma (plein écran) à chaque navigation
    if (typeof requestCinemaMode === 'function') {
        requestCinemaMode();
    }

    // Retour en haut de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressIndicator(pageId) {
    const dots = document.querySelectorAll('.dot');
    const pageOrder = ['page-entry', 'page-home', 'page-timeline', 'page-love-letter', 'page-letters', 'page-gallery', 'page-quiz', 'page-questions', 'page-distance', 'page-tree', 'page-surprise'];
    const currentIndex = pageOrder.indexOf(pageId);

    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'visited');
        if (index === currentIndex) {
            dot.classList.add('active');
        } else if (index < currentIndex) {
            dot.classList.add('visited');
        }
    });
}

function onPageLoad(pageId) {
    switch(pageId) {
        case 'page-timeline':
            animateTimelineItems();
            break;
        case 'page-letters':
            animateLetterCards();
            break;
        case 'page-gallery':
            animateGalleryItems();
            break;
        case 'page-quiz':
            break;
        case 'page-questions':
            break;
        case 'page-distance':
            if (typeof initDistancePage === 'function') initDistancePage();
            break;
        case 'page-tree':
            if (typeof initTreePage === 'function') initTreePage();
            break;
        case 'page-surprise':
            break;
    }
}

function handleKeyboard(e) {
    // Échap ferme les fenêtres modales
    if (e.key === 'Escape') {
        closeAllModals();
    }
}

function closeAllModals() {
    // Fermeture de la fenêtre de lettre
    const letterModal = document.getElementById('letter-modal');
    if (letterModal && letterModal.classList.contains('active')) {
        letterModal.classList.remove('active');
    }
    
    // Fermeture de la visionneuse
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
    }
}

// Animations des pages

function animateTimelineItems() {
    const items = document.querySelectorAll('.story-scroll .story-card');
    items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 120}ms`;
        item.classList.add('visible');
    });
}

function animateLetterCards() {
    const cards = document.querySelectorAll('.letter-card');
    cards.forEach(card => card.classList.add('visible'));
}

function animateGalleryItems() {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => item.classList.add('visible'));
}
