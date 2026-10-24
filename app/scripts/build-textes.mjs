// Quiz écrits à la main (pas de source automatique fiable) : émojis, répliques, slogans, expressions…
// Chaque liste va du plus connu au plus pointu. Usage : node scripts/build-textes.mjs
import { readFile, writeFile } from 'node:fs/promises'

const T = (fr, en = fr) => ({ fr, en })
const ecrire = (id, items) => writeFile(`public/packs/culture/${id}.json`, JSON.stringify(items)).then(() => console.log(`${id} : ${items.length}`))
// [énoncé, réponse fr, réponse en?, détail?] → élément de pack
const paquet = (id, lignes, opts = {}) => lignes.map(([n, r, ren, d], i) => ({
  id: `${id}-${i}`,
  n: typeof n === 'string' ? T(n, opts.nEn?.[i] ?? n) : n,
  r: T(r, ren || r),
  ...(d ? { d: T(d) } : {}),
  ...(opts.g ? { g: opts.g(r) } : {}),
}))

// ——— Films en émojis ———
await ecrire('emojis-films', paquet('emo', [
  ['🦁👑', 'Le Roi lion', 'The Lion King'], ['🚢🧊💔', 'Titanic'], ['🧙‍♂️⚡👓', 'Harry Potter'], ['🦖🏝️🚙', 'Jurassic Park'], ['❄️👸⛄', 'La Reine des neiges', 'Frozen'],
  ['🐠🔍', 'Le Monde de Nemo', 'Finding Nemo'], ['🕷️👨', 'Spider-Man'], ['🦇👨🌃', 'Batman'], ['👻🚫📞', 'SOS Fantômes', 'Ghostbusters'], ['🤖❤️🌱', 'WALL-E'],
  ['🐀👨‍🍳🇫🇷', 'Ratatouille'], ['🎈🏠👴', 'Là-haut', 'Up'], ['🧸🤠🚀', 'Toy Story'], ['🦈🏖️😱', 'Les Dents de la mer', 'Jaws'], ['👽📞🏠', 'E.T. l’extra-terrestre', 'E.T. the Extra-Terrestrial'],
  ['💍🌋🧝', 'Le Seigneur des anneaux', 'The Lord of the Rings'], ['⭐⚔️🌌', 'Star Wars'], ['🕶️💊🐇', 'Matrix', 'The Matrix'], ['🏃‍♂️🍫🪶', 'Forrest Gump'], ['🐼🥋', 'Kung Fu Panda'],
  ['👸🐸💋', 'La Princesse et la Grenouille', 'The Princess and the Frog'], ['🧞‍♂️🪔🐒', 'Aladdin'], ['🌹👹📚', 'La Belle et la Bête', 'Beauty and the Beast'], ['🐟🧜‍♀️🔱', 'La Petite Sirène', 'The Little Mermaid'], ['🍫🏭🎩', 'Charlie et la Chocolaterie', 'Charlie and the Chocolate Factory'],
  ['🟢👹🏰🫏', 'Shrek'], ['🐭🏰✨', 'Cendrillon', 'Cinderella'], ['🧪🐊', 'Hulk'], ['🏴‍☠️🦜💀🌊', 'Pirates des Caraïbes', 'Pirates of the Caribbean'], ['⏰🚗⚡', 'Retour vers le futur', 'Back to the Future'],
  ['🦍🏙️✈️', 'King Kong'], ['🎤🐨🎹', 'Tous en scène', 'Sing'], ['🍌💛👓', 'Les Minions', 'Minions'], ['🐉🧔‍♂️🔥', 'Dragons', 'How to Train Your Dragon'], ['🐘👂🎪', 'Dumbo'],
  ['🌊🌺🐔', 'Vaiana', 'Moana'], ['💀🎸🌼', 'Coco'], ['🧠😄😢😡', 'Vice-versa', 'Inside Out'], ['🚗⚡🏁', 'Cars'], ['🐻🍯🎈', 'Winnie l’ourson', 'Winnie the Pooh'],
  ['🏹🔥👧', 'Hunger Games', 'The Hunger Games'], ['🔨⚡🌩️', 'Thor'], ['🛡️🇺🇸', 'Captain America'], ['🪐🚀⏳🌽', 'Interstellar'], ['🃏🤡🃏', 'Joker'],
  ['🧛‍♂️🏨👻', 'Hôtel Transylvanie', 'Hotel Transylvania'], ['🏚️🎈🤡', 'Ça', 'It'], ['👨‍🚀🥔🔴', 'Seul sur Mars', 'The Martian'], ['🌀🛌🏙️', 'Inception'], ['🦸‍♂️👨‍👩‍👧‍👦', 'Les Indestructibles', 'The Incredibles'],
  ['🐷🕸️', 'Le Petit Monde de Charlotte', 'Charlotte’s Web'], ['🌪️👠🦁', 'Le Magicien d’Oz', 'The Wizard of Oz'], ['🥊🐯🏃', 'Rocky'], ['🦍🦍🪐', 'La Planète des singes', 'Planet of the Apes'], ['👦🏠🎄🪤', 'Maman, j’ai raté l’avion !', 'Home Alone'],
  ['🎩🐇⏰🍵', 'Alice au pays des merveilles', 'Alice in Wonderland'], ['🍷🧀🇫🇷🥖', 'Bienvenue chez les Ch’tis'], ['🦌🤴🌲', 'Bambi'], ['🧊🦣🐿️', 'L’Âge de glace', 'Ice Age'], ['🧑‍🦽🤝🧑🏿', 'Intouchables', 'The Intouchables'],
]))

