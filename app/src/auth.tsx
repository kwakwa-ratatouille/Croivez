import { BONUS_PARRAIN, declarerFilleul, parrainRetenu } from './parrainage'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { arrayUnion, deleteField, doc, getDoc, onSnapshot, serverTimestamp, setDoc, increment } from 'firebase/firestore'
import { auth, db } from './firebase'
import { cleRevision, planifier, type CarteRevision } from './quiz/revision'
import type { SousThemeId } from './quiz/engine'
import { publierRecord, publierXp, resumePublic, synchroniserProfilPublic } from './social'
import { avancerQuetes, type EtatQuetes, type StatsPartie } from './quetes'
import { secretsObtenus } from './meta'
import { evenementActif } from './evenements'

export type Profile = {
  pseudo: string
  xp: number
  serie: number
  meilleureSerie?: number
  dernierJour: string // AAAA-MM-JJ
  maitrise: Record<string, number> // sous-thème → 0..100
  parties?: number
  bonnes?: number
  defis?: number
  defiJour?: string // dernier défi du jour réussi
  sansFaute?: number
  revision?: Record<string, CarteRevision>
  amis?: string[]
  vitrine?: string[] // jusqu'à 3 badges mis en avant
  favori?: string // sous-thème favori
  pieces?: number
  familles?: string[] // familles choisies au départ (entièrement ouvertes) ; absent = ancien compte, tout ouvert
  quiz?: string[] // sous-thèmes possédés (choisis au départ ou achetés)
  choixFait?: boolean // false : le joueur doit encore choisir ses 6 sous-thèmes de départ
  sauts?: Record<string, number[]> // difficultés débloquées en payant, par quiz
  records?: Record<string, number> // meilleurs scores Express / Survie
  quetes?: EtatQuetes // quêtes du jour
  album?: Record<string, string[]> // cartes collectionnées (bonnes réponses) par quiz
  secrets?: string[] // succès secrets obtenus
  possede?: string[] // objets achetés (avatars, cadres)
  avatar?: string
  cadre?: string
  partiesJour?: number // parties jouées aujourd'hui (succès Marathonien)
  paliers?: Record<string, number[]> // difficultés réussies (sans-faute, cumulatif) par quiz : ouvre la Légende
  toutDebloque?: boolean // menu de test : tous les quiz, toutes les difficultés et la Légende ouverts
  titre?: string // titre équipé (affiché sous le pseudo)
  bio?: string // phrase de la vitrine
  vitrineFond?: string // fond de la vitrine (dégradé ou fond animé « fond-… »)
  pseudoStyle?: string // style du pseudo acheté en boutique
  caisses?: number // caisses ouvertes (le prix augmente avec)
  farm?: Record<string, Record<string, number>> // parties du jour par niveau (XP dégressive), clé = date
  miniJeux?: string[] // mini-jeux déjà joués (cadre Holographique, titre Touche-à-tout)
  saison?: { id: string; xp: number; recl: number[] } // saison en cours (un mois) : XP gagnée et paliers récupérés
  histo?: Record<string, { p: number; b: number; t: number; xp: number }> // 30 derniers jours (statistiques)
  precision?: Record<string, { b: number; t: number }> // bonnes réponses / questions par famille
  aventure?: number // étapes du mode aventure réussies
  halloween?: number // ancien compteur Halloween (2026)
  evenements?: Record<string, number> // parties jouées pendant chaque événement (récompenses)
  exploits?: { salons?: number; victoiresMulti?: number; tv?: number; tvHote?: number; duelsGagnes?: number } // compteurs des récompenses multijoueur
}

type Ctx = { user: User | null; profile: Profile | null; loading: boolean }
const AuthCtx = createContext<Ctx>({ user: null, profile: null, loading: true })

// Mode aperçu (développement uniquement, « ?apercu » dans l'adresse) : profil fictif, sans connexion,
// pour regarder les écrans en local. Absent des versions publiées (import.meta.env.DEV vaut false).
const APERCU = import.meta.env.DEV && (location.search.includes('apercu') || sessionStorage.getItem('apercu') === '1')
const PROFIL_APERCU: Profile = { pseudo: 'Aperçu', xp: 5400, serie: 6, dernierJour: '', maitrise: { drapeaux: 80, films: 40, youtubeurs: 10 }, pieces: 420, parties: 37, bonnes: 290, paliers: { drapeaux: [1, 2, 3] } }

export function AuthProvider({ children }: { children: ReactNode }) {
  if (APERCU) {
    sessionStorage.setItem('apercu', '1')
    return <AuthCtx.Provider value={{ user: { uid: 'apercu', email: 'apercu@localhost' } as User, profile: PROFIL_APERCU, loading: false }}>{children}</AuthCtx.Provider>
  }
  return <AuthReel>{children}</AuthReel>
}

