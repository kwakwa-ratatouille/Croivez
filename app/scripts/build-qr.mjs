// Génère les QR codes d'ajout de la source SideStore (README du dépôt public + écran Paramètres).
// Usage : node scripts/build-qr.mjs
import QRCode from 'qrcode'

export const SOURCE_URL = 'https://raw.githubusercontent.com/kwakwa-ratatouille/Croivez/main/sidestore/source.json'
const lien = `sidestore://source?url=${SOURCE_URL}`
const opts = { margin: 2, width: 512, color: { dark: '#2F3437', light: '#FBF8F3' } }

await QRCode.toFile('public/qr-sidestore.svg', lien, { ...opts, type: 'svg' })
await QRCode.toFile('../sidestore/qr-sidestore.png', lien, opts)
// Android : lien fixe vers la dernière APK
const apk = 'https://github.com/kwakwa-ratatouille/Croivez/releases/download/android/Croivez.apk'
await QRCode.toFile('public/qr-android.svg', apk, { ...opts, type: 'svg' })
await QRCode.toFile('../sidestore/qr-android.png', apk, opts)
console.log('QR codes écrits :', lien, apk)
