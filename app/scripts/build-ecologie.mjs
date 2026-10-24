// Famille Écologie & planète : quiz écrits à la main (ordres de grandeur couramment cités : ADEME, Water Footprint Network, FAO…).
// Chaque pack garde des réponses de même nature (litres, watts, durées…) pour que les mauvaises réponses restent crédibles.
// Usage : node scripts/build-ecologie.mjs
import { writeFile } from 'node:fs/promises'

const T = (fr, en = fr) => ({ fr, en })
const ecrire = (id, items) => writeFile(`public/packs/culture/${id}.json`, JSON.stringify(items)).then(() => console.log(`${id} : ${items.length}`))
const paquet = (id, lignes, d) => lignes.map(([n, r, det], i) => ({ id: `${id}-${i}`, n: T(n), r: T(r), ...(det || d ? { d: T(det || d) } : {}) }))

// ——— Eau cachée : litres nécessaires pour produire ou utiliser ———
await ecrire('eco-eau', paquet('eau', [
  ['Combien d’eau faut-il pour produire 1 kg de bœuf ?', '15 000 litres', 'Surtout l’eau qui fait pousser la nourriture des animaux'],
  ['Combien d’eau faut-il pour produire 1 kg de chocolat ?', '17 000 litres', 'Le cacao est très gourmand en eau'],
  ['Combien d’eau faut-il pour fabriquer un jean ?', '7 500 litres', 'Principalement pour faire pousser le coton'],
  ['Combien d’eau faut-il pour fabriquer un t-shirt en coton ?', '2 700 litres', 'De quoi boire pendant plus de deux ans'],
  ['Combien d’eau faut-il pour produire 1 kg de riz ?', '2 500 litres', 'Les rizières sont souvent inondées'],
  ['Combien d’eau faut-il pour produire 1 kg de poulet ?', '4 300 litres', 'Trois fois moins que le bœuf'],
  ['Combien d’eau faut-il pour produire 1 kg de fromage ?', '5 000 litres', 'Il faut environ 10 litres de lait pour 1 kg de fromage'],
  ['Combien d’eau faut-il pour produire 1 litre de lait ?', '1 000 litres', 'L’eau bue par la vache et celle de son alimentation'],
  ['Combien d’eau faut-il pour produire un œuf ?', '200 litres'],
  ['Combien d’eau faut-il pour produire une tasse de café ?', '140 litres', 'Pour faire pousser et traiter les grains'],
  ['Combien d’eau faut-il pour produire une tasse de thé ?', '30 litres', 'Bien moins que le café'],
  ['Combien d’eau faut-il pour produire un hamburger ?', '2 400 litres'],
  ['Combien d’eau faut-il pour produire 1 kg de pain ?', '1 600 litres'],
  ['Combien d’eau faut-il pour produire 1 kg d’avocats ?', '2 000 litres', 'Souvent cultivés dans des régions sèches'],
  ['Combien d’eau faut-il pour produire 1 kg de pommes ?', '800 litres'],
  ['Combien d’eau faut-il pour produire un verre de vin ?', '110 litres'],
  ['Combien d’eau faut-il pour produire un verre de bière ?', '75 litres'],
  ['Combien d’eau utilise une douche de 5 minutes ?', '60 litres', 'Un pommeau économe divise ce chiffre par deux'],
  ['Combien d’eau faut-il pour remplir une baignoire ?', '150 litres', 'Deux à trois douches'],
  ['Combien d’eau utilise une chasse d’eau classique ?', '9 litres', 'Les modèles double chasse descendent à 3 ou 6 litres'],
  ['Combien d’eau utilise un lave-vaisselle récent par cycle ?', '12 litres', 'Moins qu’une vaisselle à la main, robinet ouvert'],
  ['Combien d’eau utilise un lave-linge récent par cycle ?', '50 litres'],
]))

