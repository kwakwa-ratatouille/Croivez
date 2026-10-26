// Musique : plus d'artistes pour les extraits, rap refait (artiste retrouvé par son nom EXACT, pas le premier résultat),
// et de nouveaux quiz audio : musiques de jeux vidéo, musiques de films, chansons Disney.
// Usage : node scripts/build-musique.mjs [extraits|rap|jeux|films|disney|voix|pop|indie|afro]   (sans argument : tout)
// Ensuite : node scripts/build-annees.mjs (année de sortie et popularité de chaque son, pour les époques)
import { readFile, writeFile } from 'node:fs/promises'

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
const norm = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim()
const item = (t, reponse) => ({ id: String(t.id), n: { fr: t.title_short ?? t.title, en: t.title_short ?? t.title }, r: reponse, img: t.album?.cover_medium, rk: t.rank, f: [[{ fr: 'Titre', en: 'Title' }, t.title_short ?? t.title], [{ fr: 'Artiste', en: 'Artist' }, t.artist?.name], [{ fr: 'Album', en: 'Album' }, t.album?.title]] })

// Artiste dont le nom correspond exactement (le plus suivi s'il y en a plusieurs), puis ses titres les plus écoutés
async function artistes(liste, parArtiste = 3) {
  const out = []
  const rates = []
  for (const nom of [...new Set(liste)]) {
    const l = (await dz(`/search/artist?q=${encodeURIComponent(nom)}&limit=10`))?.data ?? []
    const a = l.filter((x) => norm(x.name) === norm(nom)).sort((x, y) => (y.nb_fan ?? 0) - (x.nb_fan ?? 0))[0]
    if (!a) { rates.push(nom); continue }
    const top = (await dz(`/artist/${a.id}/top?limit=${parArtiste + 2}`))?.data ?? []
    // Titres où l'artiste est bien l'interprète principal
    for (const t of top.filter((t) => t.preview && t.artist?.id === a.id).slice(0, parArtiste)) out.push(item(t, a.name))
    await pause(120)
  }
  if (rates.length) console.log(`  artistes introuvables : ${rates.join(', ')}`)
  return out
}
// Recherches vérifiées : le résultat doit citer un mot-clé (titre, album ou artiste) ; [recherche, réponse, mots-clés]
async function recherches(liste) {
  const out = []
  const rates = []
  for (const [q, reponse, cles] of liste) {
    const mots = norm(cles ?? reponse).split(' ').filter((m) => m.length >= 3 && !['the', 'les', 'des', 'and', 'from', 'theme'].includes(m))
    const l = (await dz(`/search?q=${encodeURIComponent(q)}&limit=10`))?.data ?? []
    const t = l.find((x) => x.preview && mots.some((m) => norm(`${x.title} ${x.album?.title} ${x.artist?.name}`).split(' ').includes(m)))
    if (t) out.push(item(t, reponse)); else rates.push(q)
    await pause(120)
  }
  if (rates.length) console.log(`  introuvables : ${rates.join(' · ')}`)
  const vus = new Set()
  return out.filter((x) => !vus.has(x.id) && vus.add(x.id))
}
const ecrire = async (id, items) => { await writeFile(`public/packs/culture/${id}.json`, JSON.stringify(items)); console.log(`${id} : ${items.length}`) }

// ——— Extraits : nouveaux artistes (pop, rock, chanson française, électro, latino, K-pop…) ———
const EXTRAITS = [
  'Taylor Swift', 'Beyoncé', 'Rihanna', 'Ed Sheeran', 'Adele', 'Bruno Mars', 'Lady Gaga', 'Ariana Grande', 'Dua Lipa', 'The Weeknd', 'Justin Bieber', 'Shakira', 'Coldplay',
  'Imagine Dragons', 'Maroon 5', 'Sia', 'Miley Cyrus', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Lana Del Rey', 'Lorde', 'Sam Smith', 'Shawn Mendes', 'Lewis Capaldi', 'One Direction',
  'Backstreet Boys', 'Spice Girls', 'Madonna', 'Mariah Carey', 'Christina Aguilera', 'P!nk', 'Avicii', 'David Guetta', 'Calvin Harris', 'Daft Punk', 'Martin Garrix', 'Kygo',
  'Bad Bunny', 'Rosalía', 'J Balvin', 'Daddy Yankee', 'Luis Fonsi', 'BTS', 'BLACKPINK', 'Stromae', 'ABBA', 'Queen', 'The Beatles', 'The Rolling Stones', 'Led Zeppelin',
  'Pink Floyd', 'AC/DC', 'Nirvana', 'Metallica', 'Linkin Park', 'Green Day', 'Red Hot Chili Peppers', 'U2', 'Muse', 'Arctic Monkeys', 'Oasis', 'The Police', 'Bob Marley & The Wailers',
  'Michael Bublé', 'Eagles', 'Fleetwood Mac', 'Guns N\' Roses', 'Bon Jovi', 'Gorillaz', 'Radiohead', 'The Killers', 'OneRepublic', 'Lizzo', 'SZA', 'Chappell Roan', 'Måneskin',
  'Eurythmics', 'Wham!', 'Bee Gees', 'Earth, Wind & Fire', 'Kool & The Gang', 'Village People', 'Boney M.', 'Toto', 'Survivor', 'Europe', 'a-ha', 'Depeche Mode', 'The Cure',
  // Chanson et pop françaises
  'Angèle', 'Aya Nakamura', 'Indila', 'Zaz', 'Louane', 'Vianney', 'Kendji Girac', 'Christophe Maé', 'Calogero', 'Mylène Farmer', 'Jean-Jacques Goldman', 'Michel Sardou',
  'Francis Cabrel', 'Renaud', 'Indochine', 'Téléphone', 'Daniel Balavoine', 'Michel Berger', 'France Gall', 'Serge Gainsbourg', 'Jacques Dutronc', 'Claude François', 'Dalida',
  'Joe Dassin', 'Patrick Bruel', 'Pascal Obispo', 'Florent Pagny', 'Garou', 'Lara Fabian', 'M. Pokora', 'Slimane', 'Amir', 'Clara Luciani', 'Juliette Armanet', 'Pomme',
  'Julien Doré', 'Christine and the Queens', 'Matthieu Chedid', 'Bénabar', 'Grand Corps Malade', 'Jain', 'Eddy de Pretto', 'Hoshi', 'Vitaa', 'Tal', 'Black M', 'Nolwenn Leroy',
  'Patricia Kaas', 'Alain Souchon', 'Laurent Voulzy', 'Étienne Daho', 'Vanessa Paradis', 'Mika', 'Jenifer', 'Alizée', 'Gims', 'Soprano', 'Bigflo & Oli', 'Kyo', 'Superbus',
  'Les Rita Mitsouko', 'Noir Désir', 'Louise Attaque', 'Zazie', 'Jean-Louis Aubert', 'Carla Bruni', 'Benjamin Biolay', 'Ben Mazué', 'Gaëtan Roussel', 'Pierre Garnier', 'Santa',
  // Ajouts : plus de variété
  'Charles Aznavour', 'Édith Piaf', 'Jacques Brel', 'Georges Brassens', 'Johnny Hallyday', 'Sylvie Vartan', 'Françoise Hardy', 'Céline Dion', 'Kids United', 'Marwa Loud', 'Naza', 'Keblack', 'Ofenbach', 'Bob Sinclar', 'Martin Solveig', 'Kavinsky', 'Justice', 'Air', 'Phoenix', "L'Impératrice",
  'Billie Eilish', 'Harry Styles', 'Post Malone', 'Doja Cat', 'Benson Boone', 'Tate McRae', 'Teddy Swims', 'Hozier', 'Tones and I', 'Glass Animals', 'The Chainsmokers', 'Alan Walker', 'Marshmello', 'Major Lazer', 'Pitbull', 'Enrique Iglesias', 'Ricky Martin', 'Karol G', 'Anitta', 'Elvis Presley',
  'Whitney Houston', 'Stevie Wonder', 'Prince', 'David Bowie', 'Elton John', 'Tina Turner', 'Cyndi Lauper', 'Lenny Kravitz', 'Amy Winehouse', 'Alicia Keys', 'Usher', 'Pharrell Williams', 'Gnarls Barkley', 'Mark Ronson', 'Jason Derulo', 'Flo Rida', 'Black Eyed Peas', 'Gotye', 'Lykke Li', 'Vance Joy',
]
// ——— Rap (listes d'origine + quelques ajouts) ———
const RAP_FR = ['Timar', 'Yvnnis', 'Luther', 'RK', 'JRK 19', 'Kobalad', 'La Fève', 'Rnboi', 'Oboy', 'Guy2Bezbar', 'Zamdane', 'Kerchak', 'Bekar', 'La Mano 1.9', 'Jolagreen23', 'Soolking', 'Niro', 'Hatik', 'Kekra', 'Green Montana', 'Ninho', 'Gims', 'Dosseh', 'Isha', 'Disiz', 'Nekfeu', 'Georgio', 'Prince Waly', 'Captaine Roshi', 'Houdi', 'Kalash', 'Elams', 'Ashe 22', 'Zuukou Mayzie', 'Khali', 'Sto', 'Mairo', 'Jul', 'Ninho', 'PNL', 'Booba', 'SCH', 'Soprano', 'Nekfeu', 'Orelsan', 'Damso', 'Niska', 'Gazo', 'Tiakola', 'Werenoi', 'Hamza', 'Vald', 'Naps', 'Heuss l\'Enfoiré', 'Lacrim',
  'Kaaris', 'Lomepal', 'Maes', 'Alonzo', 'PLK', 'Koba LaD', 'Zola', 'Leto', 'Sexion d\'Assaut', 'La Fouine', 'Rohff', 'Diam\'s', 'MC Solaar', 'IAM', 'Suprême NTM', 'Oxmo Puccino', 'Kery James',
  'Sinik', 'Lunatic', '113', 'Fonky Family', 'Médine', 'Freeze Corleone', 'Laylow', 'Josman', 'Luv Resval', 'Gradur', 'MHD', 'Dinos', 'Kalash Criminel', 'Sofiane', 'Jok\'Air', 'Ziak',
  'Doc Gynéco', 'Passi', 'Ärsenik', 'Stomy Bugsy', 'Lino', 'Youssoupha', 'Sniper', 'Gambi', 'SDM', 'Rim\'K', 'Sadek', 'Tayc', 'Dadju', 'Lartiste', 'Bouss', 'Zkr', 'Rsko', 'Favé', 'Theodora',
  // Ajouts : plus de variété (nouvelle école, rap de Marseille, de Belgique, anciens)
  'Soolking', "L'Algérino", 'Nabil', 'Kofs', 'Moha La Squale', 'Djadja & Dinaz', 'Hornet La Frappe', 'Dosseh', 'Tsew The Kid', 'Ninho', 'Ninho', 'Kekra', 'Hatik', 'Nekfeu', 'Lefa', 'Georgio', 'Népal', 'Alpha Wann', 'Sneazzy', 'Nemir',
  'Caballero & JeanJass', 'Hamza', 'Damso', 'Shay', 'Roméo Elvis', 'Green Montana', 'Krisy', 'Le Motel', 'Tiakola', 'Leto', 'Tif', 'Guy2Bezbar', 'Jolagreen23', 'Zamdane', 'Kerchak', 'La Mano 1.9', 'Ninho', 'Timal', 'Landy', 'Bramsito',
  'Hugo TSR', 'Scylla', 'Disiz', 'Akhenaton', "Shurik'n", 'Psy 4 de la Rime', 'Keny Arkana', 'Casey', 'Booba', 'Nessbeal', 'Mac Tyer', 'Despo Rutti', 'Seth Gueko', 'Alkpote', 'Jazzy Bazz', 'Deen Burbigo', 'Lujipeka', 'Columbine', 'Lord Esperanza', 'Bekar']