// ——— Répliques cultes ———
await ecrire('repliques', paquet('rep', [
  ['« Que la Force soit avec toi. »', 'Star Wars'], ['« Je suis ton père. »', 'L’Empire contre-attaque', 'The Empire Strikes Back'], ['« Hasta la vista, baby. »', 'Terminator 2'], ['« Je reviendrai. »', 'Terminator'], ['« Mon précieux… »', 'Le Seigneur des anneaux', 'The Lord of the Rings'],
  ['« Vers l’infini et au-delà ! »', 'Toy Story'], ['« Hakuna matata ! »', 'Le Roi lion', 'The Lion King'], ['« Je suis le roi du monde ! »', 'Titanic'], ['« La vie, c’est comme une boîte de chocolats. »', 'Forrest Gump'], ['« E.T. téléphone maison. »', 'E.T. l’extra-terrestre', 'E.T. the Extra-Terrestrial'],
  ['« Libérée, délivrée ! »', 'La Reine des neiges', 'Frozen'], ['« Houston, nous avons un problème. »', 'Apollo 13'], ['« Pourquoi tant de sérieux ? »', 'The Dark Knight'], ['« Je vais lui faire une offre qu’il ne pourra pas refuser. »', 'Le Parrain', 'The Godfather'], ['« Avec un grand pouvoir vient une grande responsabilité. »', 'Spider-Man'],
  ['« C’est pas faux. »', 'Kaamelott'], ['« Le gras, c’est la vie ! »', 'Kaamelott'], ['« Sur un malentendu, ça peut marcher. »', 'Les Bronzés font du ski'], ['« Okayyy ! »', 'Les Visiteurs'], ['« C’est une bonne situation, ça, scribe ? »', 'Astérix et Obélix : Mission Cléopâtre'],
  ['« Je s’appelle Groot. »', 'Les Gardiens de la Galaxie', 'Guardians of the Galaxy'], ['« Je suis Iron Man. »', 'Iron Man'], ['« Wakanda forever ! »', 'Black Panther'], ['« Continue de nager. »', 'Le Monde de Nemo', 'Finding Nemo'], ['« Ohana, ça veut dire famille. »', 'Lilo et Stitch', 'Lilo & Stitch'],
  ['« Il y a un serpent dans ma botte ! »', 'Toy Story'], ['« Je vois des gens qui sont morts. »', 'Sixième Sens', 'The Sixth Sense'], ['« La première règle du Fight Club… »', 'Fight Club'], ['« Pilule rouge ou pilule bleue ? »', 'Matrix', 'The Matrix'], ['« Tu ne passeras pas ! »', 'Le Seigneur des anneaux', 'The Lord of the Rings'],
  ['« Mon nom est Bond, James Bond. »', 'James Bond'], ['« L’hiver vient. »', 'Game of Thrones'], ['« Dis bonjour à mon petit ami ! »', 'Scarface'], ['« Si j’avais su, j’aurais pas venu. »', 'La Guerre des boutons'], ['« C’est cela, oui… »', 'Le père Noël est une ordure'],
  ['« T’as d’beaux yeux, tu sais. »', 'Le Quai des brumes'], ['« Atmosphère, atmosphère ! »', 'Hôtel du Nord'], ['« Bizarre, vous avez dit bizarre ? »', 'Drôle de drame'], ['« Les cons, ça ose tout. »', 'Les Tontons flingueurs'], ['« Here’s Johnny ! »', 'Shining', 'The Shining'],
]))

// ——— Super-héros : identité secrète ———
await ecrire('superheros', paquet('sh', [
  ['Batman', 'Bruce Wayne'], ['Spider-Man', 'Peter Parker'], ['Superman', 'Clark Kent'], ['Iron Man', 'Tony Stark'], ['Wonder Woman', 'Diana Prince'],
  ['Captain America', 'Steve Rogers'], ['Hulk', 'Bruce Banner'], ['Black Widow', 'Natasha Romanoff'], ['Wolverine', 'Logan'], ['Flash', 'Barry Allen'],
  ['Catwoman', 'Selina Kyle'], ['Black Panther', 'T’Challa'], ['Doctor Strange', 'Stephen Strange'], ['Aquaman', 'Arthur Curry'], ['Captain Marvel', 'Carol Danvers'],
  ['Deadpool', 'Wade Wilson'], ['Robin', 'Dick Grayson'], ['Supergirl', 'Kara Zor-El'], ['Ant-Man', 'Scott Lang'], ['Daredevil', 'Matt Murdock'],
  ['Green Lantern', 'Hal Jordan'], ['Hawkeye', 'Clint Barton'], ['Le Faucon', 'Sam Wilson'], ['La Sorcière rouge', 'Wanda Maximoff'], ['Miss Marvel', 'Kamala Khan'],
  ['Le Professeur X', 'Charles Xavier'], ['Magneto', 'Erik Lehnsherr'], ['Tornade', 'Ororo Munroe'], ['Cyclope', 'Scott Summers'], ['Le Joker', 'Arthur Fleck'],
  ['Venom', 'Eddie Brock'], ['Le Punisher', 'Frank Castle'], ['Ghost Rider', 'Johnny Blaze'], ['Batgirl', 'Barbara Gordon'], ['Shazam', 'Billy Batson'],
  ['Le Soldat de l’Hiver', 'Bucky Barnes'], ['Star-Lord', 'Peter Quill'], ['Moon Knight', 'Marc Spector'],
]))

