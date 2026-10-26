// Comparaisons improbables : « combien de terrains de foot ? », « combien de tacos ? »… (ordres de grandeur arrondis).
// Chaque question a ses propres pièges dans la même unité (x.pieges) : les mauvaises réponses restent crédibles.
// Repères : terrain de foot 105 × 68 m = 0,714 ha ; tacos 8 € ; girafe 5 m ; éléphant d'Afrique 6 t ; Tour Eiffel 330 m et 10 100 t ;
// baguette 65 cm ; douche de 5 min 60 L ; baignoire 150 L ; piscine olympique 2 500 m³ ; arbre 25 kg de CO₂ absorbés par an.
// Usage : node scripts/build-comparaisons.mjs
import { writeFile } from 'node:fs/promises'

const T = (fr) => ({ fr, en: fr })
const ecrire = (id, lignes) => writeFile(`public/packs/culture/${id}.json`, JSON.stringify(lignes.map(([n, r, pieges, d], i) => ({ id: `${id}-${i}`, n: T(n), r: T(r), d: T(d), x: { pieges: pieges.join('|') } }))))
  .then(() => console.log(`${id} : ${lignes.length}`))

// ——— Écologie : [question, réponse, pièges, explication] ———
await ecrire('eco-comparaisons', [
  ['Chaque minute, la forêt tropicale primaire perdue dans le monde équivaut à combien de terrains de foot ?', '10 terrains de foot', ['1 terrain de foot', '100 terrains de foot', '1 000 terrains de foot', '3 terrains de foot', '35 terrains de foot'], 'Environ 3,7 millions d’hectares perdus en 2023 (Global Forest Watch), soit près de 10 terrains par minute.'],
  ['La surface de Paris, c’est combien de terrains de foot ?', '14 700 terrains de foot', ['1 500 terrains de foot', '147 000 terrains de foot', '500 terrains de foot', '4 700 terrains de foot', '47 000 terrains de foot'], 'Paris fait 105 km², et un terrain 0,714 ha.'],
  ['L’Amazonie, c’est combien de fois la France métropolitaine ?', '10 fois', ['2 fois', '50 fois', '100 fois', '4 fois', '25 fois'], '5,5 millions de km² de forêt contre 550 000 km² pour la France.'],
  ['Le « continent de plastique » du Pacifique, c’est combien de fois la France ?', '3 fois', ['La moitié', '10 fois', '30 fois', '1 fois', '6 fois'], 'Environ 1,6 million de km² selon The Ocean Cleanup.'],
  ['Les méga-feux australiens de 2019-2020 ont brûlé l’équivalent de combien de Belgique ?', '6 Belgique', ['1 Belgique', '20 Belgique', '60 Belgique', '3 Belgique', '12 Belgique'], 'Environ 18,6 millions d’hectares, la Belgique en fait 3,07 millions.'],
  ['Combien de camions-poubelle de plastique finissent dans l’océan chaque minute ?', '1 camion-poubelle', ['1 par jour', '100 camions-poubelle', '1 par heure', '10 camions-poubelle', '1 000 camions-poubelle'], 'L’ordre de grandeur souvent cité : environ 11 millions de tonnes par an.'],
  ['La production mondiale de plastique en un an pèse autant que combien de Tours Eiffel ?', '40 000 Tours Eiffel', ['400 Tours Eiffel', '4 000 Tours Eiffel', '400 000 Tours Eiffel', '4 millions de Tours Eiffel', '1 000 Tours Eiffel'], 'Environ 400 millions de tonnes par an, la Tour Eiffel pèse 10 100 tonnes.'],
  ['Le Groenland perd environ 270 milliards de tonnes de glace par an : combien de piscines olympiques par seconde ?', '3 piscines olympiques par seconde', ['1 par heure', '1 par minute', '30 par seconde', '300 par seconde', '1 par jour'], '270 milliards de m³ d’eau par an ÷ 2 500 m³ par piscine ÷ 31,5 millions de secondes.'],
  ['Combien de bouteilles en plastique sont achetées dans le monde chaque minute ?', '1 million', ['1 000', '10 000', '100 000', '10 millions', '100 millions'], 'Le chiffre souvent cité depuis une enquête du Guardian (2017).'],
  ['Il faut environ 7 500 litres d’eau pour fabriquer un jean. Ça fait combien de douches de 5 minutes ?', '125 douches', ['12 douches', '1 250 douches', '40 douches', '400 douches', '5 douches'], 'Une douche de 5 minutes, c’est environ 60 litres.'],
  ['Produire 1 kg de bœuf demande environ 15 000 litres d’eau. Ça fait combien de baignoires ?', '100 baignoires', ['10 baignoires', '1 000 baignoires', '3 baignoires', '30 baignoires', '300 baignoires'], 'Une baignoire, c’est environ 150 litres.'],
  ['Un aller-retour Paris – New York en avion émet autant de CO₂ (par passager) que combien de km en voiture ?', '8 000 km', ['800 km', '80 000 km', '200 km', '2 000 km', '25 000 km'], 'Environ 1,75 tonne d’équivalent CO₂ (ADEME), une voiture thermique en émet ≈ 0,22 kg par km.'],
  ['Combien d’arbres faut-il pendant un an pour absorber le CO₂ d’un aller-retour Paris – New York ?', '70 arbres', ['7 arbres', '700 arbres', '2 arbres', '20 arbres', '7 000 arbres'], '1,75 tonne de CO₂ ÷ 25 kg absorbés par arbre et par an.'],
  ['En une vie, un Français produit environ 46 tonnes de déchets ménagers. Ça pèse combien d’éléphants ?', '8 éléphants', ['1 éléphant', '80 éléphants', '3 éléphants', '25 éléphants', '800 éléphants'], 'Environ 580 kg par an pendant 80 ans, un éléphant d’Afrique pèse 6 tonnes.'],
  ['Un Français jette environ 30 kg de nourriture par an chez lui. Ça fait combien de baguettes ?', '120 baguettes', ['12 baguettes', '1 200 baguettes', '40 baguettes', '400 baguettes', '6 baguettes'], 'Une baguette pèse 250 g (chiffres ADEME : environ 30 kg par personne et par an).'],
  ['Une éolienne terrestre moderne fournit l’électricité (hors chauffage) d’environ combien de foyers ?', '2 000 foyers', ['20 foyers', '200 foyers', '20 000 foyers', '200 000 foyers', '50 foyers'], 'Environ 4 400 MWh par an pour 2 MW, un foyer consomme ≈ 2 500 kWh hors chauffage.'],
  ['Une vache émet chaque année autant de gaz à effet de serre que… ?', 'Une voiture qui roule toute l’année', ['Un smartphone chargé tous les jours', 'Un vol Paris – Nice', 'Une maison chauffée pendant 10 ans', 'Un bus scolaire', 'Une ampoule allumée un an'], 'Environ 100 kg de méthane par an, soit ≈ 2,8 t d’équivalent CO₂ : comme 13 000 km en voiture.'],
  ['Une baleine stocke environ 33 tonnes de CO₂ dans sa vie. Ça fait combien d’arbres pendant un an ?', '1 300 arbres', ['13 arbres', '130 arbres', '13 000 arbres', '130 000 arbres', '400 arbres'], 'Estimation du FMI : 33 t ÷ 25 kg par arbre et par an.'],
  ['Combien de bouteilles en plastique recyclées faut-il pour fabriquer un pull polaire ?', '27 bouteilles', ['2 bouteilles', '270 bouteilles', '8 bouteilles', '80 bouteilles', '1 000 bouteilles'], 'Le chiffre souvent cité par Citeo (ex-Eco-Emballages).'],
  ['Recycler une canette économise assez d’énergie pour faire marcher une télé pendant combien de temps ?', '3 heures', ['3 secondes', '3 minutes', '3 jours', '3 semaines', '30 heures'], 'Recycler l’aluminium demande 95 % d’énergie en moins que d’en produire du neuf.'],
  ['Une tonne de papier recyclé évite de couper combien d’arbres ?', '17 arbres', ['1 arbre', '170 arbres', '5 arbres', '50 arbres', '1 700 arbres'], 'Le chiffre classique du recyclage du papier.'],
  ['Une heure de streaming vidéo émet à peu près autant de CO₂ qu’une voiture qui roule… ?', '200 mètres', ['2 mètres', '20 mètres', '2 km', '20 km', '200 km'], 'Environ 36 g de CO₂ par heure (estimation de l’AIE), une voiture ≈ 220 g par km.'],
  ['Le bitcoin consomme chaque année à peu près autant d’électricité que… ?', 'La Pologne', ['Le Luxembourg', 'La ville de Lyon', 'La Chine', 'Les États-Unis', 'Un village de 1 000 habitants'], 'Environ 150 à 170 TWh par an selon l’université de Cambridge, comme un pays européen moyen.'],
  ['La France métropolitaine couverte de terrains de foot, ça en ferait combien ?', '77 millions', ['77 000', '770 000', '7,7 millions', '770 millions', '7,7 milliards'], '551 695 km² ÷ 0,714 ha.'],
])

