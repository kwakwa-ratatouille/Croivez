import { CONDITIONS_ALBUM } from './albumRecompenses'
import { CHAMP_EFFET, EFFETS as EFFETS_BOUTIQUE, type Sorte } from './effets'
import { PORTRAITS } from './components/Portrait'
import { arrayUnion, doc, increment, runTransaction, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Lang } from './i18n'
import { niveau, type Profile } from './auth'
import { BADGES, palierAtteint } from './badges'
import { legendeOuverte, progresLegende } from './progression'
import { FAMILLES, type Famille } from './themes'
import { erudition, semaine } from './social'
import { EVENEMENTS, SAISONS, evenementActif } from './evenements'
import { ANIMAUX } from './components/Animal'
import { FONDS_ANIMES, STYLES_PSEUDO } from './components/Cosmetiques'
import { TOUS_RANGS } from './ligues'

// ——— Ligues hebdomadaires : selon l'XP gagnée cette semaine (classement de la semaine) ———
export const LIGUES = [
  { id: 'bronze', nom: { fr: 'Bronze', en: 'Bronze' }, min: 0, couleur: '#C98B5A' },
  { id: 'argent', nom: { fr: 'Argent', en: 'Silver' }, min: 300, couleur: '#9AA3AD' },
  { id: 'or', nom: { fr: 'Or', en: 'Gold' }, min: 1000, couleur: '#D8B04A' },
  { id: 'saphir', nom: { fr: 'Saphir', en: 'Sapphire' }, min: 2000, couleur: '#6B8FD6' },
  { id: 'diamant', nom: { fr: 'Diamant', en: 'Diamond' }, min: 3500, couleur: '#7CCFDA' },
]
export const ligueDe = (xpSemaine: number) => [...LIGUES].reverse().find((l) => xpSemaine >= l.min)!
export const ligueSuivante = (xpSemaine: number) => LIGUES.find((l) => l.min > xpSemaine)

// ——— Événements : d'abord le vrai calendrier (fêtes, journées mondiales), sinon une famille à l'honneur chaque semaine ———
// Dates fixes « MM-JJ » (début, fin inclus). XP et pièces ×2 sur la famille entière, ou seulement sur les quiz listés.
type Evenement = { k: Famille; nom: Record<Lang, string>; debut: string; fin: string; quiz?: string[] }
const CALENDRIER: Evenement[] = [
  { k: 'his', nom: { fr: 'Nouvel An lunaire', en: 'Lunar New Year' }, debut: '02-01', fin: '02-07', quiz: ['histoire', 'monuments', 'plats'] },
  { k: 'his', nom: { fr: 'Saint-Valentin : couples célèbres', en: 'Valentine’s Day' }, debut: '02-12', fin: '02-15', quiz: ['personnalites', 'films', 'tableaux', 'livres', 'albums'] },
  { k: 'cine', nom: { fr: 'Semaine des César et des Oscars', en: 'Awards week' }, debut: '02-26', fin: '03-10' },
  { k: 'sci', nom: { fr: 'Semaine du cerveau', en: 'Brain week' }, debut: '03-11', fin: '03-17' },
  { k: 'lit', nom: { fr: 'Printemps des poètes', en: 'Poetry spring' }, debut: '03-18', fin: '03-24' },
  { k: 'nat', nom: { fr: 'Journée de la Terre', en: 'Earth Day' }, debut: '04-20', fin: '04-24' },
  { k: 'lit', nom: { fr: 'Journée mondiale du livre', en: 'World Book Day' }, debut: '04-23', fin: '04-26' },
  { k: 'cine', nom: { fr: 'Festival de Cannes', en: 'Cannes Film Festival' }, debut: '05-13', fin: '05-24' },
  { k: 'his', nom: { fr: 'Nuit des musées', en: 'Museum night' }, debut: '05-15', fin: '05-19', quiz: ['tableaux', 'sculptures', 'mouvements', 'architecture'] },
  { k: 'spo', nom: { fr: 'Roland-Garros', en: 'French Open' }, debut: '05-25', fin: '06-08' },
  { k: 'jv', nom: { fr: 'Semaine des annonces jeux vidéo', en: 'Games showcase week' }, debut: '06-06', fin: '06-14' },
  { k: 'nat', nom: { fr: 'Journée des océans', en: 'Oceans Day' }, debut: '06-08', fin: '06-08', quiz: ['animaux', 'poissons', 'iles'] },
  { k: 'mus', nom: { fr: 'Fête de la musique', en: 'Music Day' }, debut: '06-19', fin: '06-23' },
  { k: 'spo', nom: { fr: 'Tour de France', en: 'Tour de France' }, debut: '07-05', fin: '07-12' },
  { k: 'his', nom: { fr: '14 Juillet', en: 'Bastille Day' }, debut: '07-13', fin: '07-15', quiz: ['histoire', 'presidents', 'departements-prefecture', 'monuments'] },
  { k: 'geo', nom: { fr: 'Grandes vacances : tour du monde', en: 'Summer world tour' }, debut: '07-20', fin: '08-20' },
  { k: 'jv', nom: { fr: 'Gamescom', en: 'Gamescom' }, debut: '08-21', fin: '08-27' },
  { k: 'lit', nom: { fr: 'Rentrée littéraire', en: 'Book season' }, debut: '09-01', fin: '09-07' },
  { k: 'his', nom: { fr: 'Journées du patrimoine', en: 'Heritage Days' }, debut: '09-16', fin: '09-22' },
  { k: 'sci', nom: { fr: 'Fête de la science', en: 'Science festival' }, debut: '10-02', fin: '10-12' },
  { k: 'cine', nom: { fr: 'Halloween : films d’horreur et monstres', en: 'Halloween' }, debut: '10-25', fin: '11-01', quiz: ['films', 'series', 'araignees', 'insectes', 'champignons'] },
  { k: 'mus', nom: { fr: 'Semaine des Victoires et Grammy', en: 'Music awards week' }, debut: '11-10', fin: '11-16' },
  { k: 'brd', nom: { fr: 'Black Friday : marques et logos', en: 'Black Friday: brands' }, debut: '11-24', fin: '11-30' },
  { k: 'cine', nom: { fr: 'Calendrier de l’Avent : films de Noël', en: 'Christmas films' }, debut: '12-01', fin: '12-24', quiz: ['films', 'series', 'personnages-anim'] },
  { k: 'geo', nom: { fr: 'Réveillon autour du monde', en: 'New Year around the world' }, debut: '12-26', fin: '12-31', quiz: ['capitales', 'drapeaux', 'plats', 'monuments'] },
]
export type EvenementActif = { k: Famille; nom: Record<Lang, string>; quiz?: string[]; fin?: string; reel: boolean }
export function evenementDuJour(d = new Date()): EvenementActif {
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  // L'événement le plus court l'emporte (une journée précise passe devant une période)
  const actifs = CALENDRIER.filter((e) => md >= e.debut && md <= e.fin).sort((a, b) => (a.fin > b.fin ? 1 : -1))
  if (actifs[0]) return { ...actifs[0], reel: true }
  const s = semaine(d)
  const n = Number(s.slice(-2)) + Number(s.slice(0, 4)) * 53
  const f = FAMILLES[n % FAMILLES.length]
  return { k: f.k, nom: f.nom, reel: false }
}
export const evenementDeLaSemaine = evenementDuJour
export const bonusEvenement = (k?: string, sousTheme?: string) => {
  // Quiz spécial de l'événement en cours (Halloween, Noël…) : XP et pièces ×2
  if (sousTheme && evenementActif()?.quiz === sousTheme) return 2
  const e = evenementDuJour()
  if (!k || e.k !== k) return e.quiz && sousTheme && e.quiz.includes(sousTheme) ? 2 : 1
  return !e.quiz || (sousTheme && e.quiz.includes(sousTheme)) ? 2 : 1
}

// ——— Succès secrets : cachés tant qu'ils ne sont pas obtenus ———
export type ContexteFin = { heure: number; jourSemaine: number; bonnes: number; total: number; comboMax: number; difficulte?: number; jeu?: string; bossReussi: boolean; partiesAujourdhui: number }
export const SECRETS: { id: string; nom: Record<Lang, string>; indice: Record<Lang, string>; test: (c: ContexteFin) => boolean }[] = [
  { id: 'nuit', nom: { fr: 'Oiseau de nuit', en: 'Night owl' }, indice: { fr: 'Jouer entre minuit et 5 h', en: 'Play between midnight and 5 am' }, test: (c) => c.heure < 5 },
  { id: 'aube', nom: { fr: 'Lève-tôt', en: 'Early bird' }, indice: { fr: 'Jouer avant 7 h', en: 'Play before 7 am' }, test: (c) => c.heure >= 5 && c.heure < 7 },
  { id: 'dimanche', nom: { fr: 'Dimanche studieux', en: 'Studious Sunday' }, indice: { fr: 'Un sans-faute un dimanche', en: 'A flawless game on Sunday' }, test: (c) => c.jourSemaine === 0 && c.total >= 10 && c.bonnes === c.total },
  { id: 'combo15', nom: { fr: 'Machine', en: 'Machine' }, indice: { fr: 'Un combo de 15', en: 'A 15-answer combo' }, test: (c) => c.comboMax >= 15 },
  { id: 'zero', nom: { fr: 'Courage, fuyons', en: 'Brave retreat' }, indice: { fr: 'Une partie de 10 sans aucune bonne réponse', en: 'A game of 10 with no correct answer' }, test: (c) => c.total >= 10 && c.bonnes === 0 },
  { id: 'expert', nom: { fr: 'Cerveau', en: 'Big brain' }, indice: { fr: 'Un sans-faute en Expert', en: 'A flawless Expert game' }, test: (c) => c.difficulte === 4 && c.total >= 10 && c.bonnes === c.total },
  { id: 'legende', nom: { fr: 'Mythe vivant', en: 'Living myth' }, indice: { fr: 'Réussir 8 questions en Légende', en: 'Get 8 right in Legend' }, test: (c) => c.difficulte === 5 && c.bonnes >= 8 },
  { id: 'boss', nom: { fr: 'Tueur de boss', en: 'Boss slayer' }, indice: { fr: 'Battre une question boss', en: 'Beat a boss question' }, test: (c) => c.bossReussi },
  { id: 'marathon', nom: { fr: 'Marathonien', en: 'Marathoner' }, indice: { fr: '10 parties dans la même journée', en: '10 games in one day' }, test: (c) => c.partiesAujourdhui >= 10 },
  { id: 'eclair', nom: { fr: 'Foudre', en: 'Thunderbolt' }, indice: { fr: '30 bonnes réponses en Express', en: '30 correct in Express' }, test: (c) => c.jeu === 'express' && c.bonnes >= 30 },
  { id: 'immortel', nom: { fr: 'Immortel', en: 'Immortal' }, indice: { fr: '25 bonnes réponses en Survie', en: '25 correct in Survival' }, test: (c) => c.jeu === 'survie' && c.bonnes >= 25 },
]
export const secretsObtenus = (p: Profile | null | undefined, c: ContexteFin) => SECRETS.filter((s) => !p?.secrets?.includes(s.id) && s.test(c)).map((s) => s.id)

