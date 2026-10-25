import type { Lang } from '../i18n'
import { PIEGES_CAPITALES, piegesSymbole, sosiesDe } from './pieges'
import { prioriser } from './memoire'

export type Pays = {
  id: string
  num?: string // code ISO numérique (cartes world-atlas)
  nom: Record<Lang, string>
  alias?: string[]
  capitale: Record<Lang, string> | null
  region: Record<Lang, string>
  population: number
  superficie: number
  latlng: [number, number] | null
}
// [nom, population, lat, lng, département | code pays]
export type Ville = [string, number, number, number, string]

export type Mode = 'qcm' | 'libre'
export type Difficulte = 0 | 1 | 2 | 3 | 4 | 5 // 0 = tout (toutes débloquées mélangées) ; 5 = Légende
export const LEGENDE = 5
// Légende : 6 propositions au lieu de 4, toutes piégeuses
// Nombre de mauvaises réponses : 2 choix en Facile, 3 en Moyen, 4 en Difficile, 5 en Expert, 6 en Légende (4 en « tout »)
const nbLeurres = (d: Difficulte) => (d === LEGENDE ? 5 : d >= 1 && d <= 4 ? d : 3)
export type Palier = 1 | 2 | 3 | 4

export type SousThemeId = 'drapeaux' | 'drapeaux-europe' | 'drapeaux-afrique' | 'drapeaux-asie' | 'drapeaux-ameriques' | 'drapeaux-oceanie' | 'drapeaux-inverse' | 'capitales' | 'capitales-inverse' | 'villes-fr' | 'villes-monde' | 'pays-carte' | 'logos-vrai' | CultureId

