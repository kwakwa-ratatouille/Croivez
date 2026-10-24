import { useEffect, useState } from 'react'
import { usePrefs } from '../i18n'

// « Quoi de neuf ? » : après une mise à jour, la note de la dernière version s'affiche une fois
// (public/nouveautes.json, la plus récente en premier).
type Note = { id: string; titre: string; points: [string, string, string][] }

export default function Nouveautes() {
  const { lang } = usePrefs()
  const [note, setNote] = useState<Note | null>(null)
  useEffect(() => {
    fetch('./nouveautes.json', { cache: 'no-store' }).then((r) => r.json()).then((l: Note[]) => {
      let vue = ''
      try { vue = localStorage.getItem('nouveautesVues') ?? '' } catch { /* stockage indisponible */ }
      if (l[0] && l[0].id !== vue) setNote(l[0])
    }).catch(() => {})
  }, [])
  if (!note) return null
  const fermer = () => { try { localStorage.setItem('nouveautesVues', note.id) } catch { /* stockage indisponible */ } setNote(null) }
  return (
    <div className="caisse-fond" role="dialog" aria-modal="true" aria-label={note.titre} onClick={fermer}>
      <div className="card nouveautes rise" onClick={(e) => e.stopPropagation()}>
        <div className="nouveautes-tete">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.85)' }}>{lang === 'fr' ? 'Quoi de neuf ?' : 'What’s new?'}</span>
          <h2 className="t" style={{ fontSize: 26, fontWeight: 900 }}>{note.titre}</h2>
        </div>
        <ul className="nouveautes-liste">
          {note.points.map(([e, t, d], i) => (
            <li key={t} style={{ animationDelay: `${i * 60}ms` }} className="rise">
              <span className="nouveautes-emoji" aria-hidden="true">{e}</span>
              <span><strong>{t}</strong><small>{d}</small></span>
            </li>
          ))}
        </ul>
        <button className="btn btn-p btn-lg" onClick={fermer} autoFocus style={{ margin: '0 20px 20px' }}>{lang === 'fr' ? 'Génial, on joue !' : 'Great, let’s play!'}</button>
      </div>
    </div>
  )
}
