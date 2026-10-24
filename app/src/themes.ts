import type { Lang } from './i18n'
import type { SousThemeId } from './quiz/engine'

export type Famille = 'geo' | 'cine' | 'mus' | 'nat' | 'sci' | 'his' | 'brd' | 'spo' | 'lit' | 'jv' | 'ani' | 'vie'

export type SousTheme = { id: string; nom: Record<Lang, string>; jouable?: SousThemeId }

// Sous-thème jouable : l'identifiant sert aussi de nom de quiz
const j = (id: SousThemeId, fr: string, en: string): SousTheme => ({ id, nom: { fr, en }, jouable: id })

// Icônes et motifs repris de la DA (Themes.dc.html)
export const FAMILLES: { k: Famille; nom: Record<Lang, string>; icon: string; motif: string; subs: SousTheme[] }[] = [
  {
    k: 'geo', nom: { fr: 'Géographie', en: 'Geography' },
    icon: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17ZM3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z',
    motif: 'M0 20 Q30 0 60 20 T120 20 M0 42 Q30 22 60 42 T120 42 M0 64 Q30 44 60 64 T120 64',
    subs: [
      { id: 'drapeaux', nom: { fr: 'Drapeaux', en: 'Flags' }, jouable: 'drapeaux' },
      { id: 'drapeaux-inverse', nom: { fr: 'Trouver le drapeau', en: 'Find the flag' }, jouable: 'drapeaux-inverse' },
      { id: 'capitales', nom: { fr: 'Capitales', en: 'Capitals' }, jouable: 'capitales' },
      { id: 'capitales-inverse', nom: { fr: 'Capitale → pays', en: 'Capital → country' }, jouable: 'capitales-inverse' },
      { id: 'villes-fr', nom: { fr: 'Villes de France', en: 'French cities' }, jouable: 'villes-fr' },
      { id: 'villes-monde', nom: { fr: 'Villes du monde', en: 'World cities' }, jouable: 'villes-monde' },
      { id: 'pays-carte', nom: { fr: 'Pays sur la carte', en: 'Countries on the map' }, jouable: 'pays-carte' },
      { id: 'monuments', nom: { fr: 'Monuments', en: 'Landmarks' }, jouable: 'monuments' },
      { id: 'plats', nom: { fr: 'Plats du monde', en: 'World dishes' }, jouable: 'plats' },
      { id: 'monnaies', nom: { fr: 'Monnaies', en: 'Currencies' }, jouable: 'monnaies' },
      j('departements-numero', 'Numéros des départements', 'Department numbers'),
      j('departements-prefecture', 'Préfectures', 'Prefectures'),
      j('departements-region', 'Départements et régions', 'Departments & regions'),
      j('montagnes', 'Montagnes', 'Mountains'),
      j('iles', 'Îles', 'Islands'),
      j('fleuves', 'Fleuves et rivières', 'Rivers'),
      j('etats-us', 'États américains', 'US states'),
    ],
  },
  {
    k: 'cine', nom: { fr: 'Cinéma & séries', en: 'Film & TV' },
    icon: 'M6 7h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-8A2.5 2.5 0 0 1 6 7ZM3.5 11h17M8 7l2 4M13 7l2 4',
    motif: 'M10 10h100v60H10ZM10 20h100M10 60h100M20 10v10M40 10v10M60 10v10M80 10v10M100 10v10M20 60v10M40 60v10M60 60v10M80 60v10M100 60v10',
    subs: [{ id: 'films', nom: { fr: 'Films et réalisateurs', en: 'Films & directors' }, jouable: 'films' }, { id: 'films-annee', nom: { fr: 'Films : année de sortie', en: 'Films: release year' }, jouable: 'films-annee' }, { id: 'series', nom: { fr: 'Séries', en: 'TV shows' }, jouable: 'series' }, { id: 'acteurs', nom: { fr: 'Acteurs', en: 'Actors' }, jouable: 'acteurs' }, j('studios', 'Disney, Pixar, Marvel… : le studio', 'Disney, Pixar, Marvel…: studio'), j('studios-annee', 'Films d’animation et super-héros : l’année', 'Animation & superhero films: year'), j('oscars', 'Oscars du meilleur film', 'Best Picture Oscars'), j('affiches', 'Affiches de films', 'Film posters')],
  },
  {
    k: 'mus', nom: { fr: 'Musique', en: 'Music' },
    icon: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0ZM19 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0Z',
    motif: 'M30 60V20l40-8v40M30 60a8 6 0 1 1-16 0a8 6 0 1 1 16 0M70 52a8 6 0 1 1-16 0a8 6 0 1 1 16 0M96 40V14l14 6',
    subs: [{ id: 'artistes', nom: { fr: 'Artistes', en: 'Artists' }, jouable: 'artistes' }, { id: 'extraits', nom: { fr: 'Extraits musicaux', en: 'Music clips' }, jouable: 'extraits' }, { id: 'albums', nom: { fr: 'Albums', en: 'Albums' }, jouable: 'albums' }, j('compositeurs', 'Compositeurs classiques', 'Classical composers'), j('blind-titre', 'Blind test : le titre', 'Blind test: title'), j('blind-album', 'Blind test : l’album', 'Blind test: album'), j('artistes-genre', 'Genres musicaux', 'Music genres'), j('groupes', 'Groupes', 'Bands')],
  },
  {
    k: 'nat', nom: { fr: 'Nature', en: 'Nature' },
    icon: 'M19.5 4.5C10 4.5 4.5 9 4.5 15.5c0 1.5.3 2.9.8 4 6.9 0 14.2-4 14.2-15ZM5.3 19.5C8 15 11.5 12 15 10',
    motif: 'M20 70C20 40 40 18 80 16c0 36-24 54-60 54M20 70c12-16 26-28 40-34M80 60c0-14 10-24 30-26 0 18-12 26-30 26',
    subs: [
      j('animaux', 'Tous les animaux', 'All animals'),
      j('mammiferes', 'Mammifères', 'Mammals'),
      j('oiseaux', 'Oiseaux', 'Birds'),
      j('poissons', 'Poissons et requins', 'Fish & sharks'),
      j('reptiles', 'Reptiles et amphibiens', 'Reptiles & amphibians'),
      j('insectes', 'Insectes', 'Insects'),
      j('papillons', 'Papillons', 'Butterflies & moths'),
      j('araignees', 'Araignées', 'Spiders'),
      j('plantes', 'Plantes et arbres', 'Plants & trees'),
      j('champignons', 'Champignons', 'Mushrooms'),
      j('chiens', 'Races de chiens', 'Dog breeds'),
      j('chats', 'Races de chats', 'Cat breeds'),
      j('chevaux', 'Races de chevaux', 'Horse breeds'),
    ],
  },
  {
    k: 'sci', nom: { fr: 'Corps humain & sciences', en: 'Human body & science' },
    icon: 'M9.5 3.5h5M10.5 3.5v5.5L5.2 18.3a1.5 1.5 0 0 0 1.3 2.2h11a1.5 1.5 0 0 0 1.3-2.2L13.5 9V3.5M7.5 15h9',
    motif: 'M40 40a10 10 0 1 1-20 0a10 10 0 1 1 20 0M80 20a8 8 0 1 1-16 0a8 8 0 1 1 16 0M100 56a10 10 0 1 1-20 0a10 10 0 1 1 20 0M40 36l26-12M76 26l12 22',
    subs: [{ id: 'corps', nom: { fr: 'Corps humain', en: 'Human body' }, jouable: 'corps' }, { id: 'elements', nom: { fr: 'Éléments chimiques', en: 'Chemical elements' }, jouable: 'elements' }, j('scientifiques', 'Scientifiques', 'Scientists'), j('inventions', 'Inventions et découvertes', 'Inventions & discoveries'), j('constellations', 'Constellations', 'Constellations'), j('lunes', 'Planètes et lunes', 'Planets & moons')],
  },
  {
    k: 'his', nom: { fr: 'Histoire, personnalités & arts', en: 'History, people & arts' },
    icon: 'M3.5 9 12 4.5 20.5 9M6 10v7.5M10 10v7.5M14 10v7.5M18 10v7.5M3.5 20h17',
    motif: 'M20 30 60 10l40 20M28 34v30M48 34v30M72 34v30M92 34v30M16 70h88',
    subs: [{ id: 'personnalites', nom: { fr: 'Personnalités', en: 'Famous people' }, jouable: 'personnalites' }, { id: 'personnalites-pays', nom: { fr: 'Nationalités', en: 'Nationalities' }, jouable: 'personnalites-pays' }, { id: 'personnalites-metier', nom: { fr: 'Qui fait quoi ?', en: 'Who does what?' }, jouable: 'personnalites-metier' }, { id: 'personnalites-naissance', nom: { fr: 'Années de naissance', en: 'Birth years' }, jouable: 'personnalites-naissance' }, { id: 'histoire', nom: { fr: 'Dates de l’histoire', en: 'History dates' }, jouable: 'histoire' }, { id: 'tableaux', nom: { fr: 'Tableaux célèbres', en: 'Famous paintings' }, jouable: 'tableaux' }, j('presidents', 'Présidents français', 'French presidents'), j('mouvements', 'Mouvements artistiques', 'Art movements'), j('sculptures', 'Sculptures', 'Sculptures'), j('architecture', 'Architectes', 'Architects'), j('batailles', 'Batailles', 'Battles'), j('attentats', 'Attentats : l’année', 'Attacks: year'), j('attentats-pays', 'Attentats : le pays', 'Attacks: country'), j('traites', 'Traités et accords', 'Treaties'), j('souverains', 'Rois, reines et empereurs', 'Monarchs')],
  },
  {
    k: 'brd', nom: { fr: 'Marques & logos', en: 'Brands & logos' },
    icon: 'M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8-9 9ZM10 8.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 1 1 3 0Z',
    motif: 'M20 44V14h30l34 34-30 30ZM40 30a5 5 0 1 1-10 0a5 5 0 1 1 10 0',
    subs: [{ id: 'logos', nom: { fr: 'Logos', en: 'Logos' }, jouable: 'logos' }, { id: 'marques', nom: { fr: 'Marques et pays', en: 'Brands & countries' }, jouable: 'marques' }],
  },
  {
    k: 'spo', nom: { fr: 'Sport', en: 'Sport' },
    icon: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17ZM12 3.5v4l3.5 2.5-1.3 4h-4.4L8.5 10 12 7.5M15.5 10l4.5-1M8.5 10 4 9M9.8 14l-2.3 4.5M14.2 14l2.3 4.5',
    motif: 'M10 70h100M20 70V30M100 70V30M20 30h80M60 30v40M40 50a20 20 0 0 1 40 0',
    subs: [j('sportifs', 'Sportifs', 'Athletes'), j('sportifs-sport', 'Quel sport ?', 'Which sport?'), j('clubs', 'Clubs de football', 'Football clubs'), j('stades', 'Stades', 'Stadiums')],
  },
  {
    k: 'lit', nom: { fr: 'Littérature & BD', en: 'Books & comics' },
    icon: 'M4 5.5c3-1 5.5-.8 8 1 2.5-1.8 5-2 8-1v13c-3-1-5.5-.8-8 1-2.5-1.8-5-2-8-1ZM12 6.5v13',
    motif: 'M20 20c15-6 28-5 40 4 12-9 25-10 40-4v46c-15-6-28-5-40 4-12-9-25-10-40-4ZM60 24v46',
    subs: [j('livres', 'Livres et auteurs', 'Books & authors'), j('livres-annee', 'Livres : année', 'Books: year'), j('auteurs', 'Écrivains', 'Writers'), j('bd', 'Personnages de BD', 'Comic characters'), j('mangas', 'Mangas', 'Manga')],
  },
  {
    k: 'jv', nom: { fr: 'Jeux vidéo', en: 'Video games' },
    icon: 'M8 7h8a6 6 0 0 1 5.8 7.5l-.6 2.3a2.6 2.6 0 0 1-4.5 1l-1.9-2.3H9.2l-1.9 2.3a2.6 2.6 0 0 1-4.5-1l-.6-2.3A6 6 0 0 1 8 7ZM8 10v4M6 12h4M15.5 11h.01M17.5 13h.01',
    motif: 'M30 24h60a20 20 0 0 1 20 20v10a14 14 0 0 1-25 8l-6-6H41l-6 6a14 14 0 0 1-25-8V44a20 20 0 0 1 20-20Z',
    subs: [j('jeux', 'Jeux et studios', 'Games & studios'), j('jeux-annee', 'Jeux : année de sortie', 'Games: release year'), j('persos-jeux', 'Personnages', 'Characters'), j('persos-univers', 'Personnages : de quel jeu ?', 'Characters: which game?'), j('lieux-jeux', 'Lieux et cartes : de quel jeu ?', 'Places & maps: which game?'), j('sagas', 'Sagas et éditeurs', 'Series & publishers')],
  },
  {
    k: 'ani', nom: { fr: 'Animés & doublage', en: 'Anime & dubbing' },
    icon: 'M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8Z',
    motif: 'M60 10l10 20 22 3-16 15 4 22-20-10-20 10 4-22-16-15 22-3Z',
    subs: [j('animes', 'Animés : l’année', 'Anime: year'), j('animes-studio', 'Animés : le studio', 'Anime: studio'), j('persos-animes', 'Personnages d’animés', 'Anime characters'), j('doubleurs', 'Voix françaises', 'French voice actors')],
  },
  {
    k: 'vie', nom: { fr: 'Vie quotidienne & mythes', en: 'Everyday life & myths' },
    icon: 'M5 20.5h14M7 20.5V11l5-6.5 5 6.5v9.5M10 20.5v-5h4v5',
    motif: 'M20 70h80M30 70V40l30-26 30 26v30M50 70V52h20v18',
    subs: [j('voitures', 'Voitures : le constructeur', 'Cars: maker'), j('voitures-photo', 'Voitures en photo', 'Cars in pictures'), j('fromages', 'Fromages du monde', 'World cheeses'), j('dieux', 'Divinités', 'Deities'), j('dieux-mythologie', 'Quelle mythologie ?', 'Which mythology?'), j('instruments', 'Instruments de musique', 'Musical instruments')],
  },
]

export const trouverSousTheme = (id: string) => {
  for (const f of FAMILLES) {
    const s = f.subs.find((x) => x.id === id)
    if (s) return { famille: f, sous: s }
  }
  return null
}