const RAP_US = ['DaBaby', 'Don Toliver', 'Lil Tjay', 'Roddy Ricch', 'NBA YoungBoy', 'Polo G', 'Rod Wave', 'Lil Yachty', 'Ken Carson', 'Yeat', 'GloRilla', 'Latto', 'Offset', 'Migos', 'Tyga', 'Wiz Khalifa', 'Denzel Curry', 'JID', 'Baby Keem', 'Lil Peep', 'Trippie Redd', 'Ski Mask the Slump God', 'Lil Skies', 'A Boogie wit da Hoodie', 'Fivio Foreign', 'Eminem', 'Drake', 'Kendrick Lamar', 'Travis Scott', 'Kanye West', 'JAY-Z', '50 Cent', 'Snoop Dogg', 'Dr. Dre', '2Pac', 'The Notorious B.I.G.', 'Nicki Minaj', 'Cardi B', 'Post Malone',
  'Lil Wayne', 'J. Cole', 'Future', 'Lil Uzi Vert', '21 Savage', 'A$AP Rocky', 'Tyler, The Creator', 'Kid Cudi', 'Juice WRLD', 'XXXTENTACION', 'Pop Smoke', 'Lil Nas X', 'Megan Thee Stallion',
  'Doja Cat', 'Playboi Carti', 'Wu-Tang Clan', 'Nas', 'Outkast', 'Missy Elliott', 'Run–D.M.C.', 'Public Enemy', 'N.W.A', 'Ice Cube', 'Busta Rhymes', 'DMX', 'Mac Miller', 'Childish Gambino',
  'Lil Baby', 'Gunna', 'Young Thug', 'Logic', 'Coolio', 'Nelly', 'Ludacris', 'Kodak Black', 'Metro Boomin', 'Lil Durk', 'Ice Spice', 'Central Cee', 'Stormzy', 'Jack Harlow', 'Lil Tecca']

