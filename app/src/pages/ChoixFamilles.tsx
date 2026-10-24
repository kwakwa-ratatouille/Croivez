import { useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { FAMILLES } from '../themes'
import { QUIZ_DEPART, choisirQuiz } from '../progression'
import Img from '../components/Img'
import Illustration from '../components/Illustration'
import { useCouverture } from '../components/CarteCouverture'
import { Coche, ICONS, Icon, Logo, Piece } from '../components/ui'

// Petite vignette sélectionnable d'un sous-thème (photo de couverture)
function Vignette({ id, nom, k, pris, grise, onClick }: { id: string; nom: string; k: string; pris: boolean; grise: boolean; onClick: () => void }) {
  const src = useCouverture(id)
  return (
    <button type="button" onClick={onClick} aria-pressed={pris} className="vignette-choix" style={{ ['--k' as string]: `var(--${k})`, ['--kt' as string]: `var(--${k}-t)`, ['--ki' as string]: `var(--${k}-i)`, opacity: grise ? 0.45 : 1 }}>
      <span className="vignette-photo">
        {src ? <Img src={src} alt="" loading="lazy" /> : <Illustration k={k as never} taille={110} fond={false} />}
        {pris && <span className="vignette-coche"><Coche size={22} anim={false} /></span>}
      </span>
      <span className="vignette-nom">{nom}</span>
    </button>
  )
}

// Premier lancement : on choisit ses 6 sous-thèmes de départ, les autres s'achèteront avec des pièces
export default function ChoixFamilles() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user } = useAuth()
  const [choix, setChoix] = useState<string[]>([])
  const [envoi, setEnvoi] = useState(false)
  // Une famille dépliée à la fois : tout se voit en grille, sans défilement horizontal
  const [ouverte, setOuverte] = useState<string | null>(FAMILLES[0].k)
  const complet = choix.length === QUIZ_DEPART

  const basculer = (id: string) => setChoix((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < QUIZ_DEPART ? [...c, id] : c))

  return (
    <div style={{ minHeight: '100%', padding: 'calc(24px + env(safe-area-inset-top)) 16px calc(120px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div className="rise" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: 560 }}>
        <Logo width={64} />
        <h1 className="t" style={{ fontSize: 28, fontWeight: 900 }}>{fr ? 'Choisis tes 6 premiers quiz' : 'Pick your first 6 quizzes'}</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.5, fontSize: 15 }}>
          {fr ? 'Pioche dans toutes les familles. Les autres se débloquent ensuite avec les pièces gagnées en jouant.' : 'Pick from any family. Unlock the others later with the coins you earn.'}
        </p>
      </div>
      {/* Au hasard : 6 quiz de 6 familles différentes (variété garantie) */}
      <button type="button" className="btn btn-s" onClick={() => {
        const familles = [...FAMILLES].sort(() => Math.random() - 0.5).slice(0, QUIZ_DEPART)
        setChoix(familles.map((f) => { const j = f.subs.filter((s) => s.jouable); return j[Math.floor(Math.random() * j.length)].id }))
      }}><Icon d={ICONS.sparkle} size={18} />{fr ? 'Au hasard' : 'Random'}</button>
      <div style={{ width: '100%', maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAMILLES.map((f) => (
          <section key={f.k} className="choix-famille" style={{ ['--k' as string]: `var(--${f.k})`, ['--kt' as string]: `var(--${f.k}-t)`, ['--ki' as string]: `var(--${f.k}-i)` }}>
            <button type="button" className="choix-famille-tete" aria-expanded={ouverte === f.k} onClick={() => setOuverte((o) => (o === f.k ? null : f.k))}>
              <span className="choix-famille-icone"><Icon d={f.icon} size={20} /></span>
              <span className="t" style={{ flex: 1, textAlign: 'left' }}>{f.nom[lang]}</span>
              {(() => { const n = f.subs.filter((s) => choix.includes(s.id)).length; return n > 0 && <span className="chip" style={{ background: 'var(--k)', color: '#fff' }}>{n} ✓</span> })()}
              <span style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>{f.subs.filter((s) => s.jouable).length}</span>
              <Icon d={ICONS.arrowR} size={16} style={{ transform: ouverte === f.k ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {ouverte === f.k && <div className="choix-grille rise">
              {f.subs.filter((s) => s.jouable).map((s) => (
                <Vignette key={s.id} id={s.id} nom={s.nom[lang]} k={f.k} pris={choix.includes(s.id)} grise={complet && !choix.includes(s.id)} onClick={() => basculer(s.id)} />
              ))}
            </div>}
          </section>
        ))}
      </div>
      <div style={{ position: 'fixed', inset: 'auto 0 0 0', zIndex: 5, padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', background: 'var(--bg)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'center' }}>
        <button className="btn btn-p btn-lg" disabled={!complet || envoi} style={{ width: '100%', maxWidth: 480 }}
          onClick={async () => { if (!user) return; setEnvoi(true); await choisirQuiz(user.uid, choix) }}>
          {complet ? (fr ? 'C’est parti !' : 'Let’s go!') : `${choix.length} / ${QUIZ_DEPART}`}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, opacity: .85 }}><Piece size={18} />50 {fr ? 'offertes' : 'free'}</span>
        </button>
      </div>
    </div>
  )
}