function AuthReel({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Filet de sécurité : jamais plus de 8 s sur l'écran de chargement, même si le réseau ne répond pas
    const id = setTimeout(() => setLoading(false), 8000)
    const off = onAuthStateChanged(auth, (u) => { setUser(u); if (!u) { setProfile(null); setLoading(false) } })
    return () => { clearTimeout(id); off() }
  }, [])

  useEffect(() => {
    if (!user) return
    let synchro = false
    return onSnapshot(doc(db, 'users', user.uid), (snap) => {
      const p = snap.exists() ? (snap.data() as Profile) : null
      setProfile(p)
      setLoading(false)
      // Une fois par session : pseudo réservé et profil public à jour (classements, amis)
      if (p && !synchro) { synchro = true; synchroniserProfilPublic(user.uid, p).catch(console.error) }
    }, (e) => { console.error(e); setLoading(false) })
  }, [user])

  return <AuthCtx.Provider value={{ user, profile, loading }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)

export async function ensureProfile(user: User, pseudo?: string) {
  const ref = doc(db, 'users', user.uid)
  if ((await getDoc(ref)).exists()) return
  // Invité par un ami : 100 pièces en plus, et le parrain est prévenu
  const parrain = parrainRetenu()
  if (parrain && parrain !== user.uid) declarerFilleul(user.uid, parrain).catch(console.error)
  await setDoc(ref, {
    pseudo: pseudo || user.displayName || user.email?.split('@')[0] || 'Explorateur',
    xp: 0, serie: 0, dernierJour: '', maitrise: {}, pieces: parrain && parrain !== user.uid ? 50 + BONUS_PARRAIN : 50, quiz: [], choixFait: false, creeLe: serverTimestamp(),
  })
}

// Exploit hors partie (ex. : animer une soirée télé)
export const noterExploit = (uid: string, k: keyof NonNullable<Profile['exploits']>) => setDoc(doc(db, 'users', uid), { exploits: { [k]: increment(1) } }, { merge: true })

export const niveau = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1
export const xpPourNiveau = (n: number) => (n - 1) ** 2 * 100

export const jour = (d = new Date()) => d.toLocaleDateString('sv') // AAAA-MM-JJ en heure locale

type Partie = {
  sousTheme: SousThemeId
  xp: number
  resultats: { id: string; juste: boolean; s?: string }[]
  revision?: boolean // partie de révision : ne compte pas dans la maîtrise
  defi?: boolean
  pieces?: number // pièces gagnées pendant la partie
  difficulte?: number // 1 à 4 : un sans-faute valide le palier (Légende)
  sansRevision?: boolean // Mix / Express / Survie : questions de plusieurs quiz
  stats?: StatsPartie // pour les quêtes du jour
  bossReussi?: boolean
  difficulteJouee?: number
  record?: { jeu: string; score: number }
  multi?: { mode: 'salon' | 'tv' | 'duel'; gagne: boolean } // partie à plusieurs (récompenses)
  miniJeu?: string
  cleFarm?: string // niveau ou mode joué (XP dégressive)
}

// Enregistre une partie : XP, série, maîtrise, statistiques des badges et cartes de révision
// Événement Halloween : du 25 octobre au 1er novembre
export const halloween = (d = new Date()) => (d.getMonth() === 9 && d.getDate() >= 25) || (d.getMonth() === 10 && d.getDate() <= 1)