// ——— Musiques de jeux vidéo : [recherche, jeu, mots-clés anglais] ———
const JEUX = [
  ['Super Mario Bros Ground Theme Koji Kondo', 'Super Mario Bros.', 'Super Mario'], ['The Legend of Zelda Main Theme', 'The Legend of Zelda', 'Zelda'], ['Tetris Theme Korobeiniki', 'Tetris', 'Tetris'],
  ['Pokemon Red Blue Opening', 'Pokémon Rouge et Bleu', 'Pokemon'], ['Green Hill Zone Sonic', 'Sonic the Hedgehog', 'Sonic'], ['Pac-Man theme', 'Pac-Man', 'Pac-Man'],
  ['Guile Theme Street Fighter II', 'Street Fighter II', 'Street Fighter'], ['One-Winged Angel Final Fantasy VII', 'Final Fantasy VII', 'Final Fantasy'], ['To Zanarkand Final Fantasy X', 'Final Fantasy X', 'Zanarkand Final Fantasy'],
  ['Chrono Trigger Main Theme', 'Chrono Trigger', 'Chrono Trigger'], ['Halo Theme Mjolnir Mix', 'Halo', 'Halo'], ['Sweden C418 Minecraft', 'Minecraft', 'Minecraft C418'],
  ['Dragonborn Skyrim Jeremy Soule', 'Skyrim', 'Skyrim Dragonborn'], ['Mass Effect Vigil', 'Mass Effect', 'Mass Effect'], ['The Witcher 3 Silver for Monsters', 'The Witcher 3', 'Witcher'],
  ['Megalovania Toby Fox', 'Undertale', 'Undertale Megalovania'], ['Still Alive Portal Jonathan Coulton', 'Portal', 'Portal'], ['Ezio\'s Family Jesper Kyd', 'Assassin’s Creed II', 'Assassin Ezio'],
  ['Grand Theft Auto San Andreas Theme', 'GTA San Andreas', 'San Andreas'], ['The Last of Us Gustavo Santaolalla', 'The Last of Us', 'Last of Us'], ['Nate\'s Theme Uncharted', 'Uncharted', 'Uncharted'],
  ['God of War Bear McCreary main theme', 'God of War', 'God of War'], ['Dearly Beloved Kingdom Hearts', 'Kingdom Hearts', 'Kingdom Hearts'], ['Metal Gear Solid Main Theme', 'Metal Gear Solid', 'Metal Gear'],
  ['Vampire Killer Castlevania', 'Castlevania', 'Castlevania'], ['Dr. Wily Stage Mega Man 2', 'Mega Man 2', 'Mega Man'], ['Aquatic Ambience Donkey Kong Country', 'Donkey Kong Country', 'Donkey Kong'],
  ['Bob-omb Battlefield Super Mario 64', 'Super Mario 64', 'Mario 64'], ['Rainbow Road Mario Kart', 'Mario Kart', 'Mario Kart'], ['Animal Crossing New Horizons main theme', 'Animal Crossing', 'Animal Crossing'],
  ['Wii Sports Theme', 'Wii Sports', 'Wii Sports'], ['Wii Shop Channel', 'Wii', 'Wii Shop'], ['Super Smash Bros Brawl Main Theme', 'Super Smash Bros. Brawl', 'Smash Bros'],
  ['Gourmet Race Kirby', 'Kirby', 'Kirby'], ['Metroid Prime Main Theme', 'Metroid Prime', 'Metroid'], ['Star Fox Corneria', 'Star Fox', 'Star Fox'], ['Banjo-Kazooie Spiral Mountain', 'Banjo-Kazooie', 'Banjo'],
  ['Crash Bandicoot N Sanity Beach', 'Crash Bandicoot', 'Crash Bandicoot'], ['Spyro the Dragon Stone Hill', 'Spyro', 'Spyro'], ['Rayman Origins soundtrack', 'Rayman', 'Rayman'],
  ['Doom E1M1 At Doom\'s Gate', 'Doom', 'Doom'], ['BFG Division Mick Gordon', 'Doom (2016)', 'Doom BFG'], ['Call of Duty Modern Warfare 2 Theme Hans Zimmer', 'Call of Duty : Modern Warfare 2', 'Modern Warfare'],
  ['Overwatch main theme', 'Overwatch', 'Overwatch'], ['Legends Never Die League of Legends', 'League of Legends', 'League of Legends'], ['Among Us theme', 'Among Us', 'Among Us'],
  ['Floral Fury Cuphead', 'Cuphead', 'Cuphead'], ['Hollow Knight Christopher Larkin', 'Hollow Knight', 'Hollow Knight'], ['Celeste Resurrections Lena Raine', 'Celeste', 'Celeste'],
  ['Hades In the Blood Darren Korb', 'Hades', 'Hades'], ['Light of the Forest Ori', 'Ori and the Blind Forest', 'Ori'], ['Apotheosis Journey Austin Wintory', 'Journey', 'Journey'],
  ['Shovel Knight Strike the Earth', 'Shovel Knight', 'Shovel Knight'], ['Terraria Overworld Day', 'Terraria', 'Terraria'], ['Stardew Valley Overture', 'Stardew Valley', 'Stardew'],
  ['Last Surprise Persona 5', 'Persona 5', 'Persona'], ['Weight of the World NieR Automata', 'NieR: Automata', 'Nier'], ['Gwyn Lord of Cinder Dark Souls', 'Dark Souls', 'Dark Souls'],
  ['Elden Ring main theme Tsukasa Saitoh', 'Elden Ring', 'Elden Ring'], ['Bloodborne main theme', 'Bloodborne', 'Bloodborne'], ['Sekiro Shadows Die Twice soundtrack', 'Sekiro', 'Sekiro'],
  ['Destiny The Journey Martin O\'Donnell', 'Destiny', 'Destiny'], ['BioShock Welcome to Rapture', 'BioShock', 'BioShock'], ['I Don\'t Want to Set the World on Fire Ink Spots', 'Fallout', 'Ink Spots'],
  ['Theme of Laura Silent Hill 2', 'Silent Hill 2', 'Silent Hill'], ['Resident Evil Save Room theme', 'Resident Evil', 'Resident Evil'], ['Tekken 3 soundtrack', 'Tekken', 'Tekken'],
  ['Mortal Kombat Techno Syndrome', 'Mortal Kombat', 'Mortal Kombat'], ['The Sims Buy Mode', 'Les Sims', 'Sims'], ['SimCity 2000 soundtrack', 'SimCity', 'SimCity'],
  ['Age of Empires II theme', 'Age of Empires II', 'Age of Empires'], ['Legends of Azeroth World of Warcraft', 'World of Warcraft', 'Warcraft'], ['StarCraft Terran theme', 'StarCraft', 'StarCraft'],
  ['Tristram Diablo', 'Diablo', 'Diablo Tristram'], ['Baba Yetu Christopher Tin', 'Civilization IV', 'Baba Yetu Civilization'], ['Pokemon Gold Silver New Bark Town', 'Pokémon Or et Argent', 'Pokemon'],
  ['Splattack Splatoon', 'Splatoon', 'Splatoon'], ['Song of Storms Ocarina of Time', 'Zelda : Ocarina of Time', 'Ocarina'], ['Breath of the Wild Main Theme', 'Zelda : Breath of the Wild', 'Breath of the Wild'],
  ['Jump Up Super Star Super Mario Odyssey', 'Super Mario Odyssey', 'Odyssey'], ['Xenoblade Chronicles Gaur Plain', 'Xenoblade Chronicles', 'Xenoblade'], ['Fire Emblem Theme', 'Fire Emblem', 'Fire Emblem'],
  ['Professor Layton main theme', 'Professeur Layton', 'Layton'], ['Phoenix Wright Objection', 'Ace Attorney', 'Ace Attorney Phoenix Wright'], ['Tomb Raider main theme', 'Tomb Raider', 'Tomb Raider'],
  ['Prince of Persia Sands of Time soundtrack', 'Prince of Persia', 'Prince of Persia'], ['Detroit Become Human Kara theme', 'Detroit: Become Human', 'Detroit'], ['To All of You Syd Matters', 'Life is Strange', 'Syd Matters'],
  ['Far Cry 3 Make It Bun Dem', 'Far Cry 3', 'Far Cry'], ['Cyberpunk 2077 soundtrack', 'Cyberpunk 2077', 'Cyberpunk'], ['Baldur\'s Gate 3 soundtrack', 'Baldur’s Gate 3', 'Baldur'],
  ['Genshin Impact main theme', 'Genshin Impact', 'Genshin'], ['Angry Birds theme', 'Angry Birds', 'Angry Birds'], ['Plants vs Zombies Grasswalk', 'Plants vs. Zombies', 'Plants vs Zombies'],
  ['Subway Surfers theme', 'Subway Surfers', 'Subway Surfers'], ['Geometry Dash Stereo Madness', 'Geometry Dash', 'Geometry Dash'], 
  ['Ratchet and Clank soundtrack', 'Ratchet & Clank', 'Ratchet'], ['Jak and Daxter soundtrack', 'Jak and Daxter', 'Jak'], ['Dofus soundtrack', 'Dofus', 'Dofus'],
  ['Big Blue F-Zero', 'F-Zero', 'F-Zero'],
  ['Dragon Quest Overture', 'Dragon Quest', 'Dragon Quest'], ['Proof of a Hero Monster Hunter', 'Monster Hunter', 'Monster Hunter'], ['Mad World Gary Jules Gears of War', 'Gears of War', 'Mad World'],
  ['Marvel\'s Spider-Man PS4 main theme', 'Marvel’s Spider-Man', 'Spider-Man'], ['Ghost of Tsushima main theme', 'Ghost of Tsushima', 'Tsushima'], ['Horizon Zero Dawn main theme', 'Horizon Zero Dawn', 'Horizon'],
  ['Death Stranding Low Roar', 'Death Stranding', 'Death Stranding Low Roar'], ['A Plague Tale Innocence soundtrack', 'A Plague Tale', 'Plague Tale'], ['Clair Obscur Expedition 33 Lumière', 'Clair Obscur : Expedition 33', 'Expedition'],
  ['Fortnite Lobby Music', 'Fortnite', 'Fortnite'], ['Candy Crush Saga theme', 'Candy Crush Saga', 'Candy Crush'],
  // Encore plus : Wakfu, Dofus, Clair Obscur, Animal Crossing, Wii et DS, et d'autres classiques
  ['Wakfu générique Yugo', 'Wakfu', 'Wakfu'], ['Wakfu The Series Main Theme', 'Wakfu', 'Wakfu'], ['Wakfu soundtrack Sufokia', 'Wakfu', 'Wakfu'], ['Dofus Incarnam', 'Dofus', 'Dofus'],
  ['Dofus Astrub', 'Dofus', 'Dofus'], ['Dofus Le Film soundtrack', 'Dofus', 'Dofus'], ['Clair Obscur Expedition 33 Alicia', 'Clair Obscur : Expedition 33', 'Expedition 33'], ['Clair Obscur Expedition 33 Une vie à t\'aimer', 'Clair Obscur : Expedition 33', 'Expedition 33'],
  ['Clair Obscur Expedition 33 Gustave', 'Clair Obscur : Expedition 33', 'Expedition 33'], ['Animal Crossing New Leaf 8 PM', 'Animal Crossing : New Leaf', 'Animal Crossing'], ['Animal Crossing Wild World Main Theme', 'Animal Crossing : Wild World', 'Animal Crossing'],
  ['K.K. Slider Bubblegum K.K.', 'Animal Crossing', 'K.K. Slider Animal Crossing'], ['Animal Crossing New Horizons 5 PM', 'Animal Crossing : New Horizons', 'Animal Crossing'], ['Mii Channel Theme', 'Wii (chaîne Mii)', 'Mii Channel'],
  ['Wii Sports Resort Main Theme', 'Wii Sports Resort', 'Wii Sports Resort'], ['Wii Fit Plus Main Theme', 'Wii Fit', 'Wii Fit'], 
  ['Mario Kart Wii Luigi Circuit', 'Mario Kart Wii', 'Mario Kart Wii'], ['Mario Kart Wii Coconut Mall', 'Mario Kart Wii', 'Coconut Mall'], ['Mario Kart Wii Title Theme', 'Mario Kart Wii', 'Mario Kart Wii'], ['New Super Mario Bros Wii Overworld', 'New Super Mario Bros. Wii', 'New Super Mario'],
  ['Twilight Princess Main Theme', 'Zelda : Twilight Princess', 'Twilight Princess'], ['Ballad of the Goddess Skyward Sword', 'Zelda : Skyward Sword', 'Skyward Sword'], ['Mario Party 8 Main Theme', 'Mario Party', 'Mario Party'], ['Donkey Kong Country Returns Jungle Hijinxs', 'Donkey Kong Country Returns', 'Donkey Kong'],
  ['Kirby\'s Epic Yarn Main Theme', 'Kirby : Au fil de l\'aventure', 'Kirby Epic Yarn'], ['Super Paper Mario Lineland Road', 'Super Paper Mario', 'Paper Mario'], ['Metroid Prime 3 Corruption theme', 'Metroid Prime 3', 'Metroid Prime'], ['Xenoblade Chronicles Engage the Enemy', 'Xenoblade Chronicles', 'Xenoblade'],
  ['Nintendogs Main Theme', 'Nintendogs', 'Nintendogs'], ['Brain Age Dr Kawashima theme', 'Programme d’entraînement cérébral du Dr Kawashima', 'Brain Age'], ['Tomodachi Life Main Theme', 'Tomodachi Life', 'Tomodachi'], ['Professor Layton Puzzle theme', 'Professeur Layton', 'Layton'],
  ['Mario & Luigi Bowser\'s Inside Story theme', 'Mario & Luigi', 'Mario Luigi'], ['Pokemon Diamond Pearl Route 209', 'Pokémon Diamant et Perle', 'Pokemon Diamond'], ['Pokemon Black White Route 10', 'Pokémon Noir et Blanc', 'Pokemon Black'], ['Pokemon Sword Shield Wild Area', 'Pokémon Épée et Bouclier', 'Pokemon Sword'],
  ['Pokemon Center theme', 'Pokémon', 'Pokemon Center'], ['Lavender Town Pokemon', 'Pokémon Rouge et Bleu', 'Lavender Town'], ['Super Mario Sunshine Delfino Plaza', 'Super Mario Sunshine', 'Delfino'], ['Luigi\'s Mansion theme', 'Luigi’s Mansion', 'Luigi Mansion'],
  ['Zelda Wind Waker Dragon Roost Island', 'Zelda : The Wind Waker', 'Wind Waker'], ['Zelda Majora\'s Mask Clock Town', 'Zelda : Majora’s Mask', 'Majora Clock Town'], ['Zelda Tears of the Kingdom main theme', 'Zelda : Tears of the Kingdom', 'Tears of the Kingdom'], ['Super Mario World Overworld', 'Super Mario World', 'Mario World'],
  ['Super Mario Bros 3 World 1', 'Super Mario Bros. 3', 'Mario Bros 3'], ['Mario Kart 8 Main Theme', 'Mario Kart 8', 'Mario Kart 8'], ['Super Mario 3D World Main Theme', 'Super Mario 3D World', '3D World'], ['Luigi\'s Mansion 3 theme', 'Luigi’s Mansion 3', 'Luigi Mansion'],
  ['Splatoon 2 Ink Me Up', 'Splatoon 2', 'Splatoon'], ['Kirby Green Greens', 'Kirby', 'Kirby Green Greens'], ['Ori and the Will of the Wisps soundtrack', 'Ori and the Will of the Wisps', 'Ori'], ['Rayman Legends Castle Rock', 'Rayman Legends', 'Rayman Legends'],
  ['Rayman 2 The Great Escape soundtrack', 'Rayman 2', 'Rayman 2'], ['Lapins Crétins Rabbids theme', 'Les Lapins Crétins', 'Rabbids'], ['Assassin\'s Creed Black Flag Leave Her Johnny', 'Assassin’s Creed IV: Black Flag', 'Black Flag'],
  ['Red Dead Redemption Far Away Jose Gonzalez', 'Red Dead Redemption', 'Far Away Red Dead'], ['GTA Vice City theme', 'GTA Vice City', 'Vice City'], ['Minecraft Wet Hands C418', 'Minecraft', 'Wet Hands Minecraft'], ['Minecraft Subwoofer Lullaby', 'Minecraft', 'Subwoofer Minecraft'],
  ['Terraria Boss 1', 'Terraria', 'Terraria'], ['Undertale Hopes and Dreams', 'Undertale', 'Undertale'], ['Deltarune Rude Buster', 'Deltarune', 'Deltarune Rude Buster'], ['Hollow Knight City of Tears', 'Hollow Knight', 'Hollow Knight'],
  ['Celeste First Steps', 'Celeste', 'Celeste'], ['Hades Good Riddance', 'Hades', 'Hades'], ['Stardew Valley Spring', 'Stardew Valley', 'Stardew'], ['Sonic Adventure 2 Live and Learn', 'Sonic Adventure 2', 'Live and Learn Sonic'],
  ['Sonic 3 Ice Cap Zone', 'Sonic 3', 'Ice Cap Sonic'], ['Street Fighter Ken theme', 'Street Fighter II', 'Street Fighter Ken'], ['Tekken 7 Heat Haze Shadow', 'Tekken 7', 'Tekken'], ['Final Fantasy Victory Fanfare', 'Final Fantasy', 'Final Fantasy Victory'],
  ['Final Fantasy VII Aerith\'s Theme', 'Final Fantasy VII', 'Aerith Final Fantasy'], ['Kingdom Hearts Simple and Clean Utada', 'Kingdom Hearts', 'Simple and Clean'], ['NieR Replicant Kaine Salvation', 'NieR', 'Nier Kaine'], ['Persona 4 Your Affection', 'Persona 4', 'Persona'],
  ['Halo 3 Finish the Fight', 'Halo 3', 'Halo'], ['Portal 2 Want You Gone', 'Portal 2', 'Want You Gone Portal'], ['Skyrim Far Horizons', 'Skyrim', 'Skyrim'], ['Oblivion Reign of the Septims', 'The Elder Scrolls IV: Oblivion', 'Oblivion'],
  ['The Witcher 3 Kaer Morhen', 'The Witcher 3', 'Witcher'], ['Fallout 4 main theme', 'Fallout 4', 'Fallout'], ['Ghost of Tsushima The Way of the Ghost', 'Ghost of Tsushima', 'Tsushima'], ['Detroit Become Human Connor', 'Detroit: Become Human', 'Detroit'],
  ['Spyro Reignited Sunny Flight', 'Spyro', 'Spyro'], ['Crash Bandicoot Warped theme', 'Crash Bandicoot 3', 'Crash'], ['Jak II soundtrack', 'Jak II', 'Jak'], ['Ratchet Clank Going Commando theme', 'Ratchet & Clank 2', 'Ratchet'],
  ['Gusty Garden Galaxy Super Mario Galaxy', 'Super Mario Galaxy', 'Mario Galaxy'], ['Dire Dire Docks', 'Super Mario 64', 'Mario 64'], ['Pokemon Battle Theme Wild', 'Pokémon', 'Pokemon'],
]
// ——— Musiques de films : [recherche, film (titre français), mots-clés] ———
const FILMS = [
  ['Star Wars Main Title John Williams', 'Star Wars', 'Star Wars'], ['The Imperial March John Williams', 'Star Wars : L’Empire contre-attaque', 'Imperial Star Wars Empire'], ['Jurassic Park Theme John Williams', 'Jurassic Park', 'Jurassic'],
  ['Raiders March John Williams', 'Indiana Jones', 'Raiders Indiana'], ['Hedwig\'s Theme John Williams', 'Harry Potter', 'Hedwig Harry Potter'], ['He\'s a Pirate Klaus Badelt', 'Pirates des Caraïbes', 'Pirate Pirates Caribbean'],
  ['Now We Are Free Gladiator', 'Gladiator', 'Gladiator'], ['Cornfield Chase Hans Zimmer', 'Interstellar', 'Interstellar Cornfield'], ['Time Hans Zimmer Inception', 'Inception', 'Inception'],
  ['Why So Serious Hans Zimmer', 'The Dark Knight', 'Dark Knight Serious'], ['Gonna Fly Now Bill Conti', 'Rocky', 'Rocky Gonna Fly'], ['Superman March John Williams', 'Superman', 'Superman'],
  ['Jaws Main Title John Williams', 'Les Dents de la mer', 'Jaws'], ['Flying Theme E.T. John Williams', 'E.T. l’extra-terrestre', 'E.T. Extra Terrestrial'], ['Back to the Future Alan Silvestri', 'Retour vers le futur', 'Back to the Future'],
  ['Ghostbusters Ray Parker Jr', 'SOS Fantômes', 'Ghostbusters'], ['Mission Impossible Theme Lalo Schifrin', 'Mission impossible', 'Mission Impossible'], ['James Bond Theme Monty Norman', 'James Bond', 'Bond'],
  ['Speak Softly Love Godfather Nino Rota', 'Le Parrain', 'Godfather'], ['The Good the Bad and the Ugly Ennio Morricone', 'Le Bon, la Brute et le Truand', 'Good Bad Ugly'], ['Once Upon a Time in the West Morricone', 'Il était une fois dans l’Ouest', 'Once Upon Time West'],
  ['Comptine d\'un autre été Yann Tiersen', 'Le Fabuleux Destin d’Amélie Poulain', 'Amélie Comptine Tiersen'], ['Vois sur ton chemin Les Choristes', 'Les Choristes', 'Choristes'], ['Una Mattina Ludovico Einaudi', 'Intouchables', 'Einaudi Mattina'],
  ['City of Stars La La Land', 'La La Land', 'La La Land City Stars'], ['Feather Theme Forrest Gump Alan Silvestri', 'Forrest Gump', 'Forrest Gump'], ['Schindler\'s List Theme John Williams', 'La Liste de Schindler', 'Schindler'],
  ['Concerning Hobbits Howard Shore', 'Le Seigneur des anneaux', 'Hobbits Lord Rings'], ['The Avengers Alan Silvestri theme', 'Avengers', 'Avengers'], ['Portals Alan Silvestri', 'Avengers : Endgame', 'Portals Endgame Avengers'],
  ['Batman Theme Danny Elfman', 'Batman', 'Batman'], ['Danger Zone Kenny Loggins', 'Top Gun', 'Danger Zone Top Gun'], ['Time of My Life Dirty Dancing', 'Dirty Dancing', 'Dirty Dancing'],
  ['You\'re the One That I Want Grease', 'Grease', 'Grease'], ['Stayin\' Alive Bee Gees', 'La Fièvre du samedi soir', 'Stayin Alive'], ['Misirlou Dick Dale', 'Pulp Fiction', 'Misirlou'],
  ['Battle Without Honor or Humanity Tomoyasu Hotei', 'Kill Bill', 'Battle Honor Hotei'], ['Born Slippy Underworld', 'Trainspotting', 'Born Slippy'], ['Clubbed to Death Rob Dougan', 'Matrix', 'Clubbed Death'],
  ['Also sprach Zarathustra Strauss 2001', '2001, l’Odyssée de l’espace', 'Zarathustra'], ['Halloween Theme John Carpenter', 'Halloween', 'Halloween'], ['Tubular Bells Mike Oldfield', 'L’Exorciste', 'Tubular Bells'],
  ['Lux Aeterna Clint Mansell', 'Requiem for a Dream', 'Lux Aeterna'], ['Dune Hans Zimmer Paul\'s Dream', 'Dune', 'Dune'], ['Can You Hear the Music Ludwig Goransson', 'Oppenheimer', 'Oppenheimer'],
  ['Dance the Night Dua Lipa', 'Barbie', 'Dance the Night Barbie'], ['Hold My Hand Lady Gaga', 'Top Gun : Maverick', 'Hold My Hand'], ['Skyfall Adele', 'Skyfall', 'Skyfall'],
  ['Chariots of Fire Vangelis', 'Les Chariots de feu', 'Chariots Fire'], ['Promentory Last of the Mohicans', 'Le Dernier des Mohicans', 'Mohicans Promentory'], ['For the Love of a Princess Braveheart', 'Braveheart', 'Braveheart'],
  ['Married Life Michael Giacchino', 'Là-haut', 'Married Life'], ['Le Festin Ratatouille', 'Ratatouille', 'Festin Ratatouille'], ['Happy Pharrell Williams', 'Moi, moche et méchant 2', 'Happy'],
  ['All Star Smash Mouth', 'Shrek', 'All Star'], ['Eye of the Tiger Survivor', 'Rocky III', 'Eye of the Tiger'], ['Footloose Kenny Loggins', 'Footloose', 'Footloose'],
  ['Flashdance What a Feeling Irene Cara', 'Flashdance', 'What a Feeling Flashdance'], ['Unchained Melody Righteous Brothers', 'Ghost', 'Unchained Melody'], ['I Will Always Love You Whitney Houston', 'Bodyguard', 'Always Love You'],
  ['See You Again Wiz Khalifa', 'Fast and Furious 7', 'See You Again'], ['My Heart Will Go On Celine Dion', 'Titanic', 'Heart Will Go On'], ['Le Grand Bleu Eric Serra', 'Le Grand Bleu', 'Grand Bleu'],
  ['The Mission Gabriel\'s Oboe Morricone', 'Mission', 'Gabriel Oboe'], ['Take My Breath Away Berlin', 'Top Gun', 'Take My Breath'], ['Mrs Robinson Simon Garfunkel', 'Le Lauréat', 'Robinson'],
  ['Shallow Lady Gaga Bradley Cooper', 'A Star Is Born', 'Shallow'], ['This Is Me Keala Settle', 'The Greatest Showman', 'This Is Me'], ['Lose Yourself Eminem', '8 Mile', 'Lose Yourself'],
]
// ——— Chansons Disney : [recherche, film (titre français), mots-clés] ———
const DISNEY = [
  ['Circle of Life Elton John Lion King', 'Le Roi lion', 'Circle Life Lion King'], ['Libérée délivrée Anaïs Delva', 'La Reine des neiges', 'Libérée délivrée Reine'],
  ['Let It Go Idina Menzel', 'La Reine des neiges', 'Let It Go Frozen'], ['Into the Unknown Idina Menzel', 'La Reine des neiges 2', 'Into the Unknown Frozen'], ['Ce rêve bleu Aladdin', 'Aladdin', 'rêve bleu Aladdin'],
  ['Friend Like Me Robin Williams', 'Aladdin', 'Friend Like Me Aladdin'], ['Under the Sea Little Mermaid', 'La Petite Sirène', 'Under the Sea Mermaid'], ['Part of Your World', 'La Petite Sirène', 'Part of Your World Mermaid'],
  ['Il en faut peu pour être heureux', 'Le Livre de la jungle', 'faut peu heureux Jungle'], ['The Bare Necessities', 'Le Livre de la jungle', 'Bare Necessities Jungle'], ['Beauty and the Beast Angela Lansbury', 'La Belle et la Bête', 'Beauty Beast'],
  ['I\'ll Make a Man Out of You Mulan', 'Mulan', 'Man Out of You Mulan'], ['Reflection Mulan Lea Salonga', 'Mulan', 'Reflection Mulan'],
  ['Colors of the Wind Pocahontas', 'Pocahontas', 'Colors Wind Pocahontas'], ['Go the Distance Hercules', 'Hercule', 'Distance Hercules'], ['Zero to Hero Hercules', 'Hercule', 'Zero Hero Hercules'],
  ['You\'ve Got a Friend in Me Randy Newman', 'Toy Story', 'Friend in Me Toy Story'], ['How Far I\'ll Go Moana', 'Vaiana', 'How Far Moana'], ['You\'re Welcome Dwayne Johnson', 'Vaiana', 'Welcome Moana'],
  ['We Don\'t Talk About Bruno', 'Encanto', 'Bruno Encanto'], ['Surface Pressure Encanto', 'Encanto', 'Surface Pressure Encanto'], ['I See the Light Tangled', 'Raiponce', 'See the Light Tangled'],
  ['Remember Me Coco', 'Coco', 'Remember Me Coco'], ['Supercalifragilisticexpialidocious', 'Mary Poppins', 'Supercalifragilisticexpialidocious Poppins'], ['Someday My Prince Will Come Snow White', 'Blanche-Neige et les Sept Nains', 'Prince Snow White'],
  ['Heigh-Ho Snow White', 'Blanche-Neige et les Sept Nains', 'Heigh Snow White'], ['Bibbidi-Bobbidi-Boo Cinderella', 'Cendrillon', 'Bibbidi Cinderella'], ['Everybody Wants to Be a Cat Aristocats', 'Les Aristochats', 'Cat Aristocats'],
  ['When You Wish Upon a Star Pinocchio', 'Pinocchio', 'Wish Upon Star Pinocchio'], ['Cruella De Vil 101 Dalmatians', 'Les 101 Dalmatiens', 'Cruella Dalmatians'], ['Almost There Princess and the Frog', 'La Princesse et la Grenouille', 'Almost There Princess Frog'],
  ['Try Everything Shakira', 'Zootopie', 'Try Everything Zootopia'], ['Hawaiian Roller Coaster Ride Lilo Stitch', 'Lilo et Stitch', 'Hawaiian Roller Lilo'], ['Bella Notte Lady and the Tramp', 'La Belle et le Clochard', 'Bella Notte Tramp'],
  ['Oo-De-Lally Robin Hood', 'Robin des Bois', 'Lally Robin Hood'], ['Mother Knows Best Tangled', 'Raiponce', 'Mother Knows Tangled'], ['Kiss the Girl Little Mermaid', 'La Petite Sirène', 'Kiss the Girl Mermaid'],
  ['A Whole New World Aladdin', 'Aladdin', 'Whole New World Aladdin'], ['Can You Feel the Love Tonight', 'Le Roi lion', 'Feel the Love Lion King'], ['Do You Want to Build a Snowman', 'La Reine des neiges', 'Snowman Frozen'],
  ['Gaston Beauty and the Beast song', 'La Belle et la Bête', 'Gaston Beauty Beast'], ['Prince Ali Aladdin', 'Aladdin', 'Prince Ali Aladdin'], ['I Just Can\'t Wait to Be King', 'Le Roi lion', 'Wait to Be King'],
  ['Strangers Like Me Phil Collins Tarzan', 'Tarzan', 'Strangers Tarzan'], ['You\'ll Be in My Heart Phil Collins', 'Tarzan', 'Be in My Heart Tarzan'], ['Wish Ariana DeBose This Wish', 'Wish', 'This Wish'],
  ['Scales and Arpeggios Aristocats', 'Les Aristochats', 'Scales Arpeggios Aristocats'], ['Trust in Me Jungle Book', 'Le Livre de la jungle', 'Trust in Me Jungle'], ['Show Yourself Frozen 2', 'La Reine des neiges 2', 'Show Yourself Frozen'],
  // Disney : encore plus de chansons
  ['For the First Time in Forever Frozen', 'La Reine des neiges', 'First Time Forever Frozen'], ['Love Is an Open Door Frozen', 'La Reine des neiges', 'Open Door Frozen'], ['Lost in the Woods Frozen 2', 'La Reine des neiges 2', 'Lost in the Woods'],
  ['Shiny Moana Tamatoa', 'Vaiana', 'Shiny Moana'], ['Dos Oruguitas Encanto', 'Encanto', 'Dos Oruguitas'], ['Un Poco Loco Coco', 'Coco', 'Poco Loco'], ['Be Prepared Lion King', 'Le Roi lion', 'Be Prepared Lion'],
  ['Arabian Nights Aladdin', 'Aladdin', 'Arabian Nights'], ['I Won\'t Say I\'m in Love Hercules', 'Hercule', 'Won\'t Say Hercules'], ['Just Around the Riverbend Pocahontas', 'Pocahontas', 'Riverbend Pocahontas'],
  ['Honor to Us All Mulan', 'Mulan', 'Honor Mulan'], ['Something There Beauty and the Beast', 'La Belle et la Bête', 'Something There Beauty'], ['I Wan\'na Be Like You Jungle Book', 'Le Livre de la jungle', 'Wanna Be Like You Jungle'],
  ['The Siamese Cat Song Lady and the Tramp', 'La Belle et le Clochard', 'Siamese Tramp'], ['You Can Fly Peter Pan', 'Peter Pan', 'You Can Fly Peter Pan'], ['Whistle While You Work Snow White', 'Blanche-Neige et les Sept Nains', 'Whistle Snow White'],
  ['I\'ve Got No Strings Pinocchio', 'Pinocchio', 'No Strings Pinocchio'], ['Pink Elephants on Parade Dumbo', 'Dumbo', 'Pink Elephants Dumbo'], ['A Spoonful of Sugar Mary Poppins', 'Mary Poppins', 'Spoonful Sugar Poppins'],
  ['Chim Chim Cher-ee Mary Poppins', 'Mary Poppins', 'Chim Poppins'], ['Two Worlds Phil Collins Tarzan', 'Tarzan', 'Two Worlds Tarzan'], ['Friends on the Other Side Princess and the Frog', 'La Princesse et la Grenouille', 'Friends Other Side'],
  ['Out There Hunchback of Notre Dame', 'Le Bossu de Notre-Dame', 'Out There Hunchback'], ['God Help the Outcasts Hunchback', 'Le Bossu de Notre-Dame', 'Outcasts Hunchback'], ['I\'m Still Here Treasure Planet', 'La Planète au trésor', 'Still Here Treasure Planet'],
  ['On My Way Phil Collins Brother Bear', 'Frère des ours', 'On My Way Brother Bear'], ['He Mele No Lilo Lilo and Stitch', 'Lilo et Stitch', 'Mele Lilo'], ['Immortals Fall Out Boy Big Hero 6', 'Les Nouveaux Héros', 'Immortals Big Hero'],
  ['Nobody Like U Turning Red', 'Alerte rouge', 'Nobody Like Turning Red'], ['Steady As She Goes Elemental', 'Élémentaire', 'Steady Elemental'], ['Strange Things Randy Newman Toy Story', 'Toy Story', 'Strange Things Toy Story'],
  ['Life Is a Highway Rascal Flatts Cars', 'Cars', 'Life Is a Highway'], ['Real Gone Sheryl Crow Cars', 'Cars', 'Real Gone'], ['When Will My Life Begin Tangled', 'Raiponce', 'Life Begin Tangled'],
  ['Poor Unfortunate Souls Little Mermaid', 'La Petite Sirène', 'Unfortunate Souls'], ['Belle Beauty and the Beast opening', 'La Belle et la Bête', 'Belle Beauty Beast'], ['Hellfire Hunchback of Notre Dame', 'Le Bossu de Notre-Dame', 'Hellfire Hunchback'],
  ['Mine Pocahontas song', 'Pocahontas', 'Mine Pocahontas'], ['Love Is a Song Bambi', 'Bambi', 'Bambi'], ['Baby Mine Dumbo', 'Dumbo', 'Baby Mine Dumbo'], ['Le Festin Camille', 'Ratatouille', 'Festin Ratatouille'],
  ['What Else Can I Do Encanto', 'Encanto', 'What Else Encanto'], ['Where You Are Moana', 'Vaiana', 'Where You Are Moana'], ['Speechless Naomi Scott Aladdin', 'Aladdin (2019)', 'Speechless Aladdin'],
  ['Feel It Still Portugal The Man', 'Les Bad Guys', 'Feel It Still'], ['Everything Is Awesome Lego Movie', 'La Grande Aventure Lego', 'Everything Is Awesome'],
  // DreamWorks, Illumination, Sony, Blue Sky…
  ['I\'m a Believer Smash Mouth Shrek', 'Shrek', 'Believer'], ['Hallelujah Rufus Wainwright Shrek', 'Shrek', 'Hallelujah Shrek'], ['Accidentally in Love Counting Crows', 'Shrek 2', 'Accidentally in Love'],
  ['Holding Out for a Hero Fairy Godmother Shrek 2', 'Shrek 2', 'Holding Out Hero Shrek'], ['I Like to Move It Madagascar', 'Madagascar', 'Move It Madagascar'], ['Kung Fu Fighting Kung Fu Panda', 'Kung Fu Panda', 'Kung Fu Fighting'],
  ['Can\'t Stop the Feeling Justin Timberlake Trolls', 'Les Trolls', 'Stop the Feeling'], ['When You Believe Prince of Egypt', 'Le Prince d’Égypte', 'When You Believe'], ['Here I Am Bryan Adams Spirit', 'Spirit, l’étalon des plaines', 'Here I Am Spirit'],
  ['Test Drive John Powell How to Train Your Dragon', 'Dragons', 'Test Drive Dragon'], ['Peaches Jack Black Super Mario Bros Movie', 'Super Mario Bros. le film', 'Peaches'], ['Sunflower Post Malone Swae Lee', 'Spider-Man : New Generation', 'Sunflower Spider-Verse'],
  ['I\'m Still Standing Taron Egerton Sing', 'Tous en scène', 'Still Standing Sing'], ['Despicable Me Pharrell Williams', 'Moi, moche et méchant', 'Despicable Me'], ['Rise Up Ice Age Scrat', 'L’Âge de glace', 'Ice Age'],
  ['Real in Rio Rio', 'Rio', 'Real in Rio'], ['Hey Ya Trolls', 'Les Trolls', 'Trolls'], ['Shake It Off Sing', 'Tous en scène', 'Sing'], ['Bang Bang Puss in Boots', 'Le Chat Potté', 'Puss in Boots'],
  ['Wonderful Life Hurts Wonder Park', 'Megamind', 'Megamind'], ['Remember Me Coco Miguel', 'Coco', 'Remember Me Coco'], ['Nobody\'s Fool Ice Age', 'L’Âge de glace', 'Ice Age'],
  ['Life\'s a Happy Song Muppets', 'Les Muppets', 'Muppets'], ['Married Life Michael Giacchino Up', 'Là-haut', 'Married Life'], ['Kiss the Girl Ashley Tisdale', 'La Petite Sirène', 'Kiss the Girl'],
]

