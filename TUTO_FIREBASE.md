# Tuto — Créer le projet Firebase « croivez »

Durée : ~10 minutes. Tout se fait sur https://console.firebase.google.com (même compte Google que ton appli existante).

## 1. Créer le projet
1. Clique sur **Créer un projet** (ou « Ajouter un projet »).
2. Nom : `croivez` → Continuer.
3. Google Analytics : **désactive-le** (inutile pour l'instant) → **Créer le projet**.
4. Attends la fin → **Continuer**. Tu es sur la page d'accueil du projet.

> Vérifie en haut à gauche que tu es bien dans `croivez` et pas dans ton autre appli.

## 2. Ajouter l'app Web (pour récupérer la config)
1. Sur l'accueil du projet, clique sur l'icône **`</>`** (Web).
2. Surnom : `Croivez PC`. **Ne coche pas** Firebase Hosting (je le configurerai) → **Enregistrer l'application**.
3. Firebase affiche un bloc de code avec `const firebaseConfig = { apiKey: ..., authDomain: ..., projectId: ..., ... }`.
   **Copie ce bloc** et envoie-le-moi. Il n'est pas secret : ce sont les règles de sécurité qui protègent les données.
4. Clique sur **Accéder à la console**.

(Tu peux le retrouver plus tard : ⚙️ Paramètres du projet → Général → en bas, « Vos applications ».)

## 3. Authentication (comptes)
1. Menu de gauche : **Créer → Authentication** → **Commencer**.
2. Onglet **Méthode de connexion** :
   - **Adresse e-mail/Mot de passe** → Activer → Enregistrer.
   - **Google** → Activer → choisis ton e-mail comme « e-mail d'assistance » → Enregistrer.

## 4. Firestore (profils, progression, classements)
1. Menu : **Créer → Firestore Database** → **Créer une base de données**.
2. Emplacement : **eur3 (Europe)** ou `europe-west1`. ⚠️ Non modifiable ensuite.
3. Mode : **production** (tout est fermé par défaut, j'écrirai les règles) → **Créer**.

## 5. Realtime Database (duels en temps réel)
1. Menu : **Créer → Realtime Database** → **Créer une base de données**.
2. Emplacement : **Belgique (europe-west1)**.
3. Mode : **verrouillé** → **Activer**.

## 6. C'est tout pour l'instant
- **Pas besoin d'activer Storage** : il demande maintenant le plan payant Blaze. Les fichiers de questions seront hébergés sur **Firebase Hosting**, gratuit, que je configurerai en ligne de commande.
- **Reste sur le plan gratuit Spark.** Le passage à Blaze ne viendra que plus tard, pour l'anti-triche des classements.

## ✅ À m'envoyer
- Le bloc `firebaseConfig` (étape 2.3).
