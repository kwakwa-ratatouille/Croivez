<p align="center"><img src="sidestore/icon.png" width="120" alt="Logo Croivez"></p>

# Croivez

Application de culture générale : ✗ faux, ✓ vrai. Drapeaux, capitales, villes sur la carte, révision espacée, défi du jour, badges. Elle existe en version PC (Electron) et iPhone (Capacitor).

## Installer sur iPhone avec SideStore

Scanne ce QR code avec l'appareil photo de l'iPhone, ouvre le lien dans SideStore, puis installe **Croivez** depuis la source.

<p align="center"><img src="sidestore/qr-sidestore.png" width="260" alt="QR code pour ajouter la source Croivez dans SideStore"></p>

Ou bien, à la main : SideStore → **Sources** → **+** →
```
https://raw.githubusercontent.com/kwakwa-ratatouille/Croivez/main/sidestore/source.json
```

## Installer sur Android

Scanne ce QR code ou ouvre le lien sur le téléphone, puis installe l'APK (autorise l'installation depuis le navigateur si Android le demande).

<p align="center"><img src="sidestore/qr-android.png" width="260" alt="QR code pour télécharger l'APK Android de Croivez"></p>

```
https://github.com/kwakwa-ratatouille/Croivez/releases/download/android/Croivez.apk
```

Ensuite, le contenu se met à jour tout seul (bannière « Mise à jour prête »). Une nouvelle APK n'est demandée que si la partie native change ; elle s'installe par-dessus, sans perdre tes données.

## Publier une nouvelle version iOS
Changer `version` dans `app/package.json`, commiter, puis :
```
git tag v0.2.0
git push origin main --tags
```
GitHub Actions compile l'IPA (~10 min), la met dans les Releases et met à jour la source SideStore.

## Développement (PC)
```
cd app
npm install
npm run app:dev
```
