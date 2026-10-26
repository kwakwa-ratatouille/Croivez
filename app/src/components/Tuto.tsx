import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../auth'

// Tuto du premier lancement : une visite guidée sur la vraie interface. Un projecteur éclaire chaque élément
// (jouer, thèmes, quiz du jour, histoire, multi, pièces, profil, classements) avec une bulle d'explication.
// Les étapes dont l'élément n'est pas à l'écran (téléphone / ordinateur) sont sautées toutes seules.
// Se relance depuis Paramètres → « Revoir le tuto » (événement croivez:tuto).
type Etape = { cibles?: string[]; emoji: string; titre: string; texte: string }
const ETAPES: Etape[] = [
  { emoji: '👋', titre: 'Bienvenue sur Croivez !', texte: 'Le jeu de culture générale où tu apprends un peu chaque jour. On te fait visiter en une minute, promis.' },
  { cibles: ['.accueil-jouer'], emoji: '🎲', titre: 'Jouer au hasard', texte: 'Une partie rapide sur tes quiz débloqués. Le plus simple pour commencer : un appui et c’est parti.' },
  { cibles: ['.nav[href="#/themes"]'], emoji: '📚', titre: 'Les thèmes', texte: 'Plus de 200 quiz rangés par familles : drapeaux, films, musique, Pokémon… Touche un quiz pour choisir ta difficulté et jouer.' },
  { cibles: ['a.objectif[href="#/jour"]', '.objectif'], emoji: '🗓️', titre: 'Le quiz du jour', texte: 'Le même quiz pour tout le monde, chaque jour. Compare ton score avec tes amis et garde ta série !' },
  { cibles: ['.bandeau-histoire', '.nav[href="#/aventure"]'], emoji: '🗺️', titre: 'Le mode histoire', texte: '17 mondes à traverser, avec des mini-boss, des boss et l’Ultime tout au bout. Chaque boss donne une récompense unique.' },
  { cibles: ['.nav[href="#/duels"]'], emoji: '⚔️', titre: 'Multi', texte: 'Défie tes amis en duel, crée un salon pour jouer à plusieurs, lance une soirée quiz sur la télé ou rejoins un clan.' },
  { cibles: ['.entete-mobile .puce-or', '.side-pied a[href="#/profil"]'], emoji: '🪙', titre: 'Tes pièces', texte: 'Tu en gagnes à chaque partie. Elles débloquent de nouveaux quiz (les caisses) et s’échangent à la boutique contre des avatars, cadres et effets.' },
  { cibles: ['.nav[href="#/profil"]'], emoji: '🧑‍🎨', titre: 'Ton profil', texte: 'Ta vitrine, ton album de cartes à collectionner, la boutique, tes badges et tes statistiques.' },
  { cibles: ['.nav[href="#/classements"]'], emoji: '🏆', titre: 'Les classements', texte: 'Grimpe dans les ligues chaque semaine et gagne des jetons de rang pour la boutique des rangs.' },
  { emoji: '🎉', titre: 'À toi de jouer !', texte: 'Astuce : tes erreurs reviennent toutes seules en Révision, au bon moment, jusqu’à ce que tu les retiennes. Bonne partie !' },
]
const visible = (sel: string) => { const el = document.querySelector<HTMLElement>(sel); if (!el) return null; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' ? el : null }
const cibleDe = (e: Etape) => e.cibles?.map(visible).find(Boolean) ?? null
const lu = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }

export default function Tuto() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [actif, setActif] = useState(false)
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  // Nouveau compte (aucune partie jouée) : la visite démarre toute seule, une seule fois
  useEffect(() => {
    if (!profile || actif || profile.tutoFait || (profile.parties ?? 0) > 0 || lu('tutoVu') === '1') return
    const t = setTimeout(() => { nav('/'); setI(0); setActif(true) }, 700)
    return () => clearTimeout(t)
  }, [!!profile]) // eslint-disable-line react-hooks/exhaustive-deps
  // « Revoir le tuto » depuis les paramètres
  useEffect(() => {
    const f = () => { nav('/'); setI(0); setTimeout(() => setActif(true), 300) }
    window.addEventListener('croivez:tuto', f)
    return () => window.removeEventListener('croivez:tuto', f)
  }, [nav])

  const etapes = ETAPES
  const etape = etapes[i]
  // Place le projecteur sur l'élément (on le fait défiler à l'écran d'abord)
  const placer = useCallback(() => {
    const el = etape ? cibleDe(etape) : null
    setRect(el ? el.getBoundingClientRect() : null)
  }, [etape])
  useLayoutEffect(() => {
    if (!actif || !etape) return
    const el = cibleDe(etape)
    if (etape.cibles && !el) { setI((x) => x + 1); return } // élément absent sur cet écran : étape suivante
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    placer()
    const t = setTimeout(placer, 450)
    window.addEventListener('resize', placer)
    window.addEventListener('scroll', placer, true)
    return () => { clearTimeout(t); window.removeEventListener('resize', placer); window.removeEventListener('scroll', placer, true) }
  }, [actif, i, etape, placer])

  const finir = useCallback(() => {
    setActif(false)
    try { localStorage.setItem('tutoVu', '1') } catch { /* stockage indisponible */ }
    if (user && !user.isAnonymous) setDoc(doc(db, 'users', user.uid), { tutoFait: true }, { merge: true }).catch(() => {})
    // Les nouveautés d'avant l'inscription n'ont pas d'intérêt pour un nouveau joueur
    fetch('./nouveautes.json', { cache: 'no-store' }).then((r) => r.json()).then((l: { id: string }[]) => { try { if (l[0]) localStorage.setItem('nouveautesVues', l[0].id) } catch { /* rien */ } }).catch(() => {})
  }, [user])
  const suivant = () => (i >= etapes.length - 1 ? finir() : setI(i + 1))
  useEffect(() => {
    if (!actif) return
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') finir(); if (e.key === 'Enter' || e.key === 'ArrowRight') suivant(); if (e.key === 'ArrowLeft' && i > 0) setI(i - 1) }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  })

  if (!actif || !etape) return null
  const marge = 8
  const trou = rect ? { left: rect.left - marge, top: rect.top - marge, width: rect.width + marge * 2, height: rect.height + marge * 2 } : null
  // Bulle sous l'élément s'il y a la place, sinon au-dessus ; centrée quand il n'y a pas d'élément
  const enBas = trou ? trou.top + trou.height + 230 < window.innerHeight : true
  const largeur = Math.min(340, window.innerWidth - 32)
  const gauche = trou ? Math.max(16, Math.min(window.innerWidth - largeur - 16, trou.left + trou.width / 2 - largeur / 2)) : undefined
  const styleBulle: React.CSSProperties = trou
    ? { width: largeur, left: gauche, ...(enBas ? { top: trou.top + trou.height + 14 } : { bottom: window.innerHeight - trou.top + 14 }) }
    : { width: largeur, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  const dernier = i === etapes.length - 1

  return (
    <div className="tuto" role="dialog" aria-modal="true" aria-label={etape.titre}>
      {trou ? <div className="tuto-trou" style={trou} /> : <div className="tuto-voile" />}
      <div key={i} className={`tuto-bulle${trou ? '' : ' centre'}`} style={styleBulle}>
        <span className="tuto-emoji" aria-hidden="true">{etape.emoji}</span>
        <strong className="t">{etape.titre}</strong>
        <p>{etape.texte}</p>
        <div className="tuto-points" aria-hidden="true">{etapes.map((_, k) => <span key={k} className={k === i ? 'ici' : k < i ? 'fait' : ''} />)}</div>
        <div className="tuto-boutons">
          {!dernier && <button type="button" className="btn btn-g" onClick={finir}>Passer le tuto</button>}
          {i > 0 && !dernier && <button type="button" className="btn btn-g" onClick={() => setI(i - 1)} aria-label="Étape précédente">←</button>}
          {dernier
            ? <>
                <button type="button" className="btn btn-g" onClick={finir}>Explorer</button>
                <button type="button" className="btn btn-p" autoFocus onClick={() => { finir(); nav('/partie?jeu=mix&d=1&m=qcm&n=5') }}>Ma 1ʳᵉ partie 🎲</button>
              </>
            : <button type="button" className="btn btn-p" autoFocus onClick={suivant}>{i === 0 ? 'C’est parti !' : 'Suivant'}</button>}
        </div>
      </div>
    </div>
  )
}

export const revoirTuto = () => window.dispatchEvent(new Event('croivez:tuto'))