// ——— Pop & R&B internationale ———
const POP = ['The Weeknd', 'Dua Lipa', 'Doja Cat', 'Bruno Mars', 'Imagine Dragons', 'Twenty One Pilots', 'Black Eyed Peas', 'Michael Jackson', 'Rihanna', 'Beyoncé', 'Taylor Swift',
  'Ariana Grande', 'Billie Eilish', 'Harry Styles', 'Ed Sheeran', 'Justin Bieber', 'Sabrina Carpenter', 'Olivia Rodrigo', 'Chappell Roan', 'SZA', 'Frank Ocean', 'Chris Brown', 'Usher',
  'Alicia Keys', 'Lady Gaga', 'Katy Perry', 'Selena Gomez', 'Shawn Mendes', 'Miley Cyrus', 'Post Malone', 'Coldplay', 'Maroon 5', 'OneRepublic', 'Sam Smith', 'Adele', 'Charli xcx',
  'Tate McRae', 'Benson Boone', 'Teddy Swims', 'Jason Derulo', 'Ne-Yo', 'Akon', 'Nelly Furtado', 'Britney Spears', 'Christina Aguilera', 'Mariah Carey', 'Whitney Houston', 'Prince',
  'Stevie Wonder', 'Madonna', 'George Michael', 'Janet Jackson', 'TLC', 'Destiny\'s Child', 'Daniel Caesar', 'Giveon', 'Khalid', 'Brent Faiyaz', 'Summer Walker', 'H.E.R.', 'Kehlani',
  'Lizzo', 'Ellie Goulding', 'Zara Larsson', 'Camila Cabello', 'Halsey', 'The Kid LAROI', 'Jung Kook', 'ROSÉ', 'Mark Ronson', 'Pharrell Williams', 'Justin Timberlake', 'Nelly', 'Jennifer Lopez']