// ——— Boutique : avatars (métiers, animaux, fun, familles), cadres et titres ———
// Certains s'achètent avec des pièces, d'autres se gagnent par un exploit précis (condition) : ils montrent ce qu'on a accompli.
// Cadres animés : animations CSS (transform / opacity / filter), seulement sur les grands avatars.
export type Objet = {
  id: string; type: 'avatar' | 'cadre' | 'titre' | 'fond' | 'pseudo' | 'effet'; sorte?: Sorte; nom: Record<Lang, string>; prix: number
  categorie?: 'portrait' | 'metier' | 'animal' | 'fun' | 'famille'
  portrait?: string // personnage illustré (components/Portrait)
  k?: Famille; couleur?: string; perso?: string; animal?: string; emoji?: string; anim?: string
  album?: boolean // récompense exclusive de l'album (onglet « Boutique de l'album »)
  cache?: boolean // retiré de la boutique (reste affichable s'il est déjà porté)
  orbite?: string[] // petits éléments qui tournent autour de l'avatar (planètes, notes, feuilles…)
  // avance : où on en est ([valeur, objectif]), affiché en direct dans la boutique
  condition?: { desc: Record<Lang, string>; test: (p: Profile) => boolean; avance?: (p: Profile) => [number, number] }
  evenement?: string; saison?: string // récompense d'un événement ou d'une saison
  luxe?: 1 | 2 // 1 = cher, 2 = ultra (le plus beau de sa catégorie, très cher)
  fondAvatar?: string // fond animé des avatars de luxe
  jetons?: number // prix en jetons de rang (boutique des rangs) au lieu de pièces
}
const NOMS_PERSOS: Record<string, [string, string]> = {
  eleve: ['Élève', 'Pupil'], savante: ['Savante', 'Scientist'], explorateur: ['Explorateur', 'Explorer'], astronaute: ['Astronaute', 'Astronaut'],
  musicienne: ['Musicienne', 'Musician'], peintre: ['Peintre', 'Painter'], gameur: ['Gameur', 'Gamer'], sportive: ['Sportive', 'Athlete'],
  detective: ['Détective', 'Detective'], magicien: ['Magicien', 'Wizard'], cheffe: ['Cheffe', 'Chef'], historien: ['Historien', 'Historian'],
  botaniste: ['Botaniste', 'Botanist'], pirate: ['Pirate', 'Pirate'], robot: ['Robot', 'Robot'], professeure: ['Professeure', 'Teacher'],
  pilote: ['Pilote de F1', 'F1 driver'], pompier: ['Pompier', 'Firefighter'], docteure: ['Docteure', 'Doctor'], policier: ['Policier', 'Police officer'],
  footballeur: ['Footballeur', 'Footballer'], dj: ['DJ', 'DJ'], ninja: ['Ninja', 'Ninja'], chevalier: ['Chevalier', 'Knight'], heroine: ['Super-héroïne', 'Superhero'],
  plongeur: ['Plongeur', 'Diver'], agent: ['Agent secret', 'Secret agent'], cowboy: ['Cow-boy', 'Cowboy'], rockstar: ['Rockstar', 'Rock star'], reine: ['Reine', 'Queen'],
  viking: ['Viking', 'Viking'], samourai: ['Samouraï', 'Samurai'], vampire: ['Vampire', 'Vampire'], sorciere: ['Sorcière', 'Witch'], streameur: ['Streameur', 'Streamer'],
}
const orBadges = (p: Profile) => BADGES.filter((b) => palierAtteint(b, p) === 3).length
const paliersReussis = (p: Profile) => Object.values(p.paliers ?? {}).reduce((n, l) => n + l.length, 0)
const st = (p: Profile, k: keyof NonNullable<Profile['exploits']>) => p.exploits?.[k] ?? 0
const maitriseFamille = (p: Profile, k: Famille) => { const j = FAMILLES.find((f) => f.k === k)?.subs.filter((s) => s.jouable) ?? []; return j.length ? j.reduce((a, s) => a + (p.maitrise?.[s.id] ?? 0), 0) / j.length : 0 }
const unLegende = (p: Profile) => FAMILLES.some((f) => legendeOuverte(f.k, p))
const C = (fr: string, en: string, test: (p: Profile) => boolean) => ({ desc: { fr, en }, test })
// Condition chiffrée : débloquée à « objectif », progression visible dans la boutique
const N = (fr: string, en: string, valeur: (p: Profile) => number, objectif: number) => ({ desc: { fr, en }, test: (p: Profile) => valeur(p) >= objectif, avance: (p: Profile): [number, number] => [Math.min(Math.floor(valeur(p)), objectif), objectif] })

// Conditions réutilisées par les avatars, cadres et titres
const EXPLOITS = {
  multi3: N('Gagner 3 parties en salon', 'Win 3 room games', (p) => st(p, 'victoiresMulti'), 3),
  multi10: N('Gagner 10 parties en salon', 'Win 10 room games', (p) => st(p, 'victoiresMulti'), 10),
  salons10: N('Jouer 10 parties en salon', 'Play 10 room games', (p) => st(p, 'salons'), 10),
  tv5: N('Jouer 5 parties en mode télé', 'Play 5 TV games', (p) => st(p, 'tv'), 5),
  tvHote3: N('Lancer 3 soirées en mode télé', 'Host 3 TV nights', (p) => st(p, 'tvHote'), 3),
  duels5: N('Gagner 5 duels', 'Win 5 duels', (p) => st(p, 'duelsGagnes'), 5),
  miniJeux: N('Jouer tous les mini-jeux', 'Play every mini-game', (p) => (p.miniJeux?.length ?? 0), 8),
  express20: N('20 bonnes réponses en Express', '20 right in Express', (p) => (p.records?.express ?? 0), 20),
  express30: N('30 bonnes réponses en Express', '30 right in Express', (p) => (p.records?.express ?? 0), 30),
  survie25: N('25 bonnes réponses en Survie', '25 right in Survival', (p) => (p.records?.survie ?? 0), 25),
  erud500: N('500 points d’érudition', '500 knowledge points', (p) => erudition(p), 500),
  erud1000: N('1 000 points d’érudition', '1,000 knowledge points', (p) => erudition(p), 1000),
  erud2000: N('2 000 points d’érudition', '2,000 knowledge points', (p) => erudition(p), 2000),
  erud5000: N('5 000 points d’érudition', '5,000 knowledge points', (p) => erudition(p), 5000),
  legende: { ...C('Ouvrir la Légende d’une famille', 'Unlock a family Legend', unLegende), avance: (p: Profile): [number, number] => { const l = FAMILLES.map((f) => progresLegende(f.k, p)).sort((a, b) => b.faits / Math.max(1, b.total) - a.faits / Math.max(1, a.total))[0]; return [l?.faits ?? 0, l?.total ?? 1] } },
  serie7: N('Série de 7 jours', '7-day streak', (p) => (p.meilleureSerie ?? p.serie ?? 0), 7),
  serie30: N('Série de 30 jours', '30-day streak', (p) => (p.meilleureSerie ?? p.serie ?? 0), 30),
  niv10: N('Niveau 10', 'Level 10', (p) => niveau(p.xp ?? 0), 10),
  niv25: N('Niveau 25', 'Level 25', (p) => niveau(p.xp ?? 0), 25),
  parties100: N('100 parties jouées', '100 games played', (p) => (p.parties ?? 0), 100),
  sansFaute10: N('10 sans-fautes', '10 perfect games', (p) => (p.sansFaute ?? 0), 10),
  paliers40: N('40 niveaux réussis au sans-faute', '40 perfect levels', (p) => paliersReussis(p), 40),
  or10: N('10 badges en or', '10 gold badges', (p) => orBadges(p), 10),
  nuit: C('Succès secret : Oiseau de nuit', 'Secret: Night owl', (p) => !!p.secrets?.includes('nuit')),
  boss: C('Succès secret : Tueur de boss', 'Secret: Boss slayer', (p) => !!p.secrets?.includes('boss')),
  machine: C('Succès secret : Machine (combo de 15)', 'Secret: Machine', (p) => !!p.secrets?.includes('combo15')),
  immortel: C('Succès secret : Immortel', 'Secret: Immortal', (p) => !!p.secrets?.includes('immortel')),
  marathon: C('Succès secret : Marathonien', 'Secret: Marathoner', (p) => !!p.secrets?.includes('marathon')),
  geo: N('60 % de maîtrise en Géographie', '60% Geography mastery', (p) => maitriseFamille(p, 'geo'), 60),
  cine: N('60 % de maîtrise en Cinéma', '60% Film mastery', (p) => maitriseFamille(p, 'cine'), 60),
  jv: N('60 % de maîtrise en Jeux vidéo', '60% Video games mastery', (p) => maitriseFamille(p, 'jv'), 60),
  nat: N('60 % de maîtrise en Nature', '60% Nature mastery', (p) => maitriseFamille(p, 'nat'), 60),
  mus: N('60 % de maîtrise en Musique', '60% Music mastery', (p) => maitriseFamille(p, 'mus'), 60),
  cui: N('60 % de maîtrise en Cuisine', '60% Food mastery', (p) => maitriseFamille(p, 'cui'), 60),
  pop: N('60 % de maîtrise en Pop culture', '60% Pop culture mastery', (p) => maitriseFamille(p, 'pop'), 60),
  riche: N('Avoir 2 000 pièces en poche', 'Hold 2,000 coins', (p) => (p.pieces ?? 0), 2000),
}