// Identifiant de saison : le mois en cours (« 2026-10 »)
export const saisonId = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export async function enregistrerPartie(uid: string, profile: Profile, p: Partie) {
  const today = jour()
  const hier = jour(new Date(Date.now() - 864e5))
  const serie = profile.dernierJour === today ? profile.serie : profile.dernierJour === hier ? profile.serie + 1 : 1
  const bonnes = p.resultats.filter((r) => r.juste).length
  const taux = bonnes / p.resultats.length
  const ancienne = profile.maitrise?.[p.sousTheme] ?? 0
  // Moyenne glissante : la maîtrise progresse sans sauter à 100 % après une seule partie
  const maitrise = Math.round(ancienne * 0.7 + taux * 100 * 0.3)

  const revision: Record<string, unknown> = {}
  for (const r of p.sansRevision ? [] : p.resultats) {
    const s = (r.s ?? p.sousTheme) as typeof p.sousTheme
    const cle = cleRevision(s, r.id)
    const carte = profile.revision?.[cle]
    const suite = planifier(carte, s, r.id, r.juste)
    if (suite) revision[cle] = suite
    else if (carte) revision[cle] = deleteField()
  }

  // Album : chaque bonne réponse ajoute sa carte (par quiz d'origine)
  const album: Record<string, unknown> = {}
  for (const r of p.resultats) if (r.juste) {
    const s = r.s ?? p.sousTheme
    album[s] = album[s] ? [...(album[s] as string[]), r.id] : [r.id]
  }
  for (const s of Object.keys(album)) album[s] = arrayUnion(...(album[s] as string[]))
  const partiesJour = profile.dernierJour === today ? (profile.partiesJour ?? 0) + 1 : 1
  const maintenant = new Date()
  const nouveauxSecrets = secretsObtenus(profile, {
    heure: maintenant.getHours(), jourSemaine: maintenant.getDay(), bonnes, total: p.resultats.length,
    comboMax: p.stats?.comboMax ?? 0, difficulte: p.difficulteJouee, jeu: p.stats?.jeu, bossReussi: !!p.bossReussi, partiesAujourdhui: partiesJour,
  })

  const defiReussi = p.defi && taux >= 0.5 && profile.defiJour !== today
  const evt = evenementActif()
  const partiesEvt = evt ? profile.evenements?.[evt.id] ?? (evt.id === 'halloween' ? profile.halloween ?? 0 : 0) : 0
  const valide = !p.revision && p.difficulte && p.difficulte <= 4 && taux >= 1
  // Paliers après cette partie : l'érudition publique est recalculée tout de suite
  const nouveauxPaliers = valide ? { ...profile.paliers, [p.sousTheme]: [...new Set([...(profile.paliers?.[p.sousTheme] ?? []), ...[1, 2, 3, 4].filter((d) => d <= p.difficulte!)])] } : profile.paliers
  await setDoc(doc(db, 'users', uid), {
    xp: increment(p.xp),
    ...(p.pieces ? { pieces: increment(p.pieces) } : {}),
    serie,
    meilleureSerie: Math.max(serie, profile.meilleureSerie ?? 0),
    dernierJour: today,
    parties: increment(1),
    bonnes: increment(bonnes),
    ...(taux === 1 && p.resultats.length >= 10 ? { sansFaute: increment(1) } : {}),
    ...(p.revision ? {} : { maitrise: { [p.sousTheme]: maitrise } }),
    ...(defiReussi ? { defis: increment(1), defiJour: today } : {}),
    ...(Object.keys(revision).length ? { revision } : {}),
    ...(p.stats ? { quetes: avancerQuetes(profile.quetes, p.stats) } : {}),
    partiesJour: partiesJour,
    // Événement Halloween : le cadre dès la 1ʳᵉ partie, l'avatar et le titre à la 5ᵉ
    // Événement en cours (Halloween, Noël…) : le cadre dès la 1ʳᵉ partie, l'avatar et le titre à la 5ᵉ
    ...(evt ? { evenements: { [evt.id]: increment(1) }, possede: arrayUnion(evt.cadre.id, ...(partiesEvt + 1 >= 5 ? [evt.avatar.id, evt.titre.id] : [])) } : {}),
    // Saison du mois : l'XP repart de zéro à chaque nouveau mois
    saison: profile.saison?.id === saisonId() ? { ...profile.saison, xp: profile.saison.xp + p.xp } : { id: saisonId(), xp: p.xp, recl: [] },
    // Historique des 30 derniers jours et précision par famille (statistiques)
    histo: { ...Object.fromEntries(Object.keys(profile.histo ?? {}).filter((j) => j < jour(new Date(Date.now() - 30 * 864e5))).map((j) => [j, deleteField()])), [today]: { p: increment(1), b: increment(bonnes), t: increment(p.resultats.length), xp: increment(p.xp) } },
    ...(p.stats?.famille ? { precision: { [p.stats.famille]: { b: increment(bonnes), t: increment(p.resultats.length) } } } : {}),
    ...(p.miniJeu ? { miniJeux: arrayUnion(p.miniJeu) } : {}),
    // Compteur du jour pour l'XP dégressive (les jours précédents sont effacés)
    ...(p.cleFarm ? { farm: { ...Object.fromEntries(Object.keys(profile.farm ?? {}).filter((j) => j !== today).map((j) => [j, deleteField()])), [today]: { [p.cleFarm]: increment(1) } } } : {}),
    ...(p.multi ? { exploits: {
      ...(p.multi.mode === 'duel' ? (p.multi.gagne ? { duelsGagnes: increment(1) } : {}) : { salons: increment(1), ...(p.multi.gagne ? { victoiresMulti: increment(1) } : {}) }),
      ...(p.multi.mode === 'tv' ? { tv: increment(1) } : {}),
    } } : {}),
    ...(Object.keys(album).length ? { album } : {}),
    ...(nouveauxSecrets.length ? { secrets: arrayUnion(...nouveauxSecrets) } : {}),
    ...(p.record && p.record.score > (profile.records?.[p.record.jeu] ?? 0) ? { records: { [p.record.jeu]: p.record.score } } : {}),
    // Sans-faute obligatoire ; valider un niveau valide aussi tous ceux du dessous
    ...(valide ? { paliers: { [p.sousTheme]: arrayUnion(...[1, 2, 3, 4].filter((d) => d <= p.difficulte!)) } } : {}),
  }, { merge: true })
  if (p.record && (p.record.jeu === 'express' || p.record.jeu === 'survie')) publierRecord(uid, profile.pseudo, { avatar: profile.avatar, cadre: profile.cadre }, p.record.jeu, p.record.score).catch(console.error)
  await publierXp(uid, profile.pseudo, p.xp, (profile.xp ?? 0) + p.xp, serie, { avatar: profile.avatar, cadre: profile.cadre }, resumePublic({ ...profile, parties: (profile.parties ?? 0) + 1, maitrise: p.revision ? profile.maitrise : { ...profile.maitrise, [p.sousTheme]: maitrise }, paliers: nouveauxPaliers })).catch(console.error)
}
