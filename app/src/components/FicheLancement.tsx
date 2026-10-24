import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { PRIX_SAUT, difficulteOuverte, legendeOuverte, plafonner, progresLegende, reussie, sauterDifficulte } from '../progression'
import type { Difficulte } from '../quiz/engine'
import { FORMATS, type Format } from '../quiz/formats'
import { lirePrefsJeu } from '../prefsJeu'

import Illustration from './Illustration'
import { ICONS, Icon, Piece, Toggle } from './ui'

// Derniers réglages : la fiche se rouvre comme on l'a laissée
type Reglages = { d: Difficulte; m: Format; rapide: boolean; chrono: boolean }
// Par défaut : les réglages de Paramètres → Partie
const lire = (): Omit<Reglages, 'd'> => { const p = lirePrefsJeu(); const def = { m: p.m, rapide: p.rapide, chrono: p.chrono }; try { const v = { ...def, ...JSON.parse(localStorage.getItem('reglages') ?? '{}') }; return { m: FORMATS.some((x) => x.v === v.m) ? v.m : 'auto', rapide: v.rapide, chrono: v.chrono } } catch { return def } }

// Fiche rapide : un quiz se lance en deux appuis (le quiz, puis « Jouer »), réglages à portée de pouce
export default function FicheLancement({ id, onFermer }: { id: string; onFermer: () => void }) {
  const { t, lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const trouve = trouverSousTheme(id)
  // Par défaut : la plus haute difficulté ouverte de ce quiz, format auto
  const [r, setR] = useState<Reglages>(() => ({ ...lire(), d: plafonner(4, profile, id) }))
  const [msg, setMsg] = useState('')
  const [options, setOptions] = useState(false)
  if (!trouve) return null
  const { famille, sous } = trouve
  const k = famille.k
  const carte = id.startsWith('villes')
  const qcmSeul = id === 'drapeaux-inverse'
  const legende = legendeOuverte(k, profile)
  const diffs: { v: Difficulte; label: string }[] = [
    { v: 1, label: t('diff.1') }, { v: 2, label: t('diff.2') }, { v: 3, label: t('diff.3') }, { v: 4, label: t('diff.4') },
    { v: 5 as Difficulte, label: fr ? 'Légende' : 'Legend' },
  ]
  // Première difficulté fermée (1 à 4) : on peut la sauter pour 100 pièces, jamais la Légende
  const verrou = ([2, 3, 4] as const).find((d) => !difficulteOuverte(d, profile, id)) ?? 0
  const maj = (x: Partial<Reglages>) => setR((v) => ({ ...v, ...x }))

  const jouer = () => {
    try { localStorage.setItem('reglages', JSON.stringify(r)) } catch { /* stockage indisponible */ }
    const m = carte ? 'libre' : qcmSeul ? 'qcm' : r.m
    const d = difficulteOuverte(r.d, profile, id) ? r.d : 0
    const p = lirePrefsJeu()
    nav(`/partie?s=${id}&m=${m}&n=${p.n}&d=${d}&t=${r.chrono ? p.duree : 0}${r.rapide ? '&r=1' : ''}`)
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

        <div className="fiche-diffs" role="radiogroup" aria-label={t('cfg.diff')}>
          {diffs.map((d) => {
            const ouvert = d.v === 5 ? legende : difficulteOuverte(d.v, profile, id)
            return (
              <button key={d.v} type="button" role="radio" aria-checked={r.d === d.v} className={`pill${d.v === 5 ? ' pill-legende' : ''}`} aria-pressed={r.d === d.v} disabled={!ouvert} onClick={() => maj({ d: d.v })} style={{ opacity: ouvert ? 1 : 0.5 }}>
                {!ouvert && <Icon d={ICONS.lock} size={14} />}{reussie(d.v, profile, id) && <span aria-label={fr ? 'réussi' : 'passed'}>✓</span>}{d.label}
              </button>
            )
          })}
        </div>

        {!legende && (() => { const pl = progresLegende(k, profile); return <p className="fiche-legende"><Icon d={ICONS.lock} size={14} />{fr ? `Légende : la difficulté ultime (pièges partout, 6 choix, 12 s). Elle s’ouvre sur toute la famille quand chaque quiz a ses 4 niveaux réussis : ${pl.faits} / ${pl.total}.` : `Legend: the ultimate level. Unlocks for the whole family once every quiz has its 4 levels passed: ${pl.faits} / ${pl.total}.`}</p> })()}

        {verrou > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
            <span style={{ flex: 1 }}>{fr ? `Sans-faute en ${diffs.find((x) => x.v === verrou - 1)?.label} (ou plus haut) pour ouvrir ${diffs.find((x) => x.v === verrou)?.label}` : `Perfect run on ${diffs.find((x) => x.v === verrou - 1)?.label} to unlock ${diffs.find((x) => x.v === verrou)?.label}`}</span>
            <button type="button" className="btn btn-s" onClick={async () => { if (!user) return; const ok = await sauterDifficulte(user.uid, id, verrou).catch(() => false); if (ok) maj({ d: verrou as Difficulte }); else setMsg(fr ? `Il faut ${PRIX_SAUT} pièces.` : `You need ${PRIX_SAUT} coins.`) }}>{fr ? 'Sauter' : 'Skip'} · <Piece size={15} />{PRIX_SAUT}</button>
            {msg && <span role="status" style={{ flexBasis: '100%', color: 'var(--ko-i)' }}>{msg}</span>}
          </div>
        )}

        <button type="button" className="fiche-options" aria-expanded={options} onClick={() => setOptions((o) => !o)}>
          <span>{fr ? 'Options' : 'Options'}</span>
          <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{FORMATS.find((x) => x.v === r.m)?.[lang]}{r.chrono ? ' · chrono' : ''}{r.rapide ? (fr ? ' · rapide' : ' · quick') : ''}</span>
          <Icon d={ICONS.arrowR} size={16} style={{ transform: options ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {options && !carte && !qcmSeul && (
          <div className="fiche-grille" role="radiogroup" aria-label={fr ? 'Format de réponse' : 'Answer format'}>
            {FORMATS.map((x) => (
              <button key={x.v} type="button" role="radio" aria-checked={r.m === x.v} className="pill" aria-pressed={r.m === x.v} onClick={() => maj({ m: x.v })}>{x[lang]}</button>
            ))}
          </div>
        )}

        {options && <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}><Toggle on={r.chrono} onChange={(v) => maj({ chrono: v })} label={t('cfg.timer')} />{t('cfg.timer')}</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}><Toggle on={r.rapide} onChange={(v) => maj({ rapide: v })} label={fr ? 'Mode rapide' : 'Quick mode'} />{fr ? 'Rapide' : 'Quick'}</label>
        </div>}

        <button className="btn btn-p btn-lg" onClick={jouer} autoFocus style={{ width: '100%' }}>{fr ? 'Jouer' : 'Play'} · {diffs.find((d) => d.v === r.d)?.label ?? t('diff.auto')}<Icon d={ICONS.arrowR} /></button>
      </div>
    </div>
  )
}

// Ouvre la fiche d'un quiz depuis n'importe quel écran (la mise en page l'affiche)
export const ouvrirFiche = (id: string) => window.dispatchEvent(new CustomEvent('croivez:fiche', { detail: id }))
