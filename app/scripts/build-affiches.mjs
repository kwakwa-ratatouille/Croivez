// Construit public/packs/culture/affiches.json : l'affiche TMDB de chaque film du pack films.
// La clé n'est jamais écrite dans le dépôt : TMDB_KEY=... node scripts/build-affiches.mjs
import { readFile, writeFile } from 'node:fs/promises'

const CLE = process.env.TMDB_KEY
if (!CLE) throw new Error('TMDB_KEY manquante')
const films = JSON.parse(await readFile('public/packs/culture/films.json', 'utf8'))

async function affiche(f) {
  const annee = f.x?.annee
  for (const titre of [...new Set([f.n.en, f.n.fr])]) {
    const u = `https://api.themoviedb.org/3/search/movie?api_key=${CLE}&language=fr-FR&query=${encodeURIComponent(titre)}${annee ? `&year=${annee}` : ''}`
    const r = await fetch(u).then((x) => x.json()).catch(() => null)
    const p = r?.results?.find((m) => m.poster_path)
    if (p) return `https://image.tmdb.org/t/p/w342${p.poster_path}`
  }
  return null
}

const out = []
// Par lots de 8 requêtes en parallèle (TMDB tolère ~40 requêtes / s)
for (let i = 0; i < films.length; i += 8) {
  const lot = films.slice(i, i + 8)
  const imgs = await Promise.all(lot.map(affiche))
  lot.forEach((f, j) => { if (imgs[j]) out.push({ id: f.id, n: f.n, d: f.d, img: imgs[j], g: f.x?.annee?.slice(0, 3), f: f.f }) })
  process.stdout.write('.')
}
await writeFile('public/packs/culture/affiches.json', JSON.stringify(out))
console.log(`\n${out.length} affiches`)
