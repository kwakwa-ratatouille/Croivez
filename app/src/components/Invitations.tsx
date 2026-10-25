import { notifierInvitation } from '../rappels'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onValue, ref, remove } from 'firebase/database'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { refuser, rejoindre } from '../duel'
import { accepterAmi, ajouterAmi } from '../social'
import { rejoindreClan } from '../clans'
import { retourFin } from '../retour'

// Invitations reçues, visibles partout dans l'appli : duel, salon, demande d'ami.
// Rangées sous « invitations/<moi> » (chemin déjà ouvert par les règles de la base temps réel).
type Invit = { id: string; de: string; uid?: string; salon?: string; type?: 'ami' | 'ami-ok' | 'defi' | 'defi-res' | 'reaction' | 'clan'; code?: string; nom?: string; url?: string; quiz?: string; bonnes?: number; total?: number; gagne?: boolean | null; emoji?: string; txt?: string }

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
      for (const x of l) if (x.type === 'ami-ok' && x.uid) ajouterAmi(uid, x.uid).catch(() => {})
      setListe((avant) => {
        if (!premiere && l.length > avant.length) {
          retourFin(true)
          // Appli en arrière-plan : notification sur le téléphone
          const n = l.find((x) => !avant.some((y) => y.id === x.id))
          if (n) notifierInvitation(n.type === 'clan' ? '🛡️ Clan' : n.type === 'ami-ok' ? '🎉 Nouvel ami' : n.type === 'ami' ? '👋 Demande d’ami' : n.salon ? '👥 Invitation' : '⚔️ Duel !', `${n.de} ${n.type === 'clan' ? `t’invite dans son clan « ${n.nom} »` : n.type === 'ami-ok' ? 'a accepté ta demande' : n.type === 'ami' ? 'veut être ton ami·e' : n.salon ? 't’invite dans son salon' : 'te défie en duel !'}`).catch(() => {})
        }
        return l
      })
      premiere = false
    })
  }, [uid])
  if (!uid || !liste.length) return null
  const fermer = (i: Invit) => remove(ref(rtdb, `invitations/${uid}/${i.id}`))
  const accepter = async (i: Invit) => {
    if (i.type === 'ami') { if (i.uid) await accepterAmi(uid, profile?.pseudo ?? '?', i.uid); await fermer(i); return }
    if (i.type === 'ami-ok' || i.type === 'defi-res' || i.type === 'reaction') { await fermer(i); return }
    if (i.type === 'defi') { await fermer(i); if (i.url) nav(i.url); return }
    if (i.type === 'clan' && i.code) {
      const r = await rejoindreClan(uid, { pseudo: profile?.pseudo ?? '?', depuis: Date.now(), ...(profile?.avatar ? { avatar: profile.avatar } : {}), ...(profile?.cadre ? { cadre: profile.cadre } : {}) }, i.code).catch(() => 'introuvable' as const)
      await fermer(i)
      if (r === 'ok') nav('/clan')
      return
    }
    if (i.salon) { await fermer(i); nav(`/salon/${i.salon}`); return }
    const ok = await rejoindre(i.id, uid, profile?.pseudo ?? '?')
    if (ok) nav(`/duel/${i.id}`)
  }
  const decliner = async (i: Invit) => { if (i.type || i.salon) await fermer(i); else await refuser(i.id, uid) }
  const deja = (i: Invit) => i.type === 'ami-ok' || i.type === 'defi-res' || i.type === 'reaction' || (i.type === 'ami' && !!i.uid && !!profile?.amis?.includes(i.uid))
  return (
    <div className="invitations" role="status" aria-live="polite">
      {liste.slice(0, 3).map((i) => (
        <div key={i.id} className="invitation rise">
          <span className="invitation-emoji">{i.type === 'clan' ? '🛡️' : i.type === 'reaction' ? i.emoji : i.type === 'defi' ? '🎯' : i.type === 'defi-res' ? (i.gagne ? '😤' : i.gagne === false ? '🏆' : '🤝') : i.type === 'ami-ok' ? '🎉' : i.type === 'ami' ? '👋' : i.salon ? '👥' : '⚔️'}</span>
          <span className="invitation-texte">
            <strong>{i.de}</strong>
            <small>{i.type === 'clan' ? (fr ? `t’invite dans son clan « ${i.nom} »` : `invites you to clan ${i.nom}`) : i.type === 'reaction' ? (fr ? `a réagi ${i.emoji} : « ${i.txt} »` : `reacted ${i.emoji}`) : i.type === 'defi' ? (fr ? `te défie : bats son ${i.bonnes}/${i.total} en ${i.quiz} !` : `challenges you: beat ${i.bonnes}/${i.total}!`) : i.type === 'defi-res' ? (fr ? (i.gagne ? `a battu ton score (${i.bonnes}/${i.total})` : i.gagne === false ? `n’a pas battu ton score (${i.bonnes}/${i.total}) 🏆` : `fait jeu égal avec toi (${i.bonnes}/${i.total})`) : `${i.bonnes}/${i.total}`) : i.type === 'ami-ok' ? (fr ? 'a accepté ta demande : vous êtes amis ! 🎉' : 'accepted: you are friends! 🎉') : i.type === 'ami' ? (deja(i) ? (fr ? 'est aussi ton ami·e maintenant' : 'is now your friend too') : (fr ? 'veut être ton ami·e' : 'wants to be your friend')) : i.salon ? (fr ? 't’invite dans son salon' : 'invites you to a room') : (fr ? 'te défie en duel !' : 'challenges you to a duel!')}</small>
          </span>
          {deja(i)
            ? <button className="btn btn-g" onClick={() => fermer(i)}>OK</button>
            : <>
              <button className="btn btn-p" onClick={() => accepter(i)}>{i.type === 'ami' ? (fr ? 'Accepter' : 'Accept') : i.type === 'clan' ? (fr ? 'Rejoindre' : 'Join') : i.type === 'defi' ? (fr ? 'Relever' : 'Accept') : (fr ? 'Jouer' : 'Play')}</button>
              <button className="btn btn-g" aria-label={fr ? 'Refuser' : 'Decline'} onClick={() => decliner(i)}>✕</button>
            </>}
        </div>
      ))}
    </div>
  )
}