// ——— Indie / alternatif ———
const INDIE = ['Mitski', 'Tame Impala', 'Cigarettes After Sex', 'Dominic Fike', 'James Blake', 'sombr', 'Arctic Monkeys', 'The Strokes', 'Mac DeMarco', 'Clairo', 'beabadoobee', 'Steve Lacy',
  'Rex Orange County', 'Phoebe Bridgers', 'Lorde', 'The 1975', 'Glass Animals', 'Hozier', 'Florence + The Machine', 'Lana Del Rey', 'The Neighbourhood', 'Wallows', 'Cage The Elephant',
  'Foster The People', 'MGMT', 'Vampire Weekend', 'Phoenix', 'Two Door Cinema Club', 'alt-J', 'Bon Iver', 'Beach House', 'Radiohead', 'The Smiths', 'The Cure', 'Pixies', 'Franz Ferdinand',
  'Kings of Leon', 'The Killers', 'Gorillaz', 'Laufey', 'Djo', 'Gracie Abrams', 'Men I Trust', 'Still Woozy', 'Joji', 'Faye Webster', 'Mazzy Star', 'The xx', 'Fleet Foxes', 'Arcade Fire',
  'Louise Attaque', "L'Impératrice", 'Air', 'Justice', 'Pomme', 'Clara Luciani', 'Juliette Armanet', 'Feu! Chatterton', 'La Femme', 'Odezenne', 'Hervé', 'November Ultra', 'Malik Djoudi']
