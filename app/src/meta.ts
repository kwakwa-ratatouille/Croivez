import { arrayUnion, doc, increment, runTransaction, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Lang } from './i18n'
import type { Profile } from './auth'
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

// ——— Événement de la semaine : une famille à l'honneur, XP et pièces ×2 sur ses quiz ———
export function evenementDeLaSemaine() {
  const s = semaine()
  const n = Number(s.slice(-2)) + Number(s.slice(0, 4)) * 53
  return FAMILLES[n % FAMILLES.length]
}
export const bonusEvenement = (k?: string) => (k && evenementDeLaSemaine().k === k ? 2 : 1)

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
export type Objet = { id: string; type: 'avatar' | 'cadre'; nom: Record<Lang, string>; prix: number; k?: Famille; couleur?: string }
export const BOUTIQUE: Objet[] = [
  ...FAMILLES.map((f, i): Objet => ({ id: `avatar-${f.k}`, type: 'avatar', nom: f.nom, prix: i < 2 ? 0 : 100, k: f.k })),
  { id: 'cadre-bronze', type: 'cadre', nom: { fr: 'Cadre bronze', en: 'Bronze frame' }, prix: 80, couleur: '#C98B5A' },
  { id: 'cadre-argent', type: 'cadre', nom: { fr: 'Cadre argent', en: 'Silver frame' }, prix: 200, couleur: '#9AA3AD' },
  { id: 'cadre-or', type: 'cadre', nom: { fr: 'Cadre or', en: 'Gold frame' }, prix: 400, couleur: '#D8B04A' },
  { id: 'cadre-arcenciel', type: 'cadre', nom: { fr: 'Cadre arc-en-ciel', en: 'Rainbow frame' }, prix: 800, couleur: 'conic-gradient(#E0997A, #DDB65E, #8FD3B6, #6BB8C4, #B3A3DB, #E0997A)' },
]
export const possede = (p: Profile | null | undefined, o: Objet) => o.prix === 0 || !!p?.possede?.includes(o.id)

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
