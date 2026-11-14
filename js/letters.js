// Lettres

// Contenu des lettres - chaque lettre est unique, sans répétition avec la grande lettre
const letters = {
    'letter-1': {
        title: 'Notre petit secret ❤️',
        content: `<p>Jeanne,</p>
        <p>Il y a quelque chose que je ne te dis peut-être pas assez souvent : tu as pris une place dans ma vie que je n'avais absolument pas prévue.</p>
        <p>Je ne sais pas à quel moment précis c'est arrivé, ni comment une personne peut devenir aussi importante au fil du temps. Mais aujourd'hui, tu fais partie de mes pensées, de mes projets et de ces petits moments de la journée où j'aimerais simplement t'avoir près de moi.</p>
        <p>Parfois, j'aimerais pouvoir mettre la distance sur pause, juste le temps de te regarder, te prendre dans mes bras et profiter de ta présence sans avoir à compter les heures avant de se dire au revoir.</p>
        <p>Je ne prétends pas être parfait, et je sais qu'on a encore beaucoup à apprendre l'un sur l'autre. Mais je veux continuer à découvrir toutes les facettes de toi, même celles que tu ne montres pas facilement.</p>
        <p>Et si je devais garder un seul souhait pour nous, ce serait de ne jamais devenir deux personnes qui se connaissent par cœur, mais qui oublient de continuer à se découvrir.</p>
        <p><strong>Je veux encore avoir mille choses à apprendre sur toi.</strong></p>
        <p>Ton Chouchou ❤️</p>`
    },
    'letter-2': {
        title: 'Le jour où je t\'ai vue en vrai ❤️',
        content: `<p>Jeanne,</p>
        <p>Je crois que tu ne réalises pas à quel point cette journée est restée dans ma tête.</p>
        <p>Je me souviens de ce maillot que je t'avais promis. Mais, pour être honnête, ce n'était pas vraiment le maillot qui me motivait à venir. C'était surtout l'occasion de te voir enfin, de mettre un visage réel devant toutes ces conversations.</p>
        <p>Et puis je t'ai vue.</p>
        <p>Je ne sais même pas comment expliquer ce moment. J'avais imaginé cette rencontre, mais la réalité avait quelque chose de différent. Tu étais là, devant moi, et j'aurais voulu que le temps ralentisse un peu.</p>
        <p>Je crois que ce qui m'a le plus marqué, c'est qu'on n'a même pas eu assez de temps pour profiter de ce moment.</p>
        <p>Alors oui, je t'ai apporté ton maillot. Mais je suis reparti avec quelque chose de bien plus précieux : un souvenir de toi que je garde encore aujourd'hui.</p>
        <p>Et j'espère sincèrement que ce n'était que le début de beaucoup d'autres rencontres.</p>
        <p><strong>La prochaine fois, je compte bien profiter de chaque seconde.</strong></p>
        <p>Ton Cheri ❤️</p>`
    },
    'letter-3': {
        title: 'Tes messages ❤️',
        content: `<p>Ma Chouchou,</p>
        <p>Tu sais, il y a des petites choses qui peuvent sembler insignifiantes pour toi, mais qui ont une importance particulière pour moi.</p>
        <p>Tes messages en font partie.</p>
        <p>J'aime découvrir ton prénom sur mon écran, voir que tu as pensé à m'écrire, même si ce n'est que pour me dire bonjour ou m'envoyer quelques mots sans raison particulière.</p>
        <p>Ce que j'aime, ce n'est même pas forcément ce que tu écris, c'est de savoir que quelque part dans ta journée, tu as pris un petit instant pour moi.</p>
        <p>Et parfois, je relis certains de tes messages avec un sourire un peu bête. Tu ne t'en rends probablement pas compte, mais tu as cette capacité de rendre mes journées plus agréables sans même essayer.</p>
        <p>Alors ne sous-estime jamais tes petits messages. Même les plus simples ont leur importance.</p>
        <p><strong>J'aime recevoir de tes nouvelles, mais j'aime encore plus savoir que tu vas bien.</strong></p>
        <p>Ton fan</p>`
    },
    'letter-4': {
        title: 'Un rêve avec toi ❤️',
        content: `<p>Jeanne,</p>
        <p>L'autre nuit, j'ai rêvé de toi.</p>
        <p>Je ne me souviens même plus exactement de l'endroit où nous étions. Ce dont je me souviens, c'est qu'on était ensemble. Pas d'écran entre nous, pas de distance à calculer, pas besoin d'attendre le prochain appel.</p>
        <p>On riait, on se taquinait, on profitait simplement du moment. Rien d'extraordinaire ne se passait, et pourtant, c'était exactement le genre de moment que j'aimerais vivre avec toi.</p>
        <p>Puis je me suis réveillé.</p>
        <p>Pendant quelques secondes, j'ai presque oublié que ce n'était qu'un rêve. Et quand j'ai réalisé que tu n'étais pas réellement à côté de moi, j'ai eu cette petite déception.</p>
        <p>Mais tu sais quoi ? Ce rêve m'a rappelé quelque chose : je n'ai pas besoin qu'on vive des choses extraordinaires pour être heureux avec toi. Parfois, j'aimerais simplement partager une journée ordinaire à tes côtés.</p>
        <p>Alors, un jour, j'espère qu'on pourra se créer des souvenirs qui seront encore plus beaux que mes rêves.</p>
        <p><strong>Et cette fois, je n'aurai pas envie de me réveiller.</strong></p>
        <p>Ton ❤️</p>`
    },
    'letter-5': {
        title: 'Une confession',
        content: `<p>Ma Chouchou,</p>
        <p>J'ai quelque chose à t'avouer.</p>
        <p>Depuis que tu fais partie de ma vie, je me surprends à imaginer des choses que je n'imaginais pas forcément avant.</p>
        <p>Je pense davantage à l'avenir, aux endroits que j'aimerais découvrir, aux expériences que je voudrais vivre et à tout ce que j'aimerais accomplir.</p>
        <p>Et parfois, quand j'imagine ces moments, tu es là.</p>
        <p>Je m'imagine te raconter mes réussites, te faire découvrir des endroits que tu n'as jamais visités, partager avec toi des moments dont on parlera encore des années plus tard.</p>
        <p>Je veux réussir beaucoup de choses dans ma vie, pour moi-même, bien sûr. Mais il y a quelque chose de particulièrement beau dans l'idée de pouvoir partager tout ça avec toi.</p>
        <p>Je ne sais pas exactement ce que l'avenir nous réserve, mais je sais que j'aimerais qu'il nous laisse beaucoup de belles histoires à raconter.</p>
        <p><strong>Et parmi toutes les choses que je veux découvrir dans cette vie, il y en a une que je veux continuer à découvrir chaque jour : toi.</strong></p>
        <p>Ton inspirateur</p>`
    },
    'letter-6': {
        title: 'Ce n\'est pas un jeu',
        content: `<p>Jeanne,</p>
        <p>Je sais qu'on est encore jeunes et qu'on a toute une vie devant nous. Certains diront qu'on a le temps, qu'il ne faut pas prendre les choses trop au sérieux à notre âge.</p>
        <p>Mais je pense qu'être jeune n'empêche pas d'avoir des sentiments sincères, ni de vouloir construire quelque chose de beau avec quelqu'un.</p>
        <p>Je ne peux pas te promettre que tout sera toujours facile. On aura nos désaccords, nos mauvais jours, nos moments de doute. Ce serait mentir de prétendre le contraire.</p>
        <p>Mais je peux te dire une chose : je ne considère pas notre relation comme un simple passe-temps.</p>
        <p>Quand je pense à nous, je ne pense pas seulement à aujourd'hui. Je pense à tout ce qu'on pourrait vivre, à tout ce qu'on pourrait construire et aux souvenirs qu'on n'a pas encore créés.</p>
        <p>Je ne veux pas simplement être quelqu'un qui partage quelques moments de ta vie. J'aimerais être quelqu'un avec qui tu peux envisager les prochains chapitres.</p>
        <p><strong>Je ne cherche pas une histoire parfaite. Je veux une histoire vraie, avec toi.</strong></p>
        <p>Ton partenaire</p>`
    },
    'letter-7': {
        title: 'Une petite attention pour toi ❤️',
        content: `<p>Mon cœur,</p>
        <p>J'ai voulu te préparer quelque chose qui ne s'achète pas dans une boutique.</p>
        <p>J'ai passé du temps à imaginer ce site, à construire chaque petite section, à écrire ces lettres et à préparer quelques surprises. J'ai parfois dû recommencer certaines choses, modifier des détails et chercher les bons mots.</p>
        <p>Tout ça simplement parce que j'avais envie de te faire plaisir d'une manière un peu différente.</p>
        <p>Bien sûr, j'ai aussi prévu d'autres petites surprises pour toi. Mais je voulais que tu aies quelque chose qui reste, quelque chose que tu pourrais retrouver même longtemps après cette journée.</p>
        <p>J'espère que tu prendras plaisir à découvrir chaque partie de ce petit univers autant que j'ai pris plaisir à le préparer.</p>
        <p>Et surtout, ne cherche pas forcément un grand message caché derrière chaque détail. Parfois, il suffit simplement de savoir que quelqu'un a pensé à toi en préparant tout ça.</p>
        <p><strong>Aujourd'hui, toutes ces petites attentions ont un seul prénom : le tien.</strong></p>
        <p>Je t'aime, Jeanne. ❤️</p>
        <p>Avec tout mon amour.</p>`
    }
};

