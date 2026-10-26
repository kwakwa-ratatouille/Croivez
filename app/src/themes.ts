import type { Lang } from './i18n'
import type { SousThemeId } from './quiz/engine'
import { evenementActif, prochainEvenement } from './evenements'

const quizEvenementAffiche = () => evenementActif()?.quiz ?? prochainEvenement()?.e.quiz

export type Famille = 'pho' | 'tec' | 'esp' | 'mot' | 'geo' | 'cine' | 'mus' | 'nat' | 'sci' | 'his' | 'brd' | 'spo' | 'lit' | 'jv' | 'ani' | 'vie' | 'pop' | 'cui' | 'mot' | 'evt' | 'eco'

export type SousTheme = { id: string; nom: Record<Lang, string>; jouable?: SousThemeId }

// Sous-thème jouable : l'identifiant sert aussi de nom de quiz
const j = (id: SousThemeId, fr: string, en: string): SousTheme => ({ id, nom: { fr, en }, jouable: id })

// Icônes et motifs repris de la DA (Themes.dc.html)
export const FAMILLES: { k: Famille; nom: Record<Lang, string>; icon: string; motif: string; subs: SousTheme[] }[] = [
  {
    k: 'evt', nom: { fr: 'Événements', en: 'Events' },
    icon: 'M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8ZM5 20.5h14',
    motif: 'M60 10l10 20 22 3-16 15 4 22-20-10-20 10 4-22-16-15 22-3Z',
    // Seulement l'événement en cours, ou à défaut le prochain (les autres reviennent à leur date)
    subs: [j('evt-halloween', '🎃 Halloween', 'Halloween'), j('evt-noel', '🎄 Noël', 'Christmas'), j('evt-nouvel-an', '🎆 Nouvel An', 'New Year'), j('evt-saint-valentin', '💝 Saint-Valentin', 'Valentine’s Day'), j('evt-paques', '🐣 Pâques', 'Easter'), j('evt-musique', '🎶 Fête de la musique', 'Music Day'), j('evt-ete', '🏖️ Vacances d’été', 'Summer'), j('evt-rentree', '🎒 Rentrée', 'Back to school')].filter((x) => x.id === quizEvenementAffiche()),
  },
  {
    k: 'geo', nom: { fr: 'Géographie', en: 'Geography' },
    icon: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17ZM3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z',
    motif: 'M0 20 Q30 0 60 20 T120 20 M0 42 Q30 22 60 42 T120 42 M0 64 Q30 44 60 64 T120 64',
    subs: [
      { id: 'drapeaux', nom: { fr: 'Drapeaux du monde', en: 'World flags' }, jouable: 'drapeaux' },
      j('drapeaux-europe', 'Drapeaux d’Europe', 'European flags'), j('drapeaux-afrique', 'Drapeaux d’Afrique', 'African flags'), j('drapeaux-asie', 'Drapeaux d’Asie', 'Asian flags'), j('drapeaux-ameriques', 'Drapeaux des Amériques', 'Flags of the Americas'), j('drapeaux-oceanie', 'Drapeaux d’Océanie', 'Oceania flags'),
      { id: 'drapeaux-inverse', nom: { fr: 'Trouver le drapeau', en: 'Find the flag' }, jouable: 'drapeaux-inverse' },
      { id: 'capitales', nom: { fr: 'Capitales', en: 'Capitals' }, jouable: 'capitales' },
      { id: 'capitales-inverse', nom: { fr: 'Capitale → pays', en: 'Capital → country' }, jouable: 'capitales-inverse' },
      { id: 'villes-fr', nom: { fr: 'Villes de France', en: 'French cities' }, jouable: 'villes-fr' },
      { id: 'villes-idf', nom: { fr: 'Paris et banlieue : villes d’Île-de-France', en: 'Paris region towns' }, jouable: 'villes-idf' },
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
    j('volcans', 'Volcans en photo', 'Volcanoes'), j('volcans-pays', 'Volcans : le pays', 'Volcanoes: country'), j('traditions', 'Traditions du monde', 'World traditions'), j('specialites-pays', 'Spécialités : le pays', 'Dishes: country')],
  },
  {
    k: 'eco', nom: { fr: 'Écologie & planète', en: 'Ecology & planet' },
    icon: 'M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l8-8',
    motif: 'M20 100c0-46 34-80 86-80 0 52-34 86-80 86M20 100l46-46',
    subs: [j('eco-comparaisons', 'Combien de terrains de foot ? Comparaisons insolites', 'Odd comparisons'), j('eco-eau', 'Eau cachée : combien de litres ?', 'Hidden water'), j('eco-electricite', 'Électricité des appareils', 'Appliance power'), j('eco-co2', 'Empreinte carbone', 'Carbon footprint'), j('eco-decomposition', 'Temps de décomposition', 'Decomposition time'), j('eco-tri', 'Le tri des déchets', 'Waste sorting'), j('eco-saison', 'Fruits et légumes de saison', 'Seasonal produce'), j('eco-energies', 'Les énergies', 'Energy sources'), j('eco-dates', 'Dates clés de l’écologie', 'Ecology milestones'), j('eco-vf', 'Écologie : vrai ou faux ?', 'Ecology: true or false?')],
  },
  {
    k: 'cine', nom: { fr: 'Cinéma & séries', en: 'Film & TV' },
    icon: 'M6 7h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-8A2.5 2.5 0 0 1 6 7ZM3.5 11h17M8 7l2 4M13 7l2 4',
    motif: 'M10 10h100v60H10ZM10 20h100M10 60h100M20 10v10M40 10v10M60 10v10M80 10v10M100 10v10M20 60v10M40 60v10M60 60v10M80 60v10M100 60v10',
    subs: [j('realisateurs', 'Réalisateurs en photo', 'Film directors'), { id: 'films', nom: { fr: 'Films et réalisateurs', en: 'Films & directors' }, jouable: 'films' }, { id: 'films-annee', nom: { fr: 'Films : année de sortie', en: 'Films: release year' }, jouable: 'films-annee' }, { id: 'series', nom: { fr: 'Séries', en: 'TV shows' }, jouable: 'series' }, { id: 'acteurs', nom: { fr: 'Acteurs', en: 'Actors' }, jouable: 'acteurs' }, j('studios', 'Disney, Pixar, Marvel… : le studio', 'Disney, Pixar, Marvel…: studio'), j('studios-annee', 'Films d’animation et super-héros : l’année', 'Animation & superhero films: year'), j('oscars', 'Oscars du meilleur film', 'Best Picture Oscars'), j('affiches', 'Affiches de films', 'Film posters'), j('emissions', 'Émissions télé françaises', 'French TV shows'), j('roles', 'Qui a joué ce rôle ?', 'Who played this role?')],
  },
  {
    k: 'mus', nom: { fr: 'Musique', en: 'Music' },
    icon: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0ZM19 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0Z',
    motif: 'M30 60V20l40-8v40M30 60a8 6 0 1 1-16 0a8 6 0 1 1 16 0M70 52a8 6 0 1 1-16 0a8 6 0 1 1 16 0M96 40V14l14 6',
    subs: [j('musiques-films', 'Musiques de films', 'Film music'), j('chansons-disney', 'Chansons Disney, Pixar, DreamWorks…', 'Disney, Pixar, DreamWorks songs'), { id: 'artistes', nom: { fr: 'Artistes', en: 'Artists' }, jouable: 'artistes' }, { id: 'extraits', nom: { fr: 'Extraits musicaux', en: 'Music clips' }, jouable: 'extraits' }, { id: 'albums', nom: { fr: 'Albums', en: 'Albums' }, jouable: 'albums' }, j('compositeurs', 'Compositeurs classiques', 'Classical composers'), j('blind-titre', 'Blind test : le titre', 'Blind test: title'), j('blind-album', 'Blind test : l’album', 'Blind test: album'), j('artistes-genre', 'Genres musicaux', 'Music genres'), j('groupes', 'Groupes', 'Bands'), j('rap-fr', 'Blind test rap français', 'French rap blind test'), j('rap-titre', 'Rap français : le titre', 'French rap: track title'), j('rap-us', 'Blind test rap US', 'US rap blind test'), j('pop-inter', 'Blind test pop & R&B', 'Pop & R&B blind test'), j('indie', 'Blind test indie / alternatif', 'Indie / alternative blind test'), j('afro', 'Blind test afro / shatta', 'Afro / shatta blind test'), j('generiques', 'Génériques de dessins animés', 'Cartoon theme songs'), j('artistes-recents', 'Artistes d’aujourd’hui', 'Today’s artists'), j('artistes-fr', 'Artistes français', 'French artists')],
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
      j('dinosaures', 'Dinosaures et animaux préhistoriques', 'Dinosaurs & prehistoric animals'),
    j('fleurs', 'Fleurs', 'Flowers'), j('arbres', 'Arbres', 'Trees')],
  },
  {
    k: 'sci', nom: { fr: 'Corps humain & sciences', en: 'Human body & science' },
    icon: 'M9.5 3.5h5M10.5 3.5v5.5L5.2 18.3a1.5 1.5 0 0 0 1.3 2.2h11a1.5 1.5 0 0 0 1.3-2.2L13.5 9V3.5M7.5 15h9',
    motif: 'M40 40a10 10 0 1 1-20 0a10 10 0 1 1 20 0M80 20a8 8 0 1 1-16 0a8 8 0 1 1 16 0M100 56a10 10 0 1 1-20 0a10 10 0 1 1 20 0M40 36l26-12M76 26l12 22',
    subs: [{ id: 'corps', nom: { fr: 'Corps humain', en: 'Human body' }, jouable: 'corps' }, j('scientifiques', 'Scientifiques', 'Scientists'), j('inventions', 'Inventions et découvertes', 'Inventions & discoveries'), j('mineraux', 'Pierres précieuses et minéraux', 'Gems & minerals'), j('unites', 'Unités de mesure', 'Units'), j('formules', 'Formules et symboles', 'Formulas'), j('pourcentages', 'Pourcentages surprenants', 'Surprising percentages'), j('maladies', 'Maladies', 'Diseases'), j('troubles', 'Troubles mentaux et dys', 'Mental disorders')],
  },
  {
    k: 'his', nom: { fr: 'Histoire, personnalités & arts', en: 'History, people & arts' },
    icon: 'M3.5 9 12 4.5 20.5 9M6 10v7.5M10 10v7.5M14 10v7.5M18 10v7.5M3.5 20h17',
    motif: 'M20 30 60 10l40 20M28 34v30M48 34v30M72 34v30M92 34v30M16 70h88',
    subs: [{ id: 'personnalites', nom: { fr: 'Personnalités', en: 'Famous people' }, jouable: 'personnalites' }, { id: 'personnalites-pays', nom: { fr: 'Nationalités', en: 'Nationalities' }, jouable: 'personnalites-pays' }, { id: 'personnalites-metier', nom: { fr: 'Qui fait quoi ?', en: 'Who does what?' }, jouable: 'personnalites-metier' }, { id: 'personnalites-naissance', nom: { fr: 'Années de naissance', en: 'Birth years' }, jouable: 'personnalites-naissance' }, { id: 'histoire', nom: { fr: 'Dates de l’histoire', en: 'History dates' }, jouable: 'histoire' }, { id: 'tableaux', nom: { fr: 'Tableaux célèbres', en: 'Famous paintings' }, jouable: 'tableaux' }, j('presidents', 'Présidents français', 'French presidents'), j('mouvements', 'Mouvements artistiques', 'Art movements'), j('sculptures', 'Sculptures', 'Sculptures'), j('architecture', 'Architectes', 'Architects'), j('batailles', 'Batailles', 'Battles'), j('attentats', 'Attentats : l’année', 'Attacks: year'), j('attentats-pays', 'Attentats : le pays', 'Attacks: country'), j('traites', 'Traités et accords', 'Treaties'), j('souverains', 'Rois, reines et empereurs', 'Monarchs'), j('politiques', 'Personnalités politiques françaises', 'French politicians'), j('dirigeants', 'Dirigeants du monde', 'World leaders'), j('peintres', 'Peintres en photo', 'Painters'), j('tableaux-photo', 'Tableaux en image', 'Paintings in pictures'), j('catastrophes', 'Catastrophes naturelles et humaines', 'Disasters')],
  },
  {
    k: 'brd', nom: { fr: 'Marques & logos', en: 'Brands & logos' },
    icon: 'M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8-9 9ZM10 8.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 1 1 3 0Z',
    motif: 'M20 44V14h30l34 34-30 30ZM40 30a5 5 0 1 1-10 0a5 5 0 1 1 10 0',
    subs: [{ id: 'logos', nom: { fr: 'Logos', en: 'Logos' }, jouable: 'logos' }, j('logos-vrai', 'Le vrai logo (repère les faux)', 'The real logo (spot the fakes)'), { id: 'marques', nom: { fr: 'Marques et pays', en: 'Brands & countries' }, jouable: 'marques' }, j('marques-mode', 'Marques de mode', 'Fashion brands')],
  },
  {
    k: 'spo', nom: { fr: 'Sport', en: 'Sport' },
    icon: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17ZM12 3.5v4l3.5 2.5-1.3 4h-4.4L8.5 10 12 7.5M15.5 10l4.5-1M8.5 10 4 9M9.8 14l-2.3 4.5M14.2 14l2.3 4.5',
    motif: 'M10 70h100M20 70V30M100 70V30M20 30h80M60 30v40M40 50a20 20 0 0 1 40 0',
    subs: [j('sportifs', 'Sportifs', 'Athletes'), j('sportifs-sport', 'Quel sport ?', 'Which sport?'), j('clubs', 'Clubs de football', 'Football clubs'), j('stades', 'Stades', 'Stadiums'), j('sports-photo', 'Sports en photo', 'Sports in pictures'), j('balles', 'Équipements sportifs', 'Sports gear'), j('ballon-or', 'Ballons d’or', 'Ballon d’Or winners'), j('coupe-monde', 'Coupes du monde : le vainqueur', 'World Cups: winner')],
  },
  {
    k: 'lit', nom: { fr: 'Littérature & BD', en: 'Books & comics' },
    icon: 'M4 5.5c3-1 5.5-.8 8 1 2.5-1.8 5-2 8-1v13c-3-1-5.5-.8-8 1-2.5-1.8-5-2-8-1ZM12 6.5v13',
    motif: 'M20 20c15-6 28-5 40 4 12-9 25-10 40-4v46c-15-6-28-5-40 4-12-9-25-10-40-4ZM60 24v46',
    subs: [j('livres', 'Livres et auteurs', 'Books & authors'), j('livres-annee', 'Livres : année', 'Books: year'), j('auteurs', 'Écrivains', 'Writers'), j('bd', 'Personnages de BD', 'Comic characters'), j('mangas', 'Mangas', 'Manga')],
  },
  {
    k: 'jv', nom: { fr: 'Jeux vidéo & jeux', en: 'Games' },
    icon: 'M8 7h8a6 6 0 0 1 5.8 7.5l-.6 2.3a2.6 2.6 0 0 1-4.5 1l-1.9-2.3H9.2l-1.9 2.3a2.6 2.6 0 0 1-4.5-1l-.6-2.3A6 6 0 0 1 8 7ZM8 10v4M6 12h4M15.5 11h.01M17.5 13h.01',
    motif: 'M30 24h60a20 20 0 0 1 20 20v10a14 14 0 0 1-25 8l-6-6H41l-6 6a14 14 0 0 1-25-8V44a20 20 0 0 1 20-20Z',
    subs: [j('musiques-jeux', 'Musiques de jeux vidéo', 'Video game music'), j('emojis-jeux', 'Jeux vidéo en émojis', 'Games in emojis'), j('jeux', 'Jeux et studios', 'Games & studios'), j('jeux-annee', 'Jeux : année de sortie', 'Games: release year'), j('persos-jeux', 'Personnages', 'Characters'), j('persos-univers', 'Personnages : de quel jeu ?', 'Characters: which game?'), j('lieux-jeux', 'Lieux et cartes : de quel jeu ?', 'Places & maps: which game?'), j('sagas', 'Sagas et éditeurs', 'Series & publishers'), j('regles-jeux', 'Jeux de société, cartes et échecs', 'Board & card games'), j('pokemon-photo', 'Quel est ce Pokémon ?', 'Who’s that Pokémon?'), j('pokemon-silhouette', 'Pokémon en silhouette', 'Pokémon silhouettes'), j('pokemon', 'Pokémon : le type', 'Pokémon: type')],
  },
  {
    k: 'ani', nom: { fr: 'Animés & doublage', en: 'Anime & dubbing' },
    icon: 'M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8Z',
    motif: 'M60 10l10 20 22 3-16 15 4 22-20-10-20 10 4-22-16-15 22-3Z',
    subs: [j('animes', 'Animés : l’année', 'Anime: year'), j('animes-studio', 'Animés : le studio', 'Anime: studio'), j('persos-animes', 'Personnages : de quel animé ?', 'Anime characters'), j('lieux-animes', 'Villes et lieux d’animés', 'Anime places'), j('openings', 'Openings d’animés', 'Anime openings'), j('voix-vf', 'Voix françaises : qui chante ?', 'French voices: who sings?'), j('doubleurs', 'Voix françaises', 'French voice actors')],
  },
  {
    k: 'vie', nom: { fr: 'Vie quotidienne & mythes', en: 'Everyday life & myths' },
    icon: 'M5 20.5h14M7 20.5V11l5-6.5 5 6.5v9.5M10 20.5v-5h4v5',
    motif: 'M20 70h80M30 70V40l30-26 30 26v30M50 70V52h20v18',
    subs: [j('comparaisons', 'Combien de tacos ? Comparaisons absurdes', 'Absurd comparisons'), j('metiers', 'Métiers : qui fait quoi ?', 'Jobs'), j('records-monde', 'Records du monde', 'World records'), j('voitures', 'Voitures : le constructeur', 'Cars: maker'), j('voitures-photo', 'Voitures en photo', 'Cars in pictures'), j('dieux', 'Divinités', 'Deities'), j('dieux-mythologie', 'Quelle mythologie ?', 'Which mythology?'), j('instruments', 'Instruments de musique', 'Musical instruments'), j('jeux-societe', 'Jeux de société et de café', 'Board & bar games'), j('legendes', 'Légendes urbaines et mythes', 'Urban legends & myths'), j('panneaux', 'Panneaux du code de la route', 'Road signs'), j('code-route', 'Code de la route : règles', 'Highway code')],
  },
  {
    k: 'pop', nom: { fr: 'Pop culture & Internet', en: 'Pop culture & Internet' },
    icon: 'M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5ZM10 9.3v5.4l4.6-2.7Z',
    motif: 'M14 14h92v52H14ZM52 28v24l20-12Z',
    subs: [j('mascottes', 'Mascottes de marques', 'Brand mascots'), j('youtubeurs', 'Youtubeurs et streamers', 'YouTubers & streamers'), j('emojis-films', 'Films en émojis', 'Films in emojis'), j('emojis-series', 'Séries en émojis', 'TV shows in emojis'), j('repliques', 'Répliques cultes', 'Famous movie lines'), j('superheros', 'Super-héros : l’identité secrète', 'Superheroes: secret identity'), j('persos-animation', 'Disney, Pixar, DreamWorks : de quel film ?', 'Animated films: which film?'), j('persos-animation-photo', 'Personnages Disney, Pixar, DreamWorks', 'Disney, Pixar, DreamWorks characters'), j('dessins-animes', 'Dessins animés : de quelle série ?', 'Cartoons: which show?'), j('persos-classiques', 'Personnages classiques (avant 1990)', 'Classic characters'), j('dessins-animes-photo', 'Personnages de dessins animés', 'Cartoon characters'), j('mechants', 'Méchants : de quelle œuvre ?', 'Villains: which work?'), j('mechants-photo', 'Méchants en image', 'Villains in pictures'), j('heros', 'Héros : de quelle œuvre ?', 'Heroes: which work?'), j('heros-photo', 'Héros en image', 'Heroes in pictures'), j('slogans', 'Slogans publicitaires', 'Ad slogans')],
  },
  {
    k: 'cui', nom: { fr: 'Cuisine & saveurs', en: 'Food & flavours' },
    icon: 'M7 3.5v6.5M5 3.5V8a2 2 0 0 0 4 0V3.5M7 10v10.5M17 3.5c-1.8 1.3-2.8 3.6-2.8 6.4V13H17v7.5',
    motif: 'M30 10v30M22 10v18a8 8 0 0 0 16 0V10M30 40v34M86 10c-8 6-12 16-12 28v12h12v24',
    subs: [j('fast-food', 'Fast-food et chaînes', 'Fast food'), j('fruits', 'Fruits', 'Fruits'), j('legumes', 'Légumes', 'Vegetables'), j('desserts', 'Desserts et pâtisseries', 'Desserts & pastries'), j('epices', 'Épices et herbes', 'Spices & herbs'), j('fromages', 'Fromages du monde', 'World cheeses'), j('plats-photo', 'Plats du monde en photo', 'World dishes in pictures')],
  },
  {
    k: 'mot', nom: { fr: 'Mots & curiosités', en: 'Words & curiosities' },
    icon: 'M4.5 5h15A1.5 1.5 0 0 1 21 6.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.5v-9A1.5 1.5 0 0 1 4.5 5ZM8 10h8M8 13h5',
    motif: 'M14 14h92v44H50l-20 16V58H14ZM30 30h60M30 42h36',
    subs: [j('devinettes', 'Devinettes : qui suis-je ?', 'Riddles'), j('suites-logiques', 'Suites logiques', 'Logic sequences'), j('idees-recues', 'Idées reçues : vrai ou faux ?', 'Myths: true or false?'), j('emojis-expressions', 'Expressions en émojis', 'Sayings in emojis'), j('emojis-pays', 'Pays en émojis', 'Countries in emojis'), j('expressions', 'Expressions françaises', 'French expressions'), j('gentiles', 'Habitants des villes', 'What locals are called'), j('phobies', 'Phobies', 'Phobias'), j('cris', 'Cris des animaux', 'Animal sounds'), j('cris-animaux', 'Cris d’animaux à écouter', 'Animal sounds (listen)'), j('sigles', 'Sigles et acronymes', 'Acronyms'), j('verlan', 'Verlan et argot', 'French slang'), j('proverbes', 'Proverbes à compléter', 'Proverbs'), j('citations', 'Qui a dit ça ?', 'Who said it?'), j('petits-animaux', 'Petits des animaux', 'Baby animals'), j('groupes-animaux', 'Groupes d’animaux', 'Animal groups'), j('surnoms-villes', 'Surnoms de villes', 'City nicknames')],
  },
  {
    k: 'tec', nom: { fr: 'Tech & Internet', en: 'Tech & Internet' },
    icon: 'M4 5.5h16v10H4ZM9 19.5h6M12 15.5v4',
    motif: 'M20 14h80v46H20ZM44 74h32M60 60v14',
    subs: [j('logos-tech', 'Logos tech', 'Tech logos'), j('reseaux', 'Réseaux sociaux et applis', 'Social networks'), j('fondateurs', 'Fondateurs d’entreprises tech', 'Tech founders'), j('sigles-tech', 'Sigles du numérique', 'Tech acronyms'), j('applis', 'Applis', 'Apps'), j('telephones', 'Téléphones cultes', 'Iconic phones')],
  },
  {
    k: 'esp', nom: { fr: 'Espace', en: 'Space' },
    icon: 'M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7ZM3.5 14c3-3.5 13-7 17-6.5M18.5 4.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7Z',
    motif: 'M60 30a14 14 0 1 0 0 28a14 14 0 1 0 0-28M20 52c14-14 56-26 80-24',
    subs: [j('planetes', 'Planètes et astres', 'Planets & stars'), j('missions', 'Missions spatiales : l’année', 'Space missions: year'), j('astronautes', 'Astronautes', 'Astronauts'), j('constellations', 'Constellations', 'Constellations'), j('lunes', 'Planètes et lunes', 'Planets & moons')],
  },
  {
    k: 'pho', nom: { fr: 'Photo & vidéo', en: 'Photo & video' },
    icon: 'M4 8.5h3l1.5-2.5h7L17 8.5h3v10H4ZM12 11a3 3 0 1 0 0 6a3 3 0 1 0 0-6Z',
    motif: 'M20 30h20l8-12h24l8 12h20v40H20ZM60 38a12 12 0 1 0 0 24a12 12 0 1 0 0-24',
    subs: [j('photo-technique', 'Technique photo', 'Photo technique'), j('plans-cinema', 'Plans et cadrages', 'Shots & framing'), j('lumiere', 'Lumière et éclairage', 'Lighting'), j('video-montage', 'Vidéo et montage', 'Video & editing')],
  },
]

export const trouverSousTheme = (id: string) => {
  for (const f of FAMILLES) {
    const s = f.subs.find((x) => x.id === id)
    if (s) return { famille: f, sous: s }
  }
  return null
}