// Avatars métiers : les premiers gratuits, la plupart à acheter, les plus prestigieux à gagner
const PRESTIGE: Record<string, keyof typeof EXPLOITS> = { pilote: 'express20', astronaute: 'erud500', chevalier: 'legende', reine: 'erud2000', streameur: 'salons10', dj: 'multi3', ninja: 'machine', vampire: 'nuit', samourai: 'boss', heroine: 'immortel' }
const ANIMAUX_PRESTIGE: Record<string, keyof typeof EXPLOITS> = { licorne: 'legende', dragon: 'erud1000', alien: 'tv5', axolotl: 'miniJeux', requin: 'duels5' }
const FUN: [string, string, string][] = [['dino', '🦖', 'Dino'], ['pizza', '🍕', 'Pizza'], ['manette', '🎮', 'Manette'], ['fusee', '🚀', 'Fusée'], ['fantome', '👻', 'Fantôme'], ['envahisseur', '👾', 'Envahisseur'], ['pieuvre', '🐙', 'Pieuvre'], ['donut', '🍩', 'Donut'], ['cerveau', '🧠', 'Cerveau'], ['diamant', '💎', 'Diamant'], ['citrouille', '🎃', 'Citrouille'], ['tacos', '🌮', 'Tacos'], ['planete', '🪐', 'Planète'], ['avocat', '🥑', 'Avocat'], ['couronne', '👑', 'Couronne'], ['feu', '🔥', 'Feu']]