// ——— Comparaisons absurdes (tous sujets) ———
await ecrire('comparaisons', [
  ['Le transfert de Neymar au PSG (222 millions d’euros), c’est combien de tacos à 8 € ?', '28 millions de tacos', ['280 000 tacos', '2,8 millions de tacos', '280 millions de tacos', '2,8 milliards de tacos', '900 000 tacos'], '222 000 000 ÷ 8 = 27,75 millions.'],
  ['Le Salvator Mundi, tableau le plus cher du monde (environ 400 millions d’euros), c’est combien de tacos à 8 € ?', '50 millions de tacos', ['500 000 tacos', '5 millions de tacos', '500 millions de tacos', '5 milliards de tacos', '15 millions de tacos'], 'Vendu 450 millions de dollars en 2017.'],
  ['Un Smic net (environ 1 430 € par mois), c’est combien de tacos à 8 € ?', '180 tacos', ['18 tacos', '1 800 tacos', '60 tacos', '500 tacos', '30 tacos'], '1 430 ÷ 8 ≈ 179.'],
  ['Une PS5 (environ 500 €), c’est combien de tacos à 8 € ?', '60 tacos', ['6 tacos', '600 tacos', '20 tacos', '200 tacos', '35 tacos'], '500 ÷ 8 ≈ 62.'],
  ['Un iPhone haut de gamme (environ 1 500 €), c’est combien de tacos à 8 € ?', '190 tacos', ['19 tacos', '1 900 tacos', '60 tacos', '600 tacos', '90 tacos'], '1 500 ÷ 8 ≈ 187.'],
  ['La Tour Eiffel (330 m), c’est combien de girafes empilées ?', '66 girafes', ['6 girafes', '660 girafes', '20 girafes', '200 girafes', '33 girafes'], 'Une girafe mesure environ 5 m.'],
  ['La Tour Eiffel pèse combien d’éléphants d’Afrique ?', '1 700 éléphants', ['17 éléphants', '170 éléphants', '17 000 éléphants', '170 000 éléphants', '500 éléphants'], '10 100 tonnes ÷ 6 tonnes.'],
  ['Le Burj Khalifa (828 m), c’est combien de Tours Eiffel ?', '2,5 Tours Eiffel', ['1,2 Tour Eiffel', '5 Tours Eiffel', '10 Tours Eiffel', '25 Tours Eiffel', '4 Tours Eiffel'], '828 ÷ 330 ≈ 2,5.'],
  ['Combien de Tours Eiffel faut-il empiler pour atteindre la Station spatiale internationale ?', '1 200 Tours Eiffel', ['12 Tours Eiffel', '120 Tours Eiffel', '12 000 Tours Eiffel', '120 000 Tours Eiffel', '400 Tours Eiffel'], 'L’ISS vole à environ 400 km d’altitude.'],
  ['La distance Terre – Lune, c’est combien de baguettes mises bout à bout ?', '590 millions de baguettes', ['5,9 millions de baguettes', '59 millions de baguettes', '5,9 milliards de baguettes', '59 milliards de baguettes', '590 000 baguettes'], '384 400 km ÷ 65 cm.'],
  ['La distance Terre – Lune, c’est combien de tours de la Terre ?', '9,6 tours', ['1 tour', '3 tours', '30 tours', '96 tours', '960 tours'], '384 400 km ÷ 40 075 km.'],
  ['Combien de bananes alignées faut-il pour faire le tour de la Terre ?', '200 millions de bananes', ['2 millions de bananes', '20 millions de bananes', '2 milliards de bananes', '20 milliards de bananes', '200 000 bananes'], '40 075 km ÷ 20 cm.'],
  ['Combien de briques LEGO empilées pour atteindre le sommet de l’Everest ?', '920 000 briques', ['9 200 briques', '92 000 briques', '9,2 millions de briques', '92 millions de briques', '300 000 briques'], '8 849 m ÷ 9,6 mm par brique.'],
  ['Monaco, c’est combien de terrains de foot ?', '290 terrains de foot', ['29 terrains de foot', '2 900 terrains de foot', '90 terrains de foot', '900 terrains de foot', '12 terrains de foot'], '2,08 km² ÷ 0,714 ha.'],
  ['Le Vatican, c’est combien de terrains de foot ?', '62 terrains de foot', ['6 terrains de foot', '620 terrains de foot', '20 terrains de foot', '200 terrains de foot', '2 terrains de foot'], '0,44 km² ÷ 0,714 ha.'],
  ['Un Boeing 747 à vide pèse combien d’éléphants d’Afrique ?', '30 éléphants', ['3 éléphants', '300 éléphants', '10 éléphants', '100 éléphants', '3 000 éléphants'], 'Environ 180 tonnes ÷ 6 tonnes.'],
  ['Une baleine bleue pèse combien de voitures ?', '115 voitures', ['11 voitures', '1 150 voitures', '40 voitures', '400 voitures', '5 voitures'], 'Environ 150 tonnes ÷ 1,3 tonne.'],
  ['En comptant un nombre par seconde sans jamais s’arrêter, combien de temps pour arriver à un milliard ?', '32 ans', ['32 jours', '3 ans', '320 ans', '3 200 ans', '11 jours'], 'Un milliard de secondes ≈ 31,7 ans.'],
  ['Un million de secondes, ça fait combien de temps ?', '11 jours et demi', ['1 jour', '3 heures', '4 mois', '2 ans', '32 ans'], '1 000 000 ÷ 86 400 ≈ 11,6 jours.'],
  ['Combien de fois cligne-t-on des yeux en une journée (16 h éveillé) ?', '14 400 fois', ['144 fois', '1 440 fois', '144 000 fois', '1,4 million de fois', '400 fois'], 'Environ 15 fois par minute.'],
  ['Toute la bière bue en France en un an remplirait combien de piscines olympiques ?', '840 piscines olympiques', ['8 piscines olympiques', '84 piscines olympiques', '8 400 piscines olympiques', '84 000 piscines olympiques', '300 piscines olympiques'], 'Environ 21 millions d’hectolitres par an ÷ 2 500 m³.'],
  ['Un escargot qui ne s’arrête jamais (environ 3,6 m par heure) mettrait combien de temps pour faire Paris – Marseille ?', '25 ans', ['25 jours', '2 ans', '250 ans', '2 500 ans', '6 mois'], '775 km ÷ 3,6 m/h ≈ 215 000 heures.'],
  ['Un marathon brûle environ 2 600 kcal. Ça fait combien de Big Mac ?', '5 Big Mac', ['1 Big Mac', '15 Big Mac', '50 Big Mac', '2 Big Mac', '30 Big Mac'], 'Un Big Mac fait environ 550 kcal.'],
  ['La France métropolitaine, c’est combien de fois Paris ?', '5 250 fois', ['52 fois', '525 fois', '52 500 fois', '525 000 fois', '1 500 fois'], '551 695 km² ÷ 105 km².'],
  ['Le Stade de France (80 000 places) rempli de tacos empilés à raison d’un par siège : combien d’euros à 8 € le tacos ?', '640 000 €', ['6 400 €', '64 000 €', '6,4 millions d’euros', '64 millions d’euros', '200 000 €'], '80 000 × 8 €.'],
  ['Le Mont Blanc (4 806 m), c’est combien de Tours Eiffel ?', '14,5 Tours Eiffel', ['1,5 Tour Eiffel', '4,8 Tours Eiffel', '48 Tours Eiffel', '145 Tours Eiffel', '30 Tours Eiffel'], '4 806 ÷ 330.'],
  ['Le Titanic (269 m de long), c’est combien de terrains de foot mis bout à bout (dans la longueur) ?', '2,5 terrains de foot', ['1 terrain de foot', '5 terrains de foot', '10 terrains de foot', '25 terrains de foot', '0,5 terrain de foot'], '269 m ÷ 105 m.'],
  ['Combien de baguettes faut-il pour faire la hauteur de la Tour Eiffel ?', '500 baguettes', ['50 baguettes', '5 000 baguettes', '150 baguettes', '1 500 baguettes', '50 000 baguettes'], '330 m ÷ 65 cm ≈ 508.'],
])
