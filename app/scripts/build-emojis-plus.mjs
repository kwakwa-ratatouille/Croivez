// Quiz en émojis, suite : on garde les entrées d'origine (Facile) et on ajoute des entrées de plus en plus subtiles
// (une scène, un détail culte, un jeu de mots plutôt que le sujet). Chaque ligne : [émojis, réponse fr, réponse en].
// Usage : node scripts/build-emojis-plus.mjs
import { readFile, writeFile } from 'node:fs/promises'

const AJOUTS = {
  'emojis-jeux': [
    // Moyen
    ['🍄🏎️🍌🐢', 'Mario Kart'], ['👻🍒🟡🍓', 'Pac-Man (fantômes)'], ['🟦🟨🟥⬇️🧱', 'Tetris'], ['🐒🛢️🔨👸', 'Donkey Kong (1981)'], ['🧑‍🌾🐔🥕🏡', 'Stardew Valley'],
    ['🔫🏝️🪂🚌', 'PUBG'], ['🚗⚽🥅💥', 'Rocket League'], ['🎤🕺📺🎶', 'SingStar'], ['🦕🍬⭐🌸', 'Yoshi'], ['🐦😡🐷🏹', 'Angry Birds'],
    ['🔪🦺🚀🗳️', 'Among Us'], ['🏰🗡️🐉👑', 'The Elder Scrolls'], ['🧟🌻🌱🧠', 'Plants vs. Zombies'], ['🍬🍭💥🍫', 'Candy Crush'], ['🐟🐍🦊🌍', 'Spore'],
    ['🎸🎤🥁⭐', 'Guitar Hero'], ['🦊⛷️🐻‍❄️', 'Crash Bandicoot'], ['🐉🔥💎🟣', 'Spyro'], ['🤖🔩👨‍🔧🔫', 'Ratchet & Clank'], ['🐱🕶️🎩💰', 'Sly Cooper'],
    // Difficile
    ['🔺🔺🔺🧝‍♂️⚔️🌋', 'Zelda : Ocarina of Time'], ['🏙️🚔💵🌴', 'GTA Vice City'], ['🧭🏴‍☠️💍🗿', 'Uncharted'], ['🍄🌌⭐🚀', 'Super Mario Galaxy'], ['🧑‍🚀🔫🛡️💍', 'Halo'],
    ['🐺🗡️🧙‍♀️🎴', 'The Witcher 3'], ['🧠💊🌊🏙️', 'BioShock'], ['🧑‍🦯🤖🦊🏹', 'Horizon Zero Dawn'], ['💀🔥🗡️🏰', 'Dark Souls'], ['🌳💍👑🐴', 'Elden Ring'],
    ['🏃‍♂️🏢🦘🔴', 'Mirror’s Edge'], ['⚾🧢🐶🌀', 'EarthBound'], ['🐙🦑🎨🔫', 'Splatoon'], ['🐉💧🗡️🌀', 'Monster Hunter'], ['🦋🌀📸⏪', 'Life is Strange'],
    ['🤖🎭🧑‍🦱🏙️', 'Detroit: Become Human'], ['🐦⚫🔦🌲', 'Alan Wake'], ['🦇🏙️🃏🏥', 'Batman: Arkham'], ['🧟‍♂️🌆🌙🏃', 'Dying Light'], ['🎮🔺⏸️🌀', 'Portal 2'],
    // Expert
    ['🌹🐉🗡️🦴', 'Hades'], ['🐞🗡️🌧️🏚️', 'Hollow Knight'], ['🏔️🍓💜💨', 'Celeste'], ['❤️🐐🧑🦴', 'Undertale'], ['🦊⚔️🌳🔮', 'Tunic'],
    ['☕🧙‍♂️🃏🎰', 'Balatro'], ['🦉🌌🪐⏳', 'Outer Wilds'], ['🎈👁️🎪🔦', 'Little Nightmares'], ['📦🧔🏻‍♂️🌧️👶', 'Death Stranding'], ['🧛‍♂️🪓📜🗝️', 'Castlevania'],
    ['🎨🖌️🌕🧑‍🎨', 'Clair Obscur : Expedition 33'], ['🐀🔥👦👧', 'A Plague Tale'], ['🧑‍🚀🌱🥔🚀', 'Astroneer'], ['🧑‍🌾🐄🌾🚜', 'Farming Simulator'], ['🐟🌊🗺️🔦', 'Subnautica'],
    ['🦗🌾👦🏡', 'Grounded'], ['🕵️‍♂️🧥🪃🏢', 'Hitman'], ['🦅🏛️🗡️🏴', 'Assassin’s Creed Origins'], ['🐻🌲⚒️🏕️', 'Valheim'], ['🧱🦖🌋🔨', 'ARK'],
  ],
  'emojis-series': [
    ['👑🗡️🐉🔥', 'House of the Dragon'], ['🏚️🔦🧒👾🚲', 'Stranger Things (saison 1)'], ['🦸‍♂️🩸🇺🇸🥛', 'The Boys'], ['🧑‍🍳🔪🍝😤', 'Top Chef'], ['🎓🧛‍♀️🏫🖤', 'Buffy contre les vampires'],
    ['🏝️🐷🚿😂', 'Les Marseillais'], ['💍👨‍👩‍👧‍👦🏠💬', 'Modern Family'], ['🧔🏽‍♂️💊🏥🦯', 'Dr House'], ['🔍🎻🧥🇬🇧', 'Sherlock'], ['👩‍🏫🧪🚬⚗️', 'Breaking Bad (Walter White)'],
    ['🐉🔶⚡👊🏻', 'Dragon Ball Z'], ['🍜🧑‍🦱🗡️🏯', 'Demon Slayer'], ['☠️🍖🧑🏻‍🦱⛵', 'One Piece'], ['👊🥚🧑‍🦲', 'One Punch Man'], ['🧪👦🏻🐿️🌀', 'Rick et Morty'],
    ['🦁👨‍⚖️🏛️💼', 'Suits'], ['🍷👨‍👨‍👦‍👦🏰🥂', 'Succession'], ['🎤🏫🎭📸', 'Riverdale'], ['📞👨‍🍳🏨🌴', 'The White Lotus'], ['🕵️‍♀️🌲🧬🏚️', 'Dark'],
    ['🧑‍⚕️🚑👩‍⚕️🏥', 'Urgences'], ['👨‍👩‍👦🍩🟡', 'Les Simpson (famille)'], ['⛪🔪🧔🏻🌲', 'True Detective'], ['🤖👨‍🔬🐴🏜️', 'Westworld (parc)'], ['💸🎲🧑‍🤝‍🧑🔴', 'Alice in Borderland'],
    ['🏫🍷🎶🎤', 'High School Musical'], ['🧙‍♀️🖤🏫🦇', 'Les Nouvelles Aventures de Sabrina'], ['👨‍👩‍👧‍👦🏠🇫🇷😂', 'Scènes de ménages'], ['🍔🏪😐🧑‍🍳', 'Bob’s Burgers'], ['🏰⚔️🍞🍷🤣', 'Kaamelott (Perceval)'],
    // Plus subtil
    ['🧇🎄👦🏻🔦', 'Stranger Things (Eleven)'], ['🔴📕👩🏻🔒', 'The Handmaid’s Tale'], ['🌊🏝️🔢✈️', 'Lost (les nombres)'], ['🎹🧑🏻‍🦰🦷🔪', 'Dexter'], ['🧑🏻‍🦲🕶️🌵💊', 'Breaking Bad (Heisenberg)'],
    ['🧑‍🚀🔴🌍🎖️', 'The Expanse'], ['🧛‍♂️🏠🇳🇿📹', 'What We Do in the Shadows'], ['🍰🧑‍🍳🇫🇷🏆', 'Le Meilleur Pâtissier'], ['🦢🏰👸🏼🕰️', 'Bridgerton'], ['🎲🧝🌲📜', 'Le Seigneur des anneaux : Les Anneaux de pouvoir'],
    ['🧑🏻‍✈️🧠💭🏙️', 'Severance'], ['🐻🍳🔪🇺🇸', 'The Bear (cuisine)'], ['📺🏢👔🇫🇷😂', 'Caméra Café'], ['🚓🏙️🇫🇷🍩', 'Brooklyn Nine-Nine'], ['🦆👨‍👦🌲🔍', 'Twin Peaks'],
  ],
  'emojis-pays': [
    ['🦘🐨🏄', 'Australie (faune)'], ['🍁🏒🫎', 'Canada (hockey)'], ['🧀🍫⌚🏔️', 'Suisse (spécialités)'], ['🌷🚲🧀💧', 'Pays-Bas (tulipes)'], ['🦁🌍🏞️💎', 'Afrique du Sud'],
    ['🐫🏜️🕌🌴', 'Maroc'], ['🗿🌊🏝️', 'Chili (île de Pâques)'], ['🍝🏛️🛵', 'Italie (Rome)'], ['🐉🏮🥢🧧', 'Chine (Nouvel An)'], ['🐘🛕🍛🪷', 'Inde (temples)'],
    ['☕💃⚽🥥', 'Colombie'], ['🌋🗻🍣🌸', 'Japon (Fuji)'], ['🍺🥨🏰🚗', 'Allemagne (Bavière)'], ['🐑🏉🌋🥝', 'Nouvelle-Zélande'], ['🧊🌋♨️🐎', 'Islande'],
    ['🎻🏰🍰🎿', 'Autriche'], ['🛶🌲🦌🎅', 'Norvège'], ['🧖‍♂️🌲🦌🎮', 'Finlande (saunas)'], ['🌮🌵🎺💀', 'Mexique (Día de los muertos)'], ['🍷🧀🥖🚴', 'France (Tour de France)'],
    ['🏔️🛕🧘‍♂️🦬', 'Népal'], ['🐼🎋🧧🏯', 'Chine (pandas)'], ['🍵🐘🏏🏝️', 'Sri Lanka'], ['🦜🌴🍫🌋', 'Costa Rica'], ['🐂💃🥘☀️', 'Espagne (corrida, paella)'],
    ['🥥🛺🐘🛕', 'Thaïlande (tuk-tuk)'], ['🧉🥩💃⚽', 'Argentine (maté, tango)'], ['🏺🛕🐫🪔', 'Égypte (pharaons)'], ['🫖🎡💂🌧️', 'Royaume-Uni (Londres)'], ['🍀🍺🎻🌧️', 'Irlande (pubs)'],
    // Plus subtil
    ['🌊🧜‍♀️🏰🧱', 'Danemark'], ['🦢🎼🌲🛁', 'Finlande (Sibelius)'], ['🐻🪆🚀❄️', 'Russie'], ['🧆🕌🛶🌉', 'Turquie (Istanbul)'], ['🐟🍶🛕🎎', 'Japon (traditions)'],
    ['🍫🍺🍟🧇', 'Belgique'], ['⛰️🦙🧶🌽', 'Pérou'], ['🥭🦓🌋🏃', 'Kenya'], ['🏝️🐢🌋🦎', 'Équateur (Galápagos)'], ['🎭🛶🍝🏛️', 'Italie (Venise)'],
    ['🦩🍹🎺🚗', 'Cuba'], ['🐧🧊🏔️🔬', 'Antarctique'], ['🌶️🪇🌵🌮', 'Mexique (cuisine)'], ['🍕🍝⚽🛵', 'Italie (Naples)'], ['🦜🏖️🎉🥁', 'Brésil (carnaval)'],
  ],
  'emojis-expressions': [
    ['🐻🦶👀', 'Vendre la peau de l’ours avant de l’avoir tué'], ['🐱🏃‍♂️🐁💃', 'Quand le chat n’est pas là, les souris dansent'], ['🧈🍞🔪', 'C’est du pain béni'], ['🦆🦆🦆🎨', 'Ne pas casser trois pattes à un canard'], ['🥚🍳🔨', 'On ne fait pas d’omelette sans casser des œufs'],
    ['🐟🛁💧', 'Noyer le poisson'], ['🐴👄🦷', 'Avoir une dent contre quelqu’un'], ['🧠🐟', 'Avoir une mémoire de poisson rouge'], ['🌶️👃', 'La moutarde me monte au nez'], ['🐓🛏️⏰', 'Se coucher avec les poules'],
    ['👅🗡️🗡️', 'Avoir la langue bien pendue'], ['🐺🏃‍♂️👄', 'Quand on parle du loup, on en voit la queue'], ['🍰🍒', 'La cerise sur le gâteau'], ['🧂🧂👀', 'Mettre son grain de sel'], ['💰🌳🍃', 'L’argent ne pousse pas sur les arbres'],
    ['🌧️☀️🌈', 'Après la pluie, le beau temps'], ['🐌🏃‍♂️🐢', 'Rien ne sert de courir, il faut partir à point'], ['🦊🧀🐦⬛', 'Le corbeau et le renard'], ['🍞🛒🔥', 'Se vendre comme des petits pains'], ['🎈💨😤', 'Dégonfler la baudruche'],
    // Plus subtil
    ['🐔🥚🤔', 'L’œuf ou la poule'], ['🧑‍🦲🐜🧠', 'Avoir une araignée au plafond'], ['🍐✂️2️⃣', 'Couper la poire en deux'], ['🦵🏃‍♂️🧹', 'Prendre ses jambes à son cou'], ['🐮🐦👀🇪🇸', 'Parler comme une vache espagnole'],
    ['🎣👢🌊', 'Tomber dans le panneau'], ['🕯️🎂🔥💸', 'Le jeu n’en vaut pas la chandelle'], ['🐇🎩📅', 'Poser un lapin'], ['🪡🧶🏠', 'De fil en aiguille'], ['🥖🧑‍🍳🍞', 'Avoir du pain sur la planche'],
    ['🦷🐔', 'Quand les poules auront des dents (bis)'], ['🌊🥛🔥', 'Soupe au lait'], ['🧲🧒👀', 'Être tiré à quatre épingles'], ['🐄🪦🏃', 'Courir sur le haricot'], ['🏹🪢🎯', 'Avoir plus d’une corde à son arc'],
    ['🌹🌵🙂', 'Il n’y a pas de rose sans épines'], ['🐒🌳🎓', 'On n’apprend pas à un vieux singe à faire la grimace'], ['💧🏺💥', 'La goutte d’eau qui fait déborder le vase'], ['🪨🐦🐦', 'Faire d’une pierre deux coups (bis)'], ['🍯🐝🐻', 'Il ne faut pas réveiller l’ours qui dort'],
  ],
}

for (const [id, ajout] of Object.entries(AJOUTS)) {
  const f = `public/packs/culture/${id}.json`
  const base = JSON.parse(await readFile(f, 'utf8')).filter((x) => !String(x.id).includes('-p'))
  // Réponses en double évitées ; les variantes « (bis) », « (saison 1) »… sont retirées : la réponse doit rester le vrai nom
  const propre = (s) => s.replace(/\s*\([^)]*\)\s*$/, '')
  // Une même réponse peut revenir avec d'autres émojis (indices différents) ; seules les suites identiques sont écartées
  const vus = new Set(base.map((x) => x.n.fr))
  const nouveaux = ajout.map(([e, fr, en]) => [e, propre(fr), propre(en ?? fr)]).filter(([e]) => !vus.has(e) && (vus.add(e), true))
  const items = [...base, ...nouveaux.map(([e, fr, en], i) => ({ id: `${id}-p${i}`, n: { fr: e, en: e }, r: { fr, en } }))]
  await writeFile(f, JSON.stringify(items))
  console.log(`${id} : ${items.length} (dont ${nouveaux.length} nouveaux)`)
}
