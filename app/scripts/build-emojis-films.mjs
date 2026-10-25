// Films en émojis : les 60 premiers (Facile) sont gardés tels quels, puis des films de plus en plus durs.
// Plus on monte, moins les émojis sont littéraux (on évoque une scène, un jeu de mots, un détail culte).
// Chaque ligne : [émojis, titre français, titre anglais]. Rangées de la plus évidente à la plus pointue.
// Usage : node scripts/build-emojis-films.mjs
import { readFile, writeFile } from 'node:fs/promises'

const MOYEN = [
  ['🐀👨‍🍳🍲🇫🇷', 'Ratatouille', 'Ratatouille'], ['🦇🃏🌃🏙️', 'The Dark Knight', 'The Dark Knight'], ['🐼🥋🥟🐢', 'Kung Fu Panda 2', 'Kung Fu Panda 2'],
  ['🧸🤠🚀👦', 'Toy Story 2', 'Toy Story 2'], ['🐙🐟🔎🐋', 'Le Monde de Dory', 'Finding Dory'], ['🦁🦓🦒🦛🏝️', 'Madagascar', 'Madagascar'],
  ['🦸‍♂️🛡️⚔️🦸‍♀️🌍', 'Avengers', 'The Avengers'], ['🤖🔴🟡💰🦾', 'Iron Man', 'Iron Man'], ['🕷️🧑‍🎓🏙️🕸️', 'Spider-Man: Homecoming', 'Spider-Man: Homecoming'],
  ['🧟‍♂️🧟‍♀️🌍🏃', 'World War Z', 'World War Z'], ['🦖🏞️🎢🧬', 'Jurassic World', 'Jurassic World'], ['🍫🏭🎩🍬', 'Wonka', 'Wonka'],
  ['🌹🧔‍♂️🏰📚', 'La Belle et la Bête (2017)', 'Beauty and the Beast (2017)'], ['🐭🍝🐕🌙', 'La Belle et le Clochard', 'Lady and the Tramp'], ['🐶🐶🐶🐾🧥', 'Les 101 Dalmatiens', '101 Dalmatians'],
  ['🦊🐰🚓🏙️', 'Zootopie', 'Zootopia'], ['🦸‍♂️🦹‍♀️🔵🧠', 'Megamind', 'Megamind'], ['🐉👦🔥🏝️', 'Dragons 2', 'How to Train Your Dragon 2'],
  ['👧👻🛁🏮', 'Le Voyage de Chihiro', 'Spirited Away'], ['🌳🐻🚌☔', 'Mon voisin Totoro', 'My Neighbor Totoro'], ['🏰🔥🧙‍♂️🚶', 'Le Château ambulant', 'Howl’s Moving Castle'],
  ['🍯🐝🎥🥛', 'Bee Movie', 'Bee Movie'], ['🐠🦈🎤🌊', 'Gang de requins', 'Shark Tale'], ['🧟‍♀️🎃🎄💀', 'L’Étrange Noël de M. Jack', 'The Nightmare Before Christmas'],
  ['👨‍🚀👽🔵🌴', 'Avatar', 'Avatar'], ['🐒🦍🗽🔫', 'La Planète des singes : Les Origines', 'Rise of the Planet of the Apes'], ['🧑‍🦱⚡🦉🏰', 'Harry Potter à l’école des sorciers', 'Harry Potter and the Philosopher’s Stone'],
  ['🥋👦🧓🪰🥢', 'Karaté Kid', 'The Karate Kid'], ['🏎️🔥💨🏁👨‍👩‍👧', 'Fast and Furious', 'The Fast and the Furious'], ['🕵️‍♂️🍸🔫7️⃣', 'James Bond 007 contre Dr No', 'Dr. No'],
  ['👸❄️🌳🍂', 'La Reine des neiges 2', 'Frozen II'], ['🏴‍☠️👦🧚‍♀️⏰🐊', 'Peter Pan', 'Peter Pan'],
  ['🐘🐁🎩🍯', 'Le Livre de la jungle', 'The Jungle Book'], ['🦍🌴🧔‍♂️👩🏼', 'Tarzan', 'Tarzan'], ['🏛️💪🔥⚡🐎', 'Hercule', 'Hercules'],
  ['🗡️👩🏻🐉🇨🇳', 'Mulan', 'Mulan'], ['🍃🪶🧑🏻‍🦱🛶', 'Pocahontas', 'Pocahontas'], ['🔔⛪🧝‍♂️🌹', 'Le Bossu de Notre-Dame', 'The Hunchback of Notre Dame'],
  ['💇‍♀️🗼🦎🍳', 'Raiponce', 'Tangled'], ['🕹️👊🍬🏎️', 'Les Mondes de Ralph', 'Wreck-It Ralph'], ['🦹‍♂️👧👧👧🍌', 'Moi, moche et méchant', 'Despicable Me'],
  ['🎤🐨🐷🐘🦍', 'Tous en scène 2', 'Sing 2'], ['🐿️🌰🧊⏳', 'L’Âge de glace 2', 'Ice Age: The Meltdown'], ['🏈💀🎃🦴', 'Les Noces funèbres', 'Corpse Bride'],
  ['🌈🦄🧸💖', 'Les Trolls', 'Trolls'], ['🐾🐶🐕🐩🚓', 'La Pat’ Patrouille, le film', 'PAW Patrol: The Movie'], ['🍄👨🔧🐢👸', 'Super Mario Bros. le film', 'The Super Mario Bros. Movie'],
  ['🦔💙💍⚡', 'Sonic, le film', 'Sonic the Hedgehog'], ['🧙‍♀️🍭🏠🌳', 'Hansel et Gretel', 'Hansel & Gretel'], ['🧑‍🍳🍝😤🔪', 'The Menu', 'The Menu'],
  ['🎮🏙️🙋‍♂️🤖', 'Free Guy', 'Free Guy'], ['👧🏻💗🧸🏙️', 'Barbie', 'Barbie'], ['💣☢️🧑‍🔬🇺🇸', 'Oppenheimer', 'Oppenheimer'],
]
const DIFFICILE = [
  ['🍷🏰🧔⚔️⏳🚽', 'Les Visiteurs', 'The Visitors'], ['⛷️🏔️👨‍👩‍👧🍷🥖', 'Les Bronzés font du ski', 'French Fried Vacation 2'], ['👮‍♂️🌊🏖️🎺🇫🇷', 'Le Gendarme de Saint-Tropez', 'The Troops of St. Tropez'],
  ['🍽️🤡📞🔙', 'Le Dîner de cons', 'The Dinner Game'], ['🍀👩🏻‍🦰🗼💌📸', 'Le Fabuleux Destin d’Amélie Poulain', 'Amélie'], ['🎼👦👦🏫🧑‍🏫✈️', 'Les Choristes', 'The Chorus'],
  ['🧔🏻🐗🐍👑🏜️', 'Astérix et Obélix : Mission Cléopâtre', 'Asterix & Obelix: Mission Cleopatra'], ['🕵️‍♂️🐫🇪🇬😏🐔', 'OSS 117 : Le Caire, nid d’espions', 'OSS 117: Cairo, Nest of Spies'], ['🚕💨🇫🇷👨‍✈️🏎️', 'Taxi', 'Taxi'],
  ['🔪🚿🏨👵', 'Psychose', 'Psycho'], ['🍔💼🕴️🕴️💉', 'Pulp Fiction', 'Pulp Fiction'], ['💛🗡️👟🥋🩸', 'Kill Bill', 'Kill Bill'],
  ['🧼👊🍽️🏢', 'Fight Club', 'Fight Club'], ['🐴🛏️🍊🤵', 'Le Parrain', 'The Godfather'], ['🍸🃏🎰🇲🇪', 'Casino Royale', 'Casino Royale'],
  ['🦢⚫🩰🪞', 'Black Swan', 'Black Swan'], ['🛸🎹🏔️🥔', 'Rencontres du troisième type', 'Close Encounters of the Third Kind'], ['🏐🏝️📦✈️', 'Seul au monde', 'Cast Away'],
  ['🐑🔇🧑‍⚕️🍷🦋', 'Le Silence des agneaux', 'The Silence of the Lambs'], ['👦👀👻🔴', 'Sixième Sens', 'The Sixth Sense'], ['🥁🩸👨‍🏫🎷', 'Whiplash', 'Whiplash'],
  ['🎷🌆🌟💃🎹', 'La La Land', 'La La Land'], ['🐻❄️🏹😤', 'The Revenant', 'The Revenant'], ['🕰️👴➡️👶', 'L’Étrange Histoire de Benjamin Button', 'The Curious Case of Benjamin Button'],
  ['🤫👂👹🌽', 'Sans un bruit', 'A Quiet Place'], ['🙈📦🐦🚣', 'Bird Box', 'Bird Box'], ['✈️🌊🗽👨‍✈️', 'Sully', 'Sully'],
  ['🐒🚀🌌🦴', '2001, l’Odyssée de l’espace', '2001: A Space Odyssey'], ['🚂🧟‍♂️🇰🇷', 'Dernier train pour Busan', 'Train to Busan'], ['🪨🍑🏠🌧️', 'Parasite', 'Parasite'],
  ['🎭😈🃏🪜', 'Joker : Folie à deux', 'Joker: Folie à Deux'], ['🦖🌍🎢🧪💥', 'Jurassic World : Fallen Kingdom', 'Jurassic World: Fallen Kingdom'], ['💍🗡️🌋👁️', 'Le Retour du roi', 'The Return of the King'],
  ['🗽🌊❄️🐺', 'Le Jour d’après', 'The Day After Tomorrow'], ['🌍💥☄️🛢️', 'Armageddon', 'Armageddon'], ['🦈🌪️🌊😱', 'Sharknado', 'Sharknado'],
  ['👠🌇💸🛍️', 'Pretty Woman', 'Pretty Woman'], ['🏴‍☠️💀💰⚓🗺️', 'L’Île au trésor', 'Treasure Island'],
  ['🎩🐇🃏⏰', 'Alice au pays des merveilles (2010)', 'Alice in Wonderland (2010)'], ['👃🧥🎨⚔️', 'Cyrano de Bergerac', 'Cyrano de Bergerac'], ['🦁✝️🚪❄️', 'Le Monde de Narnia', 'The Chronicles of Narnia'],
  ['🧠💭🎥🔁', 'Un jour sans fin', 'Groundhog Day'], ['🎂🔪📼📞', 'Scream', 'Scream'], ['👩‍👧🏚️👐🎵', 'Conjuring', 'The Conjuring'],
  ['🎯🏹🍎👦', 'Robin des Bois', 'Robin Hood'], ['🦇🧛‍♂️🏰🌕🇷🇴', 'Dracula', 'Dracula'], ['🚢⚓🐳📖', 'Au cœur de l’océan', 'In the Heart of the Sea'],
  ['🎤👑🎸🦷', 'Bohemian Rhapsody', 'Bohemian Rhapsody'], ['🏀🐰👽🏆', 'Space Jam', 'Space Jam'], ['🧪💚🧔‍♂️😡', 'L’Incroyable Hulk', 'The Incredible Hulk'],
]
const EXPERT = [
  ['🪒🍊⚙️🎩🥛', 'Orange mécanique', 'A Clockwork Orange'], ['🪓🚪🏨👧👧🩸', 'Shining', 'The Shining'], ['✂️✋🏰❄️💇', 'Edward aux mains d’argent', 'Edward Scissorhands'],
  ['🌧️☂️💃🎤🎬', 'Chantons sous la pluie', 'Singin’ in the Rain'], ['🧠🔁📸🖊️🩲', 'Memento', 'Memento'], ['🐦🐦🐦🏫😱', 'Les Oiseaux', 'The Birds'],
  ['🏨🎂💐🔑🏔️', 'The Grand Budapest Hotel', 'The Grand Budapest Hotel'], ['🌹🛏️👨‍💼🧔', 'American Beauty', 'American Beauty'], ['🐟🐟🍞🍷🧔🏽', 'La Vie de Brian', 'Life of Brian'],
  ['🛁🔫👔🎵🏙️', 'Le Loup de Wall Street', 'The Wolf of Wall Street'], ['🌽🏟️👻⚾', 'Jusqu’au bout du rêve', 'Field of Dreams'], ['🧔🏻‍♂️🐟🗡️👊', 'Old Boy', 'Oldboy'],
  ['🏔️🐐👧🧀', 'Heidi', 'Heidi'], ['💒🎉🍽️😰📸', 'Le Sens de la fête', 'C’est la vie!'], ['🐄🎤🤟👨‍👩‍👧', 'La Famille Bélier', 'The Bélier Family'],
  ['🔫🥃👨‍👧🎹🧓', 'Les Tontons flingueurs', 'Monsieur Gangster'], ['🎩🦶🚶‍♂️🏰🧔🏻', 'La Grande Vadrouille', 'Don’t Look Now… We’re Being Shot At!'],
  ['🧑‍🍳🎺🍷👨‍👦', 'Les Aventures de Rabbi Jacob', 'The Mad Adventures of Rabbi Jacob'], ['💈🪒🩸🎼🏙️', 'Sweeney Todd', 'Sweeney Todd'], ['🌋🦖🦕⏳🔬', 'Le Monde perdu', 'The Lost World'],
  ['🧳🎻🚂👦🇬🇧', 'Paddington', 'Paddington'], ['🧑‍🦯🎹🎶🍾', 'Ray', 'Ray'], ['🃏🎲🎰🧮🏙️', 'Las Vegas 21', '21'],
  ['🧑‍🚀🌑🔙🎥', 'Apollo 13', 'Apollo 13'], ['🏃‍♂️🏅🇬🇧⛪', 'Les Chariots de feu', 'Chariots of Fire'],
  
  ['🦍🎹✈️🏢', 'King Kong (1933)', 'King Kong (1933)'], ['🎪🐘😢👂', 'Dumbo (2019)', 'Dumbo (2019)'], ['🎭🎹🕯️🚣‍♂️', 'Le Fantôme de l’Opéra', 'The Phantom of the Opera'],
  ['🌌🚀🧔‍♂️🕹️🐱', 'Les Gardiens de la Galaxie', 'Guardians of the Galaxy'], ['🍑🌲🧔‍♂️📬', 'Call Me by Your Name', 'Call Me by Your Name'], ['🎩🐇🎪🪄🔍', 'Le Prestige', 'The Prestige'],
  ['🐠🎬🧔🏽🌊🎨', 'La Vie aquatique', 'The Life Aquatic with Steve Zissou'], ['🌻🚐👧🏆💃', 'Little Miss Sunshine', 'Little Miss Sunshine'],
  ['🧠🌸💔🧹', 'Eternal Sunshine of the Spotless Mind', 'Eternal Sunshine of the Spotless Mind'], ['🏚️🎥🌲🧙‍♀️', 'Le Projet Blair Witch', 'The Blair Witch Project'], ['📼👧📺🌀', 'Le Cercle', 'The Ring'],
  ['👁️🎈🎪🤡🚌', 'Ça : Chapitre 2', 'It Chapter Two'], ['🦋🌀⏪📓', 'L’Effet papillon', 'The Butterfly Effect'], ['🧘‍♂️🥋🐉🌕🇭🇰', 'Tigre et Dragon', 'Crouching Tiger, Hidden Dragon'],
  ['🎞️🔥🎬🇮🇹👦', 'Cinema Paradiso', 'Cinema Paradiso'], ['🚲🇮🇹👨‍👦😢', 'Le Voleur de bicyclette', 'Bicycle Thieves'], ['🎈🏡🧓👦🏻🇫🇷', 'Le Ballon rouge', 'The Red Balloon'],
]

const fichier = 'public/packs/culture/emojis-films.json'
const base = JSON.parse(await readFile(fichier, 'utf8')).slice(0, 60) // les 60 d'origine (Facile)
const deja = new Set(base.map((x) => x.r.fr))
const ajout = [...MOYEN, ...DIFFICILE, ...EXPERT].filter(([, fr]) => !deja.has(fr) && (deja.add(fr), true))
const items = [...base, ...ajout.map(([e, fr, en], i) => ({ id: `emo-${60 + i}`, n: { fr: e, en: e }, r: { fr, en } }))]
await writeFile(fichier, JSON.stringify(items))
console.log(`emojis-films : ${items.length} (dont ${ajout.length} nouveaux)`)