// Thèmes générés depuis Wikidata (scripts/build-culture.mjs)
type Texte = Record<Lang, string>
export type ItemCulture = { id: string; n: Texte; d?: Texte; img?: string; r?: string | Texte; g?: string; alt?: Texte[]; x?: Record<string, string | Texte | undefined>; f?: [Texte, string | Texte | undefined][] }
type TypeCulture = 'image' | 'attribut' | 'annee' | 'audio'
const minuscule = (n: string) => n.charAt(0).toLowerCase() + n.slice(1)
// « de Paris », « du Havre », « de la Rochelle », « d’Angers »
const deVille = (n: string) => n.startsWith('Le ') ? `du ${n.slice(3)}` : n.startsWith('Les ') ? `des ${n.slice(4)}` : n.startsWith('La ') ? `de la ${n.slice(3)}` : /^[AEIOUYÉÈÂH]/i.test(n) ? `d’${n}` : `de ${n}`
const CULTURE = {
  films: { type: 'attribut', q: { fr: (n) => `Qui a réalisé « ${n} » ?`, en: (n) => `Who directed “${n}”?` } },
  series: { type: 'annee', q: { fr: (n) => `En quelle année a débuté la série « ${n} » ?`, en: (n) => `In what year did “${n}” first air?` } },
  acteurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette actrice ?' : 'Qui est cet acteur ?'), en: () => 'Who is this actor?' } },
  artistes: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette artiste ?' : 'Qui est cet artiste ?'), en: () => 'Who is this artist?' } },
  albums: { type: 'attribut', q: { fr: (n) => `Quel artiste a sorti l’album « ${n} » ?`, en: (n) => `Which artist released the album “${n}”?` } },
  animaux: { type: 'image', q: { fr: () => 'Quel est cet animal ?', en: () => 'What is this animal?' } },
  mammiferes: { type: 'image', q: { fr: () => 'Quel est ce mammifère ?', en: () => 'What is this mammal?' } },
  oiseaux: { type: 'image', q: { fr: () => 'Quel est cet oiseau ?', en: () => 'What is this bird?' } },
  poissons: { type: 'image', q: { fr: () => 'Quel est ce poisson ?', en: () => 'What is this fish?' } },
  reptiles: { type: 'image', q: { fr: () => 'Quel est cet animal ?', en: () => 'What is this animal?' } },
  papillons: { type: 'image', q: { fr: () => 'Quel est ce papillon ?', en: () => 'What is this butterfly?' } },
  araignees: { type: 'image', q: { fr: () => 'Quelle est cette araignée ?', en: () => 'What is this spider?' } },
  champignons: { type: 'image', q: { fr: () => 'Quel est ce champignon ?', en: () => 'What is this mushroom?' } },
  chiens: { type: 'image', q: { fr: () => 'Quelle est cette race de chien ?', en: () => 'Which dog breed is this?' } },
  chats: { type: 'image', q: { fr: () => 'Quelle est cette race de chat ?', en: () => 'Which cat breed is this?' } },
  chevaux: { type: 'image', q: { fr: () => 'Quelle est cette race de cheval ?', en: () => 'Which horse breed is this?' } },
  'noms-scientifiques': { type: 'attribut', pack: 'animaux', champ: 'latin', montrer: true, q: { fr: (n) => `Quel est le nom scientifique de : ${n} ?`, en: (n) => `What is the scientific name of ${n}?` } },
  insectes: { type: 'image', q: { fr: () => 'Quel est cet insecte ?', en: () => 'What is this insect?' } },
  plantes: { type: 'image', q: { fr: () => 'Quelle est cette plante ?', en: () => 'What is this plant?' } },
  corps: { type: 'attribut', q: { fr: (n) => `Quelle partie du corps : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Which body part ${n}?` } },
  elements: { type: 'attribut', q: { fr: (n) => `Quel est le symbole chimique de cet élément : ${n} ?`, en: (n) => `What is the chemical symbol of ${n}?` } },
  personnalites: { type: 'image', q: { fr: () => 'Qui est cette personnalité ?', en: () => 'Who is this famous person?' } },
  histoire: { type: 'annee', q: { fr: (n) => `En quelle année a commencé : ${n} ?`, en: (n) => `In what year did this begin: ${n}?` } },
  logos: { type: 'image', q: { fr: () => 'À quelle marque appartient ce logo ?', en: () => 'Which brand does this logo belong to?' } },
  marques: { type: 'attribut', q: { fr: (n) => `De quel pays vient ${n} ?`, en: (n) => `Which country is ${n} from?` } },
  monuments: { type: 'image', q: { fr: () => 'Quel est ce monument ?', en: () => 'What is this landmark?' } },
  plats: { type: 'attribut', montrer: true, q: { fr: (n) => `De quel pays vient ce plat : ${n} ?`, en: (n) => `Which country is this dish from: ${n}?` } },
  monnaies: { type: 'attribut', q: { fr: (n) => `Quelle est la monnaie de ce pays : ${n} ?`, en: (n) => `What is the currency of ${n}?` } },
  langues: { type: 'attribut', q: { fr: (n) => `Quelle est une langue officielle de ce pays : ${n} ?`, en: (n) => `What is an official language of ${n}?` } },
  tableaux: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui a peint « ${n} » ?`, en: (n) => `Who painted “${n}”?` } },
  'films-annee': { type: 'annee', pack: 'films', champ: 'annee', q: { fr: (n) => `En quelle année est sorti « ${n} » ?`, en: (n) => `In what year was “${n}” released?` } },
  'personnalites-pays': { type: 'attribut', pack: 'personnalites', champ: 'pays', montrer: true, q: { fr: (n) => `De quel pays est ${n} ?`, en: (n) => `Which country is ${n} from?` } },
  'personnalites-metier': { type: 'attribut', pack: 'personnalites', champ: 'metier', montrer: true, q: { fr: (n) => `Quelle est l’activité principale de ${n} ?`, en: (n) => `What is ${n} best known as?` } },
  'personnalites-naissance': { type: 'annee', pack: 'personnalites', champ: 'naissance', montrer: true, q: { fr: (n, g) => `En quelle année est ${g === 'f' ? 'née' : 'né'} ${n} ?`, en: (n) => `In what year was ${n} born?` } },
  clubs: { type: 'image', q: { fr: () => 'Quel est ce club ?', en: () => 'Which club is this?' } },
  sportifs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette sportive ?' : 'Qui est ce sportif ?'), en: () => 'Who is this athlete?' } },
  'sportifs-sport': { type: 'attribut', pack: 'sportifs', champ: 'sport', montrer: true, q: { fr: (n) => `Quel sport pratique ${n} ?`, en: (n) => `What sport does ${n} play?` } },
  jo: { type: 'attribut', q: { fr: (n) => `Dans quel pays se sont déroulés les ${n} ?`, en: (n) => `In which country were the ${n} held?` } },
  livres: { type: 'attribut', q: { fr: (n) => `Qui a écrit « ${n} » ?`, en: (n) => `Who wrote “${n}”?` } },
  'livres-annee': { type: 'annee', pack: 'livres', champ: 'annee', q: { fr: (n) => `En quelle année a été publié « ${n} » ?`, en: (n) => `In what year was “${n}” published?` } },
  auteurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette écrivaine ?' : 'Qui est cet écrivain ?'), en: () => 'Who is this writer?' } },
  bd: { type: 'image', q: { fr: () => 'Quel est ce personnage ?', en: () => 'Who is this character?' } },
  mangas: { type: 'attribut', q: { fr: (n) => `Qui est l’auteur du manga « ${n} » ?`, en: (n) => `Who created the manga “${n}”?` } },
  inventions: { type: 'attribut', q: { fr: (n) => `Qui a inventé ou découvert : ${n} ?`, en: (n) => `Who invented or discovered: ${n}?` } },
  constellations: { type: 'image', q: { fr: () => 'Quelle est cette constellation ?', en: () => 'Which constellation is this?' } },
  scientifiques: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette scientifique ?' : 'Qui est ce scientifique ?'), en: () => 'Who is this scientist?' } },
  lunes: { type: 'attribut', q: { fr: (n) => `Autour de quel astre tourne ${n} ?`, en: (n) => `What does ${n} orbit?` } },
  jeux: { type: 'attribut', q: { fr: (n) => `Quel studio a développé « ${n} » ?`, en: (n) => `Which studio developed “${n}”?` } },
  'jeux-annee': { type: 'annee', pack: 'jeux', champ: 'annee', q: { fr: (n) => `En quelle année est sorti « ${n} » ?`, en: (n) => `In what year was “${n}” released?` } },
  // Personnages : pack écrit à la main (scripts/build-jeux.mjs), des stars aux seconds rôles obscurs, image du wiki du jeu
  'persos-jeux': { type: 'image', pack: 'persos-jeu', q: { fr: () => 'Qui est ce personnage de jeu vidéo ?', en: () => 'Which video game character is this?' } },
  consoles: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui fabrique la console « ${n} » ?`, en: (n) => `Who makes the “${n}” console?` } },
  'departements-numero': { type: 'annee', pack: 'departements', champ: 'numero', q: { fr: (n) => `Quel est le numéro du département : ${n} ?`, en: (n) => `What is the number of the department ${n}?` } },
  'departements-prefecture': { type: 'attribut', pack: 'departements', champ: 'prefecture', q: { fr: (n) => `Quelle est la préfecture de ce département : ${n} ?`, en: (n) => `What is the prefecture of ${n}?` } },
  'departements-region': { type: 'attribut', pack: 'departements', champ: 'region', q: { fr: (n) => `Dans quelle région se trouve ce département : ${n} ?`, en: (n) => `Which region is ${n} in?` } },
  presidents: { type: 'image', q: { fr: () => 'Quel président de la République est-ce ?', en: () => 'Which French president is this?' } },
  montagnes: { type: 'attribut', montrer: true, q: { fr: (n) => `Dans quel pays se trouve : ${n} ?`, en: (n) => `Which country is ${n} in?` } },
  iles: { type: 'attribut', montrer: true, q: { fr: (n) => `À quel pays appartient l’île : ${n} ?`, en: (n) => `Which country does ${n} belong to?` } },
  fleuves: { type: 'attribut', q: { fr: (n) => `Quel pays traverse : ${n} ?`, en: (n) => `Which country does ${n} flow through?` } },
  'etats-us': { type: 'attribut', q: { fr: (n) => `Quelle est la capitale de l’État : ${n} ?`, en: (n) => `What is the capital of ${n}?` } },
  sculptures: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui a sculpté « ${n} » ?`, en: (n) => `Who sculpted “${n}”?` } },
  architecture: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui est l’architecte de : ${n} ?`, en: (n) => `Who was the architect of ${n}?` } },
  compositeurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette compositrice ?' : 'Qui est ce compositeur ?'), en: () => 'Who is this composer?' } },
  mouvements: { type: 'attribut', montrer: true, q: { fr: (n) => `De quel mouvement artistique relève « ${n} » ?`, en: (n) => `Which art movement is “${n}” part of?` } },
  // Vocabulaire : le mot est toujours donné en français, on demande sa traduction
  'traduction-en': { type: 'attribut', pack: 'vocabulaire', champ: 'en', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en anglais ?`, en: (n) => `How do you say “${n.toLowerCase()}” in English?` } },
  'traduction-es': { type: 'attribut', pack: 'vocabulaire', champ: 'es', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en espagnol ?`, en: (n) => `How do you say “${n.toLowerCase()}” in Spanish?` } },
  'traduction-de': { type: 'attribut', pack: 'vocabulaire', champ: 'de', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en allemand ?`, en: (n) => `How do you say “${n.toLowerCase()}” in German?` } },
  'traduction-it': { type: 'attribut', pack: 'vocabulaire', champ: 'it', q: { fr: (n) => `Comment dit-on « ${n.toLowerCase()} » en italien ?`, en: (n) => `How do you say “${n.toLowerCase()}” in Italian?` } },
  extraits: { type: 'audio', q: { fr: () => 'Qui interprète ce titre ?', en: () => 'Who performs this song?' } },
  // Blind tests : mêmes extraits, on demande le titre ou l'album
  'blind-titre': { type: 'audio', pack: 'extraits', champ: 'nom', q: { fr: () => 'Quel est le titre de ce morceau ?', en: () => 'What is the title of this song?' } },
  // Blind tests rap et animés (scripts/build-deezer.mjs)
  'rap-fr': { type: 'audio', q: { fr: () => 'Qui rappe sur ce morceau ?', en: () => 'Who is rapping on this track?' } },
  'rap-us': { type: 'audio', q: { fr: () => 'Qui rappe sur ce morceau ?', en: () => 'Who is rapping on this track?' } },
  'rap-titre': { type: 'audio', pack: 'rap-fr', champ: 'nom', q: { fr: () => 'Quel est le titre de ce son ?', en: () => 'What is this track called?' } },
  openings: { type: 'audio', q: { fr: () => 'De quel animé vient cet opening ?', en: () => 'Which anime is this opening from?' } },
  'pokemon-photo': { type: 'image', q: { fr: () => 'Quel est ce Pokémon ?', en: () => 'Who’s that Pokémon?' } },
  'pokemon-silhouette': { type: 'image', pack: 'pokemon-photo', silhouette: true, q: { fr: () => 'Quel est ce Pokémon ? (silhouette)', en: () => 'Who’s that Pokémon? (silhouette)' } },
  'voix-vf': { type: 'audio', q: { fr: () => 'Qui chante cette chanson en version française ?', en: () => 'Who sings this in the French version?' } },
  'musiques-jeux': { type: 'audio', q: { fr: () => 'De quel jeu vidéo vient cette musique ?', en: () => 'Which video game is this music from?' } },
  'musiques-films': { type: 'audio', q: { fr: () => 'De quel film vient cette musique ?', en: () => 'Which film is this music from?' } },
  'chansons-disney': { type: 'audio', q: { fr: () => 'De quel film d’animation vient cette chanson ?', en: () => 'Which animated film is this song from?' } },
  generiques: { type: 'audio', q: { fr: () => 'De quel dessin animé vient ce générique ?', en: () => 'Which cartoon is this theme song from?' } },
  'blind-album': { type: 'audio', pack: 'extraits', champ: 'f:Album', q: { fr: () => 'De quel album vient ce morceau ?', en: () => 'Which album is this song from?' } },
  'artistes-genre': { type: 'attribut', pack: 'artistes', champ: 'genre', montrer: true, q: { fr: (n) => `Quel est le genre musical de ${n} ?`, en: (n) => `What music genre is ${n} known for?` } },
  studios: { type: 'attribut', q: { fr: (n) => `Quel studio a produit « ${n} » ?`, en: (n) => `Which studio produced “${n}”?` } },
  'studios-annee': { type: 'annee', pack: 'studios', champ: 'annee', q: { fr: (n) => `En quelle année est sorti « ${n} » ?`, en: (n) => `In what year was “${n}” released?` } },
  groupes: { type: 'image', q: { fr: () => 'Quel est ce groupe ?', en: () => 'Which band is this?' } },
  stades: { type: 'attribut', montrer: true, q: { fr: (n) => `Dans quelle ville se trouve : ${n} ?`, en: (n) => `Which city is ${n} in?` } },
  animes: { type: 'annee', champ: 'annee', montrer: true, q: { fr: (n) => `En quelle année a débuté l’animé « ${n} » ?`, en: (n) => `In what year did “${n}” first air?` } },
  'animes-studio': { type: 'attribut', pack: 'animes', montrer: true, q: { fr: (n) => `Quel studio a produit l’animé « ${n} » ?`, en: (n) => `Which studio made “${n}”?` } },
  'persos-animes': { type: 'attribut', montrer: true, groupe: 'genre', q: { fr: (n) => `De quel animé vient ce personnage : ${n} ?`, en: (n) => `Which anime is ${n} from?` } },
  'lieux-animes': { type: 'attribut', montrer: true, groupe: 'genre', q: { fr: (n) => `De quel animé vient ce lieu : ${n} ?`, en: (n) => `Which anime is ${n} from?` } },
  mechants: { type: 'attribut', montrer: true, groupe: 'genre', q: { fr: (n) => `De quelle œuvre vient ce méchant : ${n} ?`, en: (n) => `Which work is the villain ${n} from?` } },
  'sports-photo': { type: 'image', q: { fr: () => 'Quel est ce sport ?', en: () => 'Which sport is this?' } },
  balles: { type: 'image', q: { fr: () => 'Pour quel sport est cette balle ?', en: () => 'Which sport is this ball for?' } },
  politiques: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette personnalité politique ?' : 'Qui est cet homme politique ?'), en: () => 'Who is this politician?' } },
  dirigeants: { type: 'image', q: { fr: () => 'Qui est ce dirigeant ?', en: () => 'Who is this world leader?' } },
  'plats-photo': { type: 'image', q: { fr: () => 'Quel est ce plat ?', en: () => 'What is this dish?' } },
  'verlan': { type: 'attribut', q: { fr: (n) => `Que veut dire ce mot en verlan : ${n} ?`, en: (n) => `Que veut dire ce mot en verlan : ${n} ?` } },
  'petits-animaux': { type: 'attribut', q: { fr: (n) => `Comment s’appelle le petit de cet animal : ${n} ?`, en: (n) => `Comment s’appelle le petit de cet animal : ${n} ?` } },
  'groupes-animaux': { type: 'attribut', q: { fr: (n) => `Comment appelle-t-on un groupe de : ${n} ?`, en: (n) => `Comment appelle-t-on un groupe de : ${n} ?` } },
  'surnoms-villes': { type: 'attribut', q: { fr: (n) => `Quelle ville surnomme-t-on « ${n} » ?`, en: (n) => `Quelle ville surnomme-t-on « ${n} » ?` } },
  'proverbes': { type: 'attribut', q: { fr: (n) => `Complète le proverbe : ${n}`, en: (n) => `Complète le proverbe : ${n}` } },
  'citations': { type: 'attribut', q: { fr: (n) => `Qui a dit : ${n} ?`, en: (n) => `Qui a dit : ${n} ?` } },
  'unites': { type: 'attribut', q: { fr: (n) => `Quelle est l’unité de mesure de : ${n} ?`, en: (n) => `Quelle est l’unité de mesure de : ${n} ?` } },
  'formules': { type: 'attribut', q: { fr: (n) => `Que désigne : ${n} ?`, en: (n) => `Que désigne : ${n} ?` } },
  'ballon-or': { type: 'image', q: { fr: () => 'Qui est ce Ballon d’or ?', en: () => 'Who is this Ballon d’Or winner?' } },
  'coupe-monde': { type: 'attribut', q: { fr: (n) => `Qui a remporté la ${n} ?`, en: (n) => `Who won the ${n}?` } },
  telephones: { type: 'attribut', montrer: true, q: { fr: (n) => `Quelle marque a sorti le ${n} ?`, en: (n) => `Which brand made the ${n}?` } },
  emissions: { type: 'annee', champ: 'annee', montrer: true, q: { fr: (n) => `En quelle année a débuté l’émission « ${n} » ?`, en: (n) => `In what year did “${n}” start?` } },
  'pourcentages': { type: 'attribut', q: { fr: (n) => `Quel est le pourcentage ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Quel est le pourcentage ${n} ?` } },
  'roles': { type: 'attribut', q: { fr: (n) => `Qui a joué ce rôle : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Qui a joué ce rôle : ${n} ?` } },
  'maladies': { type: 'attribut', q: { fr: (n) => `Quelle est cette maladie : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Quelle est cette maladie : ${n} ?` } },
  'troubles': { type: 'attribut', q: { fr: (n) => `Quel est ce trouble : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Quel est ce trouble : ${n} ?` } },
  'traditions': { type: 'attribut', q: { fr: (n) => `Quelle tradition est célèbre dans ce pays : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Quelle tradition est célèbre dans ce pays : ${n} ?` } },
  'specialites-pays': { type: 'attribut', q: { fr: (n) => `De quel pays vient cette spécialité : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `De quel pays vient cette spécialité : ${n} ?` } },
  'legendes': { type: 'attribut', q: { fr: (n) => `De quelle légende ou de quel mythe s’agit-il : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `De quelle légende ou de quel mythe s’agit-il : ${n} ?` } },
  catastrophes: { type: 'annee', champ: 'annee', montrer: true, q: { fr: (n) => `En quelle année a eu lieu : ${n} ?`, en: (n) => `In what year did this happen: ${n}?` } },
  'reseaux': { type: 'attribut', q: { fr: (n) => `Quel est ce réseau ou cette appli : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Quel est ce réseau ou cette appli : ${n} ?` } },
  'sigles-tech': { type: 'attribut', q: { fr: (n) => `Que signifie : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Que signifie : ${n} ?` } },
  'planetes': { type: 'attribut', q: { fr: (n) => `Qui ou quoi est-ce : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Qui ou quoi est-ce : ${n} ?` } },
  'logos-tech': { type: 'image', q: { fr: () => 'Quelle est cette entreprise tech ?', en: () => 'Which tech company is this?' } },
  fondateurs: { type: 'attribut', montrer: true, q: { fr: (n) => `Qui a fondé ${n} ?`, en: (n) => `Who founded ${n}?` } },
  missions: { type: 'annee', champ: 'annee', montrer: true, q: { fr: (n) => `En quelle année a été lancée la mission : ${n} ?`, en: (n) => `In what year was ${n} launched?` } },
  astronautes: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette astronaute ?' : 'Qui est cet astronaute ?'), en: () => 'Who is this astronaut?' } },
  'regles-jeux': { type: 'attribut', q: { fr: (n) => `${n} ?`, en: (n) => `${n}?` } },
  pokemon: { type: 'attribut', montrer: true, q: { fr: (n) => `De quel type est le Pokémon ${n} ?`, en: (n) => `What type is the Pokémon ${n}?` } },
  panneaux: { type: 'image', q: { fr: () => 'Que signifie ce panneau ?', en: () => 'What does this road sign mean?' } },
  'code-route': { type: 'attribut', q: { fr: (n) => `${n} ?`, en: (n) => `${n}?` } },
  'artistes-recents': { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette artiste ?' : 'Qui est cet artiste ?'), en: () => 'Who is this artist?' } },
  'artistes-fr': { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette artiste française ?' : 'Qui est cet artiste français ?'), en: () => 'Who is this French artist?' } },
  'photo-technique': { type: 'attribut', q: { fr: (n) => `Photo : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Photography: ${n}?` } },
  'plans-cinema': { type: 'attribut', q: { fr: (n) => `Cadrage : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Framing: ${n}?` } },
  lumiere: { type: 'attribut', q: { fr: (n) => `Lumière : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Lighting: ${n}?` } },
  'video-montage': { type: 'attribut', q: { fr: (n) => `Vidéo : ${n.charAt(0).toLowerCase() + n.slice(1)} ?`, en: (n) => `Video: ${n}?` } },
  'persos-classiques': { type: 'image', q: { fr: () => 'Qui est ce personnage classique ?', en: () => 'Who is this classic character?' } },
  volcans: { type: 'image', q: { fr: () => 'Quel est ce volcan ?', en: () => 'Which volcano is this?' } },
  'volcans-pays': { type: 'attribut', pack: 'volcans', montrer: true, q: { fr: (n) => `Dans quel pays se trouve le volcan ${n} ?`, en: (n) => `Which country is ${n} in?` } },
  fleurs: { type: 'image', q: { fr: () => 'Quelle est cette fleur ?', en: () => 'Which flower is this?' } },
  arbres: { type: 'image', q: { fr: () => 'Quel est cet arbre ?', en: () => 'Which tree is this?' } },
  'marques-mode': { type: 'image', q: { fr: () => 'Quelle est cette marque de mode ?', en: () => 'Which fashion brand is this?' } },
  peintres: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette peintre ?' : 'Qui est ce peintre ?'), en: () => 'Who is this painter?' } },
  'tableaux-photo': { type: 'image', pack: 'tableaux', q: { fr: () => 'Quel est ce tableau ?', en: () => 'Which painting is this?' } },
  applis: { type: 'image', q: { fr: () => 'Quelle est cette appli ?', en: () => 'Which app is this?' } },
  heros: { type: 'attribut', montrer: true, groupe: 'genre', q: { fr: (n) => `De quelle œuvre vient ce héros : ${n} ?`, en: (n) => `Which work is the hero ${n} from?` } },
  'heros-photo': { type: 'image', pack: 'heros', q: { fr: () => 'Qui est ce héros ?', en: () => 'Who is this hero?' } },
  'mechants-photo': { type: 'image', pack: 'mechants', q: { fr: () => 'Qui est ce méchant ?', en: () => 'Who is this villain?' } },
  doubleurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette comédienne de doublage ?' : 'Qui est ce comédien de doublage ?'), en: () => 'Who is this voice actor?' } },
  batailles: { type: 'annee', champ: 'annee', montrer: true, q: { fr: (n) => `En quelle année a eu lieu : ${n} ?`, en: (n) => `In what year was the ${n}?` } },
  attentats: { type: 'annee', champ: 'annee', montrer: true, q: { fr: (n) => `En quelle année a eu lieu : ${n} ?`, en: (n) => `In what year did this happen: ${n}?` } },
  'attentats-pays': { type: 'attribut', pack: 'attentats', champ: 'pays', montrer: true, q: { fr: (n) => `Dans quel pays a eu lieu : ${n} ?`, en: (n) => `In which country did this happen: ${n}?` } },
  traites: { type: 'annee', champ: 'annee', montrer: true, q: { fr: (n) => `En quelle année a été signé : ${n} ?`, en: (n) => `In what year was this signed: ${n}?` } },
  souverains: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette souveraine ?' : 'Qui est ce souverain ?'), en: () => 'Who is this monarch?' } },
  voitures: { type: 'attribut', montrer: true, q: { fr: (n) => `Quel constructeur fabrique la ${n} ?`, en: (n) => `Who makes the ${n}?` } },
  'voitures-photo': { type: 'image', pack: 'voitures', q: { fr: () => 'Quel est ce modèle de voiture ?', en: () => 'Which car model is this?' } },
  fromages: { type: 'attribut', montrer: true, q: { fr: (n) => `De quel pays vient ce fromage : ${n} ?`, en: (n) => `Which country is this cheese from: ${n}?` } },
  dieux: { type: 'image', q: { fr: () => 'Qui est cette divinité ?', en: () => 'Who is this deity?' } },
  'dieux-mythologie': { type: 'attribut', pack: 'dieux', montrer: true, q: { fr: (n) => `De quelle mythologie vient ${n} ?`, en: (n) => `Which mythology is ${n} from?` } },
  instruments: { type: 'image', q: { fr: () => 'Quel est cet instrument ?', en: () => 'Which instrument is this?' } },
  oscars: { type: 'annee', champ: 'annee', q: { fr: (n) => `En quelle année est sorti « ${n} » (Oscar du meilleur film) ?`, en: (n) => `In what year was “${n}” released?` } },
  affiches: { type: 'image', q: { fr: () => 'De quel film est cette affiche ?', en: () => 'Which film is this poster from?' } },
  'lieux-jeux': { type: 'attribut', montrer: true, groupe: 'genre', q: { fr: (n) => `De quel jeu vient ce lieu : ${n} ?`, en: (n) => `Which game is ${n} from?` } },
  sagas: { type: 'attribut', q: { fr: (n) => `Quel studio ou éditeur est derrière « ${n} » ?`, en: (n) => `Which studio or publisher is behind “${n}”?` } },
  // ——— Quiz spéciaux des événements (scripts/build-evenements.mjs) : l'élément est la question elle-même ———
  ...Object.fromEntries(['halloween', 'noel', 'nouvel-an', 'saint-valentin', 'paques', 'musique', 'ete', 'rentree'].map((e) => [`evt-${e}`, { type: 'attribut' as const, q: { fr: (n: string) => n, en: (n: string) => n } }])) as Record<`evt-${'halloween' | 'noel' | 'nouvel-an' | 'saint-valentin' | 'paques' | 'musique' | 'ete' | 'rentree'}`, { type: 'attribut'; q: Record<Lang, (nom: string) => string> }>,
  // ——— Nouveaux thèmes ———
  youtubeurs: { type: 'image', q: { fr: (_, g) => (g === 'f' ? 'Qui est cette vidéaste ?' : 'Qui est ce vidéaste ?'), en: () => 'Who is this content creator?' } },
  fruits: { type: 'image', q: { fr: () => 'Quel est ce fruit ?', en: () => 'What is this fruit?' } },
  legumes: { type: 'image', q: { fr: () => 'Quel est ce légume ?', en: () => 'What is this vegetable?' } },
  epices: { type: 'image', q: { fr: () => 'Quelle est cette épice ou herbe ?', en: () => 'What is this spice or herb?' } },
  desserts: { type: 'image', q: { fr: () => 'Quelle est cette douceur ?', en: () => 'What is this sweet treat?' } },
  dinosaures: { type: 'image', q: { fr: () => 'Quel est cet animal préhistorique ?', en: () => 'What is this prehistoric animal?' } },
  mineraux: { type: 'image', q: { fr: () => 'Quelle est cette pierre ?', en: () => 'What is this stone?' } },
  'jeux-societe': { type: 'image', q: { fr: () => 'Quel est ce jeu ?', en: () => 'What is this game?' } },
  // Énoncé « en grand » : les émojis, la réplique, le slogan… s'affichent en gros sous la question
  'emojis-series': { type: 'attribut', grand: true, q: { fr: () => 'Quelle série se cache derrière ces émojis ?', en: () => 'Which TV show is this?' } },
  'emojis-jeux': { type: 'attribut', grand: true, q: { fr: () => 'Quel jeu vidéo se cache derrière ces émojis ?', en: () => 'Which video game is this?' } },
  'emojis-expressions': { type: 'attribut', grand: true, q: { fr: () => 'Quelle expression se cache derrière ces émojis ?', en: () => 'Which saying is this?' } },
  'emojis-pays': { type: 'attribut', grand: true, q: { fr: () => 'Quel pays se cache derrière ces émojis ?', en: () => 'Which country is this?' } },
  'emojis-films': { type: 'attribut', grand: true, q: { fr: () => 'Quel film se cache derrière ces émojis ?', en: () => 'Which film do these emojis describe?' } },
  repliques: { type: 'attribut', grand: true, q: { fr: () => 'De quel film ou série vient cette réplique ?', en: () => 'Which film or show is this line from?' } },
  superheros: { type: 'attribut', q: { fr: (n) => `Quelle est l’identité secrète de ${n} ?`, en: (n) => `What is ${n}’s secret identity?` } },
  slogans: { type: 'attribut', grand: true, q: { fr: () => 'À quelle marque appartient ce slogan ?', en: () => 'Which brand uses this slogan?' } },
  'dessins-animes': { type: 'attribut', montrer: true, groupe: 'genre', q: { fr: (n) => `De quel dessin animé vient ce personnage : ${n} ?`, en: (n) => `Which cartoon is ${n} from?` } },
  'persos-animation': { type: 'attribut', montrer: true, groupe: 'genre', q: { fr: (n) => `De quel film d’animation vient ce personnage : ${n} ?`, en: (n) => `Which animated film is ${n} from?` } },
  'persos-animation-photo': { type: 'image', pack: 'persos-animation', q: { fr: () => 'Qui est ce personnage de Disney, Pixar ou DreamWorks ?', en: () => 'Which animated character is this?' } },
  'dessins-animes-photo': { type: 'image', pack: 'dessins-animes', q: { fr: () => 'Qui est ce personnage de dessin animé ?', en: () => 'Which cartoon character is this?' } },
  expressions: { type: 'attribut', grand: true, q: { fr: () => 'Que signifie cette expression ?', en: () => 'What does this French expression mean?' } },
  gentiles: { type: 'attribut', q: { fr: (n) => `Comment appelle-t-on les habitants ${deVille(n)} ?`, en: (n) => `What are the people of ${n} called?` } },
  phobies: { type: 'attribut', q: { fr: (n) => `De quoi a peur une personne atteinte de ${minuscule(n)} ?`, en: (n) => `What does someone with ${minuscule(n)} fear?` } },
  cris: { type: 'attribut', q: { fr: (n) => `Comment crie ${minuscule(n)} ?`, en: (n) => `What sound does ${minuscule(n)} make?` } },
  sigles: { type: 'attribut', grand: true, q: { fr: () => 'Que signifie ce sigle ?', en: () => 'What does this acronym stand for?' } },
  // Vrai ou faux : deux réponses seulement, jamais transformé en un autre format
  // Défis (scripts/build-defis.mjs) : l'élément est la question elle-même
  'devinettes': { type: 'attribut', grand: true, fixe: true, q: { fr: () => 'Devinette : qui suis-je ?', en: () => 'Riddle: who am I?' } },
  'suites-logiques': { type: 'attribut', grand: true, fixe: true, q: { fr: () => 'Complète la suite logique', en: () => 'Complete the sequence' } },
  'metiers': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'records-monde': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'mascottes': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'fast-food': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  // Écologie & planète (scripts/build-ecologie.mjs) : l'élément est la question elle-même
  'eco-eau': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-electricite': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-co2': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-decomposition': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-tri': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-saison': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-energies': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-dates': { type: 'attribut', q: { fr: (n) => n, en: (n) => n } },
  'eco-vf': { type: 'attribut', grand: true, fixe: true, q: { fr: () => 'Écologie : vrai ou faux ?', en: () => 'Ecology: true or false?' } },
  'idees-recues': { type: 'attribut', grand: true, fixe: true, q: { fr: () => 'Vrai ou faux ?', en: () => 'True or false?' } },
  'persos-univers': { type: 'attribut', pack: 'persos-jeu', montrer: true, groupe: 'genre', q: { fr: (n) => `De quel jeu vient ce personnage : ${n} ?`, en: (n) => `Which game is ${n} from?` } },
} satisfies Record<string, { type: TypeCulture; silhouette?: boolean; montrer?: boolean; pack?: string; champ?: string; grand?: boolean; fixe?: boolean; groupe?: string; q: Record<Lang, (nom: string, genre?: string) => string> }>
// (les quiz de dates gardent l'image : le titre est déjà dans la question)
const TRAHIT = new Set(['albums', 'livres', 'jeux', 'studios', 'logos', 'bd'])
export type CultureId = keyof typeof CULTURE
export const estCulture = (s: string): s is CultureId => s in CULTURE
export const packCulture = (s: CultureId) => (CULTURE[s] as { pack?: string }).pack ?? s
// Nature d'un quiz : sert aux mini-jeux (photo floue → quiz en images, avant / après → quiz d'années)
export function natureQuiz(s: string): 'image' | 'annee' | 'texte' | 'audio' | 'carte' {
  if (s === 'villes-fr' || s === 'villes-monde' || s === 'pays-carte') return 'carte'
  if (s === 'drapeaux') return 'image'
  if (!estCulture(s)) return 'texte'
  const t = CULTURE[s].type
  return t === 'attribut' ? 'texte' : t
}

// ——— La réponse ne doit jamais se lire dans la question ———
// Années : on retire les dates de l'énoncé (« Attaque du 29 mai 2018 à Liège » → « Attaque à Liège »).
// Autres : les mots de la réponse sont masqués (« la Peugeot 208 » → « la ___ 208 ») ;
// s'il ne reste rien de lisible, la question est écartée (null).
const MOIS = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december'
const DATE_INTRODUITE = new RegExp(`\\s*,?\\s*(?:(?:du|le|en|de|depuis|of|in|on|since)\\s+(?:\\d{1,2}(?:er)?\\s+)?(?:(?:${MOIS})\\s+)?|(?:\\d{1,2}(?:er)?\\s+)?(?:${MOIS})\\s+)\\d{4}(?![\\w])(?:\\s*[-–]\\s*\\d{2,4})?`, 'gi')
const sansAccent = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const VIDES = new Set(['les', 'des', 'the', 'and', 'une', 'pour', 'dans', 'avec', 'sur', 'par', 'saga', 'serie', 'group', 'groupe', 'games', 'game', 'company', 'studio', 'studios', 'entertainment'])
export function masquer(nom: string, reponse: string, annee: boolean): string | null {
  if (annee) {
    const sans = nom
      // Parenthèses qui contiennent une année : « (série télévisée de 2026) »
      .replace(/\s*\([^)]*\d{4}[^)]*\)/g, '')
      // Date introduite par « de », « du », « en »… ou par un mois : « du 13 novembre 2015 », « de 1870 »
      .replace(DATE_INTRODUITE, '')
      // L'année de la réponse où qu'elle soit ; un titre comme « Cosmos 1999 » (sorti en 1975) reste intact
      .replace(new RegExp(`\\s*(?<![\\w-])${reponse}(?![\\w])`, 'g'), '')
      .replace(/\s{2,}/g, ' ').trim()
    if (sans === nom.trim()) return nom
    // Il faut qu'il reste de quoi deviner (« Attentats » tout seul ne suffit pas)
    if (sans.split(/\s+/).filter((m) => m.replace(/[^\p{L}]/gu, '').length >= 3).length < 2) return null
    return sans
  }
  const mots = sansAccent(reponse).split(/[^a-z0-9]+/).filter((m) => m.length >= 4 && !VIDES.has(m))
  if (!mots.length) return nom
  let touche = false
  const masque = nom.split(/(\s+)/).map((m) => {
    const brut = sansAccent(m).replace(/[^a-z0-9]/g, '')
    if (brut.length >= 3 && mots.some((r) => brut === r || (brut.length >= 4 && (brut.includes(r) || r.includes(brut))))) { touche = true; return '___' }
    return m
  }).join('')
  if (!touche) return nom
  // Il doit rester au moins un vrai mot à lire
  return masque.split(/\s+/).some((m) => m !== '___' && (m.replace(/[^\p{L}\p{N}]/gu, '').length >= 4 || /\d/.test(m))) ? masque : null
}
export const quizFixe = (s: string) => estCulture(s) && !!(CULTURE[s] as { fixe?: boolean }).fixe

// effet : retouche CSS de l'image (faux logos : couleurs décalées, inversé, écrasé…)
export type Option = { label: string; image?: string; effet?: { filter?: string; transform?: string; truc?: string; force?: number; graine?: number; secours?: string } }
export type Fiche = { image?: string; faits: { l: string; v: string }[]; saviez: string; wiki: string }
export type Carte = {
  vue: 'france' | 'monde'
  cible?: [number, number] // lat, lng à placer
  zoomPays?: string // code numérique : la carte se cadre sur ce pays
  surligne?: string // code numérique du pays mis en évidence (QCM « quel est ce pays ? »)
  trouverPays?: string // code numérique du pays à cliquer
  seuilKm: number
}
export type Question = {
  id: string
  enonce: string
  image?: string
  reponse: string
  acceptees: string[]
  options: Option[]
  imagesOnly: boolean
  audio?: string // identifiant de titre Deezer (extrait à écouter)
  s?: SousThemeId // sous-thème d'origine (parties Mix, Express, Survie)
  boss?: boolean // question finale très dure (+30 pièces)
  carte?: Carte
  fiche: Fiche
  format?: 'qcm' | 'libre' | 'assistee' | 'vf' | 'lettres'
  propose?: string // vrai / faux : la réponse proposée
  vraie?: string // vrai / faux : la vraie réponse
  leurres?: string[] // saisie assistée : suggestions pièges
  lettres?: string[] // lettres mélangées
  grand?: string // texte à afficher en gros (émojis, réplique, slogan…)
  fixe?: boolean // format imposé (vrai / faux) : pas de transformation
  flou?: boolean // mini-jeu Photo floue : l'image se dévoile peu à peu
  silhouette?: boolean // image en ombre noire jusqu'à la réponse (« Quel est ce Pokémon ? »)
  effet?: 'flash' | 'zoom' // mini-jeux Flash (image furtive) et Zoom (gros plan qui se dézoome)
  jeu?: string // format tiré en mode Auto (pastille affichée sur la question)
  fondGris?: boolean // logos : fond gris pour voir aussi les logos blancs
}

export const drapeau = (id: string, w = 320) => `https://flagcdn.com/w${w}/${id}.png`
export const numPays = (n?: string) => (n ?? '').padStart(3, '0')

const caches = new Map<string, unknown>()
async function pack<T>(nom: string): Promise<T> {
  if (!caches.has(nom)) caches.set(nom, await (await fetch(`./packs/${nom}`)).json())
  return caches.get(nom) as T
}
export const chargerPays = async () => (await pack<{ pays: Pays[] }>('pays.json')).pays


// Énoncés en émojis : plus c'est dur, plus leur ordre est mélangé (on ne reconnaît plus la suite par cœur).
// Facile : ordre d'origine · Moyen : deux émojis échangés · Difficile et au-delà : ordre entièrement mélangé.
type Segmenteur = { segment: (s: string) => Iterable<{ segment: string }> }
const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: 'grapheme' }) => Segmenteur }).Segmenter
const segmenteur = Seg ? new Seg('fr', { granularity: 'grapheme' }) : null
export function melangerEmojis(s: string, niveau: number) {
  if (niveau <= 1 || !segmenteur || !/^[^p{L}d]+$/u.test(s)) return s
  const g = [...segmenteur.segment(s)].map((x) => x.segment).filter((x) => x.trim())
  if (g.length < 2) return s
  const avant = g.join('')
  for (let essai = 0; essai < 6 && g.join('') === avant; essai++) {
    if (niveau === 2) { const i = Math.floor(Math.random() * (g.length - 1)); [g[i], g[i + 1]] = [g[i + 1], g[i]] }
    else for (let i = g.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [g[i], g[j]] = [g[j], g[i]] }
  }
  return g.join('')
}

