import { arrayUnion, doc, increment, runTransaction, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Lang } from './i18n'
import { niveau, type Profile } from './auth'
import { BADGES, palierAtteint } from './badges'
import { legendeOuverte } from './progression'
import { FAMILLES, type Famille } from './themes'
import { erudition, semaine } from './social'
import { ANIMAUX } from './components/Animal'

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
  id: string; type: 'avatar' | 'cadre' | 'titre'; nom: Record<Lang, string>; prix: number
  categorie?: 'metier' | 'animal' | 'fun' | 'famille'
  k?: Famille; couleur?: string; perso?: string; animal?: string; emoji?: string; anim?: string
  orbite?: string[] // petits éléments qui tournent autour de l'avatar (planètes, notes, feuilles…)
  condition?: { desc: Record<Lang, string>; test: (p: Profile) => boolean }
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

// Conditions réutilisées par les avatars, cadres et titres
const EXPLOITS = {
  multi3: C('Gagner 3 parties en salon', 'Win 3 room games', (p) => st(p, 'victoiresMulti') >= 3),
  multi10: C('Gagner 10 parties en salon', 'Win 10 room games', (p) => st(p, 'victoiresMulti') >= 10),
  salons10: C('Jouer 10 parties en salon', 'Play 10 room games', (p) => st(p, 'salons') >= 10),
  tv5: C('Jouer 5 parties en mode télé', 'Play 5 TV games', (p) => st(p, 'tv') >= 5),
  tvHote3: C('Lancer 3 soirées en mode télé', 'Host 3 TV nights', (p) => st(p, 'tvHote') >= 3),
  duels5: C('Gagner 5 duels', 'Win 5 duels', (p) => st(p, 'duelsGagnes') >= 5),
  miniJeux: C('Jouer tous les mini-jeux', 'Play every mini-game', (p) => (p.miniJeux?.length ?? 0) >= 8),
  express20: C('20 bonnes réponses en Express', '20 right in Express', (p) => (p.records?.express ?? 0) >= 20),
  express30: C('30 bonnes réponses en Express', '30 right in Express', (p) => (p.records?.express ?? 0) >= 30),
  survie25: C('25 bonnes réponses en Survie', '25 right in Survival', (p) => (p.records?.survie ?? 0) >= 25),
  erud500: C('500 points d’érudition', '500 knowledge points', (p) => erudition(p) >= 500),
  erud1000: C('1 000 points d’érudition', '1,000 knowledge points', (p) => erudition(p) >= 1000),
  erud2000: C('2 000 points d’érudition', '2,000 knowledge points', (p) => erudition(p) >= 2000),
  erud5000: C('5 000 points d’érudition', '5,000 knowledge points', (p) => erudition(p) >= 5000),
  legende: C('Ouvrir la Légende d’une famille', 'Unlock a family Legend', unLegende),
  serie7: C('Série de 7 jours', '7-day streak', (p) => (p.meilleureSerie ?? p.serie ?? 0) >= 7),
  serie30: C('Série de 30 jours', '30-day streak', (p) => (p.meilleureSerie ?? p.serie ?? 0) >= 30),
  niv10: C('Niveau 10', 'Level 10', (p) => niveau(p.xp ?? 0) >= 10),
  niv25: C('Niveau 25', 'Level 25', (p) => niveau(p.xp ?? 0) >= 25),
  parties100: C('100 parties jouées', '100 games played', (p) => (p.parties ?? 0) >= 100),
  sansFaute10: C('10 sans-fautes', '10 perfect games', (p) => (p.sansFaute ?? 0) >= 10),
  paliers40: C('40 niveaux réussis au sans-faute', '40 perfect levels', (p) => paliersReussis(p) >= 40),
  or10: C('10 badges en or', '10 gold badges', (p) => orBadges(p) >= 10),
  nuit: C('Succès secret : Oiseau de nuit', 'Secret: Night owl', (p) => !!p.secrets?.includes('nuit')),
  boss: C('Succès secret : Tueur de boss', 'Secret: Boss slayer', (p) => !!p.secrets?.includes('boss')),
  machine: C('Succès secret : Machine (combo de 15)', 'Secret: Machine', (p) => !!p.secrets?.includes('combo15')),
  immortel: C('Succès secret : Immortel', 'Secret: Immortal', (p) => !!p.secrets?.includes('immortel')),
  marathon: C('Succès secret : Marathonien', 'Secret: Marathoner', (p) => !!p.secrets?.includes('marathon')),
  geo: C('60 % de maîtrise en Géographie', '60% Geography mastery', (p) => maitriseFamille(p, 'geo') >= 60),
  cine: C('60 % de maîtrise en Cinéma', '60% Film mastery', (p) => maitriseFamille(p, 'cine') >= 60),
  jv: C('60 % de maîtrise en Jeux vidéo', '60% Video games mastery', (p) => maitriseFamille(p, 'jv') >= 60),
  nat: C('60 % de maîtrise en Nature', '60% Nature mastery', (p) => maitriseFamille(p, 'nat') >= 60),
  mus: C('60 % de maîtrise en Musique', '60% Music mastery', (p) => maitriseFamille(p, 'mus') >= 60),
  cui: C('60 % de maîtrise en Cuisine', '60% Food mastery', (p) => maitriseFamille(p, 'cui') >= 60),
  pop: C('60 % de maîtrise en Pop culture', '60% Pop culture mastery', (p) => maitriseFamille(p, 'pop') >= 60),
  riche: C('Avoir 2 000 pièces en poche', 'Hold 2,000 coins', (p) => (p.pieces ?? 0) >= 2000),
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
  ...FAMILLES.map((f, i): Objet => ({ id: `avatar-${f.k}`, type: 'avatar', categorie: 'famille', nom: f.nom, prix: i < 2 ? 0 : 100, k: f.k })),

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
  ] as [string, string, string, Objet['condition']][]).map(([id, fr, en, condition]): Objet => ({ id: `titre-${id}`, type: 'titre', nom: { fr, en }, prix: 0, condition })),
  // Pass de saison : palier 10 (titre) et palier 20 (cadre animé)
  { id: 'titre-saison', type: 'titre', nom: { fr: 'De la saison', en: 'Of the season' }, prix: 0, condition: { desc: { fr: 'Pass de saison : palier 10', en: 'Season pass tier 10' }, test: (p) => !!p.possede?.includes('titre-saison') } },
  { id: 'cadre-saison', type: 'cadre', nom: { fr: 'Saison', en: 'Season' }, prix: 0, couleur: 'conic-gradient(#8E8CD8, #6BB8C4, #F29BB0, #8E8CD8)', anim: 'tourne brille', condition: { desc: { fr: 'Pass de saison : palier 20', en: 'Season pass tier 20' }, test: (p) => !!p.possede?.includes('cadre-saison') } },
  // ——— Récompenses de sections : chaque famille dont on ouvre la Légende donne un cadre animé et un titre ———
  ...FAMILLES.flatMap((f): Objet[] => {
    const orb = ({"geo":["🌍","🧭","🗺️"],"cine":["🎬","🍿","⭐"],"mus":["🎵","🎸","🎶"],"nat":["🍃","🦋","🌸"],"sci":["⚛️","🧪","🔭"],"his":["🏛️","👑","📜"],"brd":["🏷️","💎","🛍️"],"spo":["⚽","🏀","🏆"],"lit":["📚","✒️","📖"],"jv":["🎮","👾","🕹️"],"ani":["⭐","🍥","🗡️"],"vie":["🏠","🚗","🧀"],"mot":["🔤","💬","📝"],"tec":["💻","📱","⚡"],"esp":["🪐","🚀","🌙"],"cui":["🍳","🥐","🍝"],"pop":["📺","🎤","✨"]} as Record<string, string[]>)[f.k] ?? ['✨', '⭐', '✨']
    const titre = ({"geo":"Globe-trotteur","cine":"Cinéphile absolu","mus":"Oreille d’or","nat":"Âme de la nature","sci":"Génie","his":"Mémoire vivante","brd":"Marketeur","spo":"Champion·ne","lit":"Rat de bibliothèque","jv":"Pro gamer","ani":"Otaku","vie":"Débrouillard·e","mot":"Maître des mots","tec":"Hacker","esp":"Astronaute","cui":"Chef étoilé","pop":"Star de la pop culture"} as Record<string, string>)[f.k] ?? `Maître : ${f.nom.fr}`
    const cond = { desc: { fr: `Ouvrir la Légende : ${f.nom.fr}`, en: `Unlock the Legend: ${f.nom.en}` }, test: (p: Profile) => legendeOuverte(f.k, p) }
    return [
      { id: `cadre-maitre-${f.k}`, type: 'cadre', nom: { fr: `Maître · ${f.nom.fr}`, en: `Master · ${f.nom.en}` }, prix: 0, couleur: `conic-gradient(var(--${f.k}), #FFE08A, var(--${f.k}-i), var(--${f.k}))`, anim: 'tourne brille', orbite: orb, condition: cond },
      { id: `titre-maitre-${f.k}`, type: 'titre', nom: { fr: titre, en: titre }, prix: 0, condition: cond },
    ]
  }),
  // ——— Mode histoire terminé ———
  { id: 'cadre-tour-du-monde', type: 'cadre', nom: { fr: 'Tour du monde', en: 'World tour' }, prix: 0, couleur: 'conic-gradient(#4FAE6A, #3A86C8, #E3A72F, #8E4FC4, #4FAE6A)', anim: 'tourne holo', orbite: ['🌍', '✈️', '🗺️'], condition: { desc: { fr: 'Finir le mode histoire', en: 'Finish story mode' }, test: (p: Profile) => (p.aventure ?? 0) >= 64 } },
  { id: 'cadre-mi-parcours', type: 'cadre', nom: { fr: 'Voyageur', en: 'Traveller' }, prix: 0, couleur: 'conic-gradient(#3A86C8, #8ED3F0, #3A86C8)', anim: 'vague', orbite: ['🧭', '🎒'], condition: { desc: { fr: 'Atteindre le 4ᵉ monde du mode histoire', en: 'Reach story world 4' }, test: (p: Profile) => (p.aventure ?? 0) >= 24 } },
  { id: 'titre-tour-du-monde', type: 'titre', nom: { fr: 'Aventurier·ère du monde', en: 'World adventurer' }, prix: 0, condition: { desc: { fr: 'Finir le mode histoire', en: 'Finish story mode' }, test: (p: Profile) => (p.aventure ?? 0) >= 64 } },
  { id: 'titre-premier-boss', type: 'titre', nom: { fr: 'Tueur de boss', en: 'Boss slayer' }, prix: 0, condition: { desc: { fr: 'Battre le premier boss du mode histoire', en: 'Beat the first story boss' }, test: (p: Profile) => (p.aventure ?? 0) >= 8 } },
  { id: 'perso-astronaute-or', type: 'avatar', nom: { fr: 'Explorateur·rice doré·e', en: 'Golden explorer' }, prix: 0, perso: 'astronaute', categorie: 'metier', condition: { desc: { fr: 'Finir le mode histoire', en: 'Finish story mode' }, test: (p: Profile) => (p.aventure ?? 0) >= 64 } },
  { id: 'avatar-boss', type: 'avatar', nom: { fr: 'Boss', en: 'Boss' }, prix: 0, emoji: '👑', categorie: 'fun', condition: { desc: { fr: 'Battre 4 boss du mode histoire', en: 'Beat 4 story bosses' }, test: (p: Profile) => (p.aventure ?? 0) >= 32 } },
  // ——— Événement Halloween (25 oct. – 1er nov.) : à gagner en jouant pendant l'événement ———
  { id: 'cadre-halloween', type: 'cadre', nom: { fr: 'Halloween', en: 'Halloween' }, prix: 0, couleur: 'conic-gradient(#FF7A00, #1A1A1A, #7C3AED, #1A1A1A, #FF7A00)', anim: 'tourne pulse', orbite: ['🦇', '👻', '🎃'], condition: { desc: { fr: 'Jouer une partie pendant Halloween', en: 'Play during Halloween' }, test: (p: Profile) => !!p.possede?.includes('cadre-halloween') } },
  { id: 'avatar-citrouille', type: 'avatar', nom: { fr: 'Citrouille', en: 'Pumpkin' }, prix: 0, emoji: '🎃', categorie: 'fun', condition: { desc: { fr: '5 parties pendant Halloween', en: '5 games during Halloween' }, test: (p: Profile) => !!p.possede?.includes('avatar-citrouille') } },
  { id: 'titre-halloween', type: 'titre', nom: { fr: 'Créature de la nuit', en: 'Creature of the night' }, prix: 0, condition: { desc: { fr: '5 parties pendant Halloween', en: '5 games during Halloween' }, test: (p: Profile) => !!p.possede?.includes('titre-halloween') } },
  { id: 'cadre-rare-saison', type: 'cadre', nom: { fr: 'Étoile filante', en: 'Shooting star' }, prix: 1200, couleur: 'conic-gradient(#0F172A, #1E3A8A, #0F172A)', anim: 'tourne etoiles', orbite: ['☄️', '⭐', '✨'] },
  { id: 'cadre-coeurs', type: 'cadre', nom: { fr: 'Cœurs', en: 'Hearts' }, prix: 600, couleur: 'conic-gradient(#F472B6, #FB7185, #F472B6)', anim: 'pulse', orbite: ['💖', '💕', '💗'] },
  { id: 'cadre-musique', type: 'cadre', nom: { fr: 'Mélodie', en: 'Melody' }, prix: 700, couleur: 'conic-gradient(#6D28D9, #DB2777, #6D28D9)', anim: 'tourne', orbite: ['🎵', '🎶', '🎵'] },
  { id: 'cadre-hiver', type: 'cadre', nom: { fr: 'Hiver', en: 'Winter' }, prix: 700, couleur: 'conic-gradient(#E0F2FE, #93C5FD, #E0F2FE)', anim: 'brille glace', orbite: ['❄️', '⛄', '❄️'] },
]
export const possede = (p: Profile | null | undefined, o: Objet) => (o.condition ? !!p && o.condition.test(p) : o.prix === 0 || !!p?.possede?.includes(o.id))

export async function acheterObjet(uid: string, o: Objet) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', uid)
    const solde = ((await tx.get(ref)).data()?.pieces as number | undefined) ?? 0
    if (solde < o.prix) return false
    tx.update(ref, { pieces: increment(-o.prix), possede: arrayUnion(o.id) })
    return true
  })
}
export async function equiper(uid: string, o: Objet) {
  const champ = { [o.type]: o.id }
  await Promise.all([
    setDoc(doc(db, 'users', uid), champ, { merge: true }),
    setDoc(doc(db, 'profils', uid), champ, { merge: true }),
    setDoc(doc(db, 'semaines', semaine(), 'scores', uid), champ, { merge: true }),
  ])
}
