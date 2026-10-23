# Croivez — Cahier des charges

Nom : **Croivez** = Croix + V (✗ faux / ✓ vrai). Logo : un ✗ terracotta et un ✓ menthe.

## Décisions
- **Plateforme** : application PC d'abord (usage perso), puis iOS / Android.
- **Langues** : français + anglais (interface et contenus).
- **Questions** : générées par code à partir de bases ouvertes gratuites (pas d'IA payante).
- **Comptes** dès le début, synchro en ligne via **Firebase** (nouveau projet dédié).
- **Hors-ligne** : le solo marche sans internet sur les thèmes téléchargés ; la progression se synchronise au retour du réseau.
- **Démarrage du code** : après réception de la DA de Claude Design.

## Gameplay
- **Difficulté** : adaptative par thème (selon tes résultats) + choix manuel possible (Facile / Moyen / Difficile / Expert).
- **Chrono** : désactivé par défaut en solo (mode zen), activable ; toujours actif en duel.
- **Après chaque réponse** : mini-fiche pour apprendre (image, faits clés, lien Wikipédia). Pas d'indices ni de 50/50.
- **Progression** : XP, niveau global, maîtrise par thème, badges.
- **Répétition espacée** (FSRS) : les questions ratées reviennent au bon moment.
- **Défi du jour** + séries (streak).

## Multijoueur
- **Duels en temps réel uniquement** : mêmes questions au même moment, chrono, scores en direct.
- **Adversaires** : liste d'amis (ajout par pseudo unique), invitation en 1 clic ou par lien/code, **+ adversaire aléatoire** de niveau proche (matchmaking).
- **Classements** : global, par thème, entre amis (hebdo / tout temps).

## Stack
- **React + TypeScript + Vite** pour l'interface.
- **Electron** pour l'app PC (Node déjà installé, pas besoin de Rust) → **Capacitor** pour iOS/Android ensuite, même code React.
- **Firebase**, dans un **nouveau projet dédié `croivez`** (séparé de ton appli existante, plan gratuit Spark) :
  - **Auth** : comptes (e-mail + Google).
  - **Firestore** : profils, amis, progression, cartes de répétition espacée, défi du jour, classements (cache hors-ligne intégré).
  - **Realtime Database** : duels en temps réel, présence en ligne, file de matchmaking.
  - **Hosting** : packs de questions au format JSON compressé (Storage demande désormais le plan Blaze, donc on l'évite).
  - **Cloud Functions** (plus tard, nécessite le plan Blaze) : valider les scores côté serveur pour éviter la triche aux classements.
- Cartes : **MapLibre** + fonds OpenStreetMap / Natural Earth.
- Données en local : **IndexedDB** pour les packs téléchargés.

## Sources de données (gratuites)
| Thème | Source |
|---|---|
| Pays, capitales, drapeaux | REST Countries, flagcdn |
| Villes France / monde | geo.api.gouv.fr, GeoNames, Wikidata |
| Films, séries, acteurs | TMDB (clé API gratuite) |
| Musique (genres, artistes, albums) | MusicBrainz, Cover Art Archive, Deezer (extraits 30 s) |
| Animaux, insectes, plantes | GBIF, iNaturalist, Wikimedia Commons |
| Corps humain, sciences | Wikidata + jeux de données faits main |
| Personnalités | Wikidata |
| Marques, logos | Wikidata + Wikimedia Commons |

**Optimisation** : un script importe les données et les compile en **packs JSON par thème et par langue**, hébergés sur Firebase Hosting, téléchargés une fois puis stockés dans l'app. On n'appelle aucune API à chaque question, et le contenu n'est pas stocké document par document dans Firestore : le quota gratuit est de 50 000 lectures/jour, donc on le réserve aux données utilisateur. Résultat : app rapide, hors-ligne, coût nul.

## Modes de question
- QCM 4 choix (texte ou images, distracteurs « similaires » : drapeaux de même couleur, villes proches, espèces de même famille…)
- Saisie libre avec tolérance aux fautes et aux accents
- Placement sur carte (score selon la distance)
- Image / son (logo, animal, affiche, extrait musical)

## V1 — Géographie
- **Drapeaux** : drapeau → nom (saisie ou QCM) et nom → 4 drapeaux similaires.
- **Capitales** : pays → capitale et capitale → pays.
- **Pays** : placer ou reconnaître sur la carte.
- **Villes**, par paliers de taille (grandes → moyennes → petites) :
  - France : toutes les communes (~35 000).
  - Monde : villes de plus de 15 000 habitants (~25 000).

## Étapes
1. DA avec Claude Design (`PROMPT_CLAUDE_DESIGN.md`) → me transmettre le rendu
2. Créer le projet Firebase `croivez` (voir `TUTO_FIREBASE.md`) → me transmettre `firebaseConfig`
3. Socle : app Electron + React, connexion Firebase, moteur de quiz générique, FR/EN
4. Script de données + packs Géographie (V1 jouable)
5. Progression (XP, badges), répétition espacée, défi du jour, mode hors-ligne
6. Amis, duels temps réel, matchmaking, classements
7. Autres thèmes (films, musique, nature, corps, personnalités, marques…)
8. Version mobile