// ——— Slogans publicitaires ———
await ecrire('slogans', paquet('slo', [
  ['« Just do it. »', 'Nike'], ['« I’m lovin’ it. »', 'McDonald’s'], ['« Think different. »', 'Apple'], ['« Parce que vous le valez bien. »', 'L’Oréal'], ['« Red Bull donne des ailes. »', 'Red Bull'],
  ['« Impossible is nothing. »', 'Adidas'], ['« Have a break, have a KitKat. »', 'KitKat'], ['« Venez comme vous êtes. »', 'McDonald’s'], ['« What else ? »', 'Nespresso'], ['« Haribo, c’est beau la vie, pour les grands et les petits. »', 'Haribo'],
  ['« Ouvre un Coca-Cola, ouvre du bonheur. »', 'Coca-Cola'], ['« Finger lickin’ good. »', 'KFC'], ['« Connecting people. »', 'Nokia'], ['« Un Mars, et ça repart ! »', 'Mars'], ['« Je positive ! »', 'Carrefour'],
  ['« Le contrat de confiance. »', 'Darty'], ['« Nous allons vous faire préférer le train. »', 'SNCF'], ['« Le bon sens près de chez vous. »', 'Crédit Agricole'], ['« Tous unis contre la vie chère. »', 'Intermarché'], ['« Das Auto. »', 'Volkswagen'],
  ['« Le plaisir de conduire. »', 'BMW'], ['« Taste the rainbow. »', 'Skittles'], ['« Broadcast yourself. »', 'YouTube'], ['« Melts in your mouth, not in your hands. »', 'M&M’s'], ['« Il y a des choses qui ne s’achètent pas. »', 'Mastercard'],
  ['« Le meilleur pour l’homme. »', 'Gillette'], ['« L’effet Axe. »', 'Axe'], ['« Lapeyre, y’en a pas deux ! »', 'Lapeyre'], ['« Today, tomorrow, Toyota. »', 'Toyota'], ['« Do you speak Micro Machines ? »', 'Micro Machines'],
  ['« La banque d’un monde qui change. »', 'BNP Paribas'], ['« Every little helps. »', 'Tesco'], ['« Tu t’es vu quand t’as bu ? »', 'Sécurité routière', 'French road safety'], ['« La force tranquille. »', 'François Mitterrand (1981)'], ['« Because I’m worth it. »', 'L’Oréal'],
]))

// ——— Dessins animés : de quel dessin animé vient ce personnage ? ———
await ecrire('dessins-animes', paquet('da', [
  ['Bob l’éponge', 'Bob l’éponge', 'SpongeBob SquarePants'], ['Homer Simpson', 'Les Simpson', 'The Simpsons'], ['Scooby-Doo', 'Scooby-Doo'], ['Pikachu', 'Pokémon'], ['Bugs Bunny', 'Looney Tunes'],
  ['Tom et Jerry', 'Tom et Jerry', 'Tom and Jerry'], ['Patrick l’étoile de mer', 'Bob l’éponge', 'SpongeBob SquarePants'], ['Bart Simpson', 'Les Simpson', 'The Simpsons'], ['Titi et Grosminet', 'Looney Tunes'], ['Peppa', 'Peppa Pig'],
  ['Stewie Griffin', 'Les Griffin', 'Family Guy'], ['Eric Cartman', 'South Park'], ['Rick et Morty', 'Rick et Morty', 'Rick and Morty'], ['Totally Spies : Sam, Clover et Alex', 'Totally Spies!'], ['Ladybug et Chat Noir', 'Miraculous'],
  ['Oggy', 'Oggy et les Cafards', 'Oggy and the Cockroaches'], ['Gumball Watterson', 'Le Monde incroyable de Gumball', 'The Amazing World of Gumball'], ['Finn et Jake', 'Adventure Time'], ['Phinéas et Ferb', 'Phinéas et Ferb', 'Phineas and Ferb'], ['Bluey', 'Bluey'],
  ['Les Pierrafeu', 'Les Pierrafeu', 'The Flintstones'], ['Fred et Daphné', 'Scooby-Doo'], ['Kim Possible', 'Kim Possible'], ['Ben Tennyson', 'Ben 10'], ['Aang', 'Avatar, le dernier maître de l’air', 'Avatar: The Last Airbender'],
  ['Les Schtroumpfs', 'Les Schtroumpfs', 'The Smurfs'], ['Arthur et Mike Drummond', 'Arthur'], ['Caillou', 'Caillou'], ['Corneil et Bernie', 'Corneil et Bernie', 'Watchdog & Bernie'], ['Code Lyoko : Aelita', 'Code Lyoko'],
  ['Mabel et Dipper', 'Souvenirs de Gravity Falls', 'Gravity Falls'], ['Dexter', 'Le Laboratoire de Dexter', 'Dexter’s Laboratory'], ['Les Super Nanas', 'Les Super Nanas', 'The Powerpuff Girls'], ['Courage', 'Courage, le chien froussard', 'Courage the Cowardly Dog'], ['Marsupilami', 'Marsupilami'],
  ['Il était une fois… Maestro', 'Il était une fois… la Vie', 'Once Upon a Time… Life'], ['Inspecteur Gadget', 'Inspecteur Gadget', 'Inspector Gadget'], ['Les Razmoket', 'Les Razmoket', 'Rugrats'], ['Doug Funnie', 'Doug'], ['Garfield', 'Garfield'],
  ['Yakko, Wakko et Dot', 'Les Animaniacs', 'Animaniacs'], ['Minus et Cortex', 'Minus et Cortex', 'Pinky and the Brain'], ['Johnny Bravo', 'Johnny Bravo'], ['Rantanplan', 'Lucky Luke'], ['Titeuf', 'Titeuf'],
]))

