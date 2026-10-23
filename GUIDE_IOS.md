# Mettre Croivez sur iPhone (GitHub + SideStore)

Tout est prêt en local. Il reste 3 actions sur github.com (je ne peux pas les faire à ta place) :

## 1. Créer les 2 dépôts (vides : sans README ni .gitignore)
- **`Croivez`** en **Private** : https://github.com/new
- **`croivez-ios`** en **Public** : https://github.com/new

## 2. Créer un jeton pour que le dépôt privé publie dans le public
1. https://github.com/settings/personal-access-tokens/new
2. Nom : `croivez-ios`, expiration : 1 an.
3. **Repository access** → *Only select repositories* → `croivez-ios`.
4. **Permissions** → *Contents* : **Read and write**.
5. **Generate token**, puis copie-le.
6. Dans le dépôt **Croivez** : *Settings* → *Secrets and variables* → *Actions* → **New repository secret**.
   Nom : `PUBLIC_REPO_TOKEN`, valeur : le jeton.

## 3. Me dire « c'est fait »
J'enverrai les deux dépôts sur GitHub et je lancerai la première compilation. Ensuite, scanne le QR code (dans `depot-ios/qr-sidestore.png` ou dans l'app : Paramètres → Installer sur iPhone).

## Publier une mise à jour
Changer `version` dans `app/package.json`, puis :
```
git tag v0.2.0
git push --tags
```
L'IPA est compilée automatiquement (~10 min) et SideStore propose la mise à jour.

> Coût : le dépôt étant privé, les compilations macOS consomment le quota gratuit de GitHub Actions (environ 20 compilations par mois).