// ——— Afro / Shatta / Afro-trap ———
const AFRO = ['Meryl', 'Aya Nakamura', 'Tiakola', 'MHD', 'Keblack', 'Nono La Grinta', 'Burna Boy', 'Wizkid', 'Davido', 'Rema', 'Tems', 'Ayra Starr', 'Asake', 'Fireboy DML', 'CKay',
  'Omah Lay', 'Tyla', 'Black Sherif', 'Mr Eazi', 'Joeboy', 'Kizz Daniel', 'Yemi Alade', 'Tiwa Savage', 'Fally Ipupa', "Innoss'B", 'Franglish', 'Naza', 'Dadju', 'Tayc', 'Ronisia',
  'Marwa Loud', 'Lartiste', 'Kalash', 'Admiral T', 'Krys', 'Nesly', 'Jahyanai King', 'Bamby', 'Magic System', 'DJ Arafat', 'Koffi Olomidé', 'Vegedream', 'Niska', 'Ninho', 'Soolking',
  'Locko', 'Charlotte Dipanda', 'Singuila', 'Hiro', 'Damso', 'Joé Dwèt Filé', 'Kaysha', 'Lynnsha', 'Fanny J', 'Slaï', 'Medhy Custos', 'Wizkid', 'Diamond Platnumz', 'Sauti Sol']

