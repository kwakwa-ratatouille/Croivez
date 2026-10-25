// Couvertures choisies à la main pour les quiz qui n'en avaient pas (ou une peu parlante) : la photo principale
// d'un article Wikipédia bien choisi (« en: » = Wikipédia anglaise). Complète public/packs/couvertures.json.
// Usage : node scripts/build-couvertures-choix.mjs
import { readFile, writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const CHOIX = {
  'evt-halloween': 'en:Halloween',
  // Écologie & planète
  'eco-eau': 'en:Drop (liquid)', 'eco-electricite': 'en:Transmission tower', 'eco-co2': 'en:Air pollution', 'eco-decomposition': 'en:Marine debris',
  'eco-tri': 'en:Recycling bin', 'eco-saison': 'en:Farmers\' market', 'eco-energies': 'en:Wind farm', 'eco-dates': 'en:The Blue Marble', 'eco-vf': 'en:Rainforest',
  // Jeux, vie quotidienne, pop culture, cuisine, mots
  'emojis-jeux': 'en:Game controller', jeux: 'en:Video arcade', metiers: 'en:Firefighter', 'records-monde': 'en:Burj Khalifa', mascottes: 'en:Mascot',
  'emojis-series': 'en:Home cinema', 'fast-food': 'en:Hamburger', devinettes: 'en:Great Sphinx of Giza', 'suites-logiques': 'en:Rubik\'s Cube',
  'emojis-expressions': 'en:Emoji', 'emojis-pays': 'en:Flags of the world', gentiles: 'en:Crowd', 'groupes-animaux': 'en:Flock (birds)', citations: 'en:The Thinker',
  // Couvertures peu parlantes remplacées
  'artistes-fr': 'fr:Stromae', 'artistes-recents': 'en:Billie Eilish', emissions: 'en:Television studio', series: 'en:Binge-watching', films: 'en:Movie theater',
  'films-annee': 'en:Clapperboard', 'rap-us': 'en:Tupac Shakur', 'rap-fr': 'fr:MC Solaar', 'rap-titre': 'en:Hip-hop dance', generiques: 'en:Saturday-morning cartoon',
  openings: 'en:Anime convention', fondateurs: 'en:Steve Jobs', 'logos-vrai': 'en:Counterfeit consumer good', 'sports-photo': 'en:Usain Bolt', unites: 'en:Tape measure',
  formules: 'en:Erlenmeyer flask', constellations: 'en:Milky Way', pourcentages: 'en:Pie chart',
}
// Quiz illustrés par un élément de leur propre pack (photo la plus parlante)
const DEPUIS_PACK = { heros: ['heros', 'Son Goku'], 'heros-photo': ['heros', 'Pikachu'] }

async function photo(cle, essai = 1) {
  const [langue, titre] = cle.includes(':') ? cle.split(/:(.+)/) : ['fr', cle]
  await new Promise((ok) => setTimeout(ok, 900 * essai))
  try {
    const r = await fetch(`https://${langue}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titre.replace(/ /g, '_'))}`, { headers: UA })
    if (!r.ok) return essai < 3 ? photo(cle, essai + 1) : null
    const j = await r.json()
    const src = j.thumbnail?.source ?? j.originalimage?.source
    if (!src) return null
    // Miniature 500 px (taille standard) sans paramètres ; les SVG (cartes, logos) sont écartés
    if (/\.svg/i.test(src)) return null
    return src.split('?')[0].replace(/\/\d+px-/, '/500px-')
  } catch { return null }
}

const fichier = 'public/packs/couvertures.json'
const couv = JSON.parse(await readFile(fichier, 'utf8'))
const rates = []
for (const [id, cle] of Object.entries(CHOIX)) {
  const u = await photo(cle)
  if (u) couv[id] = u; else rates.push(`${id} (${cle})`)
}
for (const [id, [pack, nom]] of Object.entries(DEPUIS_PACK)) {
  const l = JSON.parse(await readFile(`public/packs/culture/${pack}.json`, 'utf8'))
  const it = l.find((x) => x.n.fr === nom) ?? l[0]
  if (it?.img) couv[id] = it.img; else rates.push(id)
}
await writeFile(fichier, JSON.stringify(couv))
console.log(`couvertures : ${Object.keys(CHOIX).length + Object.keys(DEPUIS_PACK).length - rates.length} mises à jour · sans photo : ${rates.join(', ') || 'aucune'}`)
