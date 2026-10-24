import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, type Profile } from '../auth'
import { usePrefs, type Lang } from '../i18n'
import { FAMILLES } from '../themes'
import { prixCaisse, accesQuiz, progresLegende, quizVerrouilles } from '../progression'
import { ouvrirFiche } from './FicheLancement'
import { proposerCaisse } from './CarteCouverture'

type Suggestion = { id: string; emoji: string; titre: string; detail: string; k: string; action: () => void; poids: number }
const NIVEAUX: Record<Lang, string[]> = { fr: ['', 'Facile', 'Moyen', 'Difficile', 'Expert'], en: ['', 'Easy', 'Medium', 'Hard', 'Expert'] }

// Suggestions calculées à partir de la progression : de quoi jouer sans réfléchir
function suggestions(p: Profile | null, lang: Lang, nav: (to: string) => void): Suggestion[] {
  const fr = lang === 'fr'
  const out: Suggestion[] = []
  for (const f of FAMILLES) {
    const possedes = f.subs.filter((s) => s.jouable && accesQuiz(s.id, p))
    // Prochain niveau à réussir sur un quiz déjà commencé
    for (const s of possedes) {
      const faits = p?.paliers?.[s.id] ?? []
      const prochain = [1, 2, 3, 4].find((d) => !faits.includes(d))
      if (prochain && faits.length) out.push({ id: `niv-${s.id}`, emoji: '🪜', titre: s.nom[lang], detail: fr ? `Sans-faute en ${NIVEAUX.fr[prochain]} pour monter` : `Perfect run on ${NIVEAUX.en[prochain]}`, k: f.k, action: () => ouvrirFiche(s.id), poids: 3 + faits.length })
    }
    // Famille proche de la Légende
    const lg = progresLegende(f.k, p)
    if (lg.total && lg.faits / lg.total >= 0.5 && lg.faits < lg.total) out.push({ id: `leg-${f.k}`, emoji: '👑', titre: f.nom[lang], detail: fr ? `Légende à ${Math.round((lg.faits / lg.total) * 100)} % : encore ${lg.total - lg.faits} niveaux` : `Legend ${Math.round((lg.faits / lg.total) * 100)} %`, k: f.k, action: () => nav(`/themes/${f.k}`), poids: 8 })
    // Quiz possédé jamais joué
    const neuf = possedes.find((s) => !((p?.maitrise?.[s.id] ?? 0) > 0))
    if (neuf) out.push({ id: `neuf-${neuf.id}`, emoji: '✨', titre: neuf.nom[lang], detail: fr ? 'Pas encore joué : à découvrir' : 'Never played', k: f.k, action: () => ouvrirFiche(neuf.id), poids: 2 })
    // Caisse à ouvrir si on a les pièces
    if ((p?.pieces ?? 0) >= prixCaisse(p) && quizVerrouilles(f.k, p).length && possedes.length) out.push({ id: `caisse-${f.k}`, emoji: '🎁', titre: f.nom[lang], detail: fr ? `Tu peux ouvrir une caisse (${prixCaisse(p)} pièces)` : `Open a crate (${prixCaisse(p)} coins)`, k: f.k, action: () => proposerCaisse(f.k), poids: 4 })
  }
  // Un peu de hasard à poids égal, pour varier d'un jour à l'autre
  return out.sort((a, b) => b.poids - a.poids || a.id.localeCompare(b.id)).slice(0, 12)
}

export default function AFaire() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const nav = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const liste = suggestions(profile, lang, nav)
  // Défilement automatique toutes les 4 s (en pause au survol ou au toucher)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let pause = false
    const on = () => { pause = true }, off = () => { pause = false }
    el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off); el.addEventListener('touchstart', on, { passive: true })
    const t = setInterval(() => {
      if (pause || !el.scrollWidth) return
      const fin = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      el.scrollTo({ left: fin ? 0 : el.scrollLeft + 236, behavior: 'smooth' })
    }, 4000)
    return () => { clearInterval(t); el.removeEventListener('pointerenter', on); el.removeEventListener('pointerleave', off); el.removeEventListener('touchstart', on) }
  }, [liste.length])
  if (!liste.length) return null
  return (
    <section className="a-faire">
      <div className="a-faire-tete">
        <h2 className="t">{fr ? 'À faire pour toi' : 'Picked for you'}</h2>
        <button type="button" className="btn btn-p" onClick={() => liste[0].action()}>🎲 {fr ? 'Que faire ?' : 'What now?'}</button>
      </div>
      <div className="a-faire-rangee" ref={ref}>
        {liste.map((x) => (
          <button key={x.id} type="button" className="a-faire-carte" onClick={x.action} style={{ ['--k' as string]: `var(--${x.k})`, ['--kt' as string]: `var(--${x.k}-t)`, ['--ki' as string]: `var(--${x.k}-i)` }}>
            <span className="a-faire-emoji">{x.emoji}</span>
            <span><strong>{x.titre}</strong><small>{x.detail}</small></span>
          </button>
        ))}
        <Link to="/aventure" className="a-faire-carte" style={{ ['--k' as string]: 'var(--esp)', ['--kt' as string]: 'var(--esp-t)', ['--ki' as string]: 'var(--esp-i)' }}><span className="a-faire-emoji">🗺️</span><span><strong>{fr ? 'Mode histoire' : 'Story mode'}</strong><small>{fr ? 'Continue ton tour du monde' : 'Continue your world tour'}</small></span></Link>
      </div>
    </section>
  )
}