// ——— Expressions françaises : que signifie… ———
await ecrire('expressions', paquet('exp', [
  ['Poser un lapin', 'Ne pas venir à un rendez-vous'], ['Avoir le cafard', 'Être triste, déprimé'], ['Coûter les yeux de la tête', 'Être très cher'], ['Tomber dans les pommes', 'S’évanouir'], ['Avoir un poil dans la main', 'Être paresseux'],
  ['Mettre les pieds dans le plat', 'Aborder maladroitement un sujet délicat'], ['Raconter des salades', 'Mentir, inventer des histoires'], ['Avoir la pêche', 'Être en pleine forme'], ['Casser les pieds', 'Ennuyer, importuner'], ['Donner sa langue au chat', 'Renoncer à deviner'],
  ['Avoir la tête dans les nuages', 'Être distrait, rêveur'], ['Prendre ses jambes à son cou', 'S’enfuir en courant'], ['Il pleut des cordes', 'Il pleut très fort'], ['Être une poule mouillée', 'Être peureux'], ['Faire la grasse matinée', 'Se lever tard'],
  ['Avoir un chat dans la gorge', 'Être enroué'], ['Se mettre le doigt dans l’œil', 'Se tromper complètement'], ['Tourner autour du pot', 'Ne pas aller droit au but'], ['Avoir les dents longues', 'Être très ambitieux'], ['Mettre la main à la pâte', 'Participer au travail'],
  ['Passer une nuit blanche', 'Ne pas dormir de la nuit'], ['Avoir le cœur sur la main', 'Être très généreux'], ['Couper les cheveux en quatre', 'Être trop pointilleux'], ['Mettre la charrue avant les bœufs', 'Faire les choses dans le mauvais ordre'],
  ['Avoir du pain sur la planche', 'Avoir beaucoup de travail'], ['Faire d’une pierre deux coups', 'Obtenir deux résultats en une seule action'], ['Être au pied du mur', 'Ne plus pouvoir reculer'], ['Jeter l’éponge', 'Abandonner'], ['Avoir le bras long', 'Avoir de l’influence'],
  ['Se faire rouler dans la farine', 'Se faire duper'], ['Mettre de l’eau dans son vin', 'Modérer ses exigences'], ['Avoir la main verte', 'Être doué pour le jardinage'], ['Être sur la sellette', 'Être dans une position menacée'], ['Tirer les vers du nez', 'Faire parler quelqu’un'],
  ['Avoir un cœur d’artichaut', 'Tomber facilement amoureux'], ['Fier comme un pou', 'Très fier, orgueilleux'], ['Mi-figue, mi-raisin', 'Mitigé, ni content ni mécontent'], ['Chercher midi à quatorze heures', 'Compliquer les choses inutilement'], ['Être fleur bleue', 'Être sentimental, romantique'],
  ['Payer en monnaie de singe', 'Ne pas payer, payer en belles paroles'], ['Se tenir à carreau', 'Rester prudent, éviter les ennuis'], ['Faire chou blanc', 'Échouer'], ['Prendre la mouche', 'Se vexer soudainement'], ['Battre la campagne', 'Divaguer, dire n’importe quoi'],
  ['Avoir maille à partir', 'Avoir un différend avec quelqu’un'], ['Tirer le diable par la queue', 'Avoir du mal à joindre les deux bouts'], ['Être chocolat', 'Être déçu, privé de ce qu’on espérait'], ['Sucrer les fraises', 'Trembler, devenir gâteux'], ['Avoir les yeux plus gros que le ventre', 'Vouloir plus que ce qu’on peut avaler ou faire'],
]))