function initLetters() {
    restoreReadLetters();

    // Déclencheurs de lettres dans la chronologie
    const letterTriggers = document.querySelectorAll('.letter-trigger');
    letterTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const letterId = this.getAttribute('data-letter');
            if (letterId) {
                openLetter(letterId);
            }
        });
    });
    
    // Cartes « souvenir »
    const souvenirCards = document.querySelectorAll('.souvenir-card');
    souvenirCards.forEach(card => {
        card.addEventListener('click', function() {
            const letterId = this.getAttribute('data-letter');
            if (letterId) {
                openLetter(letterId);
            }
        });
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const letterId = this.getAttribute('data-letter');
                if (letterId) openLetter(letterId);
            }
        });
    });
    
    // Cartes de la page lettres
    const letterCards = document.querySelectorAll('.letter-card');
    letterCards.forEach(card => {
        card.addEventListener('click', function() {
            const letterId = this.getAttribute('data-letter');
            if (letterId) {
                openLetter(letterId);
            }
        });
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const letterId = this.getAttribute('data-letter');
                if (letterId) openLetter(letterId);
            }
        });
    });
    
    // Bouton de fermeture de la fenêtre
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeLetterModal);
    }
    
    // Fermeture au clic à l'extérieur
    const letterModal = document.getElementById('letter-modal');
    if (letterModal) {
        letterModal.addEventListener('click', function(e) {
            if (e.target === letterModal) {
                closeLetterModal();
            }
        });
    }
}

