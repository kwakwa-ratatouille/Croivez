// Génériques de dessins animés et d'animés (version française), d'hier et d'aujourd'hui, avec l'extrait Deezer.
// On ne garde un résultat que s'il parle vraiment de la série (un mot du nom dans le titre, l'album ou l'artiste),
// sinon on essaie la recherche suivante. Les génériques déjà présents sont conservés.
// Usage : node scripts/build-generiques.mjs
import { readFile, writeFile } from 'node:fs/promises'

const SERIES = [
  // Années 70-80
  'Les Bisounours', 'Jayce et les conquérants de la lumière', 'Les Maîtres de l\'univers', 'Rémi sans famille', 'Tom Sawyer', 'Princesse Sarah',
  'Jeanne et Serge', 'Dragon Ball', 'Bioman', 'X-Or', 'San Ku Kaï', 'Cobra', 'Les Snorky', 'Fraggle Rock', 'Bouba', 'Clémentine',
  'Lady Oscar', 'Embrasse-moi Lucile', 'Cat\'s Eyes', 'Juliette je t\'aime', 'Sailor Moon', 'Denver le dernier dinosaure', 'Les Gummi', 'La Bande à Picsou',
  'Tic et Tac les rangers du risque', 'Super Mario Bros', 'Babar', 'Les Aventures de Tintin', 'Les Mondes engloutis', 'Il était une fois l\'homme',
  'Barbapapa', 'Rahan', 'Les Trois Mousquetaires', 'Les Entrechats', 'Bucky O\'Hare', 'Cosmocats', 'Les Visionnaires', 'Les Popples',
  // Années 90-2000
  'Bob le bricoleur', 'Kid Paddle', 'Martin Mystère', 'Galactik Football', 'Foot 2 Rue',
  'Wakfu', 'Kim Possible', 'Phinéas et Ferb', 'Le Laboratoire de Dexter', 'Ben 10', 'Teen Titans',
  'Mes parrains sont magiques',
  'Dragon Ball Super', 'One Piece', 'Fairy Tail', 'Hunter x Hunter', 'Atomic Betty',
  'Gadget et les Gadgetinis', 'Animaniacs',
  'Batman la série animée', 'Spider-Man l\'araignée', 'X-Men la série animée', 'Mew Mew Power', 'Winx Club',
  'Witch', 'Totally Spies', 'Les Minijusticiers',
  // Années 2010-2020
  'La Pat\' Patrouille', 'Peppa Pig', 'Bluey', 'Zig et Sharko', 'Les As de la jungle', 'Simon le lapin',
  'Les Lapins Crétins Invasion', 'Le Monde incroyable de Gumball', 'Souvenirs de Gravity Falls', 'Steven Universe', 'Bienvenue chez les Loud',
  'Teen Titans Go', 'Oggy et les Cafards la nouvelle génération', 'Pyjamasques', 'Ladybug et Chat Noir', 'Trotro', 'T\'choupi',
  'Ernest et Célestine', 'Robin des Bois Malice à Sherwood', 'Dino Ranch', 'Gigantosaurus', 'Robocar Poli', 'Blaze et les Monster Machines',

  // Deuxième vague
  'Capitaine Flam', 'Goldorak', 'Albator 84', 'Ulysse 31', 'Les Chevaliers du Zodiaque', 'Dragon Ball Kai', 'Naruto Shippuden',
  'Demon Slayer', 'Pokémon Soleil et Lune', 'Pokémon Horizons', 'Yu-Gi-Oh GX',
  'Bakugan Battle Brawlers', 'Hamtaro', 'Doraemon', 'Les Simpsons', 'Futurama',
  'South Park', 'Daria', 'Les Razmoket à Paris', 'Clifford', 'Babar et les aventures de Badou', 'Les Bisounours la série',
  'Monster High', 'Winx', 'Les Mystérieuses Cités d\'or', 'Il était une fois la vie', 'Il était une fois l\'espace', 'Il était une fois les découvreurs',
  'Les Tortues Ninja 2012', 'G.I. Joe', 'Power Rangers', 'Batman Beyond', 'Superman la série animée', 'Les Gardiens de la galaxie série',
  'Les Aventures de Jackie Chan', 'Kim Possible saison 2', 'Lilo et Stitch la série', 'Aladdin la série',
  'La Bande à Picsou 2017', 'La Maison de Mickey', 'Le Roi Lion La Garde du Roi Lion', 'Raiponce la série', 'Elena d\'Avalor', 'Princesse Sofia', 'Vic le Viking',
  'Lucky Luke la série', 'Les Dalton', 'Spirou et Fantasio', 'Gaston Lagaffe', 'Les Schtroumpfs 1981', 'Marsupilami Houba Houba Hop', 'Iznogoud',
  'Dora l\'exploratrice', 'Les Mystérieuses Cités d\'or saison 2', 'Yakari', 'Sam le pompier', 'Les Schtroumpfs 2021',
]
const norm = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const VIDES = new Set(['les', 'la', 'le', 'des', 'de', 'et', 'du', 'the', 'serie', 'animee', 'saison', 'nouvelle', 'generation'])
const motsCles = (s) => norm(s).split(' ').filter((m) => m.length >= 3 && !VIDES.has(m))

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms))
async function dz(chemin) {
  for (let e = 1; e < 4; e++) {
    const j = await (await fetch(`https://api.deezer.com${chemin}`, { headers: UA })).json().catch(() => null)
    if (j && !j.error) return j
    await pause(1500 * e)
  }
  return null
}
const item = (t, reponse) => ({ id: String(t.id), n: { fr: t.title_short ?? t.title, en: t.title_short ?? t.title }, r: reponse, img: t.album?.cover_medium, f: [[{ fr: 'Titre', en: 'Title' }, t.title_short ?? t.title], [{ fr: 'Artiste', en: 'Artist' }, t.artist?.name], [{ fr: 'Album', en: 'Album' }, t.album?.title]] })

// Résultats faux repérés à l'écoute (autre chanson, remix, épisode audio) : la série est retirée de la liste ci-dessus
const fichier = 'public/packs/culture/generiques.json'
const existants = JSON.parse(await readFile(fichier, 'utf8'))
const dejaSeries = new Set(existants.map((x) => norm(x.r)))
const ids = new Set(existants.map((x) => x.id))
const ajout = []
const manques = []
for (const serie of SERIES) {
  if (dejaSeries.has(norm(serie))) continue
  const mots = motsCles(serie)
  let trouve = null
  for (const q of [`générique ${serie}`, `${serie} générique`, serie]) {
    const l = (await dz(`/search?q=${encodeURIComponent(q)}&limit=8`))?.data ?? []
    // Le résultat doit citer la série (titre, album ou artiste) et avoir un extrait
    trouve = l.find((t) => t.preview && !ids.has(String(t.id)) && mots.some((m) => norm(`${t.title} ${t.album?.title} ${t.artist?.name}`).split(' ').includes(m)))
    if (trouve) break
    await pause(120)
  }
  if (trouve) { ajout.push(item(trouve, serie)); ids.add(String(trouve.id)) } else manques.push(serie)
  await pause(120)
}
await writeFile(fichier, JSON.stringify([...existants, ...ajout]))
console.log(`generiques : ${existants.length + ajout.length} (dont ${ajout.length} nouveaux) · introuvables : ${manques.length}${manques.length ? ` (${manques.join(', ')})` : ''}`)
