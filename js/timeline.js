// Chronologie

function initTimeline() {
    // Les interactions sont gérées par les déclencheurs de lettres (letters.js)

    // Léger effet au survol des éléments de la chronologie
    const timelineItems = document.querySelectorAll('.timeline-item, .story-card');
    timelineItems.forEach(item => {
        const content = item.querySelector('.timeline-content, .story-content');
        if (!content) return;

        item.addEventListener('mouseenter', function() {
            content.style.transform = 'translateY(-5px) scale(1.01)';
        });

        item.addEventListener('mouseleave', function() {
            content.style.transform = '';
        });
    });
}