const melanger = <T,>(arr: T[]) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const L = {
  fr: { capital: 'Capitale', continent: 'Continent', population: 'Population', dep: 'Département', country: 'Pays' },
  en: { capital: 'Capital', continent: 'Continent', population: 'Population', dep: 'Department', country: 'Country' },
}
const ordinal = (n: number, lang: Lang) => lang === 'fr'
  ? (n === 1 ? '1er' : `${n}e`)
  : `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
const wiki = (titre: string, lang: Lang) => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(titre)}`

function fichePays(p: Pays, tous: Pays[], lang: Lang): Fiche {
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  const rang = ordinal(tous.indexOf(p) + 1, lang)
  const surf = p.superficie ? fmt.format(p.superficie) : ''
  return {
    image: drapeau(p.id),
    faits: [
      ...(p.capitale ? [{ l: L[lang].capital, v: p.capitale[lang] }] : []),
      { l: L[lang].continent, v: p.region[lang] },
      ...(p.population ? [{ l: L[lang].population, v: fmt.format(p.population) }] : []),
    ],
    saviez: lang === 'fr'
      ? `${p.nom.fr} est le ${rang} pays le plus peuplé du monde${surf ? `, pour ${surf} km²` : ''}.`
      : `${p.nom.en} is the world's ${rang} most populous country${surf ? `, covering ${surf} km²` : ''}.`,
    wiki: wiki(p.nom[lang], lang),
  }
}

