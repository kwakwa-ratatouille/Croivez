// Blind tests (extraits Deezer) : rap français, rap US, openings d'animés, génériques de dessins animés.
// Artistes : leurs titres les plus écoutés ; openings et génériques : « titre + interprète » cherché sur Deezer.
// Ordre des listes = du plus connu au plus pointu. Usage : node scripts/build-deezer.mjs
import { writeFile } from 'node:fs/promises'

const RAP_FR = [
  'Jul', 'Ninho', 'PNL', 'Booba', 'SCH', 'Gims', 'Soprano', 'Nekfeu', 'Orelsan', 'Damso', 'Niska', 'Gazo', 'Tiakola', 'Werenoi', 'Hamza', 'Bigflo & Oli', 'Vald', 'Naps', 'Heuss l\'Enfoiré', 'Lacrim',
  'Kaaris', 'Lomepal', 'Maes', 'Alonzo', 'Plk', 'Koba LaD', 'Zola', 'Leto', 'Sexion d\'Assaut', 'La Fouine', 'Rohff', 'Diam\'s', 'MC Solaar', 'IAM', 'Suprême NTM', 'Oxmo Puccino', 'Kery James', 'Sinik', 'Lunatic', '113',
  'Fonky Family', 'Médine', 'Freeze Corleone', 'Laylow', 'Josman', 'Luv Resval', 'Gradur', 'MHD', 'Dinos', 'Kalash Criminel', 'Sofiane', 'Jok\'air', 'Ziak', 'Doc Gynéco', 'Passi', 'Ärsenik', 'Stomy Bugsy', 'Lino', 'Youssoupha', 'Sniper',
]
const RAP_US = [
  'Eminem', 'Drake', 'Kendrick Lamar', 'Travis Scott', 'Kanye West', 'Jay-Z', '50 Cent', 'Snoop Dogg', 'Dr. Dre', '2Pac', 'The Notorious B.I.G.', 'Nicki Minaj', 'Cardi B', 'Post Malone', 'Lil Wayne', 'J. Cole', 'Future', 'Lil Uzi Vert',
  '21 Savage', 'A$AP Rocky', 'Tyler, The Creator', 'Kid Cudi', 'Juice WRLD', 'XXXTentacion', 'Pop Smoke', 'Lil Nas X', 'Megan Thee Stallion', 'Doja Cat', 'Playboi Carti', 'Wu-Tang Clan', 'Nas', 'Outkast', 'Missy Elliott', 'Run-DMC',
  'Public Enemy', 'N.W.A', 'Ice Cube', 'Busta Rhymes', 'DMX', 'Mac Miller', 'Childish Gambino', 'Lil Baby', 'Gunna', 'Young Thug', 'Logic', 'Coolio', 'Nelly', 'Ludacris', 'Missy Elliott', 'Kodak Black',
]
// [recherche Deezer, réponse (l'animé), titre affiché]
const OPENINGS = [
  ['Blue Bird Ikimono Gakari', 'Naruto'], ['We Are! Hiroshi Kitadani', 'One Piece'], ['Guren no Yumiya Linked Horizon', 'L’Attaque des Titans'], ['Gurenge LiSA', 'Demon Slayer'], ['Cha-La Head-Cha-La Hironobu Kageyama', 'Dragon Ball Z'],
  ['A Cruel Angel\'s Thesis Yoko Takahashi', 'Neon Genesis Evangelion'], ['Unravel TK from Ling tosite sigure', 'Tokyo Ghoul'], ['Kaikai Kitan Eve', 'Jujutsu Kaisen'], ['The World Nightmare', 'Death Note'], ['Again YUI', 'Fullmetal Alchemist'],
  ['Silhouette KANA-BOON', 'Naruto'], ['Shinzou wo Sasageyo Linked Horizon', 'L’Attaque des Titans'], ['Peace Sign Kenshi Yonezu', 'My Hero Academia'], ['Kick Back Kenshi Yonezu', 'Chainsaw Man'], ['Mixed Nuts Official HIGE DANdism', 'Spy × Family'],
  ['Idol YOASOBI', 'Oshi no Ko'], ['Departure! Masatoshi Ono', 'Hunter × Hunter'], ['Tank! Seatbelts', 'Cowboy Bebop'], ['Asterisk Orange Range', 'Bleach'], ['Butter-Fly Kouji Wada', 'Digimon'],
  ['The Hero JAM Project', 'One Punch Man'], ['Sono Chi no Sadame Hiroaki Tommy Tominaga', 'JoJo’s Bizarre Adventure'], ['Bloody Stream Coda', 'JoJo’s Bizarre Adventure'], ['Colors FLOW', 'Code Geass'], ['Hacking to the Gate Kanako Itou', 'Steins;Gate'],
  ['Crossing Field LiSA', 'Sword Art Online'], ['Specialz King Gnu', 'Jujutsu Kaisen'], ['Otonoke Creepy Nuts', 'Dandadan'], ['Bling-Bang-Bang-Born Creepy Nuts', 'Mashle'], ['Imagination SPYAIR', 'Haikyu!!'],
  ['Yuusha YOASOBI', 'Frieren'], ['Black Rover Vickeblanka', 'Black Clover'], ['Hikaru Nara Goose house', 'Your Lie in April'], ['Kyouran Hey Kids THE ORAL CIGARETTES', 'Noragami'], ['Inferno Mrs. GREEN APPLE', 'Fire Force'],
  ['Akuma no Ko Ai Higuchi', 'L’Attaque des Titans'], ['Pegasus Fantasy MAKE-UP', 'Saint Seiya'], ['Moonlight Densetsu DALI', 'Sailor Moon'], ['Dragon Soul Takayoshi Tanimoto', 'Dragon Ball Z Kai'], ['Secret base ZONE', 'AnoHana'],
  ['Rose Anna Tsuchiya', 'Nana'], ['Ignite Eir Aoi', 'Sword Art Online'], ['Fighting Gold Coda', 'JoJo’s Bizarre Adventure'], ['Boku no Sensou Shinsei Kamattechan', 'L’Attaque des Titans'], ['LEveL SawanoHiroyuki', 'Solo Leveling'],
]
// Génériques français de dessins animés et d'animés d'hier et d'aujourd'hui
const GENERIQUES = [
  ['Générique Pokémon attrapez-les tous', 'Pokémon'], ['Bob l\'éponge générique', 'Bob l’éponge'], ['Dragon Ball Z Bernard Minet', 'Dragon Ball Z'], ['Les Chevaliers du Zodiaque Bernard Minet', 'Les Chevaliers du Zodiaque'], ['Olive et Tom générique', 'Olive et Tom'],
  ['Code Lyoko Un monde sans danger', 'Code Lyoko'], ['Totally Spies générique', 'Totally Spies!'], ['Les Razmoket générique', 'Les Razmoket'], ['Inspecteur Gadget générique', 'Inspecteur Gadget'], ['Goldorak générique Noam', 'Goldorak'],
  ['Albator générique Eric Charden', 'Albator'], ['Capitaine Flam générique', 'Capitaine Flam'], ['Ulysse 31 générique', 'Ulysse 31'], ['Les Mystérieuses Cités d\'Or générique', 'Les Mystérieuses Cités d’or'], ['Il était une fois la vie générique', 'Il était une fois… la Vie'],
  ['Les Schtroumpfs générique', 'Les Schtroumpfs'], ['Nicky Larson générique Jean-Paul Césari', 'Nicky Larson'], ['Ken le survivant générique', 'Ken le survivant'], ['Candy générique Dorothée', 'Candy'], ['Les Minikeums', 'Les Minikeums'],
  ['Pokémon Johto générique', 'Pokémon'], ['Digimon générique français', 'Digimon'], ['Miraculous générique', 'Miraculous'], ['Oggy et les cafards générique', 'Oggy et les Cafards'], ['Les Zinzins de l\'espace générique', 'Les Zinzins de l’espace'],
  ['Marsupilami générique', 'Marsupilami'], ['Lucky Luke générique', 'Lucky Luke'], ['La Panthère Rose Henry Mancini', 'La Panthère rose'], ['Les Simpson générique', 'Les Simpson'], ['Scooby-Doo générique', 'Scooby-Doo'],
  ['Hamtaro générique', 'Hamtaro'], ['Yu-Gi-Oh générique français', 'Yu-Gi-Oh!'], ['Naruto générique français', 'Naruto'], ['Tortues Ninja générique', 'Tortues Ninja'], ['Titeuf générique', 'Titeuf'],
]

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms))
async function dz(chemin) {
  for (let e = 1; e < 5; e++) {
    const r = await fetch(`https://api.deezer.com${chemin}`, { headers: UA })
    const j = await r.json().catch(() => null)
    if (j && !j.error) return j
    await pause(2000 * e)
  }
  return null
}
const item = (t, reponse) => ({ id: String(t.id), n: { fr: t.title_short ?? t.title, en: t.title_short ?? t.title }, r: reponse, img: t.album?.cover_medium, f: [[{ fr: 'Titre', en: 'Title' }, t.title_short ?? t.title], [{ fr: 'Artiste', en: 'Artist' }, t.artist?.name], [{ fr: 'Album', en: 'Album' }, t.album?.title]] })

