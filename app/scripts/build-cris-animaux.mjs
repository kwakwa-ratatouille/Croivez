// Quiz « Cris d'animaux » à écouter : vrais enregistrements (Wikidata, propriété P51 « audio », fichiers de Wikimedia Commons).
// Classés du plus connu au plus rare (nombre d'articles Wikipédia) : Facile = animaux familiers, Expert = espèces peu connues.
// Les fausses réponses viennent de la même classe (oiseau avec oiseaux…) pour que l'oreille compte, pas la logique.
// Usage : node scripts/build-cris-animaux.mjs
import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/1.0 (quiz de culture generale)', Accept: 'application/sparql-results+json' }
const sparql = async (q) => (await (await fetch('https://query.wikidata.org/sparql?query=' + encodeURIComponent(q), { headers: UA })).json()).results.bindings

const CLASSES = `VALUES (?classe ?g) { (wd:Q5113 "oiseau") (wd:Q7377 "mammifère") (wd:Q10908 "amphibien") (wd:Q10811 "reptile") (wd:Q1390 "insecte") (wd:Q152 "poisson") }
  OPTIONAL { ?item wdt:P171* ?classe . }`
const especes = await sparql(`SELECT ?item ?fr ?audio ?sl ?g WHERE {
  ?item wdt:P51 ?audio ; wdt:P105 wd:Q7432 ; wikibase:sitelinks ?sl .
  ?item rdfs:label ?fr . FILTER(lang(?fr) = "fr")
  FILTER(?sl > 10)
  OPTIONAL { VALUES (?classe ?g) { (wd:Q5113 "oiseau") (wd:Q7377 "mammifère") (wd:Q10908 "amphibien") (wd:Q10811 "reptile") (wd:Q1390 "insecte") } ?item wdt:P171+ ?classe . }
} ORDER BY DESC(?sl) LIMIT 1200`)
// Animaux domestiques et familiers (souvent rangés comme sous-espèces ou races)
const DOMESTIQUES = { Q144: 'Chien', Q146: 'Chat', Q830: 'Vache', Q726: 'Cheval', Q780: 'Poule', Q787: 'Cochon', Q7368: 'Mouton', Q2934: 'Chèvre', Q19707: 'Âne', Q3736439: 'Canard', Q16521: 'Dindon', Q2840: 'Corbeau', Q7378: 'Éléphant', Q29858: 'Dauphin', Q83310: 'Grenouille', Q1426: 'Coq' }
const dom = await sparql(`SELECT ?item ?audio ?sl WHERE { VALUES ?item { ${Object.keys(DOMESTIQUES).map((q) => 'wd:' + q).join(' ')} } ?item wdt:P51 ?audio ; wikibase:sitelinks ?sl . }`)

// Fichier Commons → MP3 lisible partout (iPhone compris) : original MP3, sinon la version MP3 transcodée par Commons
const mp3 = (url) => {
  const nom = decodeURIComponent(url.split('/').pop()).replace(/ /g, '_')
  const h = createHash('md5').update(nom).digest('hex')
  const chemin = `${h[0]}/${h.slice(0, 2)}/${encodeURIComponent(nom)}`
  return /\.mp3$/i.test(nom) ? `https://upload.wikimedia.org/wikipedia/commons/${chemin}` : `https://upload.wikimedia.org/wikipedia/commons/transcoded/${chemin}/${encodeURIComponent(nom)}.mp3`
}
const maj = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const vus = new Map()
for (const b of dom) {
  const q = b.item.value.split('/').pop()
  if (!vus.has(q)) vus.set(q, { q, nom: DOMESTIQUES[q], audio: b.audio.value, sl: 10000 + Number(b.sl.value), g: ['Poule', 'Coq', 'Canard', 'Dindon', 'Corbeau'].includes(DOMESTIQUES[q]) ? 'oiseau' : DOMESTIQUES[q] === 'Grenouille' ? 'amphibien' : 'mammifère' })
}
const nomsPris = new Set([...vus.values()].map((x) => x.nom.toLowerCase()))
for (const b of especes) {
  const q = b.item.value.split('/').pop()
  const nom = maj(b.fr.value)
  if (vus.has(q) || nomsPris.has(nom.toLowerCase()) || /^[A-Z][a-z]+ [a-z]+$/.test(b.fr.value)) continue // pas de nom latin seul
  nomsPris.add(nom.toLowerCase())
  vus.set(q, { q, nom, audio: b.audio.value, sl: Number(b.sl.value), g: b.g?.value ?? 'animal' })
}

// Vérifie que le MP3 existe vraiment (on garde ceux qui répondent)
const liste = [...vus.values()].sort((a, b) => b.sl - a.sl)
const ok = []
// Par lots de 50 : Commons dit pour chaque fichier s'il a une version MP3 (original ou transcodée) — une requête par lot
const pause = (ms) => new Promise((r) => setTimeout(r, ms))
const titre = (x) => 'File:' + decodeURIComponent(x.audio.split('/').pop()).replace(/_/g, ' ')
for (let i = 0; i < liste.length && ok.length < 260; i += 50) {
  const lot = liste.slice(i, i + 50)
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=videoinfo&viprop=mime|derivatives&titles=' + encodeURIComponent(lot.map(titre).join('|'))
  const j = await (await fetch(url, { headers: { 'User-Agent': UA['User-Agent'] } })).json().catch(() => ({}))
  const avecMp3 = new Set()
  const norm = new Map((j.query?.normalized ?? []).map((n) => [n.to, n.from]))
  for (const p of Object.values(j.query?.pages ?? {})) {
    const v = p.videoinfo?.[0]
    if (v && (v.mime === 'audio/mpeg' || (v.derivatives ?? []).some((d) => d.type?.startsWith('audio/mpeg')))) avecMp3.add(norm.get(p.title) ?? p.title)
  }
  for (const x of lot) if (avecMp3.has(titre(x)) && ok.length < 260) ok.push(x)
  await pause(500)
}
const items = ok.slice(0, 260).map((x, i) => ({ id: `cri-${x.q}`, n: { fr: x.nom, en: x.nom }, r: { fr: x.nom, en: x.nom }, g: x.g, x: { son: mp3(x.audio) }, ...(i < 0 ? {} : {}) }))
await writeFile('public/packs/culture/cris-animaux.json', JSON.stringify(items))
console.log(`cris-animaux : ${items.length} (sur ${liste.length} candidats) ; exemples : ${items.slice(0, 12).map((x) => x.n.fr).join(', ')} … ${items.slice(-6).map((x) => x.n.fr).join(', ')}`)