// ——— Voix françaises : qui chante en VF ? [recherche, voix (personnage), nom de la voix crédité comme artiste] ———
const VOIX = [
  ['Libérée délivrée Anaïs Delva', 'Anaïs Delva (Elsa, La Reine des neiges)', 'Anaïs Delva'], ['Sous l’océan Henri Salvador', 'Henri Salvador (Sébastien, La Petite Sirène)', 'Henri Salvador'],
  ['Partir là-bas Claire Guyot', 'Claire Guyot (Ariel, La Petite Sirène)', 'Claire Guyot'], ['Je suis ton ami Charlélie Couture', 'Charlélie Couture (Toy Story)', 'Charlélie Couture'],
  ['Prince Ali Richard Darbois', 'Richard Darbois (le Génie, Aladdin)', 'Richard Darbois'], ['Le bleu lumière Cerise Calixte', 'Cerise Calixte (Vaiana)', 'Cerise Calixte'],
  ['Pour les hommes Anthony Kavanagh', 'Anthony Kavanagh (Maui, Vaiana)', 'Anthony Kavanagh'], ['L’air du vent Laura Mayne', 'Laura Mayne (Pocahontas)', 'Laura Mayne'],
  ['Comme un homme Patrick Fiori', 'Patrick Fiori (Shang, Mulan)', 'Patrick Fiori'], ['Ce rêve bleu Karine Costa', 'Karine Costa (Jasmine, Aladdin)', 'Karine Costa'],
  ['Ce rêve bleu Paolo Domingo', 'Paolo Domingo (Aladdin)', 'Paolo Domingo'], ['Où est la vraie vie Maeva Méline', 'Maeva Méline (Raiponce)', 'Maeva Méline'],
  ['Le Festin Camille Ratatouille', 'Camille (Le Festin, Ratatouille)', 'Camille'], ['Un jour mon prince viendra Lucie Dolène', 'Lucie Dolène (Blanche-Neige)', 'Lucie Dolène'],
  ['Je voudrais un bonhomme de neige Emmylou Homs', 'Emmylou Homs (Anna, La Reine des neiges)', 'Emmylou Homs'], ['La Garde du Roi Lion Corneille', 'Corneille (La Garde du Roi lion)', 'Corneille'],
]
async function voix(liste) {
  const out = []
  const rates = []
  for (const [q, reponse, nom] of liste) {
    const l = (await dz(`/search?q=${encodeURIComponent(q)}&limit=10`))?.data ?? []
    // La voix doit être créditée comme artiste du morceau (pas une reprise)
    const t = l.find((x) => x.preview && norm(x.artist?.name).includes(norm(nom)))
    if (t) out.push({ ...item(t, reponse), f: [[{ fr: 'Chanson', en: 'Song' }, t.title_short ?? t.title], [{ fr: 'Voix', en: 'Voice' }, reponse], [{ fr: 'Album', en: 'Album' }, t.album?.title]] })
    else rates.push(nom)
    await pause(120)
  }
  if (rates.length) console.log(`  voix introuvables : ${rates.join(', ')}`)
  return out
}

