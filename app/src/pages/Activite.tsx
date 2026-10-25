import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { filAmis, reagir, type EvAmi } from '../activite'
import Avatar from '../components/Avatar'
import { ICONS, Icon } from '../components/ui'

const REACTIONS = ['👏', '🔥', '😮', '😂']

// Il y a combien de temps, en clair
function depuis(t: number, fr: boolean) {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 1) return fr ? 'à l’instant' : 'just now'
  if (m < 60) return fr ? `il y a ${m} min` : `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return fr ? `il y a ${h} h` : `${h} h ago`
  const j = Math.round(h / 24)
  return fr ? `il y a ${j} j` : `${j} d ago`
}

// Fil d'activité : les derniers exploits des amis, avec une réaction en un geste
export default function Activite() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [fil, setFil] = useState<EvAmi[] | null>(null)
  const [reagi, setReagi] = useState<Record<string, string>>({})
  const amis = profile?.amis ?? []
  useEffect(() => { filAmis(amis).then(setFil).catch(() => setFil([])) }, [amis.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const cle = (e: EvAmi) => `${e.uid}-${e.t}`
  const envoyer = (e: EvAmi, emoji: string) => {
    if (!user || reagi[cle(e)]) return
    setReagi((r) => ({ ...r, [cle(e)]: emoji }))
    reagir(user.uid, profile?.pseudo ?? '?', e.uid, emoji, e.txt).catch(() => {})
  }
  return (
    <>
      <Link to="/duels" className="lien-retour"><Icon d={ICONS.arrowL} />Multi</Link>
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>📰 {fr ? 'Activité des amis' : 'Friends activity'}</h1>
      {fil === null && <p style={{ color: 'var(--muted)' }}>{fr ? 'Chargement…' : 'Loading…'}</p>}
      {fil?.length === 0 && (
        <div className="card fil-vide">
          <span aria-hidden="true">🌱</span>
          <p>{amis.length ? (fr ? 'Rien pour l’instant : les exploits de tes amis apparaîtront ici dès leur prochaine partie.' : 'Nothing yet.') : (fr ? 'Ajoute des amis dans Multi pour suivre leurs exploits.' : 'Add friends in Multi to follow them.')}</p>
        </div>
      )}
      <ul className="fil">
        {fil?.map((e) => (
          <li key={cle(e)} className="fil-ev card">
            <Link to={`/joueur/${e.uid}`}><Avatar pseudo={e.pseudo} avatar={e.avatar} cadre={e.cadre} taille={42} /></Link>
            <div className="fil-texte">
              <p><strong>{e.pseudo}</strong> {e.txt} <span className="fil-emoji">{e.e}</span></p>
              <small>{depuis(e.t, fr)}</small>
            </div>
            <div className="fil-reactions">
              {reagi[cle(e)]
                ? <span className="fil-reagi">{reagi[cle(e)]}</span>
                : REACTIONS.map((r) => <button key={r} type="button" aria-label={r} onClick={() => envoyer(e, r)}>{r}</button>)}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
