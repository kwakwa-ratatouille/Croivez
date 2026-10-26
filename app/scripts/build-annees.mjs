// Époques des quiz musique : année de sortie (« an ») et popularité (« rk ») de chaque son, puis tri du plus connu au plus pointu.
// Deezer ne connaît souvent que des rééditions (Billie Jean → « Thriller 25 », 2008) : l'année vient d'iTunes, qui garde
// la sortie d'origine (la plus ancienne vue au moins deux fois, pour écarter une erreur isolée) ; à défaut, celle de Deezer.
// Reprend là où il s'était arrêté (les sons déjà datés sont sautés).
// Usage : node scripts/build-annees.mjs [pack…]   (sans argument : tous les packs musicaux)
import { readFile, writeFile } from 'node:fs/promises'

const PACKS = process.argv.slice(2).length ? process.argv.slice(2) : ['extraits', 'rap-fr', 'rap-us', 'pop-inter', 'indie', 'afro']
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms))
const norm = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
async function json(url, essais = 3) {
  for (let e = 1; e <= essais; e++) {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) }).catch(() => null)
    if (r?.ok) { const j = await r.json().catch(() => null); if (j && !j.error) return j }
    await pause(r?.status === 403 || r?.status === 429 ? 30000 * e : 1500 * e) // iTunes limite le débit : on ralentit
  }
  return null
}
const annee = (d) => { const a = Number(String(d ?? '').slice(0, 4)); return a >= 1900 && a <= 2100 ? a : undefined }
// « Titre (feat. X) - Remastered 2011 » → « titre »
const titrePropre = (t) => norm(t.replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+.*$/, ''))

let dernier = 0
async function sortieItunes(titre, artiste) {
  const attente = 1500 - (Date.now() - dernier)
  if (attente > 0) await pause(attente)
  dernier = Date.now()
  const j = await json(`https://itunes.apple.com/search?term=${encodeURIComponent(`${artiste} ${titre.replace(/\s*[([].*?[)\]]/g, '')}`)}&entity=song&limit=25&country=fr`)
  const a = norm(artiste), t = titrePropre(titre)
  if (!t) return undefined
  const ans = (j?.results ?? []).filter((x) => norm(x.artistName).includes(a) && norm(x.trackName).startsWith(t)).map((x) => annee(x.releaseDate)).filter(Boolean).sort()
  return ans.find((x, i) => ans[i + 1] === x) ?? ans[0]
}

for (const id of PACKS) {
  const fichier = `public/packs/culture/${id}.json`
  const items = JSON.parse(await readFile(fichier, 'utf8').catch(() => '[]'))
  if (!items.length) { console.log(`${id} : absent`); continue }
  let faits = 0
  for (const it of items) {
    if (it.an) continue
    const t = await json(`https://api.deezer.com/track/${it.id}`)
    if (t?.rank && !it.rk) it.rk = t.rank
    const artiste = it.f?.find(([l]) => l.fr === 'Artiste')?.[1] ?? (typeof it.r === 'string' ? it.r : '')
    const an = (artiste ? await sortieItunes(it.n.fr, artiste) : undefined) ?? annee(t?.release_date ?? t?.album?.release_date)
    if (an) it.an = an
    if (++faits % 50 === 0) { await writeFile(fichier, JSON.stringify(items)); console.log(`  ${id} : ${faits} datés…`) }
  }
  // Du plus écouté au plus pointu : Facile = les tubes, Expert = les sons moins connus
  items.sort((a, b) => (b.rk ?? 0) - (a.rk ?? 0))
  await writeFile(fichier, JSON.stringify(items))
  const parEpoque = { '<1990': 0, '1990s': 0, '2000s': 0, '2010+': 0, '?': 0 }
  for (const it of items) parEpoque[!it.an ? '?' : it.an < 1990 ? '<1990' : it.an < 2000 ? '1990s' : it.an < 2010 ? '2000s' : '2010+']++
  console.log(`${id} : ${items.length} sons`, parEpoque)
}
