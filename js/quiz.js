// Jeu de mémoire

const MEMORY_SYMBOLS = [
    'icon-heart',
    'icon-mail',
    'icon-image',
    'icon-mic',
    'icon-gift',
    'icon-cake'
];

let memoryDeck = [];
let firstMemoryCard = null;
let memoryLock = false;
let matchedPairs = 0;
let memoryMoves = 0;
let memoryStartTime = 0;

function initQuiz() {
    buildMemoryGame();
    initTruthGame();
    initGameTabs();

    const board = document.getElementById('memory-board');
    board?.addEventListener('click', event => {
        const card = event.target.closest('.memory-card');
        if (card) flipMemoryCard(card);
    });
}

function buildMemoryGame() {
    const board = document.getElementById('memory-board');
    const content = document.getElementById('quiz-content');
    const result = document.getElementById('quiz-result');
    if (!board) return;

    board.innerHTML = '';
    firstMemoryCard = null;
    memoryLock = false;
    matchedPairs = 0;
    memoryMoves = 0;
    memoryStartTime = 0;

    content?.classList.remove('hidden');
    result?.classList.add('hidden');

    memoryDeck = shuffleArray([...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]);

    memoryDeck.forEach(symbol => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        card.innerHTML = `
            <span class="memory-card-inner">
                <span class="memory-card-face memory-card-back">
                    <svg class="icon icon-lg" aria-hidden="true"><use href="#icon-sparkles"/></svg>
                </span>
                <span class="memory-card-face memory-card-front">
                    <svg class="icon icon-lg" aria-hidden="true"><use href="#${symbol}"/></svg>
                </span>
            </span>
        `;
        board.appendChild(card);
    });

    updateMemoryStatus();
}

function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function flipMemoryCard(card) {
    if (memoryLock || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    if (!memoryStartTime) {
        memoryStartTime = Date.now();
    }

    card.classList.add('flipped');

    if (!firstMemoryCard) {
        firstMemoryCard = card;
        return;
    }

    const first = firstMemoryCard;
    const second = card;
    firstMemoryCard = null;
    memoryLock = true;
    memoryMoves++;
    updateMemoryStatus();

    setTimeout(() => {
        const isMatch = first.dataset.symbol === second.dataset.symbol;

        if (isMatch) {
            first.classList.add('matched');
            second.classList.add('matched');
            matchedPairs++;
            updateMemoryStatus();

            if (matchedPairs === MEMORY_SYMBOLS.length) {
                setTimeout(showMemoryResult, 650);
            }
        } else {
            first.classList.remove('flipped');
            second.classList.remove('flipped');
        }

        memoryLock = false;
    }, 750);
}

function updateMemoryStatus() {
    const pairs = document.getElementById('memory-pairs');
    const moves = document.getElementById('memory-moves');
    if (pairs) pairs.textContent = matchedPairs;
    if (moves) moves.textContent = memoryMoves;
}

function showMemoryResult() {
    const content = document.getElementById('quiz-content');
    const result = document.getElementById('quiz-result');
    const finalScore = document.getElementById('final-score');
    const finalTime = document.getElementById('final-time');

    content?.classList.add('hidden');
    result?.classList.remove('hidden');

    if (finalScore) finalScore.textContent = memoryMoves;
    if (finalTime) {
        const seconds = memoryStartTime ? Math.max(1, Math.round((Date.now() - memoryStartTime) / 1000)) : 0;
        finalTime.textContent = `${seconds} s`;
    }

    try {
        localStorage.setItem('jeanne-memory-done', 'yes');
        const best = Number(localStorage.getItem('jeanne-memory-best'));
        if (!Number.isFinite(best) || memoryMoves < best) {
            localStorage.setItem('jeanne-memory-best', String(memoryMoves));
        }
    } catch (error) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('jeanne:progress-changed'));
}

function restartQuiz() {
    buildMemoryGame();
}

// Onglets de jeux

function initGameTabs() {
    document.querySelectorAll('.game-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.gameTab;
            document.querySelectorAll('.game-tab').forEach(item => {
                const active = item === tab;
                item.classList.toggle('active', active);
                item.setAttribute('aria-selected', String(active));
            });
            document.getElementById('memory-panel')?.classList.toggle('hidden', target !== 'memory');
            document.getElementById('truth-panel')?.classList.toggle('hidden', target !== 'truth');
        });
    });
}

// Vrai ou faux

