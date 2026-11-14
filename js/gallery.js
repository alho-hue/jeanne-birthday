// Galerie

let currentImageIndex = 0;
let galleryImages = [];

function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryItems.length === 0) {
        return;
    }

    // On récupère chaque entrée de la galerie (vraie photo ou placeholder)
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-caption') || '';
        const iconId = item.getAttribute('data-icon');
        item.setAttribute('aria-label', caption ? `Voir le souvenir : ${caption}` : 'Voir le souvenir');

        if (img) {
            galleryImages[index] = { src: img.src, caption };
        } else if (iconId) {
            galleryImages[index] = { src: placeholderDataUri(iconId, caption || 'Souvenir'), caption };
        }

        item.addEventListener('click', function() {
            if (galleryImages[index]) {
                openLightbox(index);
            }
        });
        item.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && galleryImages[index]) {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    // Contrôles de la visionneuse
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevImage);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNextImage);
    }

    // Fermeture au clic à l'extérieur
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Navigation au clavier dans la visionneuse
    document.addEventListener('keydown', function(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    
    currentImageIndex = index;
    const imageData = galleryImages[index];
    if (!imageData) return;

    lightboxImage.src = imageData.src;
    lightboxCaption.textContent = imageData.caption;
    
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!lightboxImage || !lightboxCaption) return;

    const imageData = galleryImages[currentImageIndex];
    if (!imageData) return;
    lightboxImage.src = imageData.src;
    lightboxCaption.textContent = imageData.caption;
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function placeholderDataUri(iconId, caption) {
    const symbol = document.getElementById(iconId);
    const iconMarkup = symbol ? symbol.innerHTML : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" style="color:#ffffff">
        <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#17142b"/>
                <stop offset="1" stop-color="#3b2f5a"/>
            </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#g)"/>
        <circle cx="200" cy="170" r="86" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
        <g transform="translate(140,110) scale(5)" style="color:#f5e9cf">${iconMarkup}</g>
        <text x="200" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#f5e9cf">${escapeXml(caption)}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
