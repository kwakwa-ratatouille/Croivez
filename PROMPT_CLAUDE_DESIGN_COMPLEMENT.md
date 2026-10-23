# Prompt Claude Design — Compléments « Croivez »

> À coller dans le **même projet Claude Design** que la DA existante, pour qu'il réutilise exactement ses tokens et composants.

---

Complète la direction artistique existante de **Croivez** sans rien changer à ce qui est déjà fait. Réutilise strictement les mêmes tokens (couleurs clair/sombre, Nunito + DM Sans, rayons, ombres), la même barre latérale et les mêmes composants (cartes, pills, boutons, chips, kbd, logo ✗✓). Chaque écran doit exister en clair et en sombre (propriété `dark`).

## 1. Configuration d'une partie — mise à jour
Modifie l'écran « 3 · Configuration d'une partie » :
- **Difficulté** : 5 options au lieu de 3 → **Auto** (sélectionnée par défaut, icône discrète type « s'adapte à vous », texte « S'adapte à votre niveau »), Facile, Moyen, Difficile, **Expert** (4 points). Garde le style des cartes actuelles, sur une ou deux lignes.
- **Chrono** : ajoute un interrupteur (toggle) « Chrono » désactivé par défaut, avec le libellé « Mode zen » quand il est éteint et un choix de durée (10 s / 20 s / 30 s par question) qui apparaît quand il est allumé.
- Le récapitulatif « Votre partie » affiche la difficulté et l'état du chrono.

## 2. Mini-fiche après réponse
Un nouvel écran (ou état de l'écran Question QCM) : après avoir répondu, un panneau doux apparaît.
- Rappel de la réponse : ✓ menthe tracé si juste, ✗ terracotta si faux + la bonne réponse mise en avant.
- Contenu de la fiche : grande image (ex. drapeau), titre, 3 faits clés sous forme de petites lignes avec icône (ex. capitale, population, continent), une phrase « Le saviez-vous ? », un lien « En savoir plus sur Wikipédia ».
- Bouton principal « Suivant » avec raccourci clavier `Entrée`.
- Montre deux versions : réponse juste et réponse fausse.

## 3. Chrono pendant une question
Sur l'écran Question QCM, une variante avec chrono actif : un indicateur circulaire ou une barre fine qui se vide doucement, dans la couleur du thème. Dans les 5 dernières secondes, il passe en terracotta doux, **sans clignotement agressif**.

## 4. Duels — adversaire aléatoire
Sur l'écran « 11a · Duel — invitation & salon », ajoute à côté de la liste d'amis une grande carte **« Adversaire au hasard »** (« Un joueur de votre niveau ») avec un bouton « Chercher ».
Nouvel écran **« Recherche d'adversaire »** : animation calme (les signes ✗ et ✓ qui tournent ou se répondent doucement), temps d'attente écoulé, niveau recherché, bouton « Annuler ». Puis état « Adversaire trouvé ! » avec les deux avatars face à face.

## 5. Paramètres
Nouvel écran **« Paramètres »** (accessible depuis le profil) :
- **Langue** : sélecteur Français / English.
- **Apparence** : Clair / Sombre / Automatique.
- **Son** et effets (on/off), **animations réduites** (on/off).
- **Données hors-ligne** : liste des thèmes téléchargés avec leur taille, bouton « Télécharger » ou « Supprimer » pour chacun, espace utilisé au total.
- **Compte** : pseudo, e-mail, se déconnecter.

## 6. Indicateur hors-ligne
Une petite pastille discrète en bas de la barre latérale (au-dessus de l'avatar) : « Hors ligne · votre progression sera synchronisée » avec une icône nuage barré, en couleur neutre (pas d'alerte). Montre-la sur l'écran d'accueil.

## Livrables
- L'écran Configuration mis à jour.
- 4 nouveaux écrans : Mini-fiche (juste + faux), Question avec chrono, Recherche d'adversaire (recherche + trouvé), Paramètres.
- Duel invitation mis à jour avec la carte « Adversaire au hasard ».
- La pastille hors-ligne sur l'accueil.
