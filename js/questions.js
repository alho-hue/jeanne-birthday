// Questions pour toi

const HER_QUESTIONS = [
    'Quel est le moment où tu as commencé à me voir autrement qu’un simple ami ?',
    'Si tu pouvais revivre une seule journée de notre histoire, laquelle choisirais-tu et pourquoi ?',
    'Qu’est-ce que tu as ressenti lors de notre première rencontre en personne ?',
    'Quelle est la petite chose que je fais et qui te fait te sentir aimée, même à distance ?',
    'Qu’est-ce qui te manque le plus chez moi quand on ne peut pas être ensemble ?',
    'Si j’étais devant toi en ce moment, quelle serait la toute première chose que tu ferais ?',
    'Y a-t-il quelque chose que tu as toujours voulu me dire, mais que tu n’as jamais vraiment osé exprimer ?',
    'Quel est ton plus grand rêve pour nous deux ?',
    'Comment imagines-tu notre quotidien lorsque la distance ne sera plus un obstacle ?',
    'Quelle promesse aimerais-tu qu’on se fasse et qu’on garde toute notre vie ?',
    'Si tu pouvais me laisser un message que je ne devrais lire que dans quelques années, qu’est-ce que tu m’écrirais ?'
];

// Adresse qui reçoit les réponses par e-mail.
// Elle est assemblée au moment de l'envoi pour ne pas apparaître en clair dans le code.
const ANSWERS_EMAIL = ['alhou', 'sseyni', 'd504@gmail', '.com'].join('');
const ANSWERS_DRAFT_KEY = 'jeanne-answers-draft';

function initQuestionsPage() {
    buildQuestionsGrid();
    restoreDraft();

    document.getElementById('questions-grid')?.addEventListener('input', saveDraft);
    document.getElementById('questions-send-btn')?.addEventListener('click', sendAnswers);
    document.getElementById('questions-clear-btn')?.addEventListener('click', clearForm);
}

// Brouillon local : les réponses ne sont jamais perdues, même hors ligne
function saveDraft() {
    try {
        const answers = collectAnswers().map(item => item.answer);
        if (answers.every(a => !a)) {
            localStorage.removeItem(ANSWERS_DRAFT_KEY);
        } else {
            localStorage.setItem(ANSWERS_DRAFT_KEY, JSON.stringify(answers));
        }
    } catch (e) { /* stockage indisponible */ }
}

function restoreDraft() {
    let draft;
    try {
        draft = JSON.parse(localStorage.getItem(ANSWERS_DRAFT_KEY) || 'null');
    } catch (e) { return; }
    if (!Array.isArray(draft)) return;

    draft.forEach((answer, index) => {
        const textarea = document.querySelector(`.question-card:nth-child(${index + 1}) .question-answer`);
        if (textarea && answer) textarea.value = answer;
    });

    if (draft.some(a => a) && typeof showNotification === 'function') {
        showNotification('Tes réponses en cours d\'écriture ont été retrouvées.', 'info');
    }
}

function buildQuestionsGrid() {
    const grid = document.getElementById('questions-grid');
    if (!grid) return;

    grid.innerHTML = '';
    HER_QUESTIONS.forEach((question, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <p class="question-text">
                <span class="question-num">${index + 1}</span>
                <span class="question-label">${question}</span>
            </p>
            <textarea class="question-answer" rows="3" placeholder="Écris ta réponse ici…" aria-label="Question ${index + 1}"></textarea>
        `;
        grid.appendChild(card);
    });
}

function collectAnswers() {
    return HER_QUESTIONS.map((question, index) => {
        const textarea = document.querySelector(`.question-card:nth-child(${index + 1}) .question-answer`);
        return {
            question,
            answer: textarea ? textarea.value.trim() : ''
        };
    });
}

function formatAnswersText(answers) {
    const lines = answers.map((item, index) =>
        `${index + 1}. ${item.question}\nRéponse : ${item.answer || '(pas répondu)'}`
    );
    return `Réponses aux questions de Jeanne\n\n${lines.join('\n\n')}`;
}

function setSendButtonState(sending) {
    const btn = document.getElementById('questions-send-btn');
    if (!btn) return;
    btn.disabled = sending;
    btn.classList.toggle('is-sending', sending);
    const label = btn.querySelector('.send-label');
    if (label) label.textContent = sending ? 'Envoi en cours…' : 'Envoyer mes réponses';
}

async function sendAnswers() {
    const answers = collectAnswers();

    if (!answers.some(item => item.answer)) {
        if (typeof showNotification === 'function') {
            showNotification('Réponds à au moins une question avant d\'envoyer.', 'info');
        }
        return;
    }

    if (!ANSWERS_EMAIL) {
        if (typeof showNotification === 'function') {
            showNotification('L\'envoi n\'est pas configuré pour le moment.', 'error');
        }
        return;
    }

    setSendButtonState(true);
    try {
        const body = new URLSearchParams();
        body.set('_subject', 'Réponses à tes questions, Chouchou');
        body.set('_captcha', 'false');
        body.set('_template', 'table');
        body.set('message', formatAnswersText(answers));

        const response = await fetch(`https://formsubmit.co/${ANSWERS_EMAIL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: body.toString()
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        try { localStorage.removeItem(ANSWERS_DRAFT_KEY); } catch (e) { /* ignore */ }
        if (typeof showNotification === 'function') {
            showNotification('Merci ! Tes réponses sont en route vers moi.', 'success');
        }
    } catch (error) {
        console.warn('Send answers failed:', error);
        saveDraft();
        if (typeof showNotification === 'function') {
            showNotification(
                navigator.onLine === false
                    ? 'Pas de réseau : tes réponses sont sauvegardées ici, réessaie plus tard.'
                    : 'L\'envoi a échoué — tes réponses sont sauvegardées, réessaie.',
                'error'
            );
        }
    } finally {
        setSendButtonState(false);
    }
}

function clearForm() {
    document.querySelectorAll('.question-answer').forEach(textarea => {
        textarea.value = '';
    });
    try { localStorage.removeItem(ANSWERS_DRAFT_KEY); } catch (e) { /* ignore */ }
    if (typeof showNotification === 'function') {
        showNotification('Formulaire effacé.', 'info');
    }
}

document.addEventListener('DOMContentLoaded', initQuestionsPage);
