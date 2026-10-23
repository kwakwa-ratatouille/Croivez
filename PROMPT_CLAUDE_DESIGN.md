# Prompt Claude Design — Direction artistique « Croivez »

> Copier-coller tout le bloc ci-dessous dans Claude Design.

---

Conçois la direction artistique complète et les écrans principaux d'une application de **culture générale** (quiz d'apprentissage) appelée **« Croivez »**.

## Nom & logo (élément central de l'identité)
- **Concept** : « Croivez » = **Croix + V** → ✗ (faux) et ✓ (vrai), l'essence même d'un quiz. La faute d'orthographe est **volontaire** et assumée : c'est un clin d'œil, l'identité doit jouer avec, avec humour et bienveillance.
- **Logo** : un **✗** et un **✓** côte à côte ou qui se chevauchent légèrement. Le V doit **impérativement se lire comme une coche ✓** (branche gauche courte, branche droite longue), jamais comme la lettre V ou le chiffre romain XV (aucune connotation rugby ou « 15 »).
- **Style du tracé** : traits épais, extrémités arrondies, aspect organique comme dessiné au feutre ou au pinceau doux.
- **Couleurs** : ✗ en terracotta doux, ✓ en vert menthe, sur fond crème.
- **Wordmark** : « Croivez » en typo arrondie chaleureuse, avec intégration créative des signes (ex. le X et le V du mot remplacés par ✗ et ✓, ou les deux signes posés au-dessus du mot). Propose 3 pistes.
- **Déclinaisons** : icône d'appli (carré arrondi, lisible à 32 px), favicon, version monochrome, version fond sombre.
- **Fil rouge** : les signes ✗ et ✓ du logo deviennent un motif récurrent de l'interface (feedback de réponse, badges, motifs de fond discrets, loader où le ✗ se transforme en ✓).

## Intention
L'app doit donner **envie d'apprendre longtemps**. Elle est **colorée et créative**, mais **douce, jamais agressive** : pas de couleurs saturées criardes, pas de rouge vif pour les erreurs, pas d'animations brusques, pas de surcharge visuelle. Ambiance : curiosité, calme, plaisir, progression. Pense « carnet d'explorateur moderne » plutôt que « jeu mobile casino ».