const TRUTH_QUESTIONS = [
    // Les petits détails que tu connais de moi
    { text: 'Je peux passer des heures à parler de technologie sans voir le temps passer.', answer: true },
    { text: 'Je suis quelqu’un qui exprime facilement tous ses sentiments.', answer: false },
    { text: 'Je préfère parfois te taquiner plutôt que te faire un compliment directement.', answer: true },

    // Notre complicité
    { text: 'On a commencé à avoir une complicité avant même de devenir amoureux.', answer: true },
    { text: 'Je pourrais reconnaître ton humeur simplement à ta façon de m’écrire.', answer: true },
    { text: 'Je n’ai jamais relu nos anciennes conversations.', answer: false },
    { text: 'Nos surnoms ont une histoire qui nous appartient.', answer: true },

    // Les pièges
    { text: 'Je pourrais être jaloux sans forcément te le montrer.', answer: true },
    { text: 'Je trouve que les appels sont inutiles dans une relation à distance.', answer: false },
    { text: 'Je suis capable de bouder juste pour attirer ton attention.', answer: true },

    // Notre avenir
    { text: 'Je me suis déjà imaginé à quoi ressemblerait notre première journée ensemble sans aucune contrainte de temps.', answer: true },
    { text: 'Je préfère les grandes déclarations aux petites attentions quotidiennes.', answer: false },
    { text: 'J’aimerais qu’on ait un jour nos propres petites habitudes de couple.', answer: true },
    { text: 'Je pense que se connaître parfaitement signifie ne plus avoir besoin de communiquer.', answer: false },

    // Quelques provocations ❤️
    { text: 'Je serais capable de te laisser gagner volontairement à tous les jeux.', answer: false },
    { text: 'Même quand je te taquine, il m’arrive de vouloir simplement te faire sourire.', answer: true },
    { text: 'Si tu me demandais de raconter notre histoire, je manquerais de choses à raconter.', answer: false }
];

let truthDeck = [];
let truthIndex = 0;
let truthScore = 0;
let truthLocked = false;

function initTruthGame() {
    const trueBtn = document.getElementById('truth-true');
    const falseBtn = document.getElementById('truth-false');
    const restartBtn = document.getElementById('restart-truth-btn');

    trueBtn?.addEventListener('click', () => answerTruth(true));
    falseBtn?.addEventListener('click', () => answerTruth(false));
    restartBtn?.addEventListener('click', restartTruthGame);

    const totalEl = document.getElementById('truth-total');
    const totalScoreEl = document.getElementById('truth-final-total');
    if (totalEl) totalEl.textContent = TRUTH_QUESTIONS.length;
    if (totalScoreEl) totalScoreEl.textContent = TRUTH_QUESTIONS.length;

    startTruthGame();
}

function startTruthGame() {
    truthDeck = shuffleArray([...TRUTH_QUESTIONS]);
    truthIndex = 0;
    truthScore = 0;
    truthLocked = false;

    document.getElementById('truth-game')?.classList.remove('hidden');
    document.getElementById('truth-result')?.classList.add('hidden');
    const feedback = document.getElementById('truth-feedback');
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'truth-feedback';
    }
    renderTruthQuestion();
}

function restartTruthGame() {
    startTruthGame();
}

function renderTruthQuestion() {
    const question = truthDeck[truthIndex];
    const indexEl = document.getElementById('truth-index');
    const scoreEl = document.getElementById('truth-score');
    const textEl = document.getElementById('truth-question');

    truthLocked = false;
    if (indexEl) indexEl.textContent = truthIndex + 1;
    if (scoreEl) scoreEl.textContent = truthScore;
    if (textEl) textEl.textContent = question ? question.text : '';
}

function answerTruth(playerAnswer) {
    if (truthLocked) return;
    const question = truthDeck[truthIndex];
    if (!question) return;

    truthLocked = true;
    const correct = playerAnswer === question.answer;
    if (correct) truthScore++;

    const scoreEl = document.getElementById('truth-score');
    if (scoreEl) scoreEl.textContent = truthScore;

    const feedback = document.getElementById('truth-feedback');
    if (feedback) {
        feedback.textContent = correct
            ? 'Bonne réponse !'
            : `Presque ! C'était ${question.answer ? 'vrai' : 'faux'}.`;
        feedback.className = `truth-feedback ${correct ? 'correct' : 'wrong'}`;
    }

    setTimeout(() => {
        truthIndex++;
        if (truthIndex >= truthDeck.length) {
            showTruthResult();
        } else {
            renderTruthQuestion();
            const fb = document.getElementById('truth-feedback');
            if (fb) {
                fb.textContent = '';
                fb.className = 'truth-feedback';
            }
        }
    }, 1000);
}

function showTruthResult() {
    document.getElementById('truth-game')?.classList.add('hidden');
    document.getElementById('truth-result')?.classList.remove('hidden');

    const scoreEl = document.getElementById('truth-final-score');
    const textEl = document.getElementById('truth-final-text');
    if (scoreEl) scoreEl.textContent = truthScore;
    if (textEl) {
        const ratio = truthScore / truthDeck.length;
        textEl.textContent = ratio === 1
            ? 'Parfait, Chouchou : tu connais notre histoire mieux que quiconque.'
            : ratio >= 0.6
                ? 'Très bien ! Tu connais l\'essentiel de notre histoire.'
                : 'Pas mal ! Notre histoire a encore des secrets pour toi.';
    }

    try {
        localStorage.setItem('jeanne-truth-done', 'yes');
        const best = Number(localStorage.getItem('jeanne-truth-best'));
        if (!Number.isFinite(best) || truthScore > best) {
            localStorage.setItem('jeanne-truth-best', String(truthScore));
        }
    } catch (error) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('jeanne:progress-changed'));
}

document.addEventListener('DOMContentLoaded', initQuiz);
