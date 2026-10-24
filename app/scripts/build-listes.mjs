// Construit les quiz « en photo » à partir de listes écrites à la main (titres d'articles Wikipédia en français).
// Pour chaque titre : photo principale de l'article, nom anglais, courte description. L'ordre des listes
// = du plus connu au plus pointu (Facile pioche dans le début de la liste).
// Usage : node scripts/build-listes.mjs [quiz…]
import { readFile, writeFile } from 'node:fs/promises'

// Photos choisies à la main sur Commons quand celle de l'article ne montre pas le sujet (planche botanique…)
const PHOTOS = JSON.parse(await readFile(new URL('./photos-listes.json', import.meta.url), 'utf8'))

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const F = { g: 'f' } // genre féminin (pour « Qui est cette vidéaste ? »)
const nom = (fr) => ({ nom: fr }) // nom affiché, quand le titre de l'article ne convient pas
// Listes dont la photo vient de préférence de l'article anglais (le fruit plutôt que la planche botanique)
const PHOTO_EN = new Set(['fruits', 'legumes', 'epices'])

export const LISTES = {
  youtubeurs: [
    'Squeezie', ['Cyprien Iov', nom('Cyprien')], ['Norman Thavaud', nom('Norman')], 'Michou (vidéaste)', 'Inoxtag', 'Tibo InShape', 'Amixem', 'Mister V', ['Natoo', F], ['Léna Mahfouf', F],
    ['Hugo Travers', nom('HugoDécrypte')], 'MrBeast', 'PewDiePie', 'Joueur du Grenier', 'Seb la Frite', 'Gotaga', 'Kameto', 'ZeratoR', 'Antoine Daniel', 'Mcfly et Carlito',
    'IShowSpeed', 'Kai Cenat', 'KSI', 'Logan Paul', 'Jake Paul', 'Ninja (streamer)', ['Pokimane', F], 'XQc', 'Markiplier', 'Ibai Llanos',
    'Le Rire jaune', 'Poisson Fécond', 'Mastu', 'Domingo (vidéaste)', 'Ponce (streamer)', 'Étoiles (streamer)', ['Maghla', F], 'Baghera Jones', 'Doigby', 'Siphano',
    'Frigiel', 'Furious Jumper', 'Dr Nozman', 'Max Bird', ['Benjamin Brillaud', nom('Nota Bene (Benjamin Brillaud)')], 'Le Grand JD', 'Lebouseuh', 'Jiraya (vidéaste)', 'Pierre Croce', ['Aminematue', F],
    'Jacksepticeye', 'Mark Rober', 'Casey Neistat', ['Emma Chamberlain', F], ['Lilly Singh', F], ['Zoella', F], 'AuronPlay', 'TheGrefg', 'El Rubius', 'Vegetta777',
    'Shroud (joueur)', 'Fuze III', 'Mathieu Sommet', ['EnjoyPhoenix', F], ['Shera Kerienski', F],
  ],
  fruits: [
    'Pomme', 'Banane', 'Orange (fruit)', 'Fraise', 'Cerise', 'Raisin', 'Ananas', 'Kiwi (fruit)', 'Pastèque', 'Citron', 'Melon (plante)', ['Cassissier', nom('Cassis')], ['Mûrier', nom('Mûre')],
    'Poire', 'Pêche (fruit)', 'Mangue', 'Abricot', 'Framboise', 'Melon', 'Noix de coco', 'Myrtille', 'Prune', ['Citron vert', nom('Citron vert')],
    'Grenade (fruit)', 'Figue', 'Litchi', 'Clémentine', 'Pamplemousse', 'Fruit de la passion', 'Avocat (fruit)', 'Mûre (fruit)', 'Groseille', 'Cassis',
    'Papaye', 'Datte', 'Kaki (fruit)', 'Mirabelle', 'Pitaya', 'Carambole', 'Goyave', 'Coing', 'Kumquat', 'Physalis',
    'Ramboutan', ['Mangoustan', nom('Mangoustan')], 'Durian', 'Jacquier', 'Nèfle', ['Feijoa', nom('Feijoa')], 'Corossol', ['Groseille à maquereau', nom('Groseille à maquereau')],
  ],
  legumes: [
    'Carotte', 'Tomate', 'Pomme de terre', 'Courgette', 'Aubergine', 'Poivron', 'Brocoli', 'Chou-fleur', 'Concombre', 'Laitue',
    'Oignon', 'Ail cultivé', 'Poireau', 'Petit pois', 'Haricot vert', 'Radis', 'Betterave', 'Épinard', 'Maïs', ['Champignon de Paris', nom('Champignon de Paris')],
    'Potiron', 'Citrouille', 'Courge musquée', 'Artichaut', 'Asperge', 'Céleri', 'Fenouil', 'Navet', 'Chou de Bruxelles', 'Chou rouge',
    'Patate douce', 'Endive', 'Échalote', 'Kale', 'Topinambour', 'Blette', 'Céleri-rave', 'Radis noir', 'Chou romanesco',
    'Gombo', 'Pâtisson', 'Salsifis', 'Rutabaga', 'Chayote', 'Cresson de fontaine', 'Roquette', ['Mâche', nom('Mâche')], 'Pak-choï', 'Rhubarbe', 'Igname', 'Manioc',
  ],
  epices: [
    'Cannelle', 'Vanille', 'Basilic (plante)', 'Persil', 'Menthe', ['Poivre noir', nom('Poivre noir')], ['Thym', nom('Thym')], 'Romarin', 'Safran (épice)', 'Gingembre',
    'Curcuma', 'Paprika', 'Clou de girofle', 'Noix de muscade', 'Coriandre', ['Laurier-sauce', nom('Laurier')], 'Cumin', 'Origan', 'Piment de Cayenne',
    ['Badiane chinoise', nom('Badiane (anis étoilé)')], 'Cardamome', 'Aneth', ['Sauge officinale', nom('Sauge')], 'Sésame', 'Câpre', 'Moutarde (condiment)',
    'Piment d\'Espelette', ['Baie rose', nom('Baies roses')], 'Poivre de Sichuan',
  ],
  desserts: [
    'Croissant (viennoiserie)', 'Crêpe', 'Macaron', 'Éclair (pâtisserie)', 'Tiramisu', 'Crème brûlée', 'Mille-feuille', 'Gaufre (pâtisserie)', 'Pain au chocolat', 'Mousse au chocolat',
    'Tarte Tatin', 'Cheesecake', 'Brownie', 'Beignet', 'Profiterole', 'Paris-brest', 'Cupcake', 'Muffin', 'Pancake', 'Churro',
    'Madeleine (pâtisserie)', 'Canelé', 'Baba au rhum', 'Forêt-noire (gâteau)', 'Opéra (pâtisserie)', 'Bûche de Noël', 'Galette des rois', 'Clafoutis',
    'Religieuse (pâtisserie)', 'Saint-honoré (pâtisserie)', 'Tarte au citron', 'Panna cotta', 'Far breton', 'Kouign-amann', 'Financier (pâtisserie)', 'Chausson aux pommes', 'Brioche', 'Kouglof',
    'Mochi', 'Baklava', 'Pastel de nata', 'Strudel', 'Sachertorte', 'Pavlova (dessert)', 'Cannolo', 'Calisson', 'Nougat', 'Gulab jamun', 'Banoffee pie', 'Charlotte (dessert)',
  ],
  dinosaures: [
    'Tyrannosaurus', 'Tricératops', 'Stegosaurus', 'Velociraptor', 'Diplodocus', 'Brachiosaurus', 'Ankylosaurus', 'Spinosaurus', 'Ptéranodon', 'Mammouth laineux',
    'Parasaurolophus', 'Allosaurus', 'Iguanodon', 'Archaeopteryx', 'Smilodon', 'Otodus megalodon', 'Pachycephalosaurus', 'Dilophosaurus', 'Mosasaurus', 'Plesiosaurus',
    'Carnotaurus', 'Gallimimus', 'Dimetrodon', 'Compsognathus', 'Baryonyx', 'Giganotosaurus', 'Argentinosaurus', 'Brontosaurus', 'Therizinosaurus', 'Deinonychus',
    'Oviraptor', 'Protoceratops', 'Microraptor', 'Edmontosaurus', 'Styracosaurus', 'Utahraptor', 'Quetzalcoatlus', 'Ichthyosaurus', 'Megatherium', 'Dodo',
  ],
  mineraux: [
    'Diamant', 'Rubis', 'Émeraude', 'Saphir', 'Améthyste', 'Quartz (minéral)', 'Or', 'Perle', 'Ambre', 'Opale',
    'Topaze', 'Turquoise (minéral)', 'Jade', 'Lapis-lazuli', 'Grenat', 'Aigue-marine', 'Obsidienne', 'Pyrite', 'Malachite', 'Citrine',
    'Tourmaline', 'Péridot', 'Onyx', 'Agate', 'Jaspe', 'Fluorite', 'Hématite', 'Soufre', 'Graphite', 'Calcite',
    'Gypse', 'Galène', 'Mica', 'Talc', 'Azurite', 'Labradorite', 'Rhodochrosite', 'Œil-de-tigre', 'Cinabre', 'Tanzanite',
  ],
  // Objets du sport : la réponse est le sport (le nom de l'objet n'est pas montré)
  balles: [
    ['Ballon de football', { r: 'Football' }], ['Ballon de rugby', { r: 'Rugby' }], ['Ballon de basket-ball', { r: 'Basket-ball' }], ['Balle de tennis', { r: 'Tennis' }], ['Balle de golf', { r: 'Golf' }],
    ['Ballon de volley-ball', { r: 'Volley-ball' }], ['Ballon de handball', { r: 'Handball' }], ['Balle de baseball', { r: 'Baseball' }], ['Ballon de football américain', { r: 'Football américain' }], ['Volant (badminton)', { r: 'Badminton' }],
    ['Balle de tennis de table', { r: 'Tennis de table' }], ['Palet (hockey sur glace)', { r: 'Hockey sur glace' }], ['Boule de pétanque', { r: 'Pétanque' }], ['Boule de bowling', { r: 'Bowling' }], ['Boule de billard', { r: 'Billard' }],
    ['Balle de cricket', { r: 'Cricket' }], ['Ballon de water-polo', { r: 'Water-polo' }], ['Balle de squash', { r: 'Squash' }], ['Pierre de curling', { r: 'Curling' }], ['Fleuret', { r: 'Escrime' }],
    ['Batte de baseball', { r: 'Baseball' }], ['Crosse de hockey sur glace', { r: 'Hockey sur glace' }], ['Club de golf', { r: 'Golf' }], ['Gant de boxe', { r: 'Boxe' }], ['Javelot', { r: 'Athlétisme' }],
    ['Disque (athlétisme)', { r: 'Athlétisme' }], ['Haie (athlétisme)', { r: 'Athlétisme' }], ['Planche à roulettes', { r: 'Skateboard' }], ['Planche de surf', { r: 'Surf' }], ['Arc (arme)', { r: 'Tir à l’arc' }],
    ['Kimono de judo', { r: 'Judo' }], ['Raquette de tennis', { r: 'Tennis' }], ['Haltère', { r: 'Haltérophilie' }], ['Cheval d\'arçons', { r: 'Gymnastique' }], ['Crosse de lacrosse', { r: 'Crosse' }],
    ['Pelote basque', { r: 'Pelote basque' }], ['Ballon de netball', { r: 'Netball' }], ['Frisbee', { r: 'Ultimate' }], ['Mailloche', { r: 'Croquet' }], ['Patin à glace', { r: 'Patinage' }],
  ],
  'sports-photo': [
    'Football', 'Rugby à XV', 'Basket-ball', 'Tennis', 'Natation (sport)', 'Cyclisme sur route', 'Ski alpin', 'Handball', 'Volley-ball', 'Judo',
    'Boxe anglaise', 'Golf', 'Formule 1', 'Équitation', 'Escrime', 'Gymnastique artistique', 'Patinage artistique', 'Snowboard', 'Surf', 'Escalade',
    'Hockey sur glace', 'Baseball', 'Football américain', 'Badminton', 'Tennis de table', 'Aviron', 'Canoë-kayak', 'Tir à l\'arc', 'Plongeon', 'Water-polo',
    'Beach-volley', 'Karaté', 'Taekwondo', 'Haltérophilie', 'Lutte', 'Triathlon', 'BMX', 'Skateboard', 'Curling', 'Biathlon',
    'Bobsleigh', 'Saut à ski', 'Luge (sport)', 'Skeleton (sport)', 'Polo (sport)', 'Cricket', 'Hockey sur gazon', 'Crosse (sport)', 'Sumo', 'Kitesurf',
    'Natation synchronisée', 'Pentathlon moderne', 'Pelote basque', 'Sepak takraw', 'Kabaddi', 'Football australien', 'Hurling', 'Roller derby', 'Breaking (danse)', 'Parkour',
  ],
  'plats-photo': [
    'Pizza', 'Sushi', 'Hamburger', 'Paella', 'Couscous', 'Lasagnes', 'Tacos', 'Croque-monsieur', 'Ratatouille', 'Bœuf bourguignon',
    'Raclette', 'Fondue savoyarde', 'Tartiflette', 'Hot-dog', 'Ramen', 'Kebab', 'Quiche lorraine', 'Moules-frites', 'Fish and chips', 'Cassoulet',
    'Choucroute garnie', 'Tajine', 'Pad thaï', 'Burrito', 'Spaghetti à la bolognaise', 'Pâtes à la carbonara', 'Risotto', 'Gnocchi', 'Falafel', 'Houmous',
    'Poutine', 'Hachis parmentier', 'Gratin dauphinois', 'Pot-au-feu', 'Blanquette de veau', 'Bouillabaisse', 'Steak tartare', 'Escargots de Bourgogne', 'Foie gras', 'Nem',
    'Phở', 'Bibimbap', 'Dim sum', 'Canard laqué de Pékin', 'Biryani', 'Moussaka', 'Gyros', 'Goulache', 'Pierogi', 'Bortsch',
    'Ceviche', 'Feijoada', 'Chili con carne', 'Nachos', 'Fajitas', 'Gaspacho', 'Samoussa', 'Chakchouka', 'Tempura', 'Okonomiyaki',
    'Takoyaki', 'Kimchi', 'Arepa', 'Empanada', 'Mac and cheese', 'Club sandwich', 'Bagel', 'Mafé', 'Poulet yassa', 'Bobotie',
  ],
  politiques: [
    'Emmanuel Macron', ['Marine Le Pen', F], 'Jean-Luc Mélenchon', 'Gabriel Attal', 'Édouard Philippe', 'Jordan Bardella', 'Nicolas Sarkozy', 'François Hollande', 'Jacques Chirac', 'Éric Zemmour',
    ['Élisabeth Borne', F], 'Michel Barnier', 'François Bayrou', 'Gérald Darmanin', 'Bruno Le Maire', ['Anne Hidalgo', F], ['Rachida Dati', F], 'Manuel Valls', ['Ségolène Royal', F], 'François Fillon',
    'Alain Juppé', 'Jean Castex', 'Laurent Wauquiez', ['Valérie Pécresse', F], 'Olivier Véran', 'Sébastien Lecornu', 'Bruno Retailleau', ['Marion Maréchal', F], 'François Ruffin', 'Raphaël Glucksmann',
    'Fabien Roussel', ['Marine Tondelier', F], ['Yaël Braun-Pivet', F], ['Christiane Taubira', F], ['Simone Veil', F], 'Jean-Marie Le Pen', 'Dominique de Villepin', 'Lionel Jospin', 'Arnaud Montebourg', 'Nicolas Hulot',
    ['Roselyne Bachelot', F], 'Jack Lang', 'Bernard Kouchner', ['Christine Lagarde', F], 'Éric Dupond-Moretti', ['Clémentine Autain', F], ['Mathilde Panot', F], ['Sandrine Rousseau', F], 'Jean Lassalle', 'Philippe Poutou',
    ['Nathalie Arthaud', F], 'Nicolas Dupont-Aignan', 'Georges Pompidou', 'Valéry Giscard d\'Estaing', 'François Mitterrand', 'Pierre Mendès France', 'Michel Rocard', ['Édith Cresson', F], 'Jean-Pierre Raffarin', 'Pierre Bérégovoy',
  ],
  dirigeants: [
    'Donald Trump', 'Barack Obama', 'Vladimir Poutine', 'Joe Biden', 'Volodymyr Zelensky', ['Angela Merkel', F], 'Xi Jinping', 'Kim Jong-un', 'Charles III', ['Élisabeth II', F],
    'Justin Trudeau', 'Boris Johnson', 'Narendra Modi', 'Recep Tayyip Erdoğan', ['Giorgia Meloni', F], 'Benyamin Netanyahou', 'Luiz Inácio Lula da Silva', 'Pedro Sánchez', 'Keir Starmer', 'Olaf Scholz',
    ['Ursula von der Leyen', F], 'François (pape)', 'Léon XIV', ['Kamala Harris', F], 'Nelson Mandela', 'Javier Milei', 'Mohammed ben Salmane', 'Viktor Orbán', 'Rishi Sunak', ['Jacinda Ardern', F],
    'Fidel Castro', 'Winston Churchill', 'John Fitzgerald Kennedy', 'Ronald Reagan', 'Mikhaïl Gorbatchev', ['Margaret Thatcher', F], 'Abraham Lincoln', 'Franklin Delano Roosevelt', 'George W. Bush', 'Bill Clinton',
    'Hugo Chávez', 'Alexandre Loukachenko', 'Friedrich Merz', 'Mark Carney', 'Shinzo Abe', ['Indira Gandhi', F], 'Jawaharlal Nehru', 'Mao Zedong', 'Deng Xiaoping', 'Kofi Annan',
  ],
  'jeux-societe': [
    'Monopoly', 'Échecs', 'Uno (jeu)', 'Jeu de dames', 'Puissance 4', 'Jenga', 'Cluedo', 'Trivial Pursuit', 'Dominos',
    'Backgammon', 'Jeu de go', 'Risk (jeu)', 'Les Colons de Catane', 'Mikado (jeu)', 'Jeu de l\'oie', 'Petits Chevaux', 'Bataille navale (jeu)', 'Mastermind (jeu)', 'Yahtzee',
    'Dixit (jeu)', 'Twister (jeu)', 'Pictionary', 'Qui est-ce ?', 'Othello (jeu)', 'Mahjong', 'Mölkky', 'Pétanque', 'Billard', 'Jeu de tarot',
    'Dobble', 'Mille Bornes', 'Taboo', 'Rummikub', 'Bowling', 'Babyfoot', 'Fléchettes', 'Rubik\'s Cube', 'Awalé', 'Shōgi',
  ],
}

