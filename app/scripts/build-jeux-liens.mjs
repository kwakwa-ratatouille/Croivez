// Ajoute à chaque personnage / lieu de jeu vidéo le lien de sa page sur le wiki du jeu
// (bouton « En savoir plus » de la fiche). À lancer après build-jeux.mjs.
import { readFile, writeFile } from 'node:fs/promises'

const src = await readFile(new URL('./build-jeux.mjs', import.meta.url), 'utf8')
const WIKI = Object.fromEntries([...src.matchAll(/jeu: '((?:[^'\\]|\\.)*)', wiki: '([^']+)'/g)].map((m) => [m[1].replace(/\\'/g, "'"), m[2]]))

for (const fichier of ['persos-jeu', 'lieux-jeux']) {
  const chemin = `public/packs/culture/${fichier}.json`
  const items = JSON.parse(await readFile(chemin, 'utf8'))
  for (const it of items) {
    const wiki = WIKI[it.r.fr]
    if (!wiki) continue
    const [nom, langue] = wiki.split('/')
    it.x = { ...it.x, lien: `https://${nom}.fandom.com${langue ? `/${langue}` : ''}/wiki/${encodeURIComponent(it.n.en.replace(/ /g, '_'))}` }
  }
  await writeFile(chemin, JSON.stringify(items))
  console.log(`${fichier} : ${items.filter((it) => it.x?.lien).length} liens`)
}
