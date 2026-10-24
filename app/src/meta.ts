import { arrayUnion, doc, increment, runTransaction, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Lang } from './i18n'
import { niveau, type Profile } from './auth'
import { BADGES, palierAtteint } from './badges'
import { legendeOuverte } from './progression'
import { FAMILLES, type Famille } from './themes'
import { semaine } from './social'

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

// ——— Boutique : avatars (illustrations des familles) et cadres ———
// Cadres de compétence : gratuits mais gagnés (ils montrent le niveau), animés en CSS (transform/opacity seulement)
export type Objet = { id: string; type: 'avatar' | 'cadre'; nom: Record<Lang, string>; prix: number; k?: Famille; couleur?: string; perso?: string; anim?: string; condition?: { desc: Record<Lang, string>; test: (p: Profile) => boolean } }
const NOMS_PERSOS: Record<string, [string, string]> = {
  eleve: ['Élève', 'Pupil'], savante: ['Savante', 'Scientist'], explorateur: ['Explorateur', 'Explorer'], astronaute: ['Astronaute', 'Astronaut'],
  musicienne: ['Musicienne', 'Musician'], peintre: ['Peintre', 'Painter'], gameur: ['Gameur', 'Gamer'], sportive: ['Sportive', 'Athlete'],
  detective: ['Détective', 'Detective'], magicien: ['Magicien', 'Wizard'], cheffe: ['Cheffe', 'Chef'], historien: ['Historien', 'Historian'],
  botaniste: ['Botaniste', 'Botanist'], pirate: ['Pirate', 'Pirate'], robot: ['Robot', 'Robot'], professeure: ['Professeure', 'Teacher'],
}
const orBadges = (p: Profile) => BADGES.filter((b) => palierAtteint(b, p) === 3).length
const paliersReussis = (p: Profile) => Object.values(p.paliers ?? {}).reduce((n, l) => n + l.length, 0)
export const BOUTIQUE: Objet[] = [
  ...Object.entries(NOMS_PERSOS).map(([id, [fr, en]], i): Objet => ({ id: `perso-${id}`, type: 'avatar', nom: { fr, en }, prix: i < 3 ? 0 : 60 + (i % 5) * 40, perso: id })),
  ...FAMILLES.map((f, i): Objet => ({ id: `avatar-${f.k}`, type: 'avatar', nom: f.nom, prix: i < 2 ? 0 : 100, k: f.k })),
  { id: 'cadre-bronze', type: 'cadre', nom: { fr: 'Cadre bronze', en: 'Bronze frame' }, prix: 80, couleur: '#C98B5A' },
  { id: 'cadre-argent', type: 'cadre', nom: { fr: 'Cadre argent', en: 'Silver frame' }, prix: 200, couleur: '#9AA3AD' },
  { id: 'cadre-or', type: 'cadre', nom: { fr: 'Cadre or', en: 'Gold frame' }, prix: 400, couleur: '#D8B04A' },
  { id: 'cadre-arcenciel', type: 'cadre', nom: { fr: 'Cadre arc-en-ciel', en: 'Rainbow frame' }, prix: 800, couleur: 'conic-gradient(#E0997A, #DDB65E, #8FD3B6, #6BB8C4, #B3A3DB, #E0997A)', anim: 'tourne' },
  { id: 'cadre-flamme', type: 'cadre', nom: { fr: 'Flamme', en: 'Flame' }, prix: 0, couleur: 'conic-gradient(#FF6A3D, #FFC23D, #FF3D3D, #FF6A3D)', anim: 'pulse', condition: { desc: { fr: 'Série de 30 jours', en: '30-day streak' }, test: (p) => (p.meilleureSerie ?? p.serie ?? 0) >= 30 } },
  { id: 'cadre-erudit', type: 'cadre', nom: { fr: 'Érudit', en: 'Scholar' }, prix: 0, couleur: 'conic-gradient(#5B8DEF, #A35BE0, #5B8DEF)', anim: 'tourne', condition: { desc: { fr: 'Niveau 25', en: 'Level 25' }, test: (p) => niveau(p.xp ?? 0) >= 25 } },
  { id: 'cadre-perfection', type: 'cadre', nom: { fr: 'Perfection', en: 'Perfection' }, prix: 0, couleur: 'conic-gradient(#fff, #8FD3B6, #fff, #6BB8C4, #fff)', anim: 'brille', condition: { desc: { fr: '40 difficultés réussies au sans-faute', en: '40 perfect difficulties' }, test: (p) => paliersReussis(p) >= 40 } },
  { id: 'cadre-medailles', type: 'cadre', nom: { fr: 'Médaillé', en: 'Medallist' }, prix: 0, couleur: 'conic-gradient(#D8B04A, #FFF2B8, #D8B04A, #B8862E, #D8B04A)', anim: 'brille', condition: { desc: { fr: '10 badges en or', en: '10 gold badges' }, test: (p) => orBadges(p) >= 10 } },
  { id: 'cadre-legende', type: 'cadre', nom: { fr: 'Légende', en: 'Legend' }, prix: 0, couleur: 'conic-gradient(#E3A72F, #A35BE0, #E3574B, #E3A72F)', anim: 'tourne pulse', condition: { desc: { fr: 'Ouvrir la Légende d’une famille', en: 'Unlock a family Legend' }, test: (p) => FAMILLES.some((f) => legendeOuverte(f.k, p)) } },
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
  const champ = { [o.type === 'avatar' ? 'avatar' : 'cadre']: o.id }
  await Promise.all([
    setDoc(doc(db, 'users', uid), champ, { merge: true }),
    setDoc(doc(db, 'profils', uid), champ, { merge: true }),
    setDoc(doc(db, 'semaines', semaine(), 'scores', uid), champ, { merge: true }),
  ])
}