// Le nom affiché : sans la précision entre parenthèses (« Orange (fruit) » → « Orange »)
const propre = (t) => t.replace(/\s*\([^)]*\)\s*$/, '').trim()
const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1)

async function lot(titres, essai = 1, langue = 'fr') {
  const p = new URLSearchParams({
    action: 'query', format: 'json', redirects: '1', titles: titres.join('|'),
    prop: 'pageimages|langlinks|description|extracts', piprop: 'thumbnail', pithumbsize: '640', pilicense: 'free',
    lllang: 'en', lllimit: 'max', exintro: '1', explaintext: '1', exsentences: '1', exlimit: '20',
  })
  try {
    const r = await fetch(`https://${langue}.wikipedia.org/w/api.php?${p}`, { headers: UA })
    if (!r.ok) throw new Error(r.status)
    return await r.json()
  } catch (e) {
    if (essai > 4) throw e
    await new Promise((ok) => setTimeout(ok, 8000 * essai)) // 429 : Wikipédia demande de ralentir
    return lot(titres, essai + 1, langue)
  }
}

export async function construire(id) {
  const entrees = LISTES[id].map((x) => (Array.isArray(x) ? { t: x[0], ...x[1] } : { t: x }))
  const parTitre = new Map()
  for (let i = 0; i < entrees.length; i += 20) {
    const j = await lot(entrees.slice(i, i + 20).map((e) => e.t))
    // Titre demandé → titre final (normalisation puis redirection)
    const vers = new Map()
    for (const n of j.query.normalized ?? []) vers.set(n.from, n.to)
    for (const r of j.query.redirects ?? []) vers.set(r.from, r.to)
    for (const page of Object.values(j.query.pages ?? {})) parTitre.set(page.title, page)
    for (const e of entrees.slice(i, i + 20)) { let t = e.t; while (vers.has(t)) t = vers.get(t); e.final = t }
    await new Promise((ok) => setTimeout(ok, 1500))
  }
  // Photo de l'article anglais (fruits, légumes : la photo du produit plutôt qu'une planche botanique)
  const photoEn = new Map()
  if (PHOTO_EN.has(id)) {
    const titresEn = [...parTitre.values()].map((p) => p.langlinks?.[0]?.['*']).filter(Boolean)
    for (let i = 0; i < titresEn.length; i += 20) {
      const j = await lot(titresEn.slice(i, i + 20), 1, 'en')
      const vers = new Map([...(j.query.normalized ?? []), ...(j.query.redirects ?? [])].map((n) => [n.to, n.from]))
      for (const page of Object.values(j.query.pages ?? {})) if (page.thumbnail) photoEn.set(vers.get(page.title) ?? page.title, page.thumbnail.source)
      await new Promise((ok) => setTimeout(ok, 1500))
    }
  }
  const items = []
  const manquants = []
  for (const e of entrees) {
    const page = parTitre.get(e.final)
    const img = PHOTOS[id]?.[e.t] ?? photoEn.get(page?.langlinks?.[0]?.['*']) ?? page?.thumbnail?.source
    if (!page || page.missing !== undefined || !img) { manquants.push(e.t); continue }
    const fr = e.nom ?? majuscule(propre(page.title))
    const en = majuscule(propre(page.langlinks?.[0]?.['*'] ?? page.title))
    const desc = page.description ?? page.extract?.split('. ')[0]
    items.push({
      id: `W${page.pageid}`,
      n: { fr, en },
      ...(desc ? { d: { fr: desc.replace(/\.$/, ''), en: desc.replace(/\.$/, '') } } : {}),
      img,
      ...(e.g ? { g: e.g } : {}),
      ...(e.r ? { r: { fr: e.r, en: e.r } } : {}),
    })
  }
  // Doublons (deux titres qui redirigent vers le même article)
  const vus = new Set()
  const uniques = items.filter((it) => !vus.has(it.id) && vus.add(it.id))
  await writeFile(`public/packs/culture/${id}.json`, JSON.stringify(uniques))
  console.log(`${id} : ${uniques.length} éléments${manquants.length ? ` · sans photo ou introuvables : ${manquants.join(', ')}` : ''}`)
}

const demandes = process.argv.slice(2)
for (const id of demandes.length ? demandes : Object.keys(LISTES)) await construire(id)