const quoi = process.argv[2]
if (!quoi || quoi === 'extraits') {
  const existants = JSON.parse(await readFile('public/packs/culture/extraits.json', 'utf8'))
  const ids = new Set(existants.map((x) => x.id))
  const nouveaux = (await artistes(EXTRAITS, 5)).filter((x) => !ids.has(x.id) && ids.add(x.id))
  await ecrire('extraits', [...existants, ...nouveaux])
}
if (!quoi || quoi === 'rap') { await ecrire('rap-fr', await artistes(RAP_FR, 5)); await ecrire('rap-us', await artistes(RAP_US, 5)) }
if (!quoi || quoi === 'pop') await ecrire('pop-inter', await artistes(POP, 5))
if (!quoi || quoi === 'indie') await ecrire('indie', await artistes(INDIE, 5))
if (!quoi || quoi === 'afro') await ecrire('afro', await artistes(AFRO, 5))
if (!quoi || quoi === 'jeux') await ecrire('musiques-jeux', await recherches(JEUX))
if (!quoi || quoi === 'films') await ecrire('musiques-films', await recherches(FILMS))
if (!quoi || quoi === 'disney') await ecrire('chansons-disney', await recherches(DISNEY))
if (!quoi || quoi === 'voix') await ecrire('voix-vf', await voix(VOIX))
