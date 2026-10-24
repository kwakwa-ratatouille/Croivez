// Complète les images des packs qui n'en ont pas :
//  - affiches TMDB (films de studios, séries, mangas/animés, émissions) — clé : TMDB_KEY=... (jamais écrite dans le dépôt)
//  - images Wikidata (événements historiques, livres → sinon photo de l'auteur, jeux vidéo)
// Usage : TMDB_KEY=... node scripts/build-images.mjs [pack…]
import { readFile, writeFile } from 'node:fs/promises'

const CLE = process.env.TMDB_KEY
const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)', Accept: 'application/sparql-results+json' }
const lire = async (p) => JSON.parse(await readFile(`public/packs/culture/${p}.json`, 'utf8'))
const ecrire = (p, d) => writeFile(`public/packs/culture/${p}.json`, JSON.stringify(d))

async function tmdb(type, titre, annee) {
  if (!CLE) return null
  const u = `https://api.themoviedb.org/3/search/${type}?api_key=${CLE}&language=fr-FR&query=${encodeURIComponent(titre)}${annee ? `&${type === 'movie' ? 'year' : 'first_air_date_year'}=${annee}` : ''}`
  const r = await fetch(u).then((x) => x.json()).catch(() => null)
  const p = r?.results?.find((m) => m.poster_path)
  return p ? `https://image.tmdb.org/t/p/w342${p.poster_path}` : null
}
async function viaTmdb(pack, type) {
  const items = await lire(pack)
  let n = 0
  for (let i = 0; i < items.length; i += 8) {
    const lot = items.slice(i, i + 8).filter((it) => !it.img)
    const imgs = await Promise.all(lot.map((it) => tmdb(type, it.n.en || it.n.fr, it.x?.annee).then((r) => r ?? (it.n.fr !== it.n.en ? tmdb(type, it.n.fr) : null))))
    lot.forEach((it, j) => { if (imgs[j]) { it.img = imgs[j]; n++ } })
  }
  await ecrire(pack, items)
  console.log(pack, '+', n, '→', items.filter((x) => x.img).length, '/', items.length)
}

// Images Wikidata (P18), par lots ; pour les livres, à défaut, la photo de l'auteur (P50 → P18)
async function viaWikidata(pack, auteur = false) {
  const items = await lire(pack)
  let n = 0
  for (let i = 0; i < items.length; i += 120) {
    const lot = items.slice(i, i + 120).filter((it) => !it.img && /^Q\d+$/.test(it.id))
    if (!lot.length) continue
    const q = `SELECT ?item ?img ?imgA WHERE { VALUES ?item { ${lot.map((it) => 'wd:' + it.id).join(' ')} } OPTIONAL { ?item wdt:P18 ?img } ${auteur ? 'OPTIONAL { ?item wdt:P50 ?a. ?a wdt:P18 ?imgA }' : ''} }`
    const r = await fetch('https://query.wikidata.org/sparql', { method: 'POST', headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'query=' + encodeURIComponent(q) }).then((x) => (x.ok ? x.json() : null)).catch(() => null)
    const vus = new Map()
    for (const b of r?.results?.bindings ?? []) { const id = b.item.value.split('/').pop(); const src = b.img?.value ?? b.imgA?.value; if (src && !vus.has(id)) vus.set(id, src.replace('http://', 'https://') + '?width=480') }
    for (const it of lot) { const v = vus.get(it.id); if (v) { it.img = v; n++ } }
    await new Promise((ok) => setTimeout(ok, 1500))
  }
  await ecrire(pack, items)
  console.log(pack, '+', n, '→', items.filter((x) => x.img).length, '/', items.length)
}

const voulus = process.argv.slice(2)
const TACHES = { studios: () => viaTmdb('studios', 'movie'), series: () => viaTmdb('series', 'tv'), mangas: () => viaTmdb('mangas', 'tv'), emissions: () => viaTmdb('emissions', 'tv'), histoire: () => viaWikidata('histoire'), livres: () => viaWikidata('livres', true), jeux: () => viaWikidata('jeux') }
for (const [k, f] of Object.entries(TACHES)) if (!voulus.length || voulus.includes(k)) await f().catch((e) => console.log(k, 'ÉCHEC', e.message))