function openLetter(letterId) {
    const letter = letters[letterId];
    if (!letter) {
        console.warn('Letter not found:', letterId);
        return;
    }
    
    const modal = document.getElementById('letter-modal');
    const modalBody = document.getElementById('letter-modal-body');
    
    if (!modal || !modalBody) return;
    
    modalBody.innerHTML = `
        <div class="small-letter-paper">
            <h2 class="small-letter-title">${letter.title}</h2>
            <div class="small-letter-content">
                ${letter.content}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    markLetterRead(letterId);
}

function getReadLetters() {
    try {
        const value = JSON.parse(localStorage.getItem('jeanne-letters-read') || '[]');
        return Array.isArray(value) ? value : [];
    } catch (error) {
        return [];
    }
}

function markLetterRead(letterId) {
    const read = getReadLetters();
    if (!read.includes(letterId)) {
        read.push(letterId);
        try { localStorage.setItem('jeanne-letters-read', JSON.stringify(read)); } catch (error) { /* ignore */ }
    }
    document.querySelectorAll(`[data-letter="${letterId}"]`).forEach(element => element.classList.add('read'));
    document.dispatchEvent(new CustomEvent('jeanne:progress-changed'));
}

function restoreReadLetters() {
    getReadLetters().forEach(letterId => {
        document.querySelectorAll(`[data-letter="${letterId}"]`).forEach(element => element.classList.add('read'));
    });
}

function closeLetterModal() {
    const modal = document.getElementById('letter-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}
