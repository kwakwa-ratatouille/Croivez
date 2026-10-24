import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onValue, ref, remove } from 'firebase/database'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { refuser, rejoindre } from '../duel'
import { ajouterAmi } from '../social'
import { retourFin } from '../retour'

// Invitations reçues, visibles partout dans l'appli : duel, salon, demande d'ami.
// Rangées sous « invitations/<moi> » (chemin déjà ouvert par les règles de la base temps réel).
type Invit = { id: string; de: string; uid?: string; salon?: string; type?: 'ami' }

export default function Invitations() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [liste, setListe] = useState<Invit[]>([])
  const uid = user?.uid
  useEffect(() => {
    if (!uid) return
    let premiere = true
    return onValue(ref(rtdb, `invitations/${uid}`), (s) => {
      const v = (s.val() ?? {}) as Record<string, Omit<Invit, 'id'>>
      const l = Object.entries(v).map(([id, x]) => ({ id, ...x }))
      setListe((avant) => { if (!premiere && l.length > avant.length) retourFin(true); return l })
      premiere = false
    })
  }, [uid])
  if (!uid || !liste.length) return null
  const fermer = (i: Invit) => remove(ref(rtdb, `invitations/${uid}/${i.id}`))
  const accepter = async (i: Invit) => {
    if (i.type === 'ami') { if (i.uid) await ajouterAmi(uid, i.uid); await fermer(i); return }
    if (i.salon) { await fermer(i); nav(`/salon/${i.salon}`); return }
    const ok = await rejoindre(i.id, uid, profile?.pseudo ?? '?')
    if (ok) nav(`/duel/${i.id}`)
  }
  const decliner = async (i: Invit) => { if (i.type === 'ami' || i.salon) await fermer(i); else await refuser(i.id, uid) }
  const deja = (i: Invit) => i.type === 'ami' && !!i.uid && !!profile?.amis?.includes(i.uid)
  return (
    <div className="invitations" role="status" aria-live="polite">
      {liste.slice(0, 3).map((i) => (
        <div key={i.id} className="invitation rise">
          <span className="invitation-emoji">{i.type === 'ami' ? '👋' : i.salon ? '👥' : '⚔️'}</span>
          <span className="invitation-texte">
            <strong>{i.de}</strong>
            <small>{i.type === 'ami' ? (deja(i) ? (fr ? 'est aussi ton ami·e maintenant' : 'is now your friend too') : (fr ? 't’a ajouté·e en ami·e' : 'added you as a friend')) : i.salon ? (fr ? 't’invite dans son salon' : 'invites you to a room') : (fr ? 'te défie en duel !' : 'challenges you to a duel!')}</small>
          </span>
          {deja(i)
            ? <button className="btn btn-g" onClick={() => fermer(i)}>OK</button>
            : <>
              <button className="btn btn-p" onClick={() => accepter(i)}>{i.type === 'ami' ? (fr ? 'Ajouter' : 'Add') : (fr ? 'Jouer' : 'Play')}</button>
              <button className="btn btn-g" aria-label={fr ? 'Refuser' : 'Decline'} onClick={() => decliner(i)}>✕</button>
            </>}
        </div>
      ))}
    </div>
  )
}
