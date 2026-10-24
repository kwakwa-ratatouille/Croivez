import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { difficulteOuverte, legendeOuverte } from '../progression'
import type { Difficulte, Mode } from '../quiz/engine'
import Illustration from './Illustration'
import { ICONS, Icon, Toggle } from './ui'

// Derniers réglages : la fiche se rouvre comme on l'a laissée
type Reglages = { d: Difficulte; m: Mode; rapide: boolean; chrono: boolean }
const lire = (): Reglages => { try { return { d: 0, m: 'qcm', rapide: false, chrono: false, ...JSON.parse(localStorage.getItem('reglages') ?? '{}') } } catch { return { d: 0, m: 'qcm', rapide: false, chrono: false } } }

// Fiche rapide : un quiz se lance en deux appuis (le quiz, puis « Jouer »), réglages à portée de pouce
export default function FicheLancement({ id, onFermer }: { id: string; onFermer: () => void }) {
  const { t, lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const nav = useNavigate()
  const trouve = trouverSousTheme(id)
  const [r, setR] = useState<Reglages>(lire)
  if (!trouve) return null
  const { famille, sous } = trouve
  const k = famille.k
  const carte = id.startsWith('villes')
  const qcmSeul = id === 'drapeaux-inverse'
  const legende = legendeOuverte(k, profile)
  const diffs: { v: Difficulte; label: string }[] = [
    { v: 0, label: t('diff.auto') }, { v: 1, label: t('diff.1') }, { v: 2, label: t('diff.2') }, { v: 3, label: t('diff.3') }, { v: 4, label: t('diff.4') },
    ...(legende ? [{ v: 5 as Difficulte, label: fr ? 'Légende' : 'Legend' }] : []),
  ]
  const maj = (x: Partial<Reglages>) => setR((v) => ({ ...v, ...x }))

  const jouer = () => {
    try { localStorage.setItem('reglages', JSON.stringify(r)) } catch { /* stockage indisponible */ }
    const m = carte ? 'libre' : qcmSeul ? 'qcm' : r.m
    const d = difficulteOuverte(r.d, profile) || (r.d === 5 && legende) ? r.d : 0
    nav(`/partie?s=${id}&m=${m}&n=10&d=${d}&t=${r.chrono ? 15 : 0}${r.rapide ? '&r=1' : ''}`)
  }

  return (
    <div className="fiche-fond" onClick={onFermer} role="presentation">
      <div className="fiche" role="dialog" aria-modal="true" aria-label={sous.nom[lang]} onClick={(e) => e.stopPropagation()} style={{ ['--k' as string]: `var(--${k})`, ['--kt' as string]: `var(--${k}-t)`, ['--ki' as string]: `var(--${k}-i)` }}>
        <div className="fiche-poignee" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Illustration k={k} taille={92} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="eyebrow" style={{ color: 'var(--ki)' }}>{famille.nom[lang]}</span>
            <h2 className="t" style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{sous.nom[lang]}</h2>
          </div>
          <button className="btn btn-g" aria-label={fr ? 'Fermer' : 'Close'} onClick={onFermer} style={{ minHeight: 40, padding: '0 10px' }}><Icon d={ICONS.close} size={18} /></button>
        </div>

        <div className="fiche-defile" role="radiogroup" aria-label={t('cfg.diff')}>
          {diffs.map((d) => {
            const ouvert = d.v === 5 ? legende : difficulteOuverte(d.v, profile)
            return (
              <button key={d.v} type="button" role="radio" aria-checked={r.d === d.v} className={`pill${d.v === 5 ? ' pill-legende' : ''}`} aria-pressed={r.d === d.v} disabled={!ouvert} onClick={() => maj({ d: d.v })} style={{ flex: 'none', opacity: ouvert ? 1 : 0.45 }}>
                {!ouvert && <Icon d={ICONS.lock} size={14} />}{d.label}
              </button>
            )
          })}
        </div>

        {!carte && !qcmSeul && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['qcm', 'libre'] as const).map((m) => (
              <button key={m} type="button" className="pill" aria-pressed={r.m === m} onClick={() => maj({ m })}>{m === 'qcm' ? t('cfg.qcm') : t('cfg.free')}</button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}><Toggle on={r.chrono} onChange={(v) => maj({ chrono: v })} label={t('cfg.timer')} />{t('cfg.timer')}</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}><Toggle on={r.rapide} onChange={(v) => maj({ rapide: v })} label={fr ? 'Mode rapide' : 'Quick mode'} />{fr ? 'Rapide' : 'Quick'}</label>
        </div>

        <button className="btn btn-p btn-lg" onClick={jouer} autoFocus style={{ width: '100%' }}>{fr ? 'Jouer' : 'Play'} · {diffs.find((d) => d.v === r.d)?.label ?? t('diff.auto')}<Icon d={ICONS.arrowR} /></button>
      </div>
    </div>
  )
}

// Ouvre la fiche d'un quiz depuis n'importe quel écran (la mise en page l'affiche)
export const ouvrirFiche = (id: string) => window.dispatchEvent(new CustomEvent('croivez:fiche', { detail: id }))
