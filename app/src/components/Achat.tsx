import { useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { RARETES, acheterQuiz, rareteDe } from '../progression'
import { useCouverture } from './CarteCouverture'
import Img from './Img'
import Illustration from './Illustration'
import Revelation from './Revelation'
import { ICONS, Icon, Piece } from './ui'

// Achat d'un quiz verrouillé : prix selon la rareté, puis révélation
export default function Achat({ id, onFermer }: { id: string; onFermer: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const src = useCouverture(id)
  const [revele, setRevele] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const t = trouverSousTheme(id)
  if (!t) return null
  if (revele) return <Revelation id={id} onFermer={onFermer} />
  const r = RARETES[rareteDe(id)]
  const solde = profile?.pieces ?? 0
  const assez = solde >= r.prix
  const k = t.famille.k
  return (
    <div className="fiche-fond" onClick={onFermer} role="presentation">
      <div className="fiche" role="dialog" aria-modal="true" aria-label={t.sous.nom[lang]} onClick={(e) => e.stopPropagation()}>
        <div className="fiche-poignee" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ position: 'relative', width: 96, height: 72, borderRadius: 14, overflow: 'hidden', flex: 'none', background: `var(--${k}-t)`, boxShadow: `0 0 0 2px ${r.couleur}` }}>
            {src ? <Img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <Illustration k={k} taille={72} fond={false} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="eyebrow" style={{ color: r.couleur }}>{r.nom[lang]} · {t.famille.nom[lang]}</span>
            <h2 className="t" style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{t.sous.nom[lang]}</h2>
          </div>
          <button className="btn btn-g" aria-label={fr ? 'Fermer' : 'Close'} onClick={onFermer} style={{ minHeight: 40, padding: '0 10px' }}><Icon d={ICONS.close} size={18} /></button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>{fr ? 'Ton solde' : 'Your balance'} : <Piece size={16} /><strong>{solde}</strong></p>
        <button className="btn btn-p btn-lg" disabled={!assez || envoi} style={{ width: '100%' }}
          onClick={async () => { if (!user) return; setEnvoi(true); const ok = await acheterQuiz(user.uid, id).catch(() => false); setEnvoi(false); if (ok) setRevele(true) }}>
          {assez ? (fr ? 'Débloquer' : 'Unlock') : (fr ? `Encore ${r.prix - solde} pièces` : `${r.prix - solde} more coins`)} · <Piece size={18} />{r.prix}
        </button>
      </div>
    </div>
  )
}
