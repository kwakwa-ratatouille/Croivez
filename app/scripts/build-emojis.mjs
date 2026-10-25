// Quiz en émojis écrits à la main : séries, jeux vidéo, expressions, pays.
// Usage : node scripts/build-emojis.mjs
import { writeFile } from 'node:fs/promises'

const T = (fr, en = fr) => ({ fr, en })
const ecrire = (id, items) => writeFile(`public/packs/culture/${id}.json`, JSON.stringify(items)).then(() => console.log(`${id} : ${items.length}`))
const paquet = (id, lignes) => lignes.map(([n, r, en], i) => ({ id: `${id}-${i}`, n: T(n), r: T(r, en || r) }))

await ecrire('emojis-series', paquet('emser', [
  ['🐉👑❄️⚔️', 'Game of Thrones'], ['🧪💰🚐', 'Breaking Bad'], ['🚲👦🔦👾', 'Stranger Things'], ['☕🛋️👫👫👫', 'Friends'], ['🦑💵🔴🟢', 'Squid Game'],
  ['🏦🎭🔴', 'La Casa de Papel', 'Money Heist'], ['👑🇬🇧', 'The Crown'], ['🧟‍♂️🔫🚔', 'The Walking Dead'], ['🍩🟡👨‍👩‍👧‍👦', 'Les Simpson', 'The Simpsons'], ['🧽🍍🌊', 'Bob l’éponge', 'SpongeBob SquarePants'],
  ['♟️👩‍🦰', 'Le Jeu de la dame', 'The Queen’s Gambit'], ['🖤🎻🏫', 'Mercredi', 'Wednesday'], ['🏥❤️🩺', 'Grey’s Anatomy'], ['🎩🔪🇬🇧', 'Peaky Blinders'], ['🕵️‍♂️🎻🇬🇧', 'Sherlock'],
  ['🎭🇫🇷🎩💎', 'Lupin'], ['⚔️🏰🍖', 'Kaamelott'], ['🧔🪓🌊', 'Vikings'], ['🍳👨‍🍳🍝', 'The Bear'], ['👨‍💼📄😬', 'The Office'],
  ['🤖🤠🎢', 'Westworld'], ['🧙‍♂️🐺⚔️', 'The Witcher'], ['🚀🪐🤠', 'The Mandalorian'], ['👽🔦📁', 'X-Files'], ['🏝️✈️🔢', 'Lost'],
  ['🍕🐢🥋', 'Les Tortues Ninja', 'Teenage Mutant Ninja Turtles'], ['🧠🔬😂', 'The Big Bang Theory'], ['🎤👩‍🎤🏫', 'Glee'], ['🌙💍🦋', 'Sailor Moon'], ['🏴‍☠️🍖👒', 'One Piece'],
  ['🍜🦊🍥', 'Naruto'], ['⚽🥅🇯🇵', 'Olive et Tom', 'Captain Tsubasa'], ['🐉🔶⭐', 'Dragon Ball'], ['🏰👹🗡️', 'L’Attaque des Titans', 'Attack on Titan'], ['📓💀🍎', 'Death Note'],
]))

await ecrire('emojis-jeux', paquet('emjv', [
  ['🍄👨‍🔧👸', 'Super Mario'], ['⚡🐭🔴⚪', 'Pokémon'], ['⛏️🟩🧱', 'Minecraft'], ['🦔💨💍', 'Sonic'], ['🗡️🧝‍♂️🛡️👸', 'Zelda'],
  ['🚗💥🌴🔫', 'GTA'], ['🏗️🪂🎯', 'Fortnite'], ['🔴🔵🔪🚀', 'Among Us'], ['🟨👻🍒', 'Pac-Man'], ['🧱🔽🟦', 'Tetris'],
  ['🏎️🍌🐢', 'Mario Kart'], ['🦍🛢️🍌', 'Donkey Kong'], ['🐻🍯🏝️', 'Animal Crossing'], ['🐄🌾🧑‍🌾', 'Stardew Valley'], ['⚽🚗💥', 'Rocket League'],
  ['🧟🏹🌍🍄', 'The Last of Us'], ['🏹🐎🤠', 'Red Dead Redemption'], ['🪓⚡👦', 'God of War'], ['🏴‍☠️🗡️🦅', 'Assassin’s Creed'], ['👊🥋🇯🇵', 'Street Fighter'],
  ['🎶💃🕹️', 'Just Dance'], ['🏰🐉🧙', 'Skyrim'], ['🐦😡🐷', 'Angry Birds'], ['🍬🍭💥', 'Candy Crush'], ['🪐🤖🔫', 'Halo'],
  ['🧑‍🚀🔧🕳️', 'Portal'], ['🦊🛸🚀', 'Star Fox'], ['🌸⚔️🌋', 'Kirby'], ['👨‍🔬💉🧟', 'Resident Evil'], ['🃏🎩🦸‍♂️', 'Persona'],
]))