// Plus un pays est peuplé, plus il est « connu »
const POOL_PAYS = { 1: 25, 2: 70, 3: 140, 4: Infinity } as const
// Paliers de population des villes
const MIN_FR = { 1: 80_000, 2: 20_000, 3: 5_000, 4: 0 } as const
const MIN_MONDE = { 1: 3_000_000, 2: 800_000, 3: 200_000, 4: 30_000 } as const
// Tolérance (km) : large en facile, plus serrée en expert
// Tolérance (km) : large en facile pour apprendre où sont les villes, serrée en expert
const SEUIL_FR = { 1: 220, 2: 140, 3: 80, 4: 45 } as const
const FACTEUR_MONDE = { 1: 4, 2: 2.6, 3: 1.7, 4: 1.2 } as const

// Distracteurs « similaires » : même continent d'abord
// Pour les drapeaux : d'abord les sosies (Tchad/Roumanie, Indonésie/Monaco…), même hors de la difficulté choisie
function distracteurs(cible: Pays, pool: Pays[], n: number, tous: Pays[] = [], sosies = false) {
  const autres = pool.filter((p) => p.id !== cible.id)
  const jumeaux = sosies ? melanger(tous.filter((p) => sosiesDe(cible.id).includes(p.id))) : []
  const vus = new Set(jumeaux.map((p) => p.id))
  const reste = [...melanger(autres.filter((p) => p.region.en === cible.region.en)), ...melanger(autres.filter((p) => p.region.en !== cible.region.en))].filter((p) => !vus.has(p.id))
  return [...jumeaux, ...reste].slice(0, n)
}

