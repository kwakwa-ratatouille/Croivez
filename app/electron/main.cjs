const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

const DEV_URL = process.env.VITE_DEV_SERVER_URL
const EN_LIGNE = 'https://kwakwa-ratatouille.github.io/Croivez/'

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#FBF8F3',
    autoHideMenuBar: true,
    title: 'Croivez',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  })

  // Liens externes (Wikipédia…) dans le navigateur par défaut
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Le .exe ouvre la version en ligne (toujours à jour) ; sans connexion, la copie embarquée prend le relais
  const local = () => win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  if (DEV_URL) win.loadURL(DEV_URL)
  else if (app.isPackaged) {
    // Seulement si la page elle-même ne charge pas (pas d'internet) : un élément qui échoue dans la page (iframe,
    // image…) ou une navigation interrompue (-3) ne doit pas faire basculer sur la vieille copie embarquée
    const repli = (_e, code, _desc, _url, principal) => {
      if (!principal || code === -3) return
      win.webContents.off('did-fail-load', repli)
      local()
    }
    win.webContents.on('did-fail-load', repli)
    win.webContents.once('did-finish-load', () => win.webContents.off('did-fail-load', repli))
    // Sans cache pour la page : chaque lancement prend la dernière version (les fichiers JS/CSS gardent le leur)
    win.loadURL(EN_LIGNE, { extraHeaders: 'pragma: no-cache\ncache-control: no-cache\n' })
  } else local()
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