await ecrire('emojis-expressions', paquet('emexp', [
  ['🐱🌳', 'Avoir un chat dans la gorge'], ['🌧️🐱🐶', 'Il pleut des cordes'], ['🐟🪣🫧', 'Être comme un poisson dans l’eau'], ['🍰🫠', 'C’est du gâteau'], ['🐔🦷', 'Quand les poules auront des dents'],
  ['🥕🥕🍳', 'Les carottes sont cuites'], ['🦵👯', 'Casser les pieds'], ['🐮🇪🇸🗣️', 'Parler français comme une vache espagnole'], ['🥖⏰', 'Long comme un jour sans pain'], ['❤️🥬💔', 'Avoir un cœur d’artichaut'],
  ['🐑🔟', 'Compter les moutons'], ['🧀🍷🍐', 'Entre la poire et le fromage'], ['🌙👀', 'Être dans la lune'], ['🐌💨🚫', 'Avancer comme un escargot'], ['🧈🧈💰', 'Vouloir le beurre et l’argent du beurre'],
  ['🐘🏪🍽️', 'Comme un éléphant dans un magasin de porcelaine'], ['⛏️🧠', 'Se creuser la tête'], ['👁️🐟', 'Avoir l’œil'], ['🔥🛢️🛢️', 'Mettre de l’huile sur le feu'], ['🥚🧺', 'Mettre tous ses œufs dans le même panier'],
  ['🐺🐺', 'Être connu comme le loup blanc'], ['🍅😳', 'Rougir comme une tomate'], ['🐦🐦🗿', 'Faire d’une pierre deux coups'], ['💤🛌🌹', 'La nuit porte conseil'], ['🐴👄🎁', 'À cheval donné, on ne regarde pas les dents'],
]))

await ecrire('emojis-pays', paquet('empays', [
  ['🗼🥐🧀', 'France'], ['🍕🍝🏛️', 'Italie', 'Italy'], ['🍣🗻🌸', 'Japon', 'Japan'], ['🌮🌵🎺', 'Mexique', 'Mexico'], ['🦘🐨🏄', 'Australie', 'Australia'],
  ['🗽🍔🦅', 'États-Unis', 'United States'], ['☕🌴⚽💃', 'Brésil', 'Brazil'], ['🫖💂👑', 'Royaume-Uni', 'United Kingdom'], ['🍁🏒🦫', 'Canada'], ['🥨🍺🚗', 'Allemagne', 'Germany'],
  ['🐼🏯🥟', 'Chine', 'China'], ['🐘🍛🕌', 'Inde', 'India'], ['🌷🚲🧀', 'Pays-Bas', 'Netherlands'], ['🧇🍫🍟', 'Belgique', 'Belgium'], ['🏔️🧀⌚🍫', 'Suisse', 'Switzerland'],
  ['🥘💃🐂', 'Espagne', 'Spain'], ['🐫🏜️🔺', 'Égypte', 'Egypt'], ['🦁🦒🌍', 'Kenya'], ['🐻‍❄️🪆❄️', 'Russie', 'Russia'], ['🏛️🫒⛵', 'Grèce', 'Greece'],
  ['🍀🍺🎻', 'Irlande', 'Ireland'], ['🦙⛰️🏛️', 'Pérou', 'Peru'], ['🥩💃🧉', 'Argentine', 'Argentina'], ['🌋🐑🏉', 'Nouvelle-Zélande', 'New Zealand'], ['🛕🐘🌶️🏝️', 'Thaïlande', 'Thailand'],
  ['🪵🦌🎅', 'Finlande', 'Finland'], ['🥢🎤🇰🇷', 'Corée du Sud', 'South Korea'], ['🐯🌋🏝️', 'Indonésie', 'Indonesia'], ['🕌🧿☕', 'Turquie', 'Turkey'], ['🐟🦞⛪🍷', 'Portugal'],
]))