// ——— Gentilés : comment appelle-t-on les habitants de… ———
await ecrire('gentiles', paquet('gen', [
  ['Paris', 'Les Parisiens'], ['Marseille', 'Les Marseillais'], ['Lyon', 'Les Lyonnais'], ['Bordeaux', 'Les Bordelais'], ['Lille', 'Les Lillois'],
  ['Nice', 'Les Niçois'], ['Toulouse', 'Les Toulousains'], ['Nantes', 'Les Nantais'], ['Strasbourg', 'Les Strasbourgeois'], ['Montpellier', 'Les Montpelliérains'],
  ['Rennes', 'Les Rennais'], ['Reims', 'Les Rémois'], ['Saint-Étienne', 'Les Stéphanois'], ['Le Havre', 'Les Havrais'], ['Grenoble', 'Les Grenoblois'],
  ['Dijon', 'Les Dijonnais'], ['Angers', 'Les Angevins'], ['Nîmes', 'Les Nîmois'], ['Tours', 'Les Tourangeaux'], ['Limoges', 'Les Limougeauds'],
  ['Clermont-Ferrand', 'Les Clermontois'], ['Besançon', 'Les Bisontins'], ['Metz', 'Les Messins'], ['Pau', 'Les Palois'], ['Perpignan', 'Les Perpignanais'],
  ['Caen', 'Les Caennais'], ['Rouen', 'Les Rouennais'], ['Brest', 'Les Brestois'], ['Le Mans', 'Les Manceaux'], ['Amiens', 'Les Amiénois'],
  ['Poitiers', 'Les Poitevins'], ['Annecy', 'Les Annéciens'], ['Saint-Malo', 'Les Malouins'], ['Monaco', 'Les Monégasques'], ['Bourges', 'Les Berruyers'],
  ['Charleville-Mézières', 'Les Carolomacériens'], ['Pont-à-Mousson', 'Les Mussipontains'], ['Saint-Denis', 'Les Dionysiens'], ['Troyes', 'Les Troyens'], ['Laval', 'Les Lavallois'],
  ['Épinal', 'Les Spinaliens'], ['Mulhouse', 'Les Mulhousiens'], ['Chalon-sur-Saône', 'Les Chalonnais'], ['Saint-Brieuc', 'Les Briochins'], ['Périgueux', 'Les Pétrocoriens'],
  ['Le Puy-en-Velay', 'Les Ponots'], ['Bourg-en-Bresse', 'Les Burgiens'], ['Évreux', 'Les Ébroïciens'], ['Saint-Lô', 'Les Saint-Lois'], ['Moscou', 'Les Moscovites'],
  ['Madagascar', 'Les Malgaches'], ['Le Costa Rica', 'Les Costaricains'], ['Chypre', 'Les Chypriotes'], ['Le Yémen', 'Les Yéménites'], ['Le Lesotho', 'Les Basothos'],
]))

// ——— Phobies : de quoi a-t-on peur ? ———
await ecrire('phobies', paquet('pho', [
  ['L’arachnophobie', 'Les araignées'], ['La claustrophobie', 'Les espaces clos'], ['L’acrophobie', 'Le vide, les hauteurs'], ['L’agoraphobie', 'Les espaces publics et la foule'], ['L’aérodromophobie', 'Prendre l’avion'],
  ['L’hydrophobie', 'L’eau'], ['La coulrophobie', 'Les clowns'], ['L’ophiophobie', 'Les serpents'], ['La nyctophobie', 'Le noir, la nuit'], ['La glossophobie', 'Parler en public'],
  ['L’hématophobie', 'Le sang'], ['La cynophobie', 'Les chiens'], ['L’ailurophobie', 'Les chats'], ['L’entomophobie', 'Les insectes'], ['La trypophobie', 'Les petits trous regroupés'],
  ['La nosocomephobie', 'Les hôpitaux'], ['La thanatophobie', 'La mort'], ['L’astraphobie', 'L’orage, la foudre'], ['La musophobie', 'Les souris'], ['L’ornithophobie', 'Les oiseaux'],
  ['La dentophobie', 'Le dentiste'], ['La bélonéphobie', 'Les aiguilles'], ['La triskaïdékaphobie', 'Le nombre 13'], ['L’apiphobie', 'Les abeilles'], ['La phasmophobie', 'Les fantômes'],
  ['La nomophobie', 'Être sans son téléphone'], ['L’émétophobie', 'Vomir'], ['La mysophobie', 'La saleté, les microbes'], ['L’amaxophobie', 'Conduire une voiture'], ['La gamophobie', 'Le mariage'],
  ['La pogonophobie', 'Les barbes'], ['La sélachophobie', 'Les requins'], ['La papyrophobie', 'Le papier'], ['L’anatidaephobie', 'Être observé par un canard'], ['L’hippopotomonstrosesquippedaliophobie', 'Les mots très longs'],
  ['La chronophobie', 'Le temps qui passe'], ['La pyrophobie', 'Le feu'], ['La batrachophobie', 'Les grenouilles et crapauds'], ['L’ergophobie', 'Le travail'], ['La philophobie', 'Tomber amoureux'],
]))

// ——— Cris des animaux ———
await ecrire('cris', paquet('cri', [
  ['Le chien', 'Il aboie'], ['Le chat', 'Il miaule'], ['La vache', 'Elle meugle'], ['Le cheval', 'Il hennit'], ['Le lion', 'Il rugit'],
  ['Le mouton', 'Il bêle'], ['Le cochon', 'Il grogne'], ['Le loup', 'Il hurle'], ['Le serpent', 'Il siffle'], ['La poule', 'Elle caquette'],
  ['Le coq', 'Il chante'], ['L’âne', 'Il brait'], ['Le canard', 'Il cancane'], ['La grenouille', 'Elle coasse'], ['Le cerf', 'Il brame'],
  ['L’éléphant', 'Il barrit'], ['Le corbeau', 'Il croasse'], ['L’abeille', 'Elle bourdonne'], ['Le pigeon', 'Il roucoule'], ['La souris', 'Elle couine'],
  ['Le hibou', 'Il hulule'], ['La chèvre', 'Elle chevrote'], ['Le tigre', 'Il feule'], ['Le dindon', 'Il glougloute'], ['La cigale', 'Elle stridule'],
  ['Le merle', 'Il flûte'], ['L’hirondelle', 'Elle gazouille'], ['L’ours', 'Il gronde'], ['Le renard', 'Il glapit'], ['La cigogne', 'Elle claquette'],
  ['Le paon', 'Il criaille'], ['Le chameau', 'Il blatère'], ['Le sanglier', 'Il grommelle'], ['La pie', 'Elle jacasse'], ['Le crocodile', 'Il vagit'],
  ['Le rhinocéros', 'Il barète'], ['La tourterelle', 'Elle gémit'], ['Le lapin', 'Il clapit'], ['Le perroquet', 'Il jase'], ['La chouette', 'Elle chuinte'],
]))