## Palette
- Base : fond crème / blanc cassé chaud (ex. #FBF8F3), texte gris anthracite doux (pas de noir pur).
- Couleurs pastel profondes (désaturées, lumineuses) — **une couleur par grande famille de thèmes** pour que l'utilisateur s'oriente au premier coup d'œil :
  - Géographie (villes, pays, drapeaux, capitales) : bleu lagon / turquoise doux
  - Cinéma & séries & acteurs : corail pêche
  - Musique : lavande / violet doux
  - Nature (animaux, insectes, plantes) : vert sauge
  - Corps humain & sciences : rose poudré
  - Personnalités & histoire : ocre / jaune moutarde doux
  - Marques & logos : bleu ardoise / pervenche
- Bonne réponse : vert menthe doux. Mauvaise réponse : terracotta / orange brique pâle (pas de rouge).
- Mode sombre obligatoire : fond bleu nuit profond (pas noir), mêmes teintes un peu plus lumineuses.
- Contraste texte conforme WCAG AA.

## Typographie
- Titres : une sans-serif arrondie et chaleureuse (type Nunito, Quicksand, Fredoka ou équivalent).
- Texte : sans-serif très lisible (type Inter / DM Sans).
- Grandes tailles pour les questions, hiérarchie très claire.

## Formes & style
- Coins très arrondis (16–24 px), cartes avec ombres très légères et diffuses.
- Illustrations : style flat / semi-flat organique, traits doux, formes rondes ; une petite illustration ou icône par thème.
- Petites touches créatives : formes blob en arrière-plan, motifs subtils liés au thème (lignes de carte pour la géo, notes pour la musique, feuilles pour la nature).
- Une mascotte discrète et bienveillante (optionnelle) qui encourage sans infantiliser.

## Micro-interactions (à décrire / maquetter)
- Feedback de réponse doux, **avec les signes du logo** : le ✓ menthe se dessine en un trait si juste ; le ✗ terracotta apparaît avec un léger balancement si faux, puis affichage de la bonne réponse avec une **anecdote courte** (« Le saviez-vous ? »).
- Transitions fluides et lentes (200–300 ms, ease-out). Pas de flash, pas de vibration agressive.
- Célébration de fin de série sobre (confettis pastel légers, étoiles).

## Écrans à concevoir
1. **Accueil** : salutation, série du jour (streak), bouton « Continuer », raccourcis vers les thèmes favoris, défi du jour.
2. **Catalogue des thèmes** : grille de cartes colorées par famille, avec sous-thèmes (ex. Géographie → Villes de France, Villes du monde, Capitales, Drapeaux, Pays sur la carte…). Barre de recherche. Indicateur de progression par thème.
3. **Configuration d'une partie** : choix du sous-thème, de la difficulté (Auto adaptative par défaut, ou Facile / Moyen / Difficile / Expert), du nombre de questions, du **mode de réponse** (saisie libre / QCM 4 choix) et d'un interrupteur **chrono** (désactivé par défaut = mode zen).
3 bis. **Mini-fiche après réponse** : panneau doux qui apparaît après chaque question (image, 2-3 faits clés, lien « En savoir plus »), puis bouton « Suivant ».
4. **Question – QCM 4 images** (ex. « Quel est le drapeau du Tchad ? » avec 4 drapeaux visuellement proches).
5. **Question – saisie libre** (ex. drapeau affiché, l'utilisateur tape le nom du pays ; autocomplétion tolérante aux fautes).
6. **Question – carte interactive** (ex. « Place Lyon sur la carte » : carte épurée, l'utilisateur pose une épingle, affichage de la distance d'erreur en km).
7. **Question – image/son** (ex. reconnaître un logo, un animal, un insecte, un extrait musical, une affiche de film).
8. **Écran de résultat** : score, bonnes/mauvaises réponses, anecdotes à revoir, bouton « Rejouer les erreurs ».
9. **Profil & progression** : niveau global, maîtrise par thème (graphique doux type radar ou barres arrondies), badges, statistiques.
10. **Révision** : file de cartes à revoir (répétition espacée).
11. **Duels (temps réel)** : liste d'amis avec présence en ligne, inviter un ami ou chercher un adversaire aléatoire (écran de recherche animé), salon d'attente, question en face-à-face avec les deux scores en temps réel, résultat du duel.
12. **Classements** : global, par thème, entre amis (hebdo / tout temps), avec avatars.
13. **Connexion / inscription** : écran accueillant et léger.

## Contraintes UX
- Interface **simple et intuitive** : 1 action principale par écran, navigation par barre latérale sur PC (Accueil / Thèmes / Révision / Duels / Classements / Profil), qui deviendra une barre inférieure sur mobile.
- **Application PC d'abord (1440×900)**, raccourcis clavier visibles (1-4 pour les réponses QCM, Entrée pour valider) ; prévoir la déclinaison mobile iOS/Android (390×844) plus tard.
- Zones cliquables ≥ 44 px.
- Application **bilingue FR / EN** : sélecteur de langue dans le profil, prévoir des textes 30 % plus longs.
- Indicateur discret du **mode hors-ligne** et des thèmes téléchargés.
- Accessibilité : couleurs jamais seules porteuses d'info (icônes ✓ / ✗ en plus), compatible daltonisme.

## Livrables attendus
- Logo ✗✓ + 3 pistes de wordmark « Croivez » + icône d'appli et ses déclinaisons.
- Design system : palette (clair + sombre), typographie, composants (boutons, cartes de thème, options QCM, champ de saisie, barre de progression, badges, toasts), iconographie.
- Maquettes des 13 écrans en desktop + accueil et question QCM en mobile pour valider la déclinaison.
