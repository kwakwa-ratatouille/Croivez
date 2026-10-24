import { useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { COFFRES, etatHebdo, ouvrirCoffre } from '../hebdo'
import { retourFin } from '../retour'
import { Piece } from './ui'

// Barre de la semaine : 7 cases (une par quiz du jour réussi), coffres à 3, 5 et 7 jours
export default function SerieHebdo() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [envoi, setEnvoi] = useState(0)
  const e = etatHebdo(profile)
  const n = e.jours.length
  return (
    <section className="hebdo">
      <div className="hebdo-tete"><strong className="t">🏆 {fr ? 'Série de la semaine' : 'Weekly streak'}</strong><small>{n} / 7 {fr ? 'quiz du jour' : 'daily quizzes'}</small></div>
      <div className="hebdo-barre">
        {Array.from({ length: 7 }, (_, i) => <span key={i} className={i < n ? 'fait' : ''} />)}
        {COFFRES.map((c) => {
          const pret = n >= c.jours && !e.coffres.includes(c.jours)
          const pris = e.coffres.includes(c.jours)
          return (
            <button key={c.jours} type="button" className={`hebdo-coffre${pret ? ' pret' : ''}${pris ? ' pris' : ''}`} style={{ left: `calc(${(c.jours / 7) * 100}% - 18px)` }} disabled={!pret || envoi === c.jours}
              title={`${c.pieces} ${fr ? 'pièces' : 'coins'} · ${c.xp} XP`}
              onClick={async () => { if (!user) return; setEnvoi(c.jours); if (await ouvrirCoffre(user.uid, c.jours).catch(() => false)) retourFin(true); setEnvoi(0) }}>
              {pris ? '✅' : '🎁'}
            </button>
          )
        })}
      </div>
      <div className="hebdo-gains">{COFFRES.map((c) => <span key={c.jours}>{c.jours} {fr ? 'j' : 'd'} : <Piece size={12} />{c.pieces} · {c.xp} XP</span>)}</div>
    </section>
  )
}
