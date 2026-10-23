// Construit public/packs/pays.json : pays souverains, drapeaux, capitales (FR + EN).
// Source : Wikidata (une seule requête SPARQL). Drapeaux servis par flagcdn via le code ISO.
// Usage : npm run data
import { writeFile, mkdir } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)', Accept: 'application/sparql-results+json' }

const sparql = `
SELECT ?iso ?nomFr ?nomEn ?capFr ?capEn ?contFr ?contEn ?pop ?area ?coord WHERE {
  ?c wdt:P31 wd:Q3624078; wdt:P297 ?iso.
  FILTER NOT EXISTS { ?c wdt:P576 [] }
  ?c rdfs:label ?nomFr FILTER(LANG(?nomFr) = "fr")
  ?c rdfs:label ?nomEn FILTER(LANG(?nomEn) = "en")
  OPTIONAL { ?c wdt:P36 ?cap. ?cap rdfs:label ?capFr FILTER(LANG(?capFr) = "fr") ?cap rdfs:label ?capEn FILTER(LANG(?capEn) = "en") }
  OPTIONAL { ?c wdt:P30 ?cont. ?cont rdfs:label ?contFr FILTER(LANG(?contFr) = "fr") ?cont rdfs:label ?contEn FILTER(LANG(?contEn) = "en") }
  OPTIONAL { ?c wdt:P1082 ?pop }
  OPTIONAL { ?c wdt:P2046 ?area }
  OPTIONAL { ?c wdt:P625 ?coord }
}`

const res = await fetch('https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql), { headers: UA })
if (!res.ok) throw new Error(`Wikidata ${res.status}`)
const rows = (await res.json()).results.bindings

// Plusieurs lignes par pays (capitales, continents, populations multiples) : on fusionne
const byIso = new Map()
for (const r of rows) {
  const id = r.iso.value.toLowerCase()
  const p = byIso.get(id) ?? {
    id,
    nom: { fr: r.nomFr.value, en: r.nomEn.value },
    capitale: null,
    region: null,
    population: 0,
    superficie: 0,
    latlng: null,
  }
  if (!p.capitale && r.capFr) p.capitale = { fr: r.capFr.value, en: r.capEn.value }
  if (!p.region && r.contFr) p.region = { fr: r.contFr.value, en: r.contEn.value }
  if (r.pop) p.population = Math.max(p.population, Math.round(+r.pop.value))
  if (r.area && !p.superficie) p.superficie = Math.round(+r.area.value)
  if (r.coord && !p.latlng) {
    const [lng, lat] = r.coord.value.replace(/^Point\(|\)$/g, '').split(' ').map(Number)
    p.latlng = [lat, lng]
  }
  byIso.set(id, p)
}

// Noms usuels et trous de Wikidata corrigés à la main
const CORRECTIONS = {
  cn: { nom: { fr: 'Chine', en: 'China' } },
  cd: { nom: { fr: 'République démocratique du Congo', en: 'DR Congo' }, alias: ['RDC', 'Congo-Kinshasa'] },
  cg: { nom: { fr: 'Congo', en: 'Republic of the Congo' }, alias: ['Congo-Brazzaville'] },
  nl: { nom: { fr: 'Pays-Bas', en: 'Netherlands' }, alias: ['Hollande'] },
  ps: { nom: { fr: 'Palestine', en: 'Palestine' } },
  fm: { nom: { fr: 'Micronésie', en: 'Micronesia' } },
  us: { alias: ['USA', 'Amérique'] },
  gb: { alias: ['Angleterre', 'UK', 'Grande-Bretagne'] },
  ae: { alias: ['Émirats', 'EAU', 'UAE'] },
  cz: { alias: ['République tchèque'] },
  no: { capitale: { fr: 'Oslo', en: 'Oslo' } },
  ag: { capitale: { fr: 'Saint John\'s', en: 'Saint John\'s' } },
}
for (const [id, fix] of Object.entries(CORRECTIONS)) {
  const p = byIso.get(id)
  if (p) Object.assign(p, fix)
}

const pays = [...byIso.values()].filter((p) => p.region).sort((a, b) => b.population - a.population)

await mkdir('public/packs', { recursive: true })
await writeFile('public/packs/pays.json', JSON.stringify({ v: 1, genere: new Date().toISOString(), pays }))
console.log(`${pays.length} pays écrits dans public/packs/pays.json`)
