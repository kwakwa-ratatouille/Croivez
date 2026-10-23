// Construit les packs de villes :
//  - public/packs/villes-fr.json : communes de France métropolitaine (geo.api.gouv.fr)
//  - public/packs/villes-monde.json : villes de plus de 15 000 habitants (GeoNames cities15000)
//  - public/packs/france.geojson : contour des départements pour la carte
// Usage : npm run data:villes (après npm run data, qui fournit les noms de pays)
import { writeFile, readFile, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const get = async (url) => {
  const res = await fetch(url, { headers: UA })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res
}
const r4 = (n) => Math.round(n * 1e4) / 1e4
await mkdir('public/packs', { recursive: true })

// --- France ---
const deps = Object.fromEntries((await (await get('https://geo.api.gouv.fr/departements?fields=nom,code')).json()).map((d) => [d.code, d.nom]))
const communes = await (await get('https://geo.api.gouv.fr/communes?fields=nom,population,centre,codeDepartement&format=json')).json()
const villesFr = communes
  .filter((c) => c.centre && !c.codeDepartement.startsWith('97') && c.population > 0)
  .sort((a, b) => b.population - a.population)
  .map((c) => [c.nom, c.population, r4(c.centre.coordinates[1]), r4(c.centre.coordinates[0]), c.codeDepartement])
await writeFile('public/packs/villes-fr.json', JSON.stringify({ v: 1, deps, villes: villesFr }))
console.log(`${villesFr.length} communes françaises`)

const geo = await (await get('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson')).text()
await writeFile('public/packs/france.geojson', geo)

// Fond de carte du monde (Natural Earth 1:50m, via world-atlas)
await writeFile('public/packs/monde.json', await readFile('node_modules/world-atlas/countries-50m.json'))

// --- Monde ---
const pays = JSON.parse(await readFile('public/packs/pays.json', 'utf8')).pays
const codes = new Set(pays.map((p) => p.id.toUpperCase()))
const tmp = await mkdtemp(path.join(tmpdir(), 'croivez-'))
try {
  const zip = path.join(tmp, 'cities.zip')
  await writeFile(zip, Buffer.from(await (await get('https://download.geonames.org/export/dump/cities15000.zip')).arrayBuffer()))
  execFileSync('tar', ['-xf', zip, '-C', tmp])
  const lignes = (await readFile(path.join(tmp, 'cities15000.txt'), 'utf8')).split('\n')
  const villesMonde = lignes
    .map((l) => l.split('\t'))
    .filter((c) => c.length > 14 && codes.has(c[8]) && +c[14] >= 15000)
    .map((c) => [c[1], +c[14], r4(+c[4]), r4(+c[5]), c[8].toLowerCase()])
    .sort((a, b) => b[1] - a[1])
  await writeFile('public/packs/villes-monde.json', JSON.stringify({ v: 1, villes: villesMonde }))
  console.log(`${villesMonde.length} villes du monde`)
} finally {
  await rm(tmp, { recursive: true, force: true })
}
