// Logos : remplace les liens « Special:FilePath » (redirection sans en-tête CORS) par l'adresse directe
// de la vignette sur upload.wikimedia.org, qui autorise la lecture des pixels (faux logos retouchés dans l'appli).
// Usage : node scripts/logos-directs.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

export function vignette(url, largeur = 500) {
  const m = url.match(/Special:FilePath\/([^?]+)/)
  if (!m) return url
  const nom = decodeURIComponent(m[1]).replace(/ /g, '_')
  const md5 = createHash('md5').update(nom).digest('hex')
  const enc = encodeURIComponent(nom).replace(/%2C/g, ',').replace(/%28/g, '(').replace(/%29/g, ')')
  const png = /\.(svg|tiff?|pdf)$/i.test(nom) ? '.png' : ''
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${md5[0]}/${md5.slice(0, 2)}/${enc}/${largeur}px-${enc}${png}`
}

const chemin = 'public/packs/culture/logos.json'
const items = JSON.parse(await readFile(chemin, 'utf8'))
let n = 0
for (const it of items) if (it.img?.includes('Special:FilePath')) { it.img = vignette(it.img); n++ }
await writeFile(chemin, JSON.stringify(items))
console.log(`${n} logos convertis sur ${items.length}`)
