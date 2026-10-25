import { useEffect, useRef, useState } from 'react'
import { usePrefs } from '../i18n'

// Lien d'écoute frais (ceux de Deezer expirent). JSONP : l'API Deezer n'autorise pas les appels
// directs depuis une page (CORS), mais accepte une réponse sous forme de script.
function lienExtrait(id: string): Promise<string> {
  return new Promise((ok, ko) => {
    const cb = `dz${id}${Date.now()}`
    const s = document.createElement('script')
    const fin = () => { s.remove(); delete (window as unknown as Record<string, unknown>)[cb] }
    ;(window as unknown as Record<string, unknown>)[cb] = (t: { preview?: string }) => { fin(); if (t.preview) ok(t.preview); else ko(new Error('Pas d’extrait')) }
    s.onerror = () => { fin(); ko(new Error('Deezer injoignable')) }
    s.src = `https://api.deezer.com/track/${id}?output=jsonp&callback=${cb}`
    document.head.appendChild(s)
  })
}

export default function Extrait({ id, stop }: { id: string; stop?: boolean }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const audio = useRef<HTMLAudioElement>(null)
  const [src, setSrc] = useState('')
  const [erreur, setErreur] = useState('')
  const [lecture, setLecture] = useState(false)
  const [progres, setProgres] = useState(0)

  useEffect(() => {
    setSrc(''); setErreur(''); setLecture(false); setProgres(0)
    ;(id.startsWith('http') ? Promise.resolve(id) : lienExtrait(id)).then(setSrc).catch(() => setErreur(fr ? 'Extrait indisponible (connexion ?)' : 'Clip unavailable'))
  }, [id, fr])

  // Lecture automatique quand c'est permis (sur iPhone, il faut d'abord un appui sur le bouton)
  useEffect(() => { if (src) audio.current?.play().catch(() => {}) }, [src])
  useEffect(() => { if (stop) audio.current?.pause() }, [stop])

  const basculer = () => { const a = audio.current; if (!a) return; if (a.paused) a.play().catch(() => {}); else a.pause() }

  return (
    <div className="card" style={{ width: '100%', maxWidth: 520, padding: 20, display: 'flex', alignItems: 'center', gap: 18, background: 'var(--mus-t)', borderColor: 'transparent', color: 'var(--mus-i)' }}>
      <button type="button" className="btn btn-p" onClick={basculer} disabled={!src} aria-label={lecture ? 'Pause' : (fr ? 'Écouter' : 'Play')} style={{ width: 64, height: 64, minHeight: 64, padding: 0, borderRadius: '50%' }}>
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" style={{ fill: 'currentColor' }}>{lecture ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}</svg>
      </button>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <strong>{erreur || (src ? (fr ? 'Écoutez l’extrait' : 'Listen to the clip') : (fr ? 'Chargement…' : 'Loading…'))}</strong>
        <div className="bar" style={{ background: 'var(--surface)' }}><span style={{ width: `${progres * 100}%`, background: 'var(--mus)' }} /></div>
      </div>
      {src && <audio ref={audio} src={src} preload="auto" onPlay={() => setLecture(true)} onPause={() => setLecture(false)} onTimeUpdate={(e) => setProgres(e.currentTarget.currentTime / (e.currentTarget.duration || 30))} />}
    </div>
  )
}