export const BOUTIQUE: Objet[] = [
  ...Object.entries(NOMS_PERSOS).map(([id, [fr, en]], i): Objet => {
    const c = PRESTIGE[id]
    return { id: `perso-${id}`, type: 'avatar', categorie: 'metier', nom: { fr, en }, prix: c ? 0 : i < 3 ? 0 : 60 + (i % 6) * 40, perso: id, ...(c ? { condition: EXPLOITS[c] } : {}) }
  }),
  ...ANIMAUX.map((a, i): Objet => {
    const c = ANIMAUX_PRESTIGE[a.id]
    return { id: `animal-${a.id}`, type: 'avatar', categorie: 'animal', nom: { fr: a.fr, en: a.en }, prix: c ? 0 : i < 2 ? 0 : 80 + (i % 5) * 30, animal: a.id, ...(c ? { condition: EXPLOITS[c] } : {}) }
  }),
  ...FUN.map(([id, e, nom], i): Objet => ({ id: `fun-${id}`, type: 'avatar', categorie: 'fun', nom: { fr: nom, en: nom }, prix: 50 + (i % 4) * 25, emoji: e, ...(id === 'couronne' ? { prix: 0, condition: EXPLOITS.multi10 } : id === 'diamant' ? { prix: 0, condition: EXPLOITS.riche } : {}) })),
  // Portraits illustrés : les 4 premiers offerts, les autres de 120 à 420 pièces
  ...PORTRAITS.map((p, i): Objet => ({ id: `portrait-${p.id}`, type: 'avatar', categorie: 'portrait', nom: { fr: p.fr, en: p.en }, prix: i < 4 ? 0 : 120 + (i % 6) * 60, portrait: p.id })),
  ...FAMILLES.map((f, i): Objet => ({ id: `avatar-${f.k}`, type: 'avatar', categorie: 'famille', cache: true, nom: f.nom, prix: i < 2 ? 0 : 100, k: f.k })),

  // ——— Luxe : des objets chers, et un « ultra » hors de prix et très animé dans chaque catégorie ———
  ...([
    ['metier', 'luxe-commandant', '🧑‍🚀', 'Commandant spatial', 'Space commander', 2500, 1, 'linear-gradient(160deg, #020617, #1E3A8A)'],
    ['metier', 'luxe-archimage', '🧙', 'Archimage', 'Archmage', 6000, 1, 'linear-gradient(160deg, #3B0764, #7C3AED)'],
    ['metier', 'ultra-empereur', '🤴', 'Empereur doré', 'Golden emperor', 20000, 2, 'conic-gradient(from 0deg, #78350F, #FDE047, #B45309, #FEF3C7, #78350F)'],
    ['animal', 'luxe-licorne', '🦄', 'Licorne étoilée', 'Starry unicorn', 2500, 1, 'linear-gradient(160deg, #F0ABFC, #A5F3FC)'],
    ['animal', 'luxe-phenix', '🐦‍🔥', 'Phénix', 'Phoenix', 6000, 1, 'linear-gradient(0deg, #7F1D1D, #F97316, #FDE047)'],
    ['animal', 'ultra-dragon', '🐉', 'Dragon d’or', 'Golden dragon', 20000, 2, 'conic-gradient(#7F1D1D, #F59E0B, #FDE047, #DC2626, #7F1D1D)'],
    ['fun', 'luxe-robot', '🤖', 'Robot plaqué or', 'Gold-plated robot', 2500, 1, 'linear-gradient(160deg, #B8862E, #FFF2B8)'],
    ['fun', 'luxe-alien', '👽', 'Roi alien', 'Alien king', 6000, 1, 'linear-gradient(160deg, #052E16, #22C55E)'],
    ['fun', 'ultra-galaxie', '🌌', 'Galaxie vivante', 'Living galaxy', 25000, 2, 'conic-gradient(#0F0C29, #6D28D9, #DB2777, #2563EB, #0F0C29)'],
    ['famille', 'luxe-encyclopedie', '📚', 'Encyclopédie vivante', 'Living encyclopedia', 3000, 1, 'linear-gradient(160deg, #7C2D12, #F59E0B)'],
    ['famille', 'ultra-cerveau', '🧠', 'Cerveau suprême', 'Supreme brain', 25000, 2, 'conic-gradient(#831843, #F472B6, #6366F1, #22D3EE, #831843)'],
  ] as const).map(([categorie, id, emoji, fr, en, prix, luxe, fondAvatar]): Objet => ({ id: "avatar-" + id, type: 'avatar', categorie, nom: { fr, en }, prix, emoji, luxe, fondAvatar })),
  { id: 'cadre-diamant', type: 'cadre', nom: { fr: 'Diamant', en: 'Diamond' }, prix: 3000, luxe: 1, couleur: 'conic-gradient(#E0F2FE, #FFFFFF, #A5F3FC, #FFFFFF, #C7D2FE, #E0F2FE)', anim: 'tourne brille', orbite: ['💎', '✨', '💎'] },
  { id: 'cadre-tresor', type: 'cadre', nom: { fr: 'Trésor du pharaon', en: 'Pharaoh’s treasure' }, prix: 6000, luxe: 1, couleur: 'conic-gradient(#1E3A8A, #F4C430, #1E3A8A, #F4C430, #1E3A8A)', anim: 'tourne brille', orbite: ['👑', '🪙', '🏺', '🪙'] },
  { id: 'cadre-cosmos', type: 'cadre', nom: { fr: 'Cosmos infini', en: 'Infinite cosmos' }, prix: 25000, luxe: 2, couleur: 'conic-gradient(#0F0C29, #6D28D9, #F472B6, #FDE047, #22D3EE, #0F0C29)', anim: 'tourne holo ultra', orbite: ['🌌', '💫', '🪐', '☄️', '✨'] },
  // Cadres classiques à acheter
  { id: 'cadre-bronze', type: 'cadre', nom: { fr: 'Cadre bronze', en: 'Bronze frame' }, prix: 80, couleur: '#C98B5A' },
  { id: 'cadre-argent', type: 'cadre', nom: { fr: 'Cadre argent', en: 'Silver frame' }, prix: 200, couleur: '#9AA3AD' },
  { id: 'cadre-or', type: 'cadre', nom: { fr: 'Cadre or', en: 'Gold frame' }, prix: 400, couleur: '#D8B04A' },
  { id: 'cadre-bonbon', type: 'cadre', nom: { fr: 'Bonbon', en: 'Candy' }, prix: 300, couleur: 'repeating-conic-gradient(#FF8FB1 0 20deg, #fff 20deg 40deg)', anim: 'tourne', orbite: ['🍬', '🍭', '🍬'] },
  { id: 'cadre-ocean', type: 'cadre', nom: { fr: 'Océan', en: 'Ocean' }, prix: 500, couleur: 'conic-gradient(#0EA5E9, #22D3EE, #6366F1, #0EA5E9)', anim: 'vague', orbite: ['🫧', '🐟', '🫧'] },
  { id: 'cadre-arcenciel', type: 'cadre', nom: { fr: 'Arc-en-ciel', en: 'Rainbow' }, prix: 800, couleur: 'conic-gradient(#E0997A, #DDB65E, #8FD3B6, #6BB8C4, #B3A3DB, #E0997A)', anim: 'tourne' },
  { id: 'cadre-aurore', type: 'cadre', nom: { fr: 'Aurore boréale', en: 'Aurora' }, prix: 1500, couleur: 'conic-gradient(#34D399, #22D3EE, #A78BFA, #F472B6, #34D399)', anim: 'tourne holo' },
  // Cadres de compétence : gratuits mais gagnés, de plus en plus spectaculaires
  { id: 'cadre-flamme', type: 'cadre', nom: { fr: 'Flamme', en: 'Flame' }, prix: 0, couleur: 'conic-gradient(#FF6A3D, #FFC23D, #FF3D3D, #FF6A3D)', anim: 'pulse', condition: EXPLOITS.serie30 },
  { id: 'cadre-erudit', type: 'cadre', nom: { fr: 'Érudit', en: 'Scholar' }, prix: 0, couleur: 'conic-gradient(#5B8DEF, #A35BE0, #5B8DEF)', anim: 'tourne', condition: EXPLOITS.niv25 },
  { id: 'cadre-perfection', type: 'cadre', nom: { fr: 'Perfection', en: 'Perfection' }, prix: 0, couleur: 'conic-gradient(#fff, #8FD3B6, #fff, #6BB8C4, #fff)', anim: 'brille', condition: EXPLOITS.paliers40 },
  { id: 'cadre-medailles', type: 'cadre', nom: { fr: 'Médaillé', en: 'Medallist' }, prix: 0, couleur: 'conic-gradient(#D8B04A, #FFF2B8, #D8B04A, #B8862E, #D8B04A)', anim: 'brille', condition: EXPLOITS.or10 },
  { id: 'cadre-legende', type: 'cadre', nom: { fr: 'Légende', en: 'Legend' }, prix: 0, couleur: 'conic-gradient(#E3A72F, #A35BE0, #E3574B, #E3A72F)', anim: 'tourne pulse', condition: EXPLOITS.legende },
  { id: 'cadre-brasier', type: 'cadre', nom: { fr: 'Brasier', en: 'Blaze' }, prix: 0, couleur: 'conic-gradient(#FF2E00, #FF9500, #FFE14D, #FF9500, #FF2E00)', anim: 'tourne feu', condition: EXPLOITS.multi10 },
  { id: 'cadre-royal', type: 'cadre', nom: { fr: 'Royal', en: 'Royal' }, prix: 0, couleur: 'conic-gradient(#6D28D9, #F4C430, #6D28D9, #F4C430, #6D28D9)', anim: 'tourne brille', condition: EXPLOITS.multi3 },
  { id: 'cadre-foyer', type: 'cadre', nom: { fr: 'Soirée en famille', en: 'Family night' }, prix: 0, couleur: 'conic-gradient(#F59E0B, #EF4444, #EC4899, #8B5CF6, #F59E0B)', anim: 'tourne pulse', condition: EXPLOITS.tvHote3 },
  { id: 'cadre-neon', type: 'cadre', nom: { fr: 'Néon', en: 'Neon' }, prix: 0, couleur: 'conic-gradient(#FF00E5, #00F0FF, #FF00E5)', anim: 'neon', condition: EXPLOITS.tv5 },
  { id: 'cadre-givre', type: 'cadre', nom: { fr: 'Givre', en: 'Frost' }, prix: 0, couleur: 'conic-gradient(#E0F2FE, #7DD3FC, #FFFFFF, #38BDF8, #E0F2FE)', anim: 'brille glace', condition: EXPLOITS.survie25 },
  { id: 'cadre-foudre', type: 'cadre', nom: { fr: 'Foudre', en: 'Thunder' }, prix: 0, couleur: 'conic-gradient(#FACC15, #1E1B4B, #FACC15, #1E1B4B, #FACC15)', anim: 'eclair', condition: EXPLOITS.express30 },
  { id: 'cadre-lave', type: 'cadre', nom: { fr: 'Magma', en: 'Magma' }, prix: 0, couleur: 'repeating-conic-gradient(#160700 0 14deg, #FF3D00 14deg 18deg, #160700 18deg 31deg, #FFB000 31deg 33deg)', anim: 'tourne', orbite: ['🔥', '🪨', '🔥'], condition: EXPLOITS.duels5 },
  { id: 'cadre-holo', type: 'cadre', nom: { fr: 'Holographique', en: 'Holographic' }, prix: 0, couleur: 'conic-gradient(#F0ABFC, #A5F3FC, #FDE68A, #A7F3D0, #F0ABFC)', anim: 'tourne holo', condition: EXPLOITS.miniJeux },
  { id: 'cadre-galaxie', type: 'cadre', nom: { fr: 'Galaxie', en: 'Galaxy' }, prix: 0, couleur: 'conic-gradient(#0F0C29, #6D28D9, #DB2777, #0F0C29, #2563EB, #0F0C29)', anim: 'tourne etoiles', orbite: ['🪐', '🌍', '🌕'], condition: EXPLOITS.erud2000 },
  { id: 'cadre-pixel', type: 'cadre', nom: { fr: 'Pixel', en: 'Pixel' }, prix: 0, couleur: 'repeating-conic-gradient(#22C55E 0 15deg, #3B82F6 15deg 30deg, #EF4444 30deg 45deg, #FACC15 45deg 60deg)', anim: 'tourne', condition: EXPLOITS.jv },
  { id: 'cadre-seve', type: 'cadre', nom: { fr: 'Sève', en: 'Sap' }, prix: 0, couleur: 'conic-gradient(#14532D, #4ADE80, #A3E635, #14532D)', anim: 'vague', orbite: ['🍃', '🌸', '🍃'], condition: EXPLOITS.nat },

  // Titres : affichés sous le pseudo, tous gagnés
  ...([
    ['curieux', 'Curieux·se', 'Curious', C('10 parties jouées', '10 games played', (p) => (p.parties ?? 0) >= 10)],
    ['assidu', 'Assidu·e', 'Dedicated', EXPLOITS.serie7],
    ['fidele', 'Fidèle au poste', 'Ever present', EXPLOITS.serie30],
    ['erudit', 'Érudit·e', 'Scholar', EXPLOITS.erud500],
    ['savant', 'Savant·e fou·folle', 'Mad scientist', EXPLOITS.erud2000],
    ['encyclopedie', 'Encyclopédie vivante', 'Walking encyclopedia', EXPLOITS.erud5000],
    ['legende', 'Légende', 'Legend', EXPLOITS.legende],
    ['perfectionniste', 'Perfectionniste', 'Perfectionist', EXPLOITS.sansFaute10],
    ['marathonien', 'Marathonien·ne', 'Marathoner', EXPLOITS.marathon],
    ['oiseau', 'Oiseau de nuit', 'Night owl', EXPLOITS.nuit],
    ['machine', 'La Machine', 'The Machine', EXPLOITS.machine],
    ['immortel', 'Immortel·le', 'Immortal', EXPLOITS.immortel],
    ['tueur', 'Tueur·se de boss', 'Boss slayer', EXPLOITS.boss],
    ['eclair', 'Éclair', 'Lightning', EXPLOITS.express30],
    ['star-soiree', 'Star de la soirée', 'Life of the party', EXPLOITS.multi3],
    ['champion', 'Champion·ne des salons', 'Room champion', EXPLOITS.multi10],
    ['animateur', 'Animateur·rice télé', 'TV host', EXPLOITS.tvHote3],
    ['duelliste', 'Duelliste', 'Duelist', EXPLOITS.duels5],
    ['touche-a-tout', 'Touche-à-tout', 'Jack of all trades', EXPLOITS.miniJeux],
    ['globe-trotter', 'Globe-trotter', 'Globetrotter', EXPLOITS.geo],
    ['cinephile', 'Cinéphile', 'Film buff', EXPLOITS.cine],
    ['gamer', 'Gamer légendaire', 'Legendary gamer', EXPLOITS.jv],
    ['naturaliste', 'Naturaliste', 'Naturalist', EXPLOITS.nat],
    ['melomane', 'Mélomane', 'Music lover', EXPLOITS.mus],
    ['gourmet', 'Fin gourmet', 'Gourmet', EXPLOITS.cui],
    ['geek', 'Roi·Reine de la pop culture', 'Pop culture royalty', EXPLOITS.pop],
    ['centurion', 'Centurion', 'Centurion', EXPLOITS.parties100],
    ['riche', 'Picsou', 'Moneybags', EXPLOITS.riche],
  ] as [string, string, string, Objet['condition']][]).map(([id, fr, en, condition], i): Objet => ({ id: `titre-${id}`, type: 'titre', nom: { fr, en }, prix: 0, condition, anim: ['givre', 'braise', 'neon', 'obsidienne', 'aurore', 'lave', 'plasma', 'matrice', 'sakura', 'ocean'][i % 10] })),
  // Pass de saison : palier 10 (titre) et palier 20 (cadre animé)
  { id: 'titre-saison', type: 'titre', nom: { fr: 'De la saison', en: 'Of the season' }, prix: 0, anim: 'plasma', condition: { desc: { fr: 'Pass de saison : palier 10', en: 'Season pass tier 10' }, test: (p) => !!p.possede?.includes('titre-saison') } },
  { id: 'cadre-saison', type: 'cadre', nom: { fr: 'Saison', en: 'Season' }, prix: 0, couleur: 'conic-gradient(#8E8CD8, #6BB8C4, #F29BB0, #8E8CD8)', anim: 'tourne brille', condition: { desc: { fr: 'Pass de saison : palier 20', en: 'Season pass tier 20' }, test: (p) => !!p.possede?.includes('cadre-saison') } },
  // ——— Récompenses de sections : chaque famille dont on ouvre la Légende donne un cadre animé et un titre ———
  ...FAMILLES.flatMap((f): Objet[] => {
    const orb = ({"geo":["🌍","🧭","🗺️"],"cine":["🎬","🍿","⭐"],"mus":["🎵","🎸","🎶"],"nat":["🍃","🦋","🌸"],"sci":["⚛️","🧪","🔭"],"his":["🏛️","👑","📜"],"brd":["🏷️","💎","🛍️"],"spo":["⚽","🏀","🏆"],"lit":["📚","✒️","📖"],"jv":["🎮","👾","🕹️"],"ani":["⭐","🍥","🗡️"],"vie":["🏠","🚗","🧀"],"mot":["🔤","💬","📝"],"tec":["💻","📱","⚡"],"esp":["🪐","🚀","🌙"],"cui":["🍳","🥐","🍝"],"pop":["📺","🎤","✨"]} as Record<string, string[]>)[f.k] ?? ['✨', '⭐', '✨']
    const titre = ({"geo":"Globe-trotteur","cine":"Cinéphile absolu","mus":"Oreille d’or","nat":"Âme de la nature","sci":"Génie","his":"Mémoire vivante","brd":"Marketeur","spo":"Champion·ne","lit":"Rat de bibliothèque","jv":"Pro gamer","ani":"Otaku","vie":"Débrouillard·e","mot":"Maître des mots","tec":"Hacker","esp":"Astronaute","cui":"Chef étoilé","pop":"Star de la pop culture"} as Record<string, string>)[f.k] ?? `Maître : ${f.nom.fr}`
    const cond = { desc: { fr: `Ouvrir la Légende : ${f.nom.fr}`, en: `Unlock the Legend: ${f.nom.en}` }, test: (p: Profile) => legendeOuverte(f.k, p) }
    return [
      { id: `cadre-maitre-${f.k}`, type: 'cadre', nom: { fr: `Maître · ${f.nom.fr}`, en: `Master · ${f.nom.en}` }, prix: 0, couleur: `conic-gradient(var(--${f.k}), #FFE08A, var(--${f.k}-i), var(--${f.k}))`, anim: 'tourne brille', orbite: orb, condition: cond },
      { id: `titre-maitre-${f.k}`, type: 'titre', nom: { fr: titre, en: titre }, prix: 0, condition: cond, anim: 'diamant' },
    ]
  }),
  // ——— Mode histoire terminé ———
  { id: 'cadre-tour-du-monde', type: 'cadre', nom: { fr: 'Tour du monde', en: 'World tour' }, prix: 0, couleur: 'conic-gradient(#4FAE6A, #3A86C8, #E3A72F, #8E4FC4, #4FAE6A)', anim: 'tourne holo', orbite: ['🌍', '✈️', '🗺️'], condition: { desc: { fr: 'Finir les 8 premiers mondes du mode histoire', en: 'Finish the first 8 story worlds' }, test: (p: Profile) => (p.aventure ?? 0) >= 64, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 64), 64] } },
  { id: 'cadre-mi-parcours', type: 'cadre', nom: { fr: 'Voyageur', en: 'Traveller' }, prix: 0, couleur: 'conic-gradient(#3A86C8, #8ED3F0, #3A86C8)', anim: 'vague', orbite: ['🧭', '🎒'], condition: { desc: { fr: 'Atteindre le 4ᵉ monde du mode histoire', en: 'Reach story world 4' }, test: (p: Profile) => (p.aventure ?? 0) >= 24, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 24), 24] } },
  { id: 'titre-tour-du-monde', type: 'titre', nom: { fr: 'Aventurier·ère du monde', en: 'World adventurer' }, prix: 0, anim: 'aurore', condition: { desc: { fr: 'Finir les 8 premiers mondes du mode histoire', en: 'Finish the first 8 story worlds' }, test: (p: Profile) => (p.aventure ?? 0) >= 64, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 64), 64] } },
  { id: 'cadre-legendes-histoire', type: 'cadre', nom: { fr: 'Dragon légendaire', en: 'Legendary dragon' }, prix: 0, couleur: 'conic-gradient(#7F1D1D, #F59E0B, #FDE047, #F59E0B, #7F1D1D)', anim: 'tourne holo', orbite: ['🐉', '🔥', '👑'], condition: { desc: { fr: 'Vaincre le boss ultime du mode histoire (104 étapes)', en: 'Beat the ultimate story boss' }, test: (p: Profile) => (p.aventure ?? 0) >= 104, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 104), 104] } },
  { id: 'titre-legende-histoire', type: 'titre', nom: { fr: 'Légende vivante', en: 'Living legend' }, prix: 0, anim: 'royal', condition: { desc: { fr: 'Vaincre le boss ultime du mode histoire', en: 'Beat the ultimate story boss' }, test: (p: Profile) => (p.aventure ?? 0) >= 104, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 104), 104] } },
  { id: 'cadre-arcade', type: 'cadre', nom: { fr: 'Pixel', en: 'Pixel' }, prix: 0, couleur: 'conic-gradient(#22C55E, #3B82F6, #EF4444, #22C55E)', anim: 'tourne', orbite: ['🕹️', '👾', '🎮'], condition: { desc: { fr: 'Finir l’arcade infinie (monde 9 du mode histoire)', en: 'Finish story world 9' }, test: (p: Profile) => (p.aventure ?? 0) >= 72, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 72), 72] } },
  { id: 'titre-premier-boss', type: 'titre', nom: { fr: 'Tueur de boss', en: 'Boss slayer' }, prix: 0, condition: { desc: { fr: 'Battre le premier boss du mode histoire', en: 'Beat the first story boss' }, test: (p: Profile) => (p.aventure ?? 0) >= 8, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 8), 8] } },
  { id: 'perso-astronaute-or', type: 'avatar', nom: { fr: 'Explorateur·rice doré·e', en: 'Golden explorer' }, prix: 0, perso: 'astronaute', categorie: 'metier', condition: { desc: { fr: 'Finir le mode histoire', en: 'Finish story mode' }, test: (p: Profile) => (p.aventure ?? 0) >= 64, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 64), 64] } },
  { id: 'avatar-boss', type: 'avatar', nom: { fr: 'Boss', en: 'Boss' }, prix: 0, emoji: '👑', categorie: 'fun', condition: { desc: { fr: 'Battre 4 boss du mode histoire', en: 'Beat 4 story bosses' }, test: (p: Profile) => (p.aventure ?? 0) >= 32, avance: (p: Profile): [number, number] => [Math.min(p.aventure ?? 0, 32), 32] } },
  // ——— Événements (Halloween, Noël…) : cadre dès la 1ʳᵉ partie pendant l'événement, avatar et titre à la 5ᵉ ———
  ...EVENEMENTS.flatMap((e): Objet[] => {
    const a = (txt: string) => (p: Profile) => !!p.possede?.includes(txt)
    const quand = `${e.debut.split('-').reverse().join('/')} – ${e.fin.split('-').reverse().join('/')}`
    return [
      { id: e.cadre.id, type: 'cadre', nom: e.cadre.nom, prix: 0, couleur: e.cadre.couleur, anim: e.cadre.anim, orbite: e.cadre.orbite, evenement: e.id, condition: { desc: { fr: `${e.emoji} ${e.nom.fr} (${quand}) : jouer 1 partie`, en: `${e.emoji} ${e.nom.en}: play 1 game` }, test: a(e.cadre.id) } },
      { id: e.avatar.id, type: 'avatar', nom: e.avatar.nom, prix: 0, emoji: e.avatar.emoji, categorie: 'fun', evenement: e.id, condition: { desc: { fr: `${e.emoji} ${e.nom.fr} (${quand}) : 5 parties`, en: `${e.emoji} ${e.nom.en}: 5 games` }, test: a(e.avatar.id) } },
      { id: e.titre.id, type: 'titre', nom: e.titre.nom, prix: 0, evenement: e.id, condition: { desc: { fr: `${e.emoji} ${e.nom.fr} (${quand}) : 5 parties`, en: `${e.emoji} ${e.nom.en}: 5 games` }, test: a(e.titre.id) } },
    ]
  }),
  // ——— Saisons du passe de combat (une par mois) : avatar au palier 5, titre au 10, cadre animé au 20 ———
  ...SAISONS.flatMap((s): Objet[] => {
    const a = (txt: string) => (p: Profile) => !!p.possede?.includes(txt)
    const c = (n: number) => ({ desc: { fr: `${s.emoji} ${s.nom.fr} : passe de combat, palier ${n}`, en: `${s.emoji} ${s.nom.en}: battle pass tier ${n}` } })
    return [
      { id: `avatar-s-${s.id}`, type: 'avatar', nom: { fr: s.nom.fr.replace('Saison ', '').replace(/^(du|des|de la|de l’) /, ''), en: s.nom.en }, prix: 0, emoji: s.avatar, categorie: 'fun', saison: s.id, condition: { ...c(5), test: a(`avatar-s-${s.id}`) } },
      { id: `titre-s-${s.id}`, type: 'titre', nom: s.titre, prix: 0, saison: s.id, condition: { ...c(10), test: a(`titre-s-${s.id}`) } },
      { id: `cadre-s-${s.id}`, type: 'cadre', nom: s.nom, prix: 0, couleur: s.cadre.couleur, anim: s.cadre.anim, orbite: s.cadre.orbite, saison: s.id, condition: { ...c(20), test: a(`cadre-s-${s.id}`) } },
    ]
  }),
  // ——— Fonds de vitrine animés et styles de pseudo (achetables ; un fond par saison au palier 15) ———
  ...EFFETS_BOUTIQUE.map((e): Objet => ({ id: e.id, type: 'effet', sorte: e.sorte, nom: e.nom, prix: e.prix, emoji: e.emoji, luxe: e.luxe })),
  // ——— Album : récompenses exclusives, plus la collection est grande, plus c'est beau ———
  { id: 'titre-al-curieux', type: 'titre', nom: { fr: 'Curieux·se', en: 'Curious' }, prix: 0, album: true, anim: 'givre', condition: CONDITIONS_ALBUM.c50 },
  { id: 'titre-al-relieur', type: 'titre', nom: { fr: 'Relieur·se', en: 'Bookbinder' }, prix: 0, album: true, anim: 'sakura', condition: CONDITIONS_ALBUM.p5 },
  { id: 'cadre-al-cuir', type: 'cadre', nom: { fr: 'Reliure de cuir', en: 'Leather binding' }, prix: 0, album: true, couleur: 'repeating-conic-gradient(#78350F 0 10deg, #A16207 10deg 20deg)', anim: 'reflet', condition: CONDITIONS_ALBUM.c150 },
  { id: 'titre-al-complet', type: 'titre', nom: { fr: 'Album complet', en: 'Full album' }, prix: 0, album: true, anim: 'or', condition: CONDITIONS_ALBUM.a1 },
  { id: 'cadre-al-marque-page', type: 'cadre', nom: { fr: 'Marque-page', en: 'Bookmark' }, prix: 0, album: true, luxe: 1, couleur: 'conic-gradient(#B91C1C, #FDE68A, #B91C1C)', anim: 'sceau', condition: CONDITIONS_ALBUM.p20 },
  { id: 'titre-al-archiviste', type: 'titre', nom: { fr: 'Archiviste', en: 'Archivist' }, prix: 0, album: true, luxe: 1, anim: 'diamant', condition: CONDITIONS_ALBUM.c600 },
  { id: 'cadre-al-grimoire', type: 'cadre', nom: { fr: 'Grimoire doré', en: 'Golden grimoire' }, prix: 0, album: true, luxe: 1, couleur: 'linear-gradient(135deg, #451A03, #F59E0B, #FEF3C7, #B45309, #451A03)', anim: 'tourne reflet etincelles', condition: CONDITIONS_ALBUM.c1000 },
  { id: 'cadre-al-encyclo', type: 'cadre', nom: { fr: 'Encyclopédie vivante', en: 'Living encyclopedia' }, prix: 0, album: true, luxe: 2, couleur: 'conic-gradient(#1E1B4B, #A78BFA, #FDE68A, #22D3EE, #1E1B4B)', anim: 'tourne eclipse aura', condition: CONDITIONS_ALBUM.a3 },
  { id: 'titre-al-bibliothecaire', type: 'titre', nom: { fr: 'Grand·e bibliothécaire', en: 'Grand librarian' }, prix: 0, album: true, luxe: 2, anim: 'royal', condition: CONDITIONS_ALBUM.p50 },
  ...FONDS_ANIMES.map((f): Objet => f.album
    ? { id: f.id, type: 'fond', nom: f.nom, prix: 0, luxe: f.luxe, album: true, condition: CONDITIONS_ALBUM[f.album] }
    : f.rang
    ? { id: f.id, type: 'fond', nom: f.nom, prix: 0, luxe: f.luxe, condition: { desc: { fr: `Finir 3 semaines au rang ${TOUS_RANGS.find((r) => r.id === f.rang)?.nom.fr} (ou plus haut)`, en: 'Finish 3 weeks at this rank' }, test: (p) => !!p.possede?.includes(f.id) } }
    : f.saison
    ? { id: f.id, type: 'fond', nom: f.nom, prix: 0, saison: f.saison, condition: { desc: { fr: `${SAISONS.find((s) => s.id === f.saison)?.emoji} ${f.nom.fr} : passe de combat, palier 15`, en: `${f.nom.en}: battle pass tier 15` }, test: (p) => !!p.possede?.includes(f.id) } }
    : { id: f.id, type: 'fond', nom: f.nom, prix: f.prix, luxe: f.luxe, ...(f.jetons ? { jetons: f.jetons } : {}) }),
  ...STYLES_PSEUDO.map((s): Objet => ({ id: s.id, type: 'pseudo', nom: s.nom, prix: s.prix, luxe: s.luxe, ...(s.jetons ? { jetons: s.jetons } : {}), ...(s.rang ? { condition: { desc: { fr: `Finir une semaine au rang ${TOUS_RANGS.find((r) => r.id === s.rang)?.nom.fr} (ou plus haut)`, en: 'Finish a week at this rank' }, test: (p: Profile) => !!p.possede?.includes(s.id) } } : {}) })),
  // ——— Rangs : un cadre par rang (finir une semaine dedans), un titre (finir 3 semaines) ———
  ...TOUS_RANGS.flatMap((r, i): Objet[] => [
    { id: `cadre-rang-${r.id}`, type: 'cadre', nom: { fr: `Cadre ${r.nom.fr}`, en: `${r.nom.en} frame` }, prix: 0, couleur: r.id === 'legende' ? 'conic-gradient(#F4C430, #F472B6, #A78BFA, #22D3EE, #F4C430)' : `conic-gradient(${r.couleur}, ${r.fonce}, ${r.couleur}, #fff, ${r.couleur})`, anim: i >= 6 ? 'tourne brille' : i >= 3 ? 'tourne' : 'brille', orbite: i >= 2 ? [r.emoji, '✨', r.emoji] : undefined, luxe: r.id === 'legende' ? 2 : undefined, condition: { desc: { fr: `Finir une semaine au rang ${r.nom.fr} (ou plus haut)`, en: `Finish a week at ${r.nom.en}` }, test: (p: Profile) => !!p.possede?.includes(`cadre-rang-${r.id}`) } },
    { id: `titre-rang-${r.id}`, type: 'titre', nom: { fr: `${r.emoji} ${r.id === 'legende' ? 'Légende éternelle' : `Habitué·e ${r.nom.fr}`}`, en: `${r.emoji} ${r.nom.en} regular` }, prix: 0, anim: r.id === 'legende' ? 'royal holo' : i >= 6 ? 'royal' : i >= 4 ? 'diamant' : i >= 2 ? 'or' : 'givre', condition: { desc: { fr: `Finir 3 semaines au rang ${r.nom.fr} (ou plus haut)`, en: `Finish 3 weeks at ${r.nom.en}` }, test: (p: Profile) => !!p.possede?.includes(`titre-rang-${r.id}`) } },
  ]),
  // ——— Boutique des rangs : cosmétiques exclusifs, payés en jetons de rang ———
  { id: 'cadre-j-laurier', type: 'cadre', nom: { fr: 'Lauriers d’or', en: 'Golden laurels' }, prix: 0, jetons: 20, couleur: 'conic-gradient(#B8862E, #FDE68A, #4D7C0F, #FDE68A, #B8862E)' },
  { id: 'cadre-j-trophee', type: 'cadre', nom: { fr: 'Trophée', en: 'Trophy' }, prix: 0, jetons: 40, couleur: 'conic-gradient(#F4C430, #FFF7D6, #B45309, #FFF7D6, #F4C430)' },
  { id: 'cadre-j-arene', type: 'cadre', nom: { fr: 'Arène', en: 'Arena' }, prix: 0, jetons: 70, couleur: 'conic-gradient(#7F1D1D, #F97316, #111827, #F97316, #7F1D1D)' },
  { id: 'cadre-j-cristal', type: 'cadre', nom: { fr: 'Cristal', en: 'Crystal' }, prix: 0, jetons: 110, couleur: 'conic-gradient(#E0F2FE, #A5B4FC, #FFFFFF, #67E8F9, #E0F2FE)' },
  { id: 'cadre-j-eclipse', type: 'cadre', nom: { fr: 'Éclipse', en: 'Eclipse' }, prix: 0, jetons: 160, couleur: 'conic-gradient(#020617, #F59E0B, #020617, #FDE68A, #020617)' },
  { id: 'cadre-j-supernova', type: 'cadre', nom: { fr: 'Supernova', en: 'Supernova' }, prix: 0, jetons: 300, luxe: 2, couleur: 'conic-gradient(#F472B6, #FDE047, #22D3EE, #A78BFA, #F472B6)' },
  ...([
    ['champion', '🏆', 'Champion·ne', 'Champion', 25, 'fun', 'linear-gradient(160deg, #B45309, #FDE047)'],
    ['gladiateur', '🛡️', 'Gladiateur·rice', 'Gladiator', 50, 'metier', 'linear-gradient(160deg, #7F1D1D, #F97316)'],
    ['genie', '🧞', 'Génie', 'Genie', 90, 'metier', 'linear-gradient(160deg, #1E3A8A, #22D3EE)'],
    ['aigle', '🦅', 'Aigle royal', 'Royal eagle', 130, 'animal', 'linear-gradient(160deg, #78350F, #FDE68A)'],
    ['souverain', '🫅', 'Souverain·e', 'Sovereign', 200, 'metier', 'conic-gradient(#7C3AED, #F4C430, #7C3AED, #F4C430, #7C3AED)'],
  ] as const).map(([id, emoji, fr, en, jetons, categorie, fondAvatar]): Objet => ({ id: 'avatar-j-' + id, type: 'avatar', categorie, nom: { fr, en }, prix: 0, jetons, emoji, fondAvatar, luxe: jetons >= 200 ? 2 : 1 })),
  { id: 'titre-j-competiteur', type: 'titre', nom: { fr: '🎖️ Compétiteur·rice', en: '🎖️ Competitor' }, prix: 0, jetons: 15 },
  { id: 'titre-j-acharne', type: 'titre', nom: { fr: '🎖️ Acharné·e du classé', en: '🎖️ Ranked grinder' }, prix: 0, jetons: 40 },
  { id: 'titre-j-gladiateur', type: 'titre', nom: { fr: '⚔️ Gladiateur·rice', en: '⚔️ Gladiator' }, prix: 0, jetons: 80 },
  { id: 'titre-j-intouchable', type: 'titre', nom: { fr: '💎 Intouchable', en: '💎 Untouchable' }, prix: 0, jetons: 150 },
  { id: 'titre-j-immortel', type: 'titre', nom: { fr: '👑 Immortel·le', en: '👑 Immortal' }, prix: 0, jetons: 300, luxe: 2, anim: 'cosmos' },
  { id: 'titre-mecene', type: 'titre', nom: { fr: 'Mécène', en: 'Patron' }, prix: 3000, luxe: 1, anim: 'or' },
  { id: 'titre-milliardaire', type: 'titre', nom: { fr: 'Milliardaire du savoir', en: 'Knowledge billionaire' }, prix: 10000, luxe: 1, anim: 'or' },
  { id: 'titre-empereur', type: 'titre', nom: { fr: '👑 Empereur·rice de Croivez', en: '👑 Emperor of Croivez' }, prix: 30000, luxe: 2, anim: 'holo' },
  { id: 'titre-lx-aurore', type: 'titre', nom: { fr: 'Enfant des étoiles', en: 'Star child' }, prix: 2000, luxe: 1, anim: 'aurore' },
  { id: 'titre-lx-lave', type: 'titre', nom: { fr: 'Cœur de volcan', en: 'Volcano heart' }, prix: 2500, luxe: 1, anim: 'lave' },
  { id: 'titre-lx-sakura', type: 'titre', nom: { fr: 'Fleur de cerisier', en: 'Cherry blossom' }, prix: 2000, luxe: 1, anim: 'sakura' },
  { id: 'titre-lx-ocean', type: 'titre', nom: { fr: 'Esprit des abysses', en: 'Spirit of the deep' }, prix: 2500, luxe: 1, anim: 'ocean' },
  { id: 'titre-lx-matrice', type: 'titre', nom: { fr: 'Hackeur·se de génie', en: 'Genius hacker' }, prix: 4000, luxe: 1, anim: 'matrice' },
  { id: 'titre-lx-plasma', type: 'titre', nom: { fr: 'Cerveau en fusion', en: 'Molten brain' }, prix: 6000, luxe: 1, anim: 'plasma' },
  { id: 'titre-lx-diamant', type: 'titre', nom: { fr: 'Esprit de diamant', en: 'Diamond mind' }, prix: 12000, luxe: 2, anim: 'diamant' },
  { id: 'titre-lx-royal', type: 'titre', nom: { fr: 'Majesté du quiz', en: 'Quiz majesty' }, prix: 25000, luxe: 2, anim: 'royal' },
  { id: 'titre-lx-cosmique', type: 'titre', nom: { fr: 'Conscience cosmique', en: 'Cosmic mind' }, prix: 75000, luxe: 2, anim: 'cosmos aurore' },
  { id: 'titre-lx-neon', type: 'titre', nom: { fr: 'Icône de la nuit', en: 'Night icon' }, prix: 2500, luxe: 1, anim: 'neon' },
  { id: 'titre-lx-braise', type: 'titre', nom: { fr: 'Esprit de feu', en: 'Fire spirit' }, prix: 3000, luxe: 1, anim: 'braise' },
  { id: 'titre-lx-glitch', type: 'titre', nom: { fr: 'Bug dans la matrice', en: 'Glitch in the matrix' }, prix: 3500, luxe: 1, anim: 'glitch' },
  { id: 'titre-lx-givre', type: 'titre', nom: { fr: 'Cœur de glace', en: 'Heart of ice' }, prix: 3000, luxe: 1, anim: 'givre' },
  { id: 'titre-lx-obsidienne', type: 'titre', nom: { fr: 'Ombre savante', en: 'Learned shadow' }, prix: 5000, luxe: 1, anim: 'obsidienne' },
  { id: 'titre-lx-oracle', type: 'titre', nom: { fr: 'Oracle', en: 'Oracle' }, prix: 8000, luxe: 1, anim: 'cosmos' },
  { id: 'titre-lx-encyclopedie', type: 'titre', nom: { fr: 'Encyclopédie vivante', en: 'Living encyclopedia' }, prix: 15000, luxe: 2, anim: 'holo' },
  { id: 'titre-lx-divin', type: 'titre', nom: { fr: 'Savoir absolu', en: 'Absolute knowledge' }, prix: 50000, luxe: 2, anim: 'or holo' },
  { id: 'cadre-rare-saison', type: 'cadre', nom: { fr: 'Étoile filante', en: 'Shooting star' }, prix: 1200, couleur: 'conic-gradient(#0F172A, #1E3A8A, #0F172A)', anim: 'tourne etoiles', orbite: ['☄️', '⭐', '✨'] },
  // ——— Cadres à motifs et couleurs vivantes ———
  { id: 'cadre-rayures-neon', type: 'cadre', nom: { fr: 'Rayures néon', en: 'Neon stripes' }, prix: 350, couleur: 'repeating-conic-gradient(#FF00E5 0 15deg, #00F0FF 15deg 30deg)', anim: 'tourne teinte' },
  { id: 'cadre-pois', type: 'cadre', nom: { fr: 'Pois pop', en: 'Pop dots' }, prix: 250, couleur: 'radial-gradient(circle, #fff 0 22%, transparent 24%) 0 0 / 9px 9px, linear-gradient(135deg, #F97316, #EC4899)', anim: 'teinte' },
  { id: 'cadre-damier', type: 'cadre', nom: { fr: 'Damier', en: 'Checkers' }, prix: 300, couleur: 'repeating-conic-gradient(#111 0 25%, #FACC15 0 50%) 0 0 / 10px 10px', anim: 'tourne' },
  { id: 'cadre-zigzag', type: 'cadre', nom: { fr: 'Zigzag', en: 'Zigzag' }, prix: 320, couleur: 'repeating-conic-gradient(from 0deg, #22C55E 0 10deg, #0EA5E9 10deg 20deg, #A855F7 20deg 30deg)', anim: 'tourne teinte' },
  { id: 'cadre-prisme', type: 'cadre', nom: { fr: 'Prisme', en: 'Prism' }, prix: 900, couleur: 'conic-gradient(#FF0080, #FF8C00, #FFE600, #00FF85, #00C2FF, #7A00FF, #FF0080)', anim: 'tourne teinte scintille', orbite: ['🔺', '🔷', '🟣'] },
  { id: 'cadre-lave-froide', type: 'cadre', nom: { fr: 'Glace bleue', en: 'Blue ice' }, prix: 450, couleur: 'repeating-conic-gradient(#0C4A6E 0 14deg, #7DD3FC 14deg 17deg, #E0F2FE 17deg 20deg)', anim: 'tourne', orbite: ['❄️', '💎'] },
  { id: 'cadre-sakura', type: 'cadre', nom: { fr: 'Sakura', en: 'Sakura' }, prix: 650, couleur: 'conic-gradient(#FBCFE8, #F472B6, #FDF2F8, #F9A8D4, #FBCFE8)', anim: 'tourne', orbite: ['🌸', '🌸', '🌸'] },
  { id: 'cadre-ocean-vif', type: 'cadre', nom: { fr: 'Lagon', en: 'Lagoon' }, prix: 550, couleur: 'conic-gradient(#06B6D4, #14B8A6, #3B82F6, #06B6D4)', anim: 'vague teinte', orbite: ['🐠', '🫧', '🐚'] },
  { id: 'cadre-retro', type: 'cadre', nom: { fr: 'Rétro 80', en: 'Retro 80s' }, prix: 700, couleur: 'linear-gradient(180deg, #F97316 0 20%, #EC4899 20% 40%, #A855F7 40% 60%, #3B82F6 60% 80%, #111827 80%)', anim: 'teinte', orbite: ['📼', '🕹️'] },
  { id: 'cadre-nebuleuse', type: 'cadre', nom: { fr: 'Nébuleuse', en: 'Nebula' }, prix: 1100, couleur: 'conic-gradient(#1E1B4B, #DB2777, #7C3AED, #0EA5E9, #1E1B4B)', anim: 'tourne teinte etoiles', orbite: ['✨', '🌌', '⭐'] },
  { id: 'cadre-jungle', type: 'cadre', nom: { fr: 'Jungle', en: 'Jungle' }, prix: 600, couleur: 'repeating-conic-gradient(#14532D 0 12deg, #4ADE80 12deg 18deg, #A3E635 18deg 22deg)', anim: 'tourne', orbite: ['🦜', '🌴', '🐒'] },
  { id: 'cadre-cristal', type: 'cadre', nom: { fr: 'Cristal', en: 'Crystal' }, prix: 1300, couleur: 'conic-gradient(#F0ABFC, #FFFFFF, #A5F3FC, #FFFFFF, #FDE68A, #FFFFFF, #F0ABFC)', anim: 'tourne brille teinte', orbite: ['💎', '✨', '💠'] },
  // ——— Cadres de luxe : effets de lumière et de géométrie dessinés (aucun émoji) ———
  { id: 'cadre-lx-aura', type: 'cadre', nom: { fr: 'Aura mystique', en: 'Mystic aura' }, prix: 2500, luxe: 1, couleur: 'conic-gradient(#7C3AED, #EC4899, #22D3EE, #7C3AED)', anim: 'tourne aura' },
  { id: 'cadre-lx-radar', type: 'cadre', nom: { fr: 'Radar', en: 'Radar' }, prix: 2200, luxe: 1, couleur: 'radial-gradient(circle, #052E16, #14532D)', anim: 'scanner' },
  { id: 'cadre-lx-pulsar', type: 'cadre', nom: { fr: 'Pulsar', en: 'Pulsar' }, prix: 3000, luxe: 1, couleur: 'conic-gradient(#0EA5E9, #6366F1, #0EA5E9)', anim: 'pulsar' },
  { id: 'cadre-lx-or-liquide', type: 'cadre', nom: { fr: 'Or liquide', en: 'Liquid gold' }, prix: 4000, luxe: 1, couleur: 'linear-gradient(135deg, #78350F, #F59E0B, #FEF3C7, #D97706, #78350F)', anim: 'reflet' },
  { id: 'cadre-lx-sceau', type: 'cadre', nom: { fr: 'Sceau ancien', en: 'Ancient seal' }, prix: 3500, luxe: 1, couleur: 'conic-gradient(#451A03, #B45309, #FDE68A, #B45309, #451A03)', anim: 'sceau' },
  { id: 'cadre-lx-atome', type: 'cadre', nom: { fr: 'Atome', en: 'Atom' }, prix: 4500, luxe: 1, couleur: 'conic-gradient(#0F172A, #22D3EE, #0F172A)', anim: 'satellites' },
  { id: 'cadre-lx-engrenage', type: 'cadre', nom: { fr: 'Mécanique', en: 'Clockwork' }, prix: 3200, luxe: 1, couleur: 'repeating-conic-gradient(#334155 0 8deg, #94A3B8 8deg 16deg)', anim: 'contresens' },
  { id: 'cadre-lx-feu-artifice', type: 'cadre', nom: { fr: 'Feu d’artifice', en: 'Fireworks' }, prix: 5000, luxe: 1, couleur: 'conic-gradient(#1E1B4B, #DB2777, #FACC15, #1E1B4B)', anim: 'tourne etincelles' },
  { id: 'cadre-lx-eclipse', type: 'cadre', nom: { fr: 'Éclipse', en: 'Eclipse' }, prix: 18000, luxe: 2, couleur: 'radial-gradient(circle, #000 60%, #1C1917)', anim: 'eclipse aura' },
  { id: 'cadre-lx-singularite', type: 'cadre', nom: { fr: 'Singularité', en: 'Singularity' }, prix: 40000, luxe: 2, couleur: 'conic-gradient(#000, #7C3AED, #22D3EE, #F472B6, #000)', anim: 'tourne teinte aura pulsar satellites' },
  { id: 'cadre-coeurs', type: 'cadre', nom: { fr: 'Cœurs', en: 'Hearts' }, prix: 600, couleur: 'conic-gradient(#F472B6, #FB7185, #F472B6)', anim: 'pulse', orbite: ['💖', '💕', '💗'] },
  { id: 'cadre-musique', type: 'cadre', nom: { fr: 'Mélodie', en: 'Melody' }, prix: 700, couleur: 'conic-gradient(#6D28D9, #DB2777, #6D28D9)', anim: 'tourne', orbite: ['🎵', '🎶', '🎵'] },
  { id: 'cadre-hiver', type: 'cadre', nom: { fr: 'Hiver', en: 'Winter' }, prix: 700, couleur: 'conic-gradient(#E0F2FE, #93C5FD, #E0F2FE)', anim: 'brille glace', orbite: ['❄️', '⛄', '❄️'] },
]
// ——— Refonte des cadres : chacun a ses effets (ondes, rayons, comète, étincelles, flammes…).
// L'orbite d'emojis n'est gardée que pour les cadres de l'espace, où des planètes qui tournent ont du sens.
const ORBITE_GARDEE = new Set(['cadre-galaxie', 'cadre-cosmos'])
const EFFETS: Record<string, string> = {
  'cadre-bronze': 'brille', 'cadre-argent': 'brille scintille', 'cadre-or': 'brille rayons', 'cadre-bonbon': 'tourne pointilles', 'cadre-ocean': 'vague ondes bulles',
  'cadre-arcenciel': 'tourne arcenciel', 'cadre-aurore': 'vague arcenciel double', 'cadre-flamme': 'pulse flamme', 'cadre-erudit': 'tourne comete', 'cadre-perfection': 'brille scintille ondes',
  'cadre-medailles': 'brille rayons scintille', 'cadre-legende': 'tourne double comete', 'cadre-brasier': 'tourne feu flamme', 'cadre-royal': 'brille double rayons', 'cadre-foyer': 'tourne ondes',
  'cadre-neon': 'neon pointilles', 'cadre-givre': 'brille glace scintille', 'cadre-foudre': 'eclair glitch', 'cadre-lave': 'tourne flamme bulles', 'cadre-holo': 'holo arcenciel comete',
  'cadre-galaxie': 'tourne etoiles anneau', 'cadre-pixel': 'pixel', 'cadre-seve': 'vague bulles', 'cadre-tour-du-monde': 'tourne holo anneau', 'cadre-mi-parcours': 'vague pointilles',
  'cadre-legendes-histoire': 'tourne flamme double rayons', 'cadre-arcade': 'pixel glitch', 'cadre-diamant': 'brille scintille rayons', 'cadre-tresor': 'tourne brille rayons scintille',
  'cadre-cosmos': 'tourne holo ultra anneau etoiles', 'cadre-rare-saison': 'tourne etoiles comete', 'cadre-coeurs': 'battement ondes', 'cadre-musique': 'tourne ondes pointilles', 'cadre-hiver': 'brille glace scintille',
  // Événements
  'cadre-nouvel-an': 'eclair scintille rayons', 'cadre-saint-valentin': 'battement ondes', 'cadre-paques': 'holo pointilles', 'cadre-fete-musique': 'neon ondes', 'cadre-ete': 'rayons vague',
  'cadre-rentree': 'tourne pointilles', 'cadre-halloween': 'flamme glitch', 'cadre-noel': 'brille scintille double',
  // Saisons du passe de combat
  'cadre-s-givre': 'glace scintille', 'cadre-s-amour': 'battement ondes', 'cadre-s-eveil': 'vague bulles', 'cadre-s-chocolat': 'tourne pointilles', 'cadre-s-floraison': 'tourne scintille',
  'cadre-s-musique': 'neon ondes', 'cadre-s-soleil': 'rayons feu', 'cadre-s-ocean': 'vague ondes bulles', 'cadre-s-rentree': 'pointilles comete', 'cadre-s-halloween': 'flamme ondes',
  'cadre-s-automne': 'vague comete', 'cadre-s-noel': 'brille scintille double',
  // Rangs : de plus en plus spectaculaires
  'cadre-rang-bronze': 'brille', 'cadre-rang-argent': 'brille scintille', 'cadre-rang-or': 'brille rayons', 'cadre-rang-platine': 'tourne comete', 'cadre-rang-emeraude': 'tourne bulles ondes',
  'cadre-rang-saphir': 'vague ondes double', 'cadre-rang-rubis': 'battement double flamme', 'cadre-rang-diamant': 'brille scintille rayons comete', 'cadre-rang-maitre': 'tourne double comete ondes',
  'cadre-rang-legende': 'holo arcenciel ultra rayons scintille',
  // Boutique des rangs
  'cadre-j-laurier': 'brille scintille', 'cadre-j-trophee': 'brille rayons', 'cadre-j-arene': 'tourne flamme', 'cadre-j-cristal': 'brille glace double scintille',
  'cadre-j-eclipse': 'tourne comete rayons', 'cadre-j-supernova': 'holo arcenciel ultra rayons ondes',
}
for (const o of BOUTIQUE) {
  if (o.type !== 'cadre') continue
  const fx = EFFETS[o.id] ?? (o.id.startsWith('cadre-maitre-') ? 'tourne comete' : undefined)
  if (fx) o.anim = fx
  if (!ORBITE_GARDEE.has(o.id)) delete o.orbite
}

export const possede = (p: Profile | null | undefined, o: Objet) => (o.condition ? !!p && o.condition.test(p) : (o.prix === 0 && !o.jetons) || !!p?.possede?.includes(o.id))

export async function acheterObjet(uid: string, o: Objet) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', uid)
    const d = (await tx.get(ref)).data() ?? {}
    // Boutique des rangs : on paie en jetons ; sinon en pièces
    const [champ, cout] = o.jetons ? ['jetons', o.jetons] : ['pieces', o.prix]
    if (((d[champ] as number | undefined) ?? 0) < cout) return false
    tx.update(ref, { [champ]: increment(-cout), possede: arrayUnion(o.id) })
    return true
  })
}
export async function equiper(uid: string, o: Objet) {
  const champ = { [o.type === 'effet' && o.sorte ? CHAMP_EFFET[o.sorte] : o.type === 'fond' ? 'vitrineFond' : o.type === 'pseudo' ? 'pseudoStyle' : o.type]: o.id }
  await Promise.all([
    setDoc(doc(db, 'users', uid), champ, { merge: true }),
    setDoc(doc(db, 'profils', uid), champ, { merge: true }),
    setDoc(doc(db, 'semaines', semaine(), 'scores', uid), champ, { merge: true }),
  ])
}