// ——— Sigles et acronymes ———
await ecrire('sigles', paquet('sig', [
  ['SNCF', 'Société nationale des chemins de fer français'], ['ONU', 'Organisation des Nations unies'], ['NASA', 'National Aeronautics and Space Administration'], ['OVNI', 'Objet volant non identifié'], ['SMS', 'Short Message Service'],
  ['PDG', 'Président-directeur général'], ['TGV', 'Train à grande vitesse'], ['RATP', 'Régie autonome des transports parisiens'], ['UE', 'Union européenne'], ['OMS', 'Organisation mondiale de la santé'],
  ['ADN', 'Acide désoxyribonucléique'], ['HLM', 'Habitation à loyer modéré'], ['SAMU', 'Service d’aide médicale urgente'], ['GPS', 'Global Positioning System'], ['FBI', 'Federal Bureau of Investigation'],
  ['VTT', 'Vélo tout-terrain'], ['BD', 'Bande dessinée'], ['JO', 'Jeux olympiques'], ['SMIC', 'Salaire minimum interprofessionnel de croissance'], ['TVA', 'Taxe sur la valeur ajoutée'],
  ['CDI', 'Contrat à durée indéterminée'], ['RER', 'Réseau express régional'], ['PIB', 'Produit intérieur brut'], ['OTAN', 'Organisation du traité de l’Atlantique Nord'], ['UNESCO', 'Organisation des Nations unies pour l’éducation, la science et la culture'],
  ['LASER', 'Light Amplification by Stimulated Emission of Radiation'], ['RADAR', 'Radio Detection and Ranging'], ['URL', 'Uniform Resource Locator'], ['PDF', 'Portable Document Format'], ['WWW', 'World Wide Web'],
  ['FIFA', 'Fédération internationale de football association'], ['CNRS', 'Centre national de la recherche scientifique'], ['INSEE', 'Institut national de la statistique et des études économiques'], ['CIA', 'Central Intelligence Agency'], ['IRM', 'Imagerie par résonance magnétique'],
  ['SIDA', 'Syndrome d’immunodéficience acquise'], ['ONG', 'Organisation non gouvernementale'], ['BCE', 'Banque centrale européenne'], ['CERN', 'Organisation européenne pour la recherche nucléaire'], ['SPA', 'Société protectrice des animaux'],
  ['IUT', 'Institut universitaire de technologie'], ['FAQ', 'Foire aux questions'], ['DOM-TOM', 'Départements et territoires d’outre-mer'], ['ZAD', 'Zone à défendre'], ['RSVP', 'Répondez s’il vous plaît'],
]))