// ——— Électricité : puissance typique des appareils ———
await ecrire('eco-electricite', paquet('elec', [
  ['Quelle est la puissance d’une ampoule LED classique ?', '8 watts', 'Elle éclaire autant qu’une ancienne ampoule de 60 W'],
  ['Quelle était la puissance d’une ampoule à incandescence classique ?', '60 watts', 'Presque toute l’énergie partait en chaleur'],
  ['Quelle est la puissance d’une bouilloire électrique ?', '2 000 watts', 'Très puissante, mais elle ne chauffe que quelques minutes'],
  ['Quelle est la puissance d’un four électrique ?', '2 500 watts'],
  ['Quelle est la puissance d’un fer à repasser ?', '2 400 watts'],
  ['Quelle est la puissance d’un sèche-cheveux ?', '1 800 watts'],
  ['Quelle est la puissance d’un radiateur électrique classique ?', '1 500 watts', 'Le chauffage est le premier poste de consommation d’un foyer'],
  ['Quelle est la puissance d’un four à micro-ondes ?', '1 000 watts'],
  ['Quelle est la puissance maximale autorisée pour un aspirateur vendu dans l’UE ?', '900 watts', 'Limite européenne depuis 2017'],
  ['Quelle est la puissance moyenne d’un réfrigérateur en marche ?', '150 watts', 'Il tourne par intermittence, jour et nuit'],
  ['Quelle est la puissance d’une télévision LED de taille moyenne ?', '100 watts'],
  ['Quelle est la puissance d’une console de salon récente en pleine partie ?', '200 watts'],
  ['Quelle est la puissance d’un ordinateur portable en utilisation ?', '50 watts', 'Bien moins qu’un ordinateur fixe de jeu'],
  ['Quelle est la puissance d’un chargeur de téléphone ?', '5 watts', 'Laissé branché à vide, il consomme encore un peu'],
  ['Quelle est la puissance d’une box internet allumée en continu ?', '15 watts', 'Sur un an, c’est autant qu’un petit frigo'],
]))

// ——— CO₂ : émissions de gaz à effet de serre (équivalent CO₂) ———
await ecrire('eco-co2', paquet('co2', [
  ['Combien émet un repas avec du bœuf ?', '7 kg de CO₂', 'Environ 14 fois plus qu’un repas végétarien'],
  ['Combien émet un repas végétarien ?', '0,5 kg de CO₂'],
  ['Combien émet la production d’1 kg de bœuf ?', '30 kg de CO₂', 'Le méthane des ruminants pèse lourd'],
  ['Combien émet la fabrication d’un jean ?', '25 kg de CO₂'],
  ['Combien émet la fabrication d’un t-shirt en coton ?', '5 kg de CO₂'],
  ['Combien émet la fabrication d’un smartphone ?', '85 kg de CO₂', 'L’essentiel de son impact vient de sa fabrication, pas de son usage'],
  ['Combien émet la fabrication d’un ordinateur portable ?', '150 kg de CO₂'],
  ['Combien émet 1 km parcouru seul en voiture essence ?', '200 g de CO₂'],
  ['Combien émet 1 km en TGV, par passager ?', '3 g de CO₂', 'Le train français roule surtout à l’électricité nucléaire et renouvelable'],
  ['Combien émet 1 km en avion court-courrier, par passager ?', '250 g de CO₂'],
  ['Combien dégage la combustion d’1 litre d’essence ?', '2,3 kg de CO₂', 'Plus que le poids du litre d’essence lui-même'],
  ['Quelle est l’empreinte carbone moyenne d’un Français par an ?', '9 tonnes de CO₂'],
  ['Quelle empreinte par personne et par an viser en 2050 pour respecter l’accord de Paris ?', '2 tonnes de CO₂'],
]))

