// Spécialités culinaires du monde : « De quel pays vient cette spécialité ? », avec la photo du plat (Wikipédia).
// Chaque ligne : [nom affiché, pays, titre de l'article Wikipédia en français (facultatif)].
// Rangées de la plus connue à la plus pointue. Sans photo trouvée, le plat est écarté.
// Usage : node scripts/build-specialites.mjs
import { writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const PLATS = [
  ['Pizza margherita', 'Italie'], ['Sushi', 'Japon'], ['Paella', 'Espagne'], ['Tacos', 'Mexique', 'Taco'], ['Hamburger', 'États-Unis'],
  ['Croissant', 'France'], ['Fish and chips', 'Royaume-Uni'], ['Gaufre', 'Belgique', 'Gaufre de Liège'], ['Couscous', 'Maroc'], ['Kebab (döner)', 'Turquie', 'Döner kebab'],
  ['Spaghetti bolognaise', 'Italie', 'Sauce bolognaise'], ['Ramen', 'Japon'], ['Poutine', 'Canada'], ['Fondue', 'Suisse', 'Fondue savoyarde'], ['Bretzel', 'Allemagne'],
  ['Moussaka', 'Grèce'], ['Tiramisu', 'Italie'], ['Burrito', 'Mexique'], ['Hot-dog', 'États-Unis'], ['Churros', 'Espagne'],
  ['Crêpe', 'France'], ['Pad thaï', 'Thaïlande'], ['Canard laqué', 'Chine', 'Canard laqué de Pékin'], ['Nems', 'Viêt Nam', 'Nem rán'], ['Kimchi', 'Corée du Sud'],
  ['Phở', 'Viêt Nam'], ['Guacamole', 'Mexique'], ['Pastel de nata', 'Portugal'], ['Baklava', 'Turquie'], ['Houmous', 'Liban'],
  ['Tajine', 'Maroc'], ['Curry butter chicken', 'Inde', 'Poulet au beurre'], ['Raclette', 'Suisse'], ['Strudel aux pommes', 'Autriche', 'Apfelstrudel'], ['Goulash', 'Hongrie'],
  ['Bortsch', 'Ukraine'], ['Feijoada', 'Brésil'], ['Ceviche', 'Pérou'], ['Empanadas', 'Argentine', 'Empanada'], ['Biryani', 'Inde'],
  ['Pierogi', 'Pologne'], ['Gyoza', 'Japon', 'Gyōza'], ['Dim sum', 'Chine'], ['Bibimbap', 'Corée du Sud'], ['Falafel', 'Égypte'],
  ['Haggis', 'Écosse'], ['Bœuf Stroganov', 'Russie'], ['Pelmeni', 'Russie'], ['Tortilla de patatas', 'Espagne', 'Tortilla de patatas'], ['Gazpacho', 'Espagne'],
  ['Moules-frites', 'Belgique'], ['Bouillabaisse', 'France'], ['Ratatouille', 'France'], ['Risotto', 'Italie'], ['Lasagnes', 'Italie', 'Lasagnes'],
  ['Pastéis de bacalhau', 'Portugal', 'Pastel de bacalhau'], ['Smørrebrød', 'Danemark'], ['Köttbullar', 'Suède'], ['Pavlova', 'Nouvelle-Zélande'], ['Lamington', 'Australie'],
  ['Jollof rice', 'Nigeria', 'Riz jollof'], ['Thiéboudienne', 'Sénégal'], ['Injera', 'Éthiopie'], ['Bobotie', 'Afrique du Sud'], ['Mafé', 'Mali'],
  ['Arepa', 'Venezuela'], ['Pão de queijo', 'Brésil'], ['Asado', 'Argentine'], ['Mole poblano', 'Mexique', 'Mole poblano'], ['Jerk chicken', 'Jamaïque', 'Jerk (cuisine)'],
  ['Tom yum', 'Thaïlande', 'Tom yam'], ['Nasi goreng', 'Indonésie'], ['Laksa', 'Malaisie'], ['Adobo', 'Philippines', 'Adobo philippin'], ['Momo', 'Népal', 'Momo (cuisine)'],
  ['Khachapuri', 'Géorgie'], ['Plov', 'Ouzbékistan'], ['Mansaf', 'Jordanie'], ['Kibbeh', 'Liban', 'Kebbé'], ['Shakshuka', 'Tunisie', 'Chakchouka'],
  ['Sarmale', 'Roumanie'], ['Ćevapi', 'Bosnie-Herzégovine', 'Ćevapčići'], ['Trdelník', 'Tchéquie'], ['Stamppot', 'Pays-Bas'], ['Bigos', 'Pologne'],
]

async function photos(titres, langue) {
  const p = new URLSearchParams({ action: 'query', format: 'json', redirects: '1', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500', titles: titres.join('|') })
  const j = await (await fetch(`https://${langue}.wikipedia.org/w/api.php?${p}`, { headers: UA })).json()
  const vers = new Map()
  for (const n of [...(j.query?.normalized ?? []), ...(j.query?.redirects ?? [])]) vers.set(n.from, n.to)
  const par = new Map(Object.values(j.query?.pages ?? {}).filter((pg) => pg.thumbnail).map((pg) => [pg.title, pg.thumbnail.source]))
  const out = new Map()
  for (const t of titres) { let f = t; for (let k = 0; k < 3 && vers.has(f); k++) f = vers.get(f); if (par.has(f)) out.set(t, par.get(f)) }
  return out
}

const titres = PLATS.map(([nom, , t]) => t ?? nom)
const img = new Map()
for (let i = 0; i < titres.length; i += 40) for (const [k, v] of await photos(titres.slice(i, i + 40), 'fr')) img.set(k, v)
const sans = titres.filter((t) => !img.has(t))
// Repli : article anglais (titre puis nom affiché)
const EN = { 'Riz jollof': 'Jollof rice', 'Jerk (cuisine)': 'Jerk (cooking)', 'Tom yam': 'Tom yum', 'Momo (cuisine)': 'Momo (food)', 'Pierogi ruskie': 'Pierogi' }
const enT = sans.map((t) => EN[t] ?? t)
const enI = await photos(enT, 'en')
sans.forEach((t, k) => { if (enI.has(enT[k])) img.set(t, enI.get(enT[k])) })
// Pas d'images de carte, de drapeau ou de logo (elles trahiraient le pays)
const douteuse = (u) => /flag|drapeau|map|carte|logo|\.svg/i.test(u)
const items = []
const manquants = []
PLATS.forEach(([nom, pays], i) => {
  const u = img.get(titres[i])
  if (!u || douteuse(u)) { manquants.push(nom); return }
  items.push({ id: `specialites-pays${i}`, n: { fr: nom, en: nom }, r: { fr: pays, en: pays }, img: u, g: 'pays' })
})
await writeFile('public/packs/culture/specialites-pays.json', JSON.stringify(items))
console.log(`specialites-pays : ${items.length} · sans photo : ${manquants.join(', ') || 'aucun'}`)
