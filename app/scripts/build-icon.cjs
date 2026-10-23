// Génère build/icon.png et build/icon.ico à partir du logo ✗✓ (rendu par Electron, sans dépendance).
// Usage : npx electron scripts/build-icon.cjs
const { app, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

const SIZE = 256
// Logo centré sur un carré arrondi crème, lisible dans la barre des tâches
const html = `<html><body style="margin:0;background:transparent">
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 256 256">
<rect x="8" y="8" width="240" height="240" rx="56" fill="#FBF8F3" stroke="#E9E2D6" stroke-width="4"/>
<g transform="translate(26 74) scale(1.76)">
<path d="M16 16 Q33 36 50 58 M50 16 Q32 37 16 58" fill="none" stroke="#DE8B6A" stroke-width="14" stroke-linecap="round"/>
<path d="M44 40 Q52 49 60 58 Q77 32 102 12" fill="none" stroke="#6FC59F" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
</g></svg></body></html>`

// Fichier ICO contenant une seule image PNG 256×256 (format accepté depuis Windows Vista)
function pngToIco(png) {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header.writeUInt8(0, 6) // 0 = 256 px
  header.writeUInt8(0, 7)
  header.writeUInt8(0, 8)
  header.writeUInt8(0, 9)
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(png.length, 14)
  header.writeUInt32LE(22, 18)
  return Buffer.concat([header, png])
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: SIZE, height: SIZE, show: false, transparent: true, frame: false, useContentSize: true })
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  await new Promise((r) => setTimeout(r, 300))
  const png = (await win.webContents.capturePage()).resize({ width: SIZE, height: SIZE }).toPNG()
  const out = path.join(__dirname, '..', 'build')
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'icon.png'), png)
  fs.writeFileSync(path.join(out, 'icon.ico'), pngToIco(png))
  console.log('Icône écrite dans build/icon.ico')

  // Icône iOS 1024 px : fond plein (iOS arrondit lui-même les coins)
  const ios = `<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 256 256">
<rect width="256" height="256" fill="#FBF8F3"/>
<g transform="translate(26 74) scale(1.76)">
<path d="M16 16 Q33 36 50 58 M50 16 Q32 37 16 58" fill="none" stroke="#DE8B6A" stroke-width="14" stroke-linecap="round"/>
<path d="M44 40 Q52 49 60 58 Q77 32 102 12" fill="none" stroke="#6FC59F" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
</g></svg></body></html>`
  win.setContentSize(1024, 1024)
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(ios))
  await new Promise((r) => setTimeout(r, 300))
  const iosPng = (await win.webContents.capturePage()).resize({ width: 1024, height: 1024 }).toPNG()
  const iosDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset')
  if (fs.existsSync(iosDir)) {
    fs.writeFileSync(path.join(iosDir, 'AppIcon-512@2x.png'), iosPng)
    console.log('Icône iOS écrite')
  }

  // Écran de lancement iOS : logo de la DA centré sur fond crème (remplace celui de Capacitor)
  const splashDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
  if (fs.existsSync(splashDir)) {
    const splash = `<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="1366" height="1366" viewBox="0 0 1366 1366">
<rect width="1366" height="1366" fill="#FBF8F3"/>
<g transform="translate(513 571) scale(2.93)">
<path d="M16 16 Q33 36 50 58 M50 16 Q32 37 16 58" fill="none" stroke="#DE8B6A" stroke-width="13" stroke-linecap="round"/>
<path d="M44 40 Q52 49 60 58 Q77 32 102 12" fill="none" stroke="#6FC59F" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
</g></svg></body></html>`
    win.setContentSize(1366, 1366)
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splash))
    await new Promise((r) => setTimeout(r, 300))
    const png = (await win.webContents.capturePage()).resize({ width: 2732, height: 2732 }).toPNG()
    for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) fs.writeFileSync(path.join(splashDir, f), png)
    console.log('Écran de lancement iOS écrit')
  }
  app.quit()
})