// ——— Décomposition dans la nature (ordres de grandeur, selon les conditions) ———
await ecrire('eco-decomposition', paquet('dec', [
  ['Combien de temps met un mouchoir en papier à se décomposer ?', '3 mois'],
  ['Combien de temps met un trognon de pomme à se décomposer ?', '1 à 5 mois'],
  ['Combien de temps met un ticket de bus à se décomposer ?', '3 à 4 mois'],
  ['Combien de temps met une peau d’orange à se décomposer ?', '6 mois'],
  ['Combien de temps met un journal à se décomposer ?', '3 à 12 mois'],
  ['Combien de temps met un mégot de cigarette à se décomposer ?', '1 à 2 ans', 'Un seul mégot peut aussi polluer des centaines de litres d’eau'],
  ['Combien de temps met un chewing-gum à se décomposer ?', '5 ans'],
  ['Combien de temps met une boîte de conserve en acier à se décomposer ?', '50 ans'],
  ['Combien de temps met une canette en aluminium à se décomposer ?', '200 à 500 ans', 'Recyclée, elle redevient canette en quelques semaines'],
  ['Combien de temps met un sac plastique à se décomposer ?', '450 ans'],
  ['Combien de temps met un filet de pêche en nylon à se décomposer ?', '600 ans'],
  ['Combien de temps met une bouteille en plastique à se décomposer ?', '100 à 1 000 ans'],
  ['Combien de temps met une bouteille en verre à se décomposer ?', '4 000 ans', 'Mais le verre se recycle à l’infini'],
], 'Ordre de grandeur souvent cité : tout dépend du sol, de l’eau et du soleil'))

// ——— Tri des déchets (consignes françaises depuis l’extension de 2023) ———
await ecrire('eco-tri', paquet('tri', [
  ['Où jette-t-on une bouteille en verre ?', 'Conteneur à verre'],
  ['Où jette-t-on un pot de confiture vide ?', 'Conteneur à verre', 'Sans le couvercle, qui va au bac jaune'],
  ['Où jette-t-on des épluchures de légumes ?', 'Compost'],
  ['Où jette-t-on du marc de café ?', 'Compost'],
  ['Où jette-t-on des coquilles d’œuf ?', 'Compost'],
  ['Où jette-t-on une canette de soda ?', 'Bac jaune'],
  ['Où jette-t-on un pot de yaourt en plastique ?', 'Bac jaune', 'Tous les emballages plastiques vont au bac jaune depuis 2023'],
  ['Où jette-t-on une brique de lait ?', 'Bac jaune'],
  ['Où jette-t-on une capsule de café en aluminium ?', 'Bac jaune'],
  ['Où jette-t-on un verre à boire cassé ?', 'Ordures ménagères', 'Le verre de table ne fond pas comme le verre d’emballage'],
  ['Où jette-t-on un mouchoir usagé ?', 'Ordures ménagères'],
  ['Où jette-t-on une couche jetable ?', 'Ordures ménagères'],
  ['Où rapporte-t-on des piles usagées ?', 'Point de collecte en magasin'],
  ['Où rapporte-t-on une ampoule LED ?', 'Point de collecte en magasin'],
  ['Où rapporte-t-on des médicaments périmés ?', 'Pharmacie'],
  ['Où apporte-t-on un pot de peinture entamé ?', 'Déchetterie'],
  ['Où apporte-t-on un vieux matelas ?', 'Déchetterie'],
]))

// ——— Fruits et légumes de saison (France) ———
await ecrire('eco-saison', paquet('sai', [
  ['En quelle saison mange-t-on des tomates de saison ?', 'Été'], ['En quelle saison mange-t-on des courgettes de saison ?', 'Été'],
  ['En quelle saison mange-t-on du melon de saison ?', 'Été'], ['En quelle saison mange-t-on des abricots de saison ?', 'Été'],
  ['En quelle saison mange-t-on des pêches de saison ?', 'Été'], ['En quelle saison mange-t-on de la pastèque de saison ?', 'Été'],
  ['En quelle saison mange-t-on des asperges de saison ?', 'Printemps'], ['En quelle saison mange-t-on des radis de saison ?', 'Printemps'],
  ['En quelle saison mange-t-on des petits pois de saison ?', 'Printemps'], ['En quelle saison mange-t-on de la rhubarbe de saison ?', 'Printemps'],
  ['En quelle saison mange-t-on des fèves de saison ?', 'Printemps'],
  ['En quelle saison mange-t-on du potiron de saison ?', 'Automne'], ['En quelle saison mange-t-on des châtaignes ?', 'Automne'],
  ['En quelle saison mange-t-on du raisin de saison ?', 'Automne'], ['En quelle saison cueille-t-on les cèpes ?', 'Automne'],
  ['En quelle saison mange-t-on des coings ?', 'Automne'], ['En quelle saison mange-t-on des poires de saison ?', 'Automne'],
  ['En quelle saison mange-t-on des poireaux de saison ?', 'Hiver'], ['En quelle saison mange-t-on des endives de saison ?', 'Hiver'],
  ['En quelle saison mange-t-on des clémentines ?', 'Hiver'], ['En quelle saison mange-t-on des choux de Bruxelles ?', 'Hiver'],
  ['En quelle saison mange-t-on du panais ?', 'Hiver'], ['En quelle saison mange-t-on de la mâche ?', 'Hiver'],
  ['En quelle saison mange-t-on des kiwis français ?', 'Hiver'],
], 'Manger de saison évite les serres chauffées et les longs transports'))

