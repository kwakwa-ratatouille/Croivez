// Ajoute un vrai « Le saviez-vous ? » aux personnages et lieux de jeux vidéo : les deux premières phrases
// de l'introduction de leur page sur le wiki Fandom du jeu (en anglais). À lancer après build-jeux.mjs.
// Usage : node scripts/build-jeux-faits.mjs
import { readFile, writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
// Wiki de chaque jeu, repris de build-jeux.mjs
const src = await readFile(new URL('./build-jeux.mjs', import.meta.url), 'utf8')
const WIKI = Object.fromEntries([...src.matchAll(/jeu: '((?:[^'\\]|\\.)*)', wiki: '([^']+)'/g)].map((m) => [m[1].replace(/\\'/g, "'"), m[2]]))

const nettoyer = (html) => html
  .replace(/<aside[\s\S]*?<\/aside>/g, '').replace(/<table[\s\S]*?<\/table>/g, '').replace(/<sup[\s\S]*?<\/sup>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '').replace(/<figure[\s\S]*?<\/figure>/g, '')

function intro(html) {
  const paras = [...nettoyer(html).matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/&#160;|&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 40)
  if (!paras.length) return null
  const phrases = paras[0].match(/[^.!?]+[.!?]+/g) ?? [paras[0]]
  let t = ''
  for (const ph of phrases) { if ((t + ph).length > 280) break; t += ph }
  return (t || phrases[0].slice(0, 280)).trim()
}

async function texte(wiki, titre, essai = 1) {
  const [nom, langue] = wiki.split('/')
  const p = new URLSearchParams({ action: 'parse', format: 'json', page: titre, prop: 'text', section: '0', redirects: '1', disablelimitreport: '1' })
  try {
    const r = await fetch(`https://${nom}.fandom.com${langue ? `/${langue}` : ''}/api.php?${p}`, { headers: UA })
    if (r.status === 429 && essai < 4) { await new Promise((ok) => setTimeout(ok, 5000 * essai)); return texte(wiki, titre, essai + 1) }
    if (!r.ok) return null
    const j = await r.json()
    return j.parse?.text?.['*'] ? intro(j.parse.text['*']) : null
  } catch { return null }
}

for (const fichier of ['persos-jeu', 'lieux-jeux']) {
  const chemin = `public/packs/culture/${fichier}.json`
  const items = JSON.parse(await readFile(chemin, 'utf8'))
  let faits = 0
  const file = items.filter((it) => !it.d)
  // 4 requêtes en parallèle, sans brusquer les wikis
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (file.length) {
      const it = file.shift()
      const wiki = WIKI[it.r.fr]
      if (!wiki) continue
      const t = await texte(wiki, it.n.en)
      if (t) { it.d = { fr: t, en: t }; faits++ }
      await new Promise((ok) => setTimeout(ok, 150))
    }
  }))
  await writeFile(chemin, JSON.stringify(items))
  console.log(`${fichier} : ${faits} faits ajoutés sur ${items.length}`)
}
