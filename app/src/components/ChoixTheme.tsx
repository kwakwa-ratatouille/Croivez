import { useState } from 'react'
import { createPortal } from 'react-dom'
import { usePrefs } from '../i18n'
import { FAMILLES, trouverSousTheme } from '../themes'
import { normaliser } from '../quiz/match'
import { useCouverture } from './CarteCouverture'
import Img from './Img'
import { ICONS, Icon } from './ui'

// Vignette d'un quiz dans le sélecteur
function Vignette({ id, nom, k, choisi, onClick }: { id: string; nom: string; k: string; choisi: boolean; onClick: () => void }) {
  const src = useCouverture(id)
  return (
    <button type="button" className={`choix-vignette${choisi ? ' choisi' : ''}`} onClick={onClick} style={{ ['--k' as string]: `var(--${k})`, ['--kt' as string]: `var(--${k}-t)` }}>
      <span className="choix-vignette-img">{src ? <Img src={src} alt="" loading="lazy" /> : null}</span>
      <span>{nom}</span>
    </button>
  )
}

// Choix du thème d'une partie (duel, salon) : un bouton, puis un sélecteur visuel
// avec recherche, familles en pastilles et quiz en vignettes (au lieu d'un long menu déroulant).
export default function ChoixTheme({ valeur, onChange, quiz , hasardFamille }: { valeur: string; onChange: (id: string) => void; quiz?: string[] ; hasardFamille?: boolean }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [ouvert, setOuvert] = useState(false)
  const [q, setQ] = useState('')
  const [fam, setFam] = useState('')
  const autorise = (id: string) => !quiz || quiz.includes(id)
  const familles = FAMILLES.map((f) => ({ f, subs: f.subs.filter((s) => s.jouable && autorise(s.id)) })).filter((x) => x.subs.length)
  const n = normaliser(q)
  const visibles = familles.filter((x) => !fam || x.f.k === fam).flatMap((x) => x.subs.filter((s) => !n || normaliser(s.nom[lang]).includes(n)).map((s) => ({ s, k: x.f.k })))
  const familleHasard = valeur.startsWith('mix-') ? FAMILLES.find((f) => f.k === valeur.slice(4)) : undefined
  const actuel = valeur.startsWith('mix') ? null : trouverSousTheme(valeur)
  const choisir = (id: string) => { onChange(id); setOuvert(false); setQ('') }
  return (
    <>
      <button type="button" className="choix-theme-bouton" onClick={() => setOuvert(true)}>
        <span>{actuel ? actuel.sous.nom[lang] : familleHasard ? `🎲 ${familleHasard.nom[lang]}` : (fr ? '🎲 Au hasard, tous thèmes' : '🎲 Random')}</span>
        <small>{actuel ? actuel.famille.nom[lang] : familleHasard ? (fr ? 'Au hasard dans cette famille' : 'Random in this family') : (fr ? 'Touche pour choisir un thème' : 'Tap to pick')}</small>
        <Icon d={ICONS.arrowR} size={16} />
      </button>
      {ouvert && createPortal(
        <div className="fiche-voile" onClick={() => setOuvert(false)}>
          <div className="card choix-theme rise" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={fr ? 'Choisir un thème' : 'Pick a topic'}>
            <div className="choix-theme-tete">
              <strong className="t">{fr ? 'Choisir un thème' : 'Pick a topic'}</strong>
              <button type="button" className="btn btn-g" aria-label={fr ? 'Fermer' : 'Close'} onClick={() => setOuvert(false)}><Icon d={ICONS.close} size={18} /></button>
            </div>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={fr ? 'Chercher : drapeaux, films, Pokémon…' : 'Search…'} autoFocus style={{ minHeight: 44 }} />
            <div className="choix-theme-familles">
              <button type="button" className="pill" aria-pressed={!fam} onClick={() => setFam('')}>{fr ? 'Toutes' : 'All'}</button>
              {familles.map(({ f }) => <button key={f.k} type="button" className="pill" aria-pressed={fam === f.k} onClick={() => setFam(f.k)}>{f.nom[lang].split(/ [&,]/)[0]}</button>)}
            </div>
            <div className="choix-theme-grille">
              <button type="button" className={`choix-vignette hasard${valeur === 'mix' ? ' choisi' : ''}`} onClick={() => choisir('mix')}><span className="choix-vignette-img">🎲</span><span>{fr ? 'Au hasard, tout' : 'Random, all'}</span></button>
              {hasardFamille && fam && <button type="button" className={`choix-vignette hasard${valeur === `mix-${fam}` ? ' choisi' : ''}`} onClick={() => choisir(`mix-${fam}`)}><span className="choix-vignette-img">🎲</span><span>{fr ? `Au hasard : ${FAMILLES.find((f) => f.k === fam)?.nom[lang].split(/ [&,]/)[0]}` : 'Random in family'}</span></button>}
              {visibles.map(({ s, k }) => <Vignette key={s.id} id={s.id} nom={s.nom[lang]} k={k} choisi={valeur === s.id} onClick={() => choisir(s.id)} />)}
            </div>
          </div>
        </div>, document.body)}
    </>
  )
}
