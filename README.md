# Site anniversaire pour Jeanne

Un petit site web fait à la main pour l'anniversaire de Jeanne : une enveloppe à ouvrir, une grande lettre, des messages vocaux, des jeux, et une surprise à la fin.

## Ce qu'il y a dedans

- **Entrée secrète** : une enveloppe animée à ouvrir pour commencer
- **Accueil** : compte à rebours jusqu'à l'anniversaire, nombre de jours ensemble, lien direct vers chaque section
- **Mes mots** : messages vocaux à écouter + la chronologie de notre histoire, avec des petites lettres cachées dans certaines étapes
- **Grande lettre** : une lettre d'amour sur papier, téléchargeable en PDF
- **Petites lettres** : 7 lettres différentes à découvrir
- **Galerie** : cachée pour l'instant, se remplit quand on ajoute de vraies photos dans `assets/images`
- **Jeux** : un jeu de mémoire et un vrai/faux sur notre histoire
- **Questions pour toi** : un formulaire dont les réponses partent par e-mail (voir `js/questions.js`)
- **Nous, à distance** : la distance entre deux points sur une carte satellite, avec un globe 3D en bonus
- **Arbre à promesses** : une plante qu'on arrose une fois par semaine, elle grandit à chaque fois
- **Surprise finale** : une boîte cadeau à ouvrir, avec un générateur de compliments
- **Réglages** : choix de couleurs, volume de la musique, réduction des animations, particules, confettis, réinitialisation de la progression, installation de l'app
- **Verrou** : il faut la date de notre officialisation pour entrer (une fois, puis le navigateur s'en souvient)
- **100 % hors ligne** : polices, scripts, images et même la carte fonctionnent sans internet — en mode avion, la carte satellite est remplacée par une carte simplifiée dessinée en local (vraies côtes, marqueurs et arc). Seul le formulaire de questions a besoin du réseau pour partir par e-mail.
- **Musique de fond** : un mp3 dans `assets/audio/musique-de-fond.mp3`

## Personnaliser

### Date d'anniversaire

Dans `js/countdown.js` :

```javascript
const BIRTHDAY_MONTH = 11; // novembre
const BIRTHDAY_DAY = 18;
```

### E-mail des réponses

Dans `js/questions.js`, la constante `ANSWERS_EMAIL` reçoit les réponses du formulaire.

### Photos de la galerie

Ajoute des `<div class="gallery-item">` avec une balise `<img>` dans la section galerie de `index.html`, et enlève la classe `hidden` de la section et des boutons qui pointent vers elle.

### Textes

Tout est dans `index.html` (lettres, titres, questions) et dans `js/letters.js` pour les 7 petites lettres.

## Fichiers

```
index.html          page principale
manifest.webmanifest  infos pour installer le site comme app
sw.js               service worker (cache hors ligne)
css/
  fonts.css          polices auto-hébergées (Inter, Kalam, Patrick Hand)
  style.css          styles principaux
  animations.css     animations
  responsive.css     adaptation mobile
js/
  lock.js           verrou par date
  main.js           démarrage + particules + notifications
  navigation.js     passage d'une page à l'autre
  countdown.js      compte à rebours
  music.js          musique de fond
  timeline.js       chronologie
  letters.js        les 7 petites lettres
  gallery.js        galerie + visionneuse
  quiz.js           jeu de mémoire + vrai/faux
  questions.js      formulaire de questions
  surprise.js       cadeau final + compliments
  distance.js       carte satellite + globe 3D
  tree.js           arbre à promesses
  pdf.js            export PDF de la lettre
  features.js       thèmes, voix, plein écran, étoiles, installation PWA
assets/
  images/           photos (jeanne.jpg sur l'accueil)
  audio/            musique + messages vocaux
  fonts/            polices woff2
  vendor/           html2canvas, jspdf, three.js, leaflet (tout en local)
  earth-blue-marble.jpg  texture du globe 3D
  icon.svg          favicon
  icon-*.png        icônes de l'app installée
```

## Mettre en ligne

Le site est du HTML/CSS/JS pur, sans build. Tu peux le publier tel quel sur GitHub Pages, Netlify, Vercel ou n'importe quel hébergement statique.

## À savoir

- Les messages vocaux `voice-message-1.mp3` et `voice-message-2.mp3` sont vides pour l'instant — remplace-les par de vrais enregistrements.
- La progression (lettres lues, jeux, arbre) est gardée dans le navigateur de celui qui visite le site.
- Le formulaire de questions envoie les réponses à l'adresse configurée dans `questions.js`.