// ——— Énergies ———
await ecrire('eco-energies', paquet('nrj', [
  ['Quelle est la première source d’électricité en France ?', 'Nucléaire', 'Environ deux tiers de la production'],
  ['Quelle est la première source d’électricité renouvelable en France ?', 'Hydraulique'],
  ['Quelle énergie produisent les barrages ?', 'Hydraulique'],
  ['Quelle énergie produit le barrage des Trois-Gorges, en Chine ?', 'Hydraulique', 'La plus grande centrale électrique du monde'],
  ['Quelle énergie utilise la chaleur du sous-sol de la Terre ?', 'Géothermie'],
  ['Quelle énergie chauffe la plupart des maisons en Islande ?', 'Géothermie'],
  ['Quelle énergie exploite l’usine de la Rance, en Bretagne ?', 'Marémotrice', 'Elle utilise le mouvement des marées depuis 1966'],
  ['Quelle énergie produisent les panneaux photovoltaïques ?', 'Solaire'],
  ['Quelle énergie produisent les grandes pales qui tournent en mer du Nord ?', 'Éolien'],
  ['Quelle énergie fournit une grande part de l’électricité du Danemark ?', 'Éolien'],
  ['Quelle énergie vient de la combustion du bois ou des déchets organiques ?', 'Biomasse'],
  ['Quelle est la première source d’électricité dans le monde ?', 'Charbon'],
  ['Quelle énergie fossile émet le plus de CO₂ pour produire de l’électricité ?', 'Charbon'],
  ['Quelle énergie fossile alimente les centrales à cycle combiné ?', 'Gaz'],
  ['Quelle énergie fossile fait rouler la plupart des voitures ?', 'Pétrole'],
]))

// ——— Dates clés de l’écologie ———
await ecrire('eco-dates', paquet('ecod', [
  ['En quelle année a été signé l’accord de Paris sur le climat ?', '2015'], ['En quelle année a été signé le protocole de Kyoto ?', '1997'],
  ['En quelle année a eu lieu le Sommet de la Terre de Rio ?', '1992'], ['En quelle année a été créé le GIEC ?', '1988'],
  ['En quelle année a eu lieu la catastrophe de Tchernobyl ?', '1986'], ['En quelle année a eu lieu la catastrophe de Fukushima ?', '2011'],
  ['En quelle année a eu lieu la marée noire de l’Erika ?', '1999'], ['En quelle année a eu lieu la marée noire de l’Amoco Cadiz ?', '1978'],
  ['En quelle année a explosé la plateforme Deepwater Horizon ?', '2010'], ['En quelle année a eu lieu le premier Jour de la Terre ?', '1970'],
  ['En quelle année a été fondé Greenpeace ?', '1971'], ['En quelle année a été fondé le WWF ?', '1961'],
  ['En quelle année Rachel Carson a-t-elle publié « Printemps silencieux » ?', '1962'], ['En quelle année Greta Thunberg a-t-elle commencé sa grève pour le climat ?', '2018'],
  ['En quelle année a été signé le protocole de Montréal sur la couche d’ozone ?', '1987'], ['En quelle année a été créé le parc de Yellowstone, premier parc national ?', '1872'],
  ['En quelle année la France a-t-elle créé son ministère de l’Environnement ?', '1971'], ['En quelle année a eu lieu la marée noire de l’Exxon Valdez ?', '1989'],
  ['En quelle année la France a-t-elle interdit les pailles en plastique ?', '2021'], ['En quelle année a eu lieu la catastrophe de Bhopal ?', '1984'],
]))

