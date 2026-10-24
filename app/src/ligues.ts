import type { Lang } from './i18n'
import { semaine } from './social'

// ——— Rangs (façon Rocket League) : 9 rangs de 4 divisions (4 = la meilleure), puis un rang ultime unique ———
// Les points de rang (PR) ne repartent pas à zéro chaque semaine : chaque XP gagnée en partie en rapporte autant.
// Pas de remise à zéro brutale : après 3 jours sans jouer, on descend d'une division par jour d'absence.
export type Rang = { id: string; nom: Record<Lang, string>; couleur: string; fonce: string; emoji: string }
export const RANGS: Rang[] = [
  { id: 'bronze', nom: { fr: 'Bronze', en: 'Bronze' }, couleur: '#D08B54', fonce: '#7C4A23', emoji: '🥉' },
  { id: 'argent', nom: { fr: 'Argent', en: 'Silver' }, couleur: '#B8C0CA', fonce: '#5B6470', emoji: '🥈' },
  { id: 'or', nom: { fr: 'Or', en: 'Gold' }, couleur: '#E9B93F', fonce: '#8A6312', emoji: '🥇' },
  { id: 'platine', nom: { fr: 'Platine', en: 'Platinum' }, couleur: '#7FD6C9', fonce: '#2F7F75', emoji: '💠' },
  { id: 'emeraude', nom: { fr: 'Émeraude', en: 'Emerald' }, couleur: '#34D399', fonce: '#065F46', emoji: '🟢' },
  { id: 'saphir', nom: { fr: 'Saphir', en: 'Sapphire' }, couleur: '#60A5FA', fonce: '#1E3A8A', emoji: '🔷' },
  { id: 'rubis', nom: { fr: 'Rubis', en: 'Ruby' }, couleur: '#F87171', fonce: '#7F1D1D', emoji: '♦️' },
  { id: 'diamant', nom: { fr: 'Diamant', en: 'Diamond' }, couleur: '#A5F3FC', fonce: '#0E7490', emoji: '💎' },
  { id: 'maitre', nom: { fr: 'Maître', en: 'Master' }, couleur: '#C084FC', fonce: '#4C1D95', emoji: '🔮' },
]
export const ULTIME: Rang = { id: 'legende', nom: { fr: 'Légende', en: 'Legend' }, couleur: '#F4C430', fonce: '#7C2D12', emoji: '👑' }
export const DIVISIONS = 4
export const NB_PALIERS = RANGS.length * DIVISIONS // + 1 palier ultime (index NB_PALIERS)

// Seuil d'un palier (0 = Bronze 1 … 35 = Maître 4, 36 = Légende) : la marche grandit à chaque palier.
// Estimation : une bonne partie ≈ 150 à 300 XP. Argent ≈ 9 000 PR (une semaine tranquille), Or ≈ 28 000,
// Diamant ≈ 207 000, Légende ≈ 309 000 (plusieurs mois de jeu régulier).
export const seuil = (k: number) => (k <= 0 ? 0 : Math.round((1000 * k ** 1.6) / 50) * 50)
export const palierDe = (pts: number) => { let k = 0; while (k < NB_PALIERS && pts >= seuil(k + 1)) k++; return k }

export type InfoRang = { k: number; rang: Rang; division: number | null; nom: string; min: number; suivant: number | null; ultime: boolean }
export function infoRang(pts: number, lang: Lang = 'fr'): InfoRang {
  const k = palierDe(pts)
  const ultime = k >= NB_PALIERS
  const rang = ultime ? ULTIME : RANGS[Math.floor(k / DIVISIONS)]
  const division = ultime ? null : (k % DIVISIONS) + 1
  return { k, rang, division, nom: division ? `${rang.nom[lang]} ${division}` : rang.nom[lang], min: seuil(k), suivant: ultime ? null : seuil(k + 1), ultime }
}

// Inactivité : 3 jours de grâce, puis une division perdue par jour (on retombe au début de la division du dessous)
export const GRACE = 3
const jours = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)
export type EtatLigue = { pts: number; jour: string; semaine?: string; fins?: Record<string, number>; derniere?: { rang: string; jetons: number; semaine: string } }
export function ptsEffectifs(l: Pick<EtatLigue, 'pts' | 'jour'> | undefined, aujourdhui: string) {
  if (!l) return 0
  const absence = jours(l.jour, aujourdhui) - GRACE
  if (absence <= 0) return l.pts
  const k = Math.max(0, palierDe(l.pts) - absence)
  return Math.min(l.pts, seuil(k))
}

// ——— Récompenses de fin de semaine ———
// Finir une semaine dans un rang (n'importe quelle division) : cadre et couleur de pseudo du rang (et de ceux du dessous).
// Le finir 3 fois : titre et fond de vitrine du rang.
// Jetons de rang gagnés à chaque fin de semaine (même si on a déjà les récompenses du rang) : plus le rang est haut, plus on en gagne
export const JETONS_RANG: Record<string, number> = { bronze: 5, argent: 8, or: 12, platine: 16, emeraude: 20, saphir: 25, rubis: 30, diamant: 40, maitre: 50, legende: 75 }
export const recompensesRang = (r: Rang) => ({ cadre: `cadre-rang-${r.id}`, pseudo: `pseudo-rang-${r.id}`, titre: `titre-rang-${r.id}`, fond: `fond-rang-${r.id}` })
export const TOUS_RANGS = [...RANGS, ULTIME]

// À appeler à chaque partie : clôt la semaine précédente si besoin (récompenses), applique l'inactivité, ajoute les points
export function avancerLigue(l: EtatLigue | undefined, gain: number, aujourdhui: string) {
  const sem = semaine()
  const objets: string[] = []
  const fins = { ...(l?.fins ?? {}) }
  let jetons = 0
  let derniere = l?.derniere
  if (l && l.semaine && l.semaine !== sem) {
    // Rang de fin de semaine (avant cette partie) : ce rang et ceux du dessous comptent comme « finis »
    const fin = infoRang(ptsEffectifs(l, aujourdhui))
    const jusqua = fin.ultime ? TOUS_RANGS.length : RANGS.indexOf(fin.rang) + 1
    jetons = JETONS_RANG[fin.rang.id] ?? 0
    derniere = { rang: fin.rang.id, jetons, semaine: l.semaine }
    for (const r of TOUS_RANGS.slice(0, jusqua)) {
      const rec = recompensesRang(r)
      fins[r.id] = (fins[r.id] ?? 0) + 1
      objets.push(rec.cadre, rec.pseudo)
      if (fins[r.id] >= 3) objets.push(rec.titre, rec.fond)
    }
  }
  const pts = ptsEffectifs(l, aujourdhui) + Math.max(0, gain)
  return { etat: { pts, jour: aujourdhui, semaine: sem, fins, ...(derniere ? { derniere } : {}) } as EtatLigue, objets, jetons }
}
