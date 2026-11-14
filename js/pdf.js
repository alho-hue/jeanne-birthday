// Export PDF

const PDF_A4_WIDTH = 210;
const PDF_A4_HEIGHT = 297;
const PDF_MARGIN = 10;

function initPDFDownload() {
    const downloadBtn = document.getElementById('download-pdf-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadLetterAsPDF);
    }
}

async function downloadLetterAsPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF || !window.html2canvas) {
        alert('Le générateur de PDF n’est pas disponible. Vérifie ta connexion puis réessaie.');
        return;
    }

    const letterPaper = document.querySelector('#page-love-letter .letter-paper') || document.querySelector('.letter-paper');
    if (!letterPaper) {
        alert('Lettre non trouvée');
        return;
    }

    const { jsPDF } = window.jspdf;
    const btn = document.getElementById('download-pdf-btn');
    const originalText = btn ? btn.innerHTML : '';
    const originalWidth = letterPaper.style.width;

    if (btn) {
        btn.innerHTML = 'Génération…';
        btn.disabled = true;
    }

    let exportStyle = null;

    try {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        exportStyle = installLetterExportStyles();
        letterPaper.classList.add('pdf-export-active');
        fitLetterToPageAspect(letterPaper);

        const canvas = await html2canvas(letterPaper, {
            scale: 3,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: Math.ceil(letterPaper.scrollWidth),
            height: Math.ceil(letterPaper.scrollHeight),
            windowWidth: Math.ceil(letterPaper.scrollWidth) + 80,
            windowHeight: Math.ceil(letterPaper.scrollHeight) + 80
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        pdf.setProperties({
            title: 'Lettre pour Jeanne',
            subject: 'Joyeux anniversaire'
        });

        const rect = letterPaper.getBoundingClientRect();
        const letterWidth = rect.width || letterPaper.scrollWidth;
        const letterHeight = rect.height || letterPaper.scrollHeight;
        addImageToSinglePage(pdf, imgData, letterWidth, letterHeight);
        pdf.save('lettre-pour-jeanne.pdf');
    } catch (error) {
        console.error('Erreur lors de la génération du PDF :', error);
        alert('Erreur lors de la génération du PDF. Réessaie.');
    } finally {
        letterPaper.classList.remove('pdf-export-active');
        letterPaper.style.width = originalWidth;
        letterPaper.style.removeProperty('--pdf-font');
        letterPaper.style.removeProperty('--pdf-lh');
        exportStyle?.remove();
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

function installLetterExportStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .pdf-export-active {
            position: relative !important;
            margin: 0 !important;
            max-width: none !important;
            min-height: 0 !important;
            transform: none !important;
            padding: 22px 28px !important;
            background: linear-gradient(180deg, #fffef9 0%, #f6f1e4 100%) !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            --pdf-font: 15px;
            --pdf-lh: 1.3;
            --pdf-p-margin: .5em;
            --pdf-title-size: 1.35rem;
        }
        .pdf-export-active .letter-content {
            max-height: none !important;
            overflow: visible !important;
            padding: 4px 22px 0 54px !important;
            margin-bottom: 6px !important;
        }
        .pdf-export-active .letter-content p {
            font-size: var(--pdf-font) !important;
            line-height: var(--pdf-lh) !important;
            margin-bottom: var(--pdf-p-margin) !important;
        }
        .pdf-export-active .letter-title {
            font-size: var(--pdf-title-size) !important;
            margin-bottom: 8px !important;
            padding-left: 0 !important;
        }
        .pdf-export-active .letter-signature {
            font-size: calc(var(--pdf-font) * 1.15) !important;
            margin-top: 8px !important;
            padding-right: 0 !important;
        }
        .pdf-export-active .letter-actions {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
    return style;
}

function fitLetterToPageAspect(letterPaper) {
    const contentWidth = PDF_A4_WIDTH - PDF_MARGIN * 2;
    const contentHeight = PDF_A4_HEIGHT - PDF_MARGIN * 2;
    const targetRatio = contentWidth / contentHeight;
    const attempts = [
        ['15px', '1.30'],
        ['13px', '1.24'],
        ['11px', '1.18']
    ];

    let best = { diff: Infinity, width: 900 };

    for (const [fontSize, lineHeight] of attempts) {
        letterPaper.style.setProperty('--pdf-font', fontSize);
        letterPaper.style.setProperty('--pdf-lh', lineHeight);

        let low = 560;
        let high = 1800;

        for (let i = 0; i < 20; i++) {
            const mid = (low + high) / 2;
            letterPaper.style.width = `${mid}px`;
            const height = measureLetterHeight(letterPaper);
            const ratio = mid / height;

            if (ratio < targetRatio) {
                low = mid;
            } else {
                high = mid;
            }
        }

        const width = (low + high) / 2;
        letterPaper.style.width = `${width}px`;
        const height = measureLetterHeight(letterPaper);
        const diff = Math.abs((width / height) - targetRatio);

        if (diff < best.diff) {
            best = { diff, width };
        }
        if (best.diff < 0.01) break;
    }

    letterPaper.style.width = `${best.width}px`;
}

function measureLetterHeight(letterPaper) {
    const rect = letterPaper.getBoundingClientRect();
    return rect.height || letterPaper.scrollHeight || 1;
}

function addImageToSinglePage(pdf, imgData, letterWidth, letterHeight) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - PDF_MARGIN * 2;
    const maxHeight = pageHeight - PDF_MARGIN * 2;

    const imageWidthMM = (letterWidth / 96) * 25.4;
    const imageHeightMM = (letterHeight / 96) * 25.4;
    const ratio = Math.min(maxWidth / imageWidthMM, maxHeight / imageHeightMM, 1);
    const drawWidth = imageWidthMM * ratio;
    const drawHeight = imageHeightMM * ratio;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    pdf.addImage(imgData, 'JPEG', x, y, drawWidth, drawHeight);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initPDFDownload);