// ——— Idées reçues : vrai ou faux ? (réponse Vrai / Faux, avec l'explication) ———
const vf = (lignes) => lignes.map(([n, v, d], i) => ({ id: `ir-${i}`, n: T(n), r: v ? T('Vrai', 'True') : T('Faux', 'False'), d: T(d) }))
await ecrire('idees-recues', vf([
  ['La Grande Muraille de Chine se voit à l’œil nu depuis l’espace.', false, 'Elle est bien trop étroite pour être vue à l’œil nu depuis l’orbite'],
  ['Les poissons rouges ont une mémoire de 3 secondes.', false, 'Ils peuvent retenir des informations pendant des mois'],
  ['Le cœur d’une crevette se trouve dans sa tête.', true, 'Son cœur est logé dans le céphalothorax, la partie avant du corps'],
  ['La foudre ne frappe jamais deux fois au même endroit.', false, 'L’Empire State Building est frappé plusieurs dizaines de fois par an'],
  ['Les autruches cachent leur tête dans le sable.', false, 'Elles baissent la tête pour retourner leurs œufs ou se faire discrètes'],
  ['Un escargot peut dormir trois ans.', true, 'En cas de sécheresse, certains escargots hibernent très longtemps'],
  ['On n’utilise que 10 % de son cerveau.', false, 'L’imagerie montre que tout le cerveau est actif'],
  ['Le miel ne se périme pratiquement jamais.', true, 'Du miel comestible a été retrouvé dans des tombes égyptiennes'],
  ['Les taureaux détestent la couleur rouge.', false, 'Ils voient mal le rouge : c’est le mouvement de la cape qui les excite'],
  ['Napoléon était particulièrement petit.', false, 'Il mesurait environ 1,69 m, la moyenne de son époque'],
  ['Les pieuvres ont trois cœurs.', true, 'Deux cœurs irriguent les branchies, le troisième le reste du corps'],
  ['La tomate est un fruit.', true, 'Botaniquement, c’est un fruit : elle contient les graines de la plante'],
  ['Les chauves-souris sont aveugles.', false, 'Elles voient, et beaucoup utilisent en plus l’écholocation'],
  ['Il y a plus d’arbres sur Terre que d’étoiles dans la Voie lactée.', true, 'Environ 3 000 milliards d’arbres contre 100 à 400 milliards d’étoiles'],
  ['Le sang est bleu dans les veines.', false, 'Il est toujours rouge, plus foncé quand il est pauvre en oxygène'],
  ['Les vaches ont quatre estomacs.', false, 'Un seul estomac, divisé en quatre poches'],
  ['Une journée sur Vénus dure plus longtemps qu’une année sur Vénus.', true, 'Vénus tourne très lentement sur elle-même : 243 jours terrestres'],
  ['Les dromadaires stockent de l’eau dans leur bosse.', false, 'Leur bosse est une réserve de graisse'],
  ['Les koalas dorment jusqu’à 20 heures par jour.', true, 'Les feuilles d’eucalyptus apportent très peu d’énergie'],
  ['Le Mont Everest est la montagne la plus haute en partant de sa base.', false, 'C’est le Mauna Kea, à Hawaï, dont la base est sous l’océan'],
  ['La banane pousse sur un arbre.', false, 'Le bananier est une plante herbacée géante, pas un arbre'],
  ['Les humains et les dinosaures ont vécu à la même époque.', false, '66 millions d’années les séparent'],
  ['Les flamants roses naissent gris.', true, 'Leur couleur rose vient des crevettes et algues qu’ils mangent'],
  ['On attrape un rhume parce qu’on a froid.', false, 'Le rhume est causé par des virus'],
  ['Le diamant et le graphite d’un crayon sont faits du même élément.', true, 'Les deux sont du carbone pur, organisé différemment'],
  ['Les éléphants ont peur des souris.', false, 'Aucune preuve : ils réagissent surtout à ce qui bouge près de leurs pieds'],
  ['La Tour Eiffel grandit un peu en été.', true, 'Le fer se dilate avec la chaleur : jusqu’à une quinzaine de centimètres'],
  ['Les vikings portaient des casques à cornes.', false, 'C’est une invention du XIXe siècle, popularisée par l’opéra'],
  ['Le Sahara est le plus grand désert du monde.', false, 'C’est l’Antarctique, un désert froid ; le Sahara est le plus grand désert chaud'],
  ['Un nuage peut peser plusieurs centaines de tonnes.', true, 'Un cumulus moyen contient environ 500 tonnes d’eau'],
  ['Les ongles et les cheveux continuent de pousser après la mort.', false, 'C’est la peau qui se rétracte et donne cette impression'],
  ['Le français était la langue officielle de l’Angleterre pendant plus de 300 ans.', true, 'Après 1066, la cour et l’administration parlaient l’anglo-normand'],
  ['Les girafes ont autant de vertèbres dans le cou que les humains.', true, 'Sept, comme presque tous les mammifères, mais très longues'],
  ['Les pingouins vivent en Antarctique.', false, 'Ce sont les manchots ; les pingouins vivent dans l’hémisphère Nord'],
  ['Marie Curie a reçu deux prix Nobel.', true, 'Physique en 1903 et chimie en 1911'],
  ['La muraille d’Hadrien sépare la France de l’Espagne.', false, 'Elle traverse le nord de l’Angleterre'],
  ['Il est dangereux de se baigner juste après avoir mangé.', false, 'Aucun lien prouvé avec la noyade ; on évite juste l’effort trop intense'],
  ['Les abeilles meurent après avoir piqué.', true, 'Les ouvrières perdent leur dard barbelé dans la peau des mammifères'],
  ['Thomas Edison a inventé l’ampoule tout seul.', false, 'Plusieurs inventeurs l’ont précédé ; il l’a rendue fiable et commerciale'],
  ['Les carottes améliorent la vision de nuit.', false, 'Mythe lancé par les Britanniques pendant la guerre pour cacher le radar'],
]))

// ——— Lieux de jeux vidéo : de quelle saga ? (réécrit : les données automatiques étaient fausses) ———
await ecrire('lieux-jeux', paquet('lieu', [
  ['Le Royaume Champignon', 'Super Mario'], ['Hyrule', 'The Legend of Zelda'], ['Bourg Palette', 'Pokémon'], ['Green Hill Zone', 'Sonic'], ['Los Santos', 'Grand Theft Auto'],
  ['Le Nether', 'Minecraft'], ['Tilted Towers', 'Fortnite'], ['Dust II', 'Counter-Strike'], ['La Faille de l’invocateur', 'League of Legends'], ['Vice City', 'Grand Theft Auto'],
  ['Raccoon City', 'Resident Evil'], ['Azeroth', 'Warcraft'], ['Bordeciel', 'The Elder Scrolls'], ['Night City', 'Cyberpunk 2077'], ['Rapture', 'BioShock'],
  ['Cité 17', 'Half-Life'], ['Black Mesa', 'Half-Life'], ['La Route arc-en-ciel', 'Mario Kart'], ['Kanto', 'Pokémon'], ['L’asile d’Arkham', 'Batman: Arkham'],
  ['Silent Hill', 'Silent Hill'], ['Midgar', 'Final Fantasy'], ['Pandora', 'Borderlands'], ['Verdansk', 'Call of Duty'], ['Erangel', 'PUBG'],
  ['Novigrad', 'The Witcher'], ['Aperture Science', 'Portal'], ['Hallownest', 'Hollow Knight'], ['Lordran', 'Dark Souls'], ['Yharnam', 'Bloodborne'],
  ['L’Entre-terre', 'Elden Ring'], ['Kamurocho', 'Yakuza / Like a Dragon'], ['Pélican Town', 'Stardew Valley'], ['Zebes', 'Metroid'], ['Dream Land', 'Kirby'],
  ['L’île Donkey Kong', 'Donkey Kong'], ['Hope County', 'Far Cry'], ['Shadow Moses', 'Metal Gear'], ['Midgard', 'God of War'], ['La Citadelle', 'Mass Effect'],
  ['Termina', 'The Legend of Zelda'], ['Liberty City', 'Grand Theft Auto'], ['Tamriel', 'The Elder Scrolls'], ['Chromapolis', 'Splatoon'], ['Spira', 'Final Fantasy'],
  ['Le Wasteland de Mojave', 'Fallout'], ['Columbia', 'BioShock'], ['Teyvat', 'Genshin Impact'], ['Gotham City', 'Batman: Arkham'], ['Nibelheim', 'Final Fantasy'],
]))