// Capitales : la plus grande ville du pays (Sydney pour l'Australie…) remplace un leurre quand elle existe
function optionsCapitale(p: Pays, autres: Pays[], lang: Lang, n = 3): Option[] {
  const pieges = (PIEGES_CAPITALES[p.id] ?? []).map(([fr, en]) => (lang === 'fr' ? fr : en))
  const leurres = [...melanger(pieges).slice(0, 2), ...autres.map((x) => x.capitale![lang])]
  const uniques = [...new Set(leurres)].filter((l) => l !== p.capitale![lang]).slice(0, n)
  return melanger([p.capitale![lang], ...uniques]).map((label) => ({ label }))
}

export function distanceKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) {
  const r = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

// max : difficulté la plus haute débloquée (pour le mode Tout)
type Opts = { exclus?: string[]; sousTheme: SousThemeId; difficulte: Difficulte; max?: Palier; nombre: number; mode: Mode; lang: Lang; ids?: string[]; seed?: number }

// Paliers cumulatifs : chaque difficulté contient celles d'en dessous, mais 60 % des questions
// viennent de son propre palier (Expert = surtout du très pointu). Mode Tout : tout ce qui est débloqué.
// Le choix suit la mémoire de l'appareil : jamais vu ou raté d'abord, bien su mis de côté un temps.
function tirer<T>(liste: T[], fin: (d: Palier) => number, o: Opts, idDe: (x: T) => string): { cibles: T[]; pool: T[] } {
  const max = o.max ?? 4
  const d = o.difficulte
  const haut = d === 0 ? max : d === LEGENDE ? 4 : d
  // Duels : on écarte les questions vues récemment par les deux joueurs (s'il en reste assez)
  if (o.exclus?.length) { const ex = new Set(o.exclus); const reste = liste.filter((x) => !ex.has(idDe(x))); if (reste.slice(0, fin(o.difficulte === 0 ? (o.max ?? 4) : o.difficulte === LEGENDE ? 4 : o.difficulte)).length >= o.nombre * 2) liste = reste }
  const pool = liste.slice(0, fin(haut))
  if (o.ids) return { cibles: liste.filter((x) => o.ids!.includes(idDe(x))), pool }
  const debut = d === LEGENDE ? fin(3) : d <= 1 ? 0 : fin((d - 1) as Palier)
  const palier = liste.slice(debut, fin(haut))
  const dessous = liste.slice(0, debut)
  // Défi du jour et duels (graine) : même tirage pour tout le monde, sans la mémoire personnelle
  const trier = (l: T[]) => (o.seed ? melanger(l) : prioriser(o.sousTheme, l, idDe, rand))
  // 70 % des questions viennent des nouveautés du niveau (ce qu'on n'avait pas au niveau d'en dessous)
  const nPalier = dessous.length && d !== LEGENDE ? Math.ceil(o.nombre * 0.7) : o.nombre
  let cibles = [...trier(palier).slice(0, nPalier), ...trier(dessous).slice(0, o.nombre - Math.min(nPalier, palier.length))]
  if (cibles.length < o.nombre) cibles = [...cibles, ...trier(pool.filter((x) => !cibles.includes(x)))].slice(0, o.nombre)
  return { cibles: melanger(cibles), pool }
}
const palierDe = (d: Difficulte): Palier => (d === 0 ? 2 : d === LEGENDE ? 4 : d)

// Générateur pseudo-aléatoire reproductible (mulberry32) : même graine = mêmes questions pour tout le monde
function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
let rand = Math.random

// Mix / Express / Survie : questions piochées dans des quiz variés (sans carte, pour enchaîner vite).
// difficultes : la difficulté de chaque question, dans l'ordre (Survie : de plus en plus dur).
export async function genererMix(o: { quiz: SousThemeId[]; difficultes: Difficulte[]; lang: Lang; max?: Palier }): Promise<Question[]> {
  const possibles = o.quiz.filter((s) => !['villes-fr', 'villes-monde', 'pays-carte'].includes(s))
  const out: Question[] = []
  let precedent = ''
  for (const d of o.difficultes) {
    // Jamais deux fois de suite le même quiz
    const choix = possibles.filter((s) => s !== precedent)
    const s = choix[Math.floor(Math.random() * choix.length)] ?? possibles[0]
    precedent = s
    const [q] = await genererPartie({ sousTheme: s, difficulte: d, max: o.max, nombre: 1, mode: 'qcm', lang: o.lang }).catch(() => [])
    if (q && !out.some((x) => x.id === q.id)) out.push({ ...q, s })
  }
  return out
}

export async function genererPartie(o: Opts): Promise<Question[]> {
  const tous = await chargerPays()
  await (o.sousTheme === 'villes-fr' ? pack('villes-fr.json') : o.sousTheme === 'villes-monde' ? pack('villes-monde.json') : o.sousTheme === 'logos-vrai' ? pack('culture/logos.json') : null)
  if (estCulture(o.sousTheme)) await pack(`culture/${packCulture(o.sousTheme)}.json`)
  // Packs chargés avant de fixer la graine : la génération qui suit est synchrone, donc reproductible
  rand = o.seed ? mulberry32(o.seed) : Math.random
  if (o.sousTheme === 'logos-vrai') return logosVrai(o, await pack<ItemCulture[]>('culture/logos.json'))
  if (estCulture(o.sousTheme)) return culture(o, await pack<ItemCulture[]>(`culture/${packCulture(o.sousTheme)}.json`))
  if (o.sousTheme === 'villes-fr') return villesFrance(o)
  if (o.sousTheme === 'villes-monde') return villesMonde(o, tous)
  return questionsPays(o, tous)
}

// Continent visé par les quiz « drapeaux-<continent> »
const CONTINENTS: Record<string, string[]> = { europe: ['Europe'], afrique: ['Afrique'], asie: ['Asie'], ameriques: ['Amérique du Nord', 'Amérique du Sud'], oceanie: ['Océanie'] }

function questionsPays(o: Opts, tousMonde: Pays[]): Question[] {
  const continent = CONTINENTS[o.sousTheme.replace('drapeaux-', '')]
  const tous = continent ? tousMonde.filter((p) => continent.includes(p.region.fr)) : tousMonde
  const sousTheme = (continent ? 'drapeaux' : o.sousTheme) as SousThemeId
  const { mode: modeChoisi, lang } = o
  const avecCapitale = sousTheme.startsWith('capitales')
  const avecCarte = sousTheme === 'pays-carte'
  const valides = tous.filter((p) => (!avecCapitale || p.capitale) && (!avecCarte || p.num))
  const { cibles, pool } = tirer(valides, (d) => Math.min(valides.length, POOL_PAYS[d]), o, (p) => p.id)
  const mode = sousTheme === 'drapeaux-inverse' ? 'qcm' : modeChoisi

  return cibles.map((p): Question => {
    const nom = (x: Pays) => x.nom[lang]
    const autres = mode === 'qcm' ? distracteurs(p, pool.length >= 4 ? pool : valides, nbLeurres(o.difficulte), valides, sousTheme.startsWith('drapeaux')) : []
    const melange = melanger([p, ...autres])
    const base = { id: p.id, imagesOnly: false, fiche: fichePays(p, tous, lang), acceptees: [p.nom.fr, p.nom.en, ...(p.alias ?? [])], reponse: nom(p) }
    switch (sousTheme) {
      case 'drapeaux':
        return { ...base, enonce: lang === 'fr' ? 'À quel pays appartient ce drapeau ?' : 'Which country does this flag belong to?', image: drapeau(p.id, 640), options: mode === 'qcm' ? melange.map((x) => ({ label: nom(x) })) : [] }
      case 'drapeaux-inverse':
        return { ...base, enonce: lang === 'fr' ? `Quel est le drapeau de ce pays : ${p.nom.fr} ?` : `Which flag belongs to ${p.nom.en}?`, imagesOnly: true, options: melange.map((x) => ({ label: nom(x), image: drapeau(x.id) })) }
      case 'capitales':
        // Le drapeau illustre la question sans donner la capitale
        return { ...base, image: drapeau(p.id, 640), enonce: lang === 'fr' ? `Quelle est la capitale de ce pays : ${p.nom.fr} ?` : `What is the capital of ${p.nom.en}?`, reponse: p.capitale![lang], acceptees: [p.capitale!.fr, p.capitale!.en], options: mode === 'qcm' ? optionsCapitale(p, autres, lang, nbLeurres(o.difficulte)) : [] }
      case 'capitales-inverse':
        return { ...base, enonce: lang === 'fr' ? `${p.capitale!.fr} est la capitale de quel pays ?` : `${p.capitale!.en} is the capital of which country?`, options: mode === 'qcm' ? melange.map((x) => ({ label: nom(x) })) : [] }
      default: // pays-carte : QCM = pays surligné à nommer, libre = cliquer le pays
        return mode === 'qcm'
          ? { ...base, enonce: lang === 'fr' ? 'Quel est ce pays ?' : 'Which country is this?', options: melange.map((x) => ({ label: nom(x) })), carte: { vue: 'monde', surligne: numPays(p.num), seuilKm: 0 } }
          : { ...base, enonce: lang === 'fr' ? `Cliquez sur ce pays : ${p.nom.fr}` : `Click on ${p.nom.en}`, options: [], carte: { vue: 'monde', trouverPays: numPays(p.num), seuilKm: 0 } }
    }
  })
}

async function villesFrance(o: Opts): Promise<Question[]> {
  const { lang } = o
  const difficulte = palierDe(o.difficulte)
  const { deps, villes } = await pack<{ deps: Record<string, string>; villes: Ville[] }>('villes-fr.json')
  const idDe = (v: Ville) => `${v[0]}|${v[4]}`
  const finSeuil = (d: Palier) => { const i = villes.findIndex((v) => v[1] < MIN_FR[d]); return i < 0 ? villes.length : i }
  const { cibles } = tirer(villes, finSeuil, o, idDe)
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  return cibles.map(([nom, pop, lat, lng, dep]) => {
    const rang = villes.findIndex((v) => v[0] === nom && v[4] === dep) + 1
    return {
      id: `${nom}|${dep}`, imagesOnly: false, options: [], acceptees: [], reponse: nom,
      enonce: lang === 'fr' ? `Placez ${nom} sur la carte` : `Place ${nom} on the map`,
      carte: { vue: 'france', cible: [lat, lng], seuilKm: o.difficulte === LEGENDE ? 25 : SEUIL_FR[difficulte] },
      fiche: {
        faits: [{ l: L[lang].dep, v: `${deps[dep] ?? dep} (${dep})` }, { l: L[lang].population, v: fmt.format(pop) }],
        saviez: lang === 'fr' ? `${nom} est la ${ordinal(rang, lang).replace('1er', '1re')} commune la plus peuplée de France métropolitaine.` : `${nom} is the ${ordinal(rang, lang)} most populous town in mainland France.`,
        wiki: wiki(nom, lang),
      },
    }
  })
}

async function villesMonde(o: Opts, tous: Pays[]): Promise<Question[]> {
  const { lang } = o
  const { villes } = await pack<{ villes: Ville[] }>('villes-monde.json')
  const parCode = new Map(tous.map((p) => [p.id, p]))
  const idDe = (v: Ville) => `${v[0]}|${v[4]}`
  const avecCarte = villes.filter((v) => parCode.get(v[4])?.num)
  const finSeuil = (d: Palier) => { const i = avecCarte.findIndex((v) => v[1] < MIN_MONDE[d]); return i < 0 ? avecCarte.length : i }
  const { cibles } = tirer(avecCarte, finSeuil, o, idDe)
  const fmt = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB')
  return cibles.map(([nom, pop, lat, lng, cc]) => {
    const p = parCode.get(cc)!
    const rangPays = villes.filter((v) => v[4] === cc).findIndex((v) => v[0] === nom) + 1
    // Seuil proportionnel à la taille du pays : 30 km au Luxembourg, ~400 km en Russie
    const seuil = Math.round(Math.max(50, Math.sqrt(p.superficie || 10000) * 0.15) * (o.difficulte === LEGENDE ? 0.8 : FACTEUR_MONDE[palierDe(o.difficulte)]))
    return {
      id: `${nom}|${cc}`, imagesOnly: false, options: [], acceptees: [], reponse: nom,
      enonce: lang === 'fr' ? `Placez ${nom} (${p.nom.fr})` : `Place ${nom} (${p.nom.en})`,
      carte: { vue: 'monde', cible: [lat, lng], zoomPays: numPays(p.num), seuilKm: seuil },
      fiche: {
        image: drapeau(cc),
        faits: [{ l: L[lang].country, v: p.nom[lang] }, { l: L[lang].population, v: fmt.format(pop) }],
        saviez: lang === 'fr'
          ? (rangPays === 1 ? `${nom} est la ville la plus peuplée du pays.` : `${nom} est la ${rangPays}e ville la plus peuplée du pays.`)
          : (rangPays === 1 ? `${nom} is the country's most populous city.` : `${nom} is the country's ${ordinal(rangPays, lang)} most populous city.`),
        wiki: wiki(nom, lang),
      },
    }
  })
}

// ——— Pièges de la Légende ———
// Ressemblance entre deux réponses : trigrammes communs + bonus si même premier ou même dernier mot
const trigrammes = (s: string) => { const t = ` ${sansAccent(s)} `; const out = new Set<string>(); for (let i = 0; i < t.length - 2; i++) out.add(t.slice(i, i + 3)); return out }
export function ressemblance(a: string, b: string) {
  const ta = trigrammes(a), tb = trigrammes(b)
  let communs = 0
  for (const t of ta) if (tb.has(t)) communs++
  const ma = sansAccent(a).split(/\s+/), mb = sansAccent(b).split(/\s+/)
  return communs / Math.max(1, Math.min(ta.size, tb.size)) + (ma[0] === mb[0] ? 0.6 : 0) + (ma.length > 1 && ma[ma.length - 1] === mb[mb.length - 1] ? 0.4 : 0)
}
// Faux jumeau : la bonne réponse avec une faute d'orthographe discrète (lettres inversées, accent, consonne doublée…)
export function fauxJumeau(s: string): string | null {
  const mots = s.split(' ')
  const i = mots.reduce((m, w, k) => (w.length > mots[m].length ? k : m), 0)
  const w = mots[i]
  if (w.length < 5 || /\d/.test(w)) return null
  const essais: ((w: string) => string)[] = [
    (w) => { const k = 1 + Math.floor(rand() * (w.length - 3)); return w.slice(0, k) + w[k + 1] + w[k] + w.slice(k + 2) },
    (w) => w.replace(/([bcdfglmnprst])(?!\1)/, '$1$1'),
    (w) => w.replace(/([bcdfglmnprst])\1/, '$1'),
    (w) => w.replace(/é/, 'è'),
    (w) => w.replace(/ph/, 'f').replace(/^((?!f).)*$/, (x) => x.replace(/y/, 'i')),
    (w) => w.replace(/[éèêë]/, 'e'),
    (w) => w.replace(/(?<=.)e(?=[^aeiouy])/, 'é'),
    (w) => w.replace(/(?<=.)ou/, 'u'),
    (w) => w.replace(/(?<=.)s(?=[aeiouy])/, 'z'),
    (w) => w.replace(/(?<=.)c(?=[aou])/, 'k'),
    (w) => w.replace(/(?<=.)i(?=.)/, 'y'),
    (w) => w.replace(/(?<=.)an/, 'en'),
    (w) => w.replace(/(?<=.)ai/, 'é'),
    (w) => { const k = 1 + Math.floor(rand() * (w.length - 2)); return /[aeiouy]/i.test(w[k]) ? w.slice(0, k) + w.slice(k + 1) : w },
    (w) => w.replace(/h/, ''),
    (w) => w.replace(/(?<=.)([aeiou])(?=[^aeiou]*$)/, (v) => ({ a: 'e', e: 'a', i: 'e', o: 'au', u: 'ou' } as Record<string, string>)[v] ?? v),
  ]
  for (const f of melanger(essais)) { const v = f(w); if (v && v !== w && v.length >= w.length - 1) { mots[i] = v; return mots.join(' ') } }
  return null
}

// Les éléments sont triés du plus connu au moins connu (nombre d'articles Wikipédia)
const POOL_CULTURE = { 1: 40, 2: 120, 3: 300, 4: Infinity } as const
// Paliers proportionnels à la taille du quiz : un gros quiz (2 000 logos) a un Facile plus large (moins de répétitions),
// tout en restant les éléments les plus connus ; chaque niveau ajoute des éléments plus pointus qu'avant
const PART_PALIER = { 1: 0.12, 2: 0.32, 3: 0.62, 4: 1 } as const
const finCulture = (n: number) => (d: Palier) => (d === 4 ? n : Math.min(n, Math.max(POOL_CULTURE[d], Math.round(n * PART_PALIER[d]))))
const texte = (v: string | Texte | undefined, lang: Lang) => (v === undefined ? '' : typeof v === 'string' ? v : v[lang])

function culture(o: Opts, tousItems: ItemCulture[]): Question[] {
  const { sousTheme, mode, lang } = o
  const difficulte = palierDe(o.difficulte)
  const cfg = CULTURE[sousTheme as CultureId] as { type: TypeCulture; montrer?: boolean; champ?: string; grand?: boolean; fixe?: boolean; groupe?: string; q: Record<Lang, (nom: string, genre?: string) => string> }
  // Question dérivée (année d'un film, pays d'une personnalité…) : la réponse vient d'un champ annexe
  // Champ « nom » : le nom lui-même ; « f:Libellé » : un fait de la fiche ; sinon un attribut x (ou la réponse r)
  const champ = (cfg as { champ?: string }).champ
  const val = (it: ItemCulture) => (champ === 'nom' ? it.n : champ?.startsWith('f:') ? it.f?.find(([l]) => l.fr === champ.slice(2))?.[1] : champ ? it.x?.[champ] : it.r)
  // Traduction identique au mot français (« sari » → « sari ») : question sans intérêt, on l'écarte
  const simple = (v: string) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const avecTexte = cfg.type === 'attribut' || cfg.type === 'annee'
  // Quiz en image : on écarte les images où la réponse est écrite (repérées par scripts/ocr-tout.sh)
  const lisibles = tousItems.filter((it) => !it.x?.nomVisible)
  const items = cfg.type === 'image' ? (lisibles.length >= 30 ? lisibles : tousItems).filter((it) => it.img) : tousItems.filter((it) => val(it) && !(sousTheme.startsWith('traduction') && simple(texte(val(it), 'fr')) === simple(it.n.fr))
    // Question où la réponse se lit dans l'énoncé et ne peut pas être masquée : écartée
    && (!avecTexte || masquer(it.n.fr, texte(val(it), 'fr'), cfg.type === 'annee') !== null))
  const { cibles, pool } = tirer(items, finCulture(items.length), o, (it) => it.id)
  // Années proposées autour de la bonne : à 1 ou 2 ans près en difficile
  // Légende : toutes les années à 1, 2 ou 3 ans près
  const ecarts = o.difficulte === LEGENDE ? [-3, -2, -1, 1, 2, 3] : { 1: [-15, -10, -7, -5, 5, 7, 10, 15], 2: [-6, -4, -3, -2, 2, 3, 4, 6], 3: [-3, -2, -1, 1, 2, 3], 4: [-2, -1, 1, 2] }[difficulte]
  const nb = nbLeurres(o.difficulte)
  const symboles = sousTheme === 'elements' ? items.map((x) => texte(val(x), lang)) : []

  return cibles.map((it): Question => {
    const nom = it.n[lang]
    const reponse = cfg.type === 'image' ? nom : texte(val(it), lang)
    // Énoncé sans la réponse dedans (dates retirées, mots de la réponse masqués)
    const nomQ = avecTexte ? masquer(nom, reponse, cfg.type === 'annee') ?? nom : nom
    const acceptees = cfg.type === 'image' ? [it.n.fr, it.n.en] : [val(it)!, ...(cfg.champ ? [] : it.alt ?? [])].flatMap((v) => (typeof v === 'string' ? [v] : [v.fr, v.en]))

    let options: Option[] = []
    if (mode === 'qcm') {
      // Les autres réponses valables (2e langue officielle…) ne doivent pas servir de leurre
      const vus = new Set([reponse, ...(it.alt ?? []).map((v) => texte(v, lang))])
      const autres: string[] = []
      if (cfg.type === 'annee') {
        for (const d of melanger(ecarts)) {
          const y = String(Number(reponse) + d)
          if (!vus.has(y)) { vus.add(y); autres.push(y) }
          if (autres.length === nb) break
        }
      } else if (sousTheme === 'elements') {
        for (const s of melanger(piegesSymbole(it.n.fr, it.n.en, reponse, symboles))) {
          if (!vus.has(s)) { vus.add(s); autres.push(s) }
          if (autres.length === nb) break
        }
      } else {
        // Distracteurs du même groupe d'abord (même genre, même classe d'animaux…)
        // Voitures en photo : à partir de Difficile, uniquement des modèles de la même marque ;
        // en Facile et Moyen, au contraire, d'autres marques (on reconnaît au moins le logo)
        const marque = (x: ItemCulture) => texte(x.r, 'fr')
        const memeMarque = sousTheme === 'voitures-photo' ? (o.difficulte === LEGENDE || difficulte >= 3 ? 'meme' : 'autre') : null
        const memes = memeMarque === 'meme'
          ? melanger(items.filter((x) => x.id !== it.id && marque(x) === marque(it)))
          // groupe : un champ annexe sert de famille (jeux : même genre de jeu → propositions crédibles)
          : melanger((o.difficulte === LEGENDE || cfg.groupe ? items : pool).filter((x) => (cfg.groupe ? texte(x.x?.[cfg.groupe], 'fr') === texte(it.x?.[cfg.groupe], 'fr') : x.g && x.g === it.g)))
        const autresMarques = (l: ItemCulture[]) => (memeMarque === 'autre' ? l.filter((x) => marque(x) !== marque(it)) : l)
        let cand = [...memes, ...melanger(autresMarques(pool.length >= 4 ? pool : items))]
        // Légende : les noms les plus ressemblants de tout le quiz (même début, mêmes syllabes), plus un « faux jumeau »
        if (o.difficulte === LEGENDE) {
          const valeur = (x: ItemCulture) => (cfg.type === 'image' ? x.n[lang] : texte(val(x), lang))
          const proches = items.filter((x) => x.id !== it.id && valeur(x) && valeur(x) !== reponse)
            .map((x) => ({ x, s: ressemblance(valeur(x), reponse) })).sort((a, b) => b.s - a.s).slice(0, 10)
          cand = [...melanger(proches.map((p) => p.x)), ...cand]
        }
        for (const x of cand) {
          const v = cfg.type === 'image' ? x.n[lang] : texte(val(x), lang)
          if (v && !vus.has(v)) { vus.add(v); autres.push(v) }
          if (autres.length === nb) break
        }
        if (o.difficulte === LEGENDE && autres.length >= 3) {
          // 0 : aucun jumeau ; 1 : jumeau de la bonne réponse + jumeau d'un leurre ; 2 : jumeau d'un leurre seulement ;
          // 3 : deux leurres avec leur jumeau. Une paire ne dit donc jamais laquelle est la bonne.
          const schema = Math.floor(rand() * 4)
          const valeurs = new Set(items.map((x) => (cfg.type === 'image' ? x.n[lang] : texte(val(x), lang))))
          const jumeau = (v: string) => { const j = fauxJumeau(v); return j && !vus.has(j) && !valeurs.has(j) ? j : null }
          const remplacer = (j: string | null) => { if (!j) return; vus.add(j); autres[autres.length - 1] = j; autres.unshift(autres.pop()!) }
          if (schema === 1) { remplacer(jumeau(reponse)); remplacer(jumeau(autres[1])) }
          if (schema === 2) remplacer(jumeau(autres[0]))
          if (schema === 3) { remplacer(jumeau(autres[0])); remplacer(jumeau(autres[2] ?? autres[1])) }
        }
      }
      options = melanger([reponse, ...autres]).map((label) => ({ label }))
    }

    const faits = (it.f ?? []).filter(([, v]) => v).map(([l, v]) => ({ l: l[lang], v: texte(v, lang) }))
    const desc = it.d?.[lang]
    return {
      id: it.id,
      enonce: cfg.q[lang](nomQ, it.g),
      ...(cfg.grand ? { grand: melangerEmojis(nomQ, o.difficulte === LEGENDE ? 4 : o.difficulte === 0 ? 2 : difficulte) } : {}),
      ...(cfg.fixe ? { fixe: true } : {}),
      ...((cfg as { silhouette?: boolean }).silhouette ? { silhouette: true } : {}),
      ...(sousTheme === 'logos' ? { fondGris: true } : {}),
      // Photo du sujet dès qu'elle existe, sauf si elle trahit la réponse (pochette, couverture, extrait audio)
      image: cfg.type === 'image' || cfg.montrer || (cfg.type !== 'audio' && !TRAHIT.has(sousTheme)) ? it.img : undefined,
      audio: cfg.type === 'audio' ? it.id : undefined,
      reponse,
      acceptees,
      options,
      imagesOnly: false,
      fiche: {
        image: it.img,
        faits: cfg.type === 'image' ? faits : [{ l: lang === 'fr' ? 'Réponse' : 'Answer', v: reponse }, ...faits],
        saviez: desc ? (cfg.grand ? `${desc}.` : `${nom} : ${desc}.`) : nom,
        // Lien propre à l'élément (page du wiki du jeu…), sinon l'article Wikipédia du nom
        wiki: texte(it.x?.lien, lang) || wiki(nom, lang),
      },
    }
  })
}

// ——— Le vrai logo : le nom de la marque, le vrai logo et des faux tirés de lui ———
// Les faux sont fabriqués dans l'appli (components/LogoTruque) : une partie seulement du logo est retouchée
// (couleur principale, deux couleurs échangées, une moitié écrasée ou décalée, un morceau effacé, trait plus gras…).
// force : 0 = Facile (retouche bien visible) … 3 = Expert / Légende (retouche fine).
const TRUCS_FACILES = ['teinte', 'echange', 'gomme', 'miroir', 'ecrase', 'decale', 'gras']
const TRUCS_DURS = ['teinte', 'echange', 'gomme', 'ecrase', 'decale', 'gras', 'maigre']
const NOMS_TRUCS: Record<string, Record<Lang, string>> = {
  teinte: { fr: 'Faux : une couleur changée', en: 'Fake: one colour changed' }, echange: { fr: 'Faux : couleurs inversées', en: 'Fake: colours swapped' },
  gomme: { fr: 'Faux : un morceau manque', en: 'Fake: a piece is missing' }, miroir: { fr: 'Faux : une partie retournée', en: 'Fake: part mirrored' },
  ecrase: { fr: 'Faux : une partie écrasée', en: 'Fake: part squashed' }, decale: { fr: 'Faux : une partie décalée', en: 'Fake: part shifted' },
  gras: { fr: 'Faux : trait trop épais', en: 'Fake: too bold' }, maigre: { fr: 'Faux : trait trop fin', en: 'Fake: too thin' },
}
function logosVrai(o: Opts, tous: ItemCulture[]): Question[] {
  const items = tous.filter((it) => it.img)
  const { cibles } = tirer(items, finCulture(items.length), o, (it) => it.id)
  const force = o.difficulte === LEGENDE ? 3 : Math.max(0, palierDe(o.difficulte) - 1)
  const nbFaux = nbLeurres(o.difficulte)
  return cibles.map((it): Question => {
    const nom = it.n[o.lang]
    const secours = texte(it.x?.orig, 'fr') || undefined
    const graine = Math.floor(rand() * 1e9)
    const faux = melanger(force <= 1 ? TRUCS_FACILES : TRUCS_DURS).slice(0, nbFaux).map((t, k) => ({ label: NOMS_TRUCS[t][o.lang], image: it.img, effet: { truc: t, force, graine: graine + k * 7, secours } }))
    const vrai = o.lang === 'fr' ? 'Le vrai logo' : 'The real logo'
    return {
      id: it.id, enonce: o.lang === 'fr' ? `Quel est le vrai logo de ${nom} ?` : `Which is the real ${nom} logo?`,
      reponse: vrai, acceptees: [vrai], imagesOnly: true, fondGris: true,
      options: melanger([{ label: vrai, image: it.img, effet: { truc: 'aucun', force, graine, secours } }, ...faux]),
      fiche: { image: it.img, faits: [{ l: o.lang === 'fr' ? 'Marque' : 'Brand', v: nom }], saviez: it.d?.[o.lang] ? `${nom} : ${it.d[o.lang]}.` : nom, wiki: wiki(nom, o.lang) },
    }
  })
}

// Toutes les images d'un sous-thème (pour le téléchargement hors ligne)
export async function imagesDe(s: SousThemeId): Promise<string[]> {
  if (s === 'logos-vrai') return imagesDe('logos')
  if (estCulture(s)) return (await pack<ItemCulture[]>(`culture/${packCulture(s)}.json`)).map((it) => it.img).filter((x): x is string => !!x)
  if (s.startsWith('drapeaux') || s.startsWith('capitales') || s === 'villes-monde') {
    const tous = await chargerPays()
    return tous.flatMap((p) => [drapeau(p.id), ...(s === 'drapeaux' ? [drapeau(p.id, 640)] : [])])
  }
  return [] // cartes et villes de France : déjà dans l'app
}

// XP : 10 par bonne réponse, ×1.5 en saisie libre ou sur carte, + bonus de difficulté
export function calculerXp(bonnes: number, mode: Mode, difficulte: number) {
  return Math.round(bonnes * 10 * (mode === 'libre' ? 1.5 : 1) * (1 + (difficulte - 1) * 0.25))
}
