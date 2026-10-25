import { useEffect, useState } from 'react'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import Img from './Img'
import Illustration from './Illustration'
import { ouvrirFiche } from './FicheLancement'
import { ICONS, Icon } from './ui'
import { RARETES, rareteDe } from '../progression'

// Quiz sans photo (quiz « texte ») : une couverture en émojis, sur un dégradé aux couleurs de la famille
const EMOJI_COUV: Record<string, string> = { 'emojis-films': '🦁👑🎬', slogans: '📣✨', expressions: '🐰💬', gentiles: '🏘️🙋', 'dessins-animes': '📺🧽', 'evt-halloween': '🎃👻🦇', 'evt-noel': '🎄🎅🎁', 'evt-nouvel-an': '🎆🥂', 'evt-saint-valentin': '💝🌹', 'evt-paques': '🐣🥚🍫', 'evt-musique': '🎶🎸', 'evt-ete': '🏖️🍦', 'evt-rentree': '🎒✏️📚', devinettes: '🤔❓', 'suites-logiques': '🔢➡️', metiers: '👩‍🚒🧑‍🍳', 'records-monde': '🏆🌍', mascottes: '🐯🤡', 'fast-food': '🍔🍟' }

// Photos de couverture des quiz (public/packs/couvertures.json), chargées une seule fois
let couvertures: Promise<Record<string, string>> | null = null
const chargerCouvertures = () => (couvertures ??= fetch('./packs/couvertures.json').then((r) => r.json()).catch(() => ({})))

export function useCouverture(id: string) {
  const [src, setSrc] = useState<string | undefined>()
  useEffect(() => { let vivant = true; chargerCouvertures().then((c) => vivant && setSrc(c[id])); return () => { vivant = false } }, [id])
  return src
}

// Carte d'un quiz : vraie photo en haut, bandeau aux couleurs de la famille, progression.
// Un appui ouvre la fiche de lancement, ou la proposition d'achat si le quiz est verrouillé.
export const proposerAchat = (id: string) => window.dispatchEvent(new CustomEvent('croivez:acheter', { detail: trouverSousTheme(id)?.famille.k }))
export const proposerCaisse = (k: string) => window.dispatchEvent(new CustomEvent('croivez:acheter', { detail: k }))
export default function CarteCouverture({ id, pct = 0, verrou = false, largeur, famille = true }: { id: string; pct?: number; verrou?: boolean; largeur?: number; famille?: boolean }) {
  const { lang } = usePrefs()
  const src = useCouverture(id)
  const t = trouverSousTheme(id)
  if (!t) return null
  const k = t.famille.k
  return (
    <button type="button" onClick={() => (verrou ? proposerAchat(id) : ouvrirFiche(id))} className={`couverture famille${verrou ? ' verrouillee' : ''}`}
      style={{ width: largeur, ['--k' as string]: `var(--${k})`, ['--kt' as string]: `var(--${k}-t)`, ['--ki' as string]: `var(--${k}-i)` }}>
      <span className="couverture-photo">
        {src
          ? <Img src={src} alt="" loading="lazy" />
          : EMOJI_COUV[id]
            ? <span className="couverture-emoji" aria-hidden="true">{EMOJI_COUV[id]}</span>
            : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'var(--kt)' }}><Illustration k={k} taille={150} fond={false} /></span>}
        {/* Pastille de la famille, pour différencier d'un coup d'œil */}
        {famille && <span className="couverture-famille"><Icon d={t.famille.icon} size={14} />{t.famille.nom[lang].split(/[ ,&]/)[0]}</span>}
        {verrou && <span className="couverture-verrou" style={{ background: RARETES[rareteDe(id)].couleur }}><Icon d={ICONS.lock} size={14} />{RARETES[rareteDe(id)].nom[lang]}</span>}
      </span>
      <span className="couverture-bas">
        <span className="t couverture-titre">{t.sous.nom[lang]}</span>
        <span className="bar" style={{ height: 6, background: 'var(--surface)' }}><span style={{ width: `${pct}%`, background: 'var(--k)' }} /></span>
      </span>
    </button>
  )
}
