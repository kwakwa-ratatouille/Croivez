// Construit public/packs/couvertures.json : une vraie photo de couverture par quiz.
//  - quiz avec images : l'élément le plus connu du pack (acteur, animal, logo…)
//  - autres : la photo de l'article Wikipédia du sujet (Paris pour les capitales…)
// Usage : npm run data:couvertures
import { readFile, writeFile, readdir } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const lire = async (f) => JSON.parse(await readFile(f, 'utf8'))

// Quiz dérivés : même pack que le quiz principal
const PACK = {
  'films-annee': 'films', 'personnalites-pays': 'personnalites', 'personnalites-metier': 'personnalites', 'personnalites-naissance': 'personnalites',
  'sportifs-sport': 'sportifs', 'livres-annee': 'livres', 'jeux-annee': 'jeux', 'noms-scientifiques': 'animaux',
}
// Couverture choisie à la main : drapeaux bien reconnaissables, ou article Wikipédia (fr) du sujet
const DRAPEAUX = { drapeaux: 'br', 'drapeaux-inverse': 'jp' }
const WIKI = {
  capitales: 'Paris', 'capitales-inverse': 'Rome', 'villes-fr': 'Lyon', 'villes-monde': 'Tokyo', 'pays-carte': 'Globe terrestre',
  monuments: 'Tour Eiffel', 'departements-prefecture': 'Hôtel de préfecture', 'departements-region': 'Régions de France', plats: 'Pizza', monnaies: 'Euro', 'departements-numero': 'Département français', 
  montagnes: 'Mont Blanc', iles: 'Île', fleuves: 'Amazone (fleuve)', 'etats-us': 'Capitole des États-Unis',
  films: 'Cinéma', albums: 'Disque microsillon', extraits: 'Casque audio',
  elements: 'Tableau périodique des éléments', histoire: 'Prise de la Bastille', livres: 'Livre',
  'livres-annee': 'Bibliothèque', mangas: 'Manga', inventions: 'Ampoule à incandescence', jeux: 'Jeu vidéo', 'jeux-annee': 'Manette de jeu',
  'personnalites-pays': 'Passeport', 'sportifs-sport': 'Stade',
  constellations: 'Grande Ourse', corps: 'Anatomie humaine', marques: 'Logo', series: 'Télévision', 'films-annee': 'Pellicule photographique',
  'personnalites-metier': 'Profession', 'personnalites-naissance': 'Anniversaire', 'noms-scientifiques': 'Carl von Linné', presidents: 'Palais de l\'Élysée', mouvements: 'Impressionnisme',
}

async function photoWiki(titre, essai = 1) {
  await new Promise((ok) => setTimeout(ok, 1200 * essai)) // Wikipédia limite la cadence
  try {
    const r = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titre)}`, { headers: UA })
    if (!r.ok) return essai < 4 ? photoWiki(titre, essai + 1) : null
    const j = await r.json()
    // Vignette en 500 px (une des tailles standard de Wikimédia) et sans paramètres de suivi
    return j.thumbnail?.source?.split('?')[0].replace(/\/\d+px-/, '/500px-') ?? null
  } catch { return null }
}

// Tous les quiz connus : les packs culture + les quiz géographiques
const packs = (await readdir('public/packs/culture')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
const quiz = [...new Set([...packs, ...Object.keys(PACK), ...Object.keys(WIKI), ...Object.keys(DRAPEAUX)])]
const out = {}
for (const id of quiz) {
  if (DRAPEAUX[id]) { out[id] = `https://flagcdn.com/w640/${DRAPEAUX[id]}.png`; continue }
  let img = null
  const pack = PACK[id] ?? id
  if (packs.includes(pack) && !WIKI[id]) {
    const items = await lire(`public/packs/culture/${pack}.json`)
    // L'élément le plus connu qui a une photo (les packs sont triés par notoriété)
    img = items.find((it) => it.img)?.img ?? null
  }
  if (!img && WIKI[id]) img = await photoWiki(WIKI[id])
  if (img) out[id] = img.replace(/\?width=\d+$/, '?width=640')
  process.stdout.write(img ? '.' : `\n  pas d'image : ${id}\n`)
}
await writeFile('public/packs/couvertures.json', JSON.stringify(out))
console.log(`\n${Object.keys(out).length} couvertures`)