// ——— Écologie : vrai ou faux ? ———
await ecrire('eco-vf', [
  ['Les océans absorbent environ un quart du CO₂ émis par les humains.', true, 'Ce qui les rend aussi plus acides'],
  ['Le verre se recycle à l’infini.', true, 'Sans perdre en qualité'],
  ['Un appareil en veille ne consomme rien.', false, 'Les veilles pèsent jusqu’à 10 % de la facture d’électricité'],
  ['L’Amazonie produit 20 % de l’oxygène que nous respirons.', false, 'Elle consomme presque autant d’oxygène qu’elle en produit ; l’essentiel vient du plancton'],
  ['Le plastique se recycle à l’infini.', false, 'Il se dégrade à chaque recyclage'],
  ['L’élevage représente environ 14,5 % des émissions mondiales de gaz à effet de serre.', true, 'Chiffre de la FAO'],
  ['Le numérique pèse environ 3 à 4 % des émissions mondiales.', true, 'Surtout à cause de la fabrication des appareils'],
  ['Une voiture électrique n’émet aucun CO₂ sur toute sa vie.', false, 'Sa fabrication, et surtout sa batterie, en émet beaucoup'],
  ['L’électricité nucléaire émet peu de CO₂ par kWh produit.', true, 'Autant que l’éolien, sur tout son cycle de vie'],
  ['Le trou dans la couche d’ozone est la cause principale du réchauffement climatique.', false, 'Ce sont deux problèmes différents'],
  ['Le CO₂ est le seul gaz à effet de serre.', false, 'Il y a aussi le méthane, le protoxyde d’azote, la vapeur d’eau…'],
  ['À masse égale, le méthane réchauffe bien plus que le CO₂.', true, 'Environ 80 fois plus sur 20 ans'],
  ['Laver son linge à 30 °C consomme moins qu’à 60 °C.', true, 'Chauffer l’eau est ce qui coûte le plus'],
  ['Un sac en papier a toujours un meilleur bilan qu’un sac en plastique.', false, 'Il faut le réutiliser plusieurs fois pour qu’il soit plus écologique'],
  ['Le « 7ᵉ continent de plastique » est une île sur laquelle on peut marcher.', false, 'C’est une soupe de minuscules débris flottants'],
  ['Une tomate sous serre chauffée en hiver émet plus qu’une tomate de saison.', true, 'Jusqu’à plusieurs fois plus'],
  ['La surface des forêts françaises a augmenté depuis le XIXᵉ siècle.', true, 'Elle a presque doublé'],
  ['Les ours polaires vivent en Antarctique.', false, 'Ils vivent en Arctique, au nord'],
  ['Recycler une canette économise environ 95 % de l’énergie d’une canette neuve.', true, 'L’aluminium est très coûteux à produire'],
  ['Le panda géant n’est plus classé « en danger » depuis 2016.', true, 'Il est désormais « vulnérable » grâce à la protection de son habitat'],
  ['Un bain consomme en général plus d’eau qu’une douche de 5 minutes.', true, 'Environ 150 litres contre 60'],
  ['Les abeilles pollinisent une grande partie des cultures alimentaires.', true, 'Environ trois quarts des cultures en dépendent au moins en partie'],
  ['Manger local est toujours plus écologique que manger de saison.', false, 'Un produit local sous serre chauffée peut émettre plus qu’un produit de saison venu de plus loin'],
  ['Les glaciers des Alpes ont fortement reculé depuis un siècle.', true, 'Certains ont perdu plus de la moitié de leur volume'],
].map(([n, v, d], i) => ({ id: `ecovf-${i}`, n: T(n), r: v ? T('Vrai', 'True') : T('Faux', 'False'), d: T(d) })))