async function artistes(liste, parArtiste = 3) {
  const out = []
  for (const nom of [...new Set(liste)]) {
    const a = (await dz(`/search/artist?q=${encodeURIComponent(nom)}&limit=1`))?.data?.[0]
    if (!a) { console.log('  artiste introuvable :', nom); continue }
    const top = (await dz(`/artist/${a.id}/top?limit=${parArtiste}`))?.data ?? []
    for (const t of top) if (t.preview) out.push(item(t, a.name))
    await pause(150)
  }
  return out
}
async function recherches(liste) {
  const out = []
  for (const [q, reponse] of liste) {
    const t = (await dz(`/search?q=${encodeURIComponent(q)}&limit=1`))?.data?.[0]
    if (t?.preview) out.push(item(t, reponse)); else console.log('  introuvable :', q)
    await pause(150)
  }
  return out
}
// Résultats faux repérés à l'écoute du catalogue (remix, autre série) : écartés
const FAUX = new Set(['Bob l’éponge', 'Les Razmoket', 'Les Minikeums', 'Les Zinzins de l’espace', 'Scooby-Doo', 'Titeuf', 'Frieren'])
const ecrire = async (id, items) => { const vus = new Set(); const u = items.filter((x) => !(id !== 'rap-fr' && id !== 'rap-us' && FAUX.has(x.r)) && !vus.has(x.id) && vus.add(x.id)); await writeFile(`public/packs/culture/${id}.json`, JSON.stringify(u)); console.log(`${id} : ${u.length}`) }

await ecrire('rap-fr', await artistes(RAP_FR))
await ecrire('rap-us', await artistes(RAP_US))
await ecrire('openings', await recherches(OPENINGS))
await ecrire('generiques', await recherches(GENERIQUES))