// ——— Sagas : quel studio ou éditeur ? (réécrit : GTA n'est pas de Capcom…) ———
await ecrire('sagas', paquet('saga', [
  ['Super Mario', 'Nintendo'], ['Grand Theft Auto', 'Rockstar Games'], ['Call of Duty', 'Activision'], ['Assassin’s Creed', 'Ubisoft'], ['Pokémon', 'Nintendo'],
  ['Les Sims', 'Electronic Arts'], ['Sonic', 'Sega'], ['Minecraft', 'Mojang'], ['Fortnite', 'Epic Games'], ['League of Legends', 'Riot Games'],
  ['The Legend of Zelda', 'Nintendo'], ['Red Dead Redemption', 'Rockstar Games'], ['Halo', 'Microsoft'], ['God of War', 'Sony'], ['Final Fantasy', 'Square Enix'],
  ['Resident Evil', 'Capcom'], ['Street Fighter', 'Capcom'], ['Far Cry', 'Ubisoft'], ['Rayman', 'Ubisoft'], ['The Witcher', 'CD Projekt'],
  ['Battlefield', 'Electronic Arts'], ['Uncharted', 'Sony'], ['The Last of Us', 'Sony'], ['Fallout', 'Bethesda'], ['The Elder Scrolls', 'Bethesda'],
  ['Half-Life', 'Valve'], ['Counter-Strike', 'Valve'], ['Portal', 'Valve'], ['World of Warcraft', 'Blizzard'], ['Overwatch', 'Blizzard'],
  ['Diablo', 'Blizzard'], ['Valorant', 'Riot Games'], ['Crash Bandicoot', 'Activision'], ['Spyro', 'Activision'], ['Gran Turismo', 'Sony'],
  ['Forza', 'Microsoft'], ['Gears of War', 'Microsoft'], ['Metal Gear', 'Konami'], ['Silent Hill', 'Konami'], ['Tekken', 'Bandai Namco'],
  ['Pac-Man', 'Bandai Namco'], ['Dark Souls', 'FromSoftware'], ['Monster Hunter', 'Capcom'], ['Kingdom Hearts', 'Square Enix'], ['Dragon Quest', 'Square Enix'],
  ['Mass Effect', 'Electronic Arts'], ['Just Dance', 'Ubisoft'], ['Animal Crossing', 'Nintendo'], ['Mortal Kombat', 'Warner Bros. Games'], ['Candy Crush', 'King'],
  ['Clash of Clans', 'Supercell'], ['Angry Birds', 'Rovio'], ['Civilization', '2K'], ['BioShock', '2K'], ['Borderlands', '2K'],
  ['Hitman', 'IO Interactive'], ['Persona', 'Atlus'], ['Genshin Impact', 'HoYoverse'], ['Among Us', 'Innersloth'], ['Destiny', 'Bungie'],
]))

// ——— Personnages d'animés : réponses ramenées à l'animé (« Cycle 3 de Pokémon » → « Pokémon »…) ———
const ANIME = [[/^Cycle \d+ de Pokémon$/, 'Pokémon'], [/^Naruto.*$/, 'Naruto'], [/^Dragon Ball.*$/, 'Dragon Ball'], [/^Yu-Gi-Oh!.*$/, 'Yu-Gi-Oh!'], [/^Fullmetal Alchemist.*$/, 'Fullmetal Alchemist'], [/^Demon Slayer.*$/, 'Demon Slayer'], [/^Ghost in the Shell.*$/, 'Ghost in the Shell'], [/^One Piece.*$/, 'One Piece'], [/^Sailor Moon.*$/, 'Sailor Moon'], [/^Bleach.*$/, 'Bleach']]
const fichier = 'public/packs/culture/persos-animes.json'
const persos = JSON.parse(await readFile(fichier, 'utf8'))
const ramener = (v) => ANIME.reduce((s, [re, nom]) => (re.test(s) ? nom : s), v)
const pasAnime = /L'Île au trésor|Nadia|Anne…/
const nettoyes = persos.filter((p) => !pasAnime.test(p.r.fr)).map((p) => ({ ...p, r: { fr: ramener(p.r.fr), en: ramener(p.r.en) } }))
await ecrire('persos-animes', nettoyes)
