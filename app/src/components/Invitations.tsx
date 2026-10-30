import { ecouterAppuiNotif, notifierInvitation } from '../rappels'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onValue, ref, remove } from 'firebase/database'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { refuser, rejoindre } from '../duel'
import { accepterAmi, ajouterAmi } from '../social'
import { rejoindreClan } from '../clans'
import { retourNotif } from '../retour'
import { choukyDe } from '../chouky'
import Chouky from './Chouky'

// Invitations reçues, visibles partout dans l'appli : duel, salon, demande d'ami.
// Rangées sous « invitations/<moi> » (chemin déjà ouvert par les règles de la base temps réel).
type Invit = { id: string; de: string; t?: number; uid?: string; salon?: string; type?: 'ami' | 'ami-ok' | 'defi' | 'defi-res' | 'reaction' | 'clan' | 'msg' | 'jour'; code?: string; nom?: string; url?: string; quiz?: string; bonnes?: number; total?: number; gagne?: boolean | null; emoji?: string; txt?: string }

export default function Invitations() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [liste, setListe] = useState<Invit[]>([])
  const [pop, setPop] = useState<Invit | null>(null) // grande fenêtre « X te lance un duel ! »
  const uid = user?.uid
  // Duel en direct (ni type ni salon) ou défi en différé
  const estDuel = (x: Invit) => (!x.type && !x.salon) || x.type === 'defi'
  useEffect(() => { ecouterAppuiNotif((l) => nav(l)).catch(() => {}) }, [nav])
  useEffect(() => {
    if (!uid) return
    let premiere = true
    return onValue(ref(rtdb, `invitations/${uid}`), (s) => {
      const v = (s.val() ?? {}) as Record<string, Omit<Invit, 'id'>>
      const l = Object.entries(v).map(([id, x]) => ({ id, ...x }))
      for (const x of l) if (x.type === 'ami-ok' && x.uid) ajouterAmi(uid, x.uid).catch(() => {})
      // À l'ouverture : un duel en direct reçu il y a moins de 10 min s'affiche en grand
      if (premiere) { const d = l.filter((x) => !x.type && !x.salon && Date.now() - (x.t ?? 0) < 600_000).sort((a, b) => (b.t ?? 0) - (a.t ?? 0))[0]; if (d) setPop(d) }
      setPop((p) => (p && !l.some((x) => x.id === p.id) ? null : p))
      setListe((avant) => {
        const nouveau = l.find((x) => !avant.some((y) => y.id === x.id))
        if (!premiere && nouveau && estDuel(nouveau)) setPop(nouveau)
        if (!premiere && l.length > avant.length) {
          retourNotif()
          // Appli en arrière-plan : notification sur le téléphone
          const n = l.find((x) => !avant.some((y) => y.id === x.id))
          if (n) notifierInvitation(n.type === 'jour' ? `🗓️ ${n.de}` : n.type === 'msg' ? `💬 ${n.de}` : n.type === 'clan' ? '🛡️ Clan' : n.type === 'ami-ok' ? '🎉 Nouvel ami' : n.type === 'ami' ? '👋 Demande d’ami' : n.salon ? '👥 Invitation' : '⚔️ Duel !', n.type === 'jour' ? `te défie au quiz du jour${n.total ? ` : ${n.bonnes}/${n.total} à battre` : ''}` : n.type === 'msg' ? (n.txt ?? '') : `${n.de} ${n.type === 'clan' ? `t’invite dans son clan « ${n.nom} »` : n.type === 'ami-ok' ? 'a accepté ta demande' : n.type === 'ami' ? 'veut être ton ami·e' : n.salon ? 't’invite dans son salon' : 'te défie en duel !'}`, n.type === 'defi' ? n.url : estDuel(n) ? '/duels' : undefined).catch(() => {})
        }
        return l
      })
      premiere = false
    })
  }, [uid])
  if (!uid || !liste.length) return null
  const fenetre = pop && liste.some((x) => x.id === pop.id) ? pop : null
  const fermer = (i: Invit) => remove(ref(rtdb, `invitations/${uid}/${i.id}`))
  const accepter = async (i: Invit) => {
    if (i.type === 'ami') { if (i.uid) await accepterAmi(uid, profile?.pseudo ?? '?', i.uid); await fermer(i); return }
    if (i.type === 'ami-ok' || i.type === 'defi-res' || i.type === 'reaction') { await fermer(i); return }
    if (i.type === 'defi') { await fermer(i); if (i.url) nav(i.url); return }
    if (i.type === 'msg') { nav(`/amis?chat=${i.uid}`); return }
    if (i.type === 'jour') { await fermer(i); nav('/jour'); return }
    if (i.type === 'clan' && i.code) {
      const r = await rejoindreClan(uid, { pseudo: profile?.pseudo ?? '?', depuis: Date.now(), ...(profile?.avatar ? { avatar: profile.avatar } : {}), ...(profile?.cadre ? { cadre: profile.cadre } : {}) }, i.code, true).catch(() => 'introuvable' as const)
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
    <>
    {fenetre && (
      <div className="fiche-voile" onClick={() => setPop(null)}>
        <div className="card duel-pop rise" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <span className="duel-pop-epees" aria-hidden="true">⚔️</span>
          <Chouky taille={110} {...choukyDe(profile)} humeur="fier" />
          <strong className="t">{fr ? `${fenetre.de} te lance un duel !` : `${fenetre.de} challenges you!`}</strong>
          <p>{fenetre.type === 'defi' ? (fr ? `Bats son ${fenetre.bonnes}/${fenetre.total} en ${fenetre.quiz}, quand tu veux.` : `Beat ${fenetre.bonnes}/${fenetre.total}.`) : (fr ? 'Il ou elle t’attend en direct : vous jouez en même temps.' : 'They are waiting for you live.')}</p>
          <div className="duel-pop-boutons">
            <button className="btn btn-g btn-lg" onClick={() => { setPop(null); decliner(fenetre) }}>{fr ? 'Refuser' : 'Decline'}</button>
            <button className="btn btn-p btn-lg" onClick={() => { setPop(null); accepter(fenetre) }}>⚔️ {fr ? 'Accepter' : 'Accept'}</button>
          </div>
          <button type="button" className="duel-pop-plus-tard" onClick={() => setPop(null)}>{fr ? 'Plus tard' : 'Later'}</button>
        </div>
      </div>
    )}
    <div className="invitations" role="status" aria-live="polite">
      {liste.slice(0, 3).map((i) => (
        <div key={i.id} className="invitation rise">
          <span className="invitation-emoji">{i.type === 'jour' ? '🗓️' : i.type === 'msg' ? '💬' : i.type === 'clan' ? '🛡️' : i.type === 'reaction' ? i.emoji : i.type === 'defi' ? '🎯' : i.type === 'defi-res' ? (i.gagne ? '😤' : i.gagne === false ? '🏆' : '🤝') : i.type === 'ami-ok' ? '🎉' : i.type === 'ami' ? '👋' : i.salon ? '👥' : '⚔️'}</span>
          <span className="invitation-texte">
            <strong>{i.de}</strong>
            <small>{i.type === 'jour' ? (fr ? `te défie au quiz du jour (${i.txt})${i.total ? ` : ${i.bonnes}/${i.total} à battre` : ''}` : `daily quiz challenge${i.total ? `: beat ${i.bonnes}/${i.total}` : ''}`) : i.type === 'msg' ? `« ${i.txt ?? ''} »` : i.type === 'clan' ? (fr ? `t’invite dans son clan « ${i.nom} »` : `invites you to clan ${i.nom}`) : i.type === 'reaction' ? (fr ? `a réagi ${i.emoji} : « ${i.txt} »` : `reacted ${i.emoji}`) : i.type === 'defi' ? (fr ? `te défie : bats son ${i.bonnes}/${i.total} en ${i.quiz} !` : `challenges you: beat ${i.bonnes}/${i.total}!`) : i.type === 'defi-res' ? (fr ? (i.gagne ? `a battu ton score (${i.bonnes}/${i.total})` : i.gagne === false ? `n’a pas battu ton score (${i.bonnes}/${i.total}) 🏆` : `fait jeu égal avec toi (${i.bonnes}/${i.total})`) : `${i.bonnes}/${i.total}`) : i.type === 'ami-ok' ? (fr ? 'a accepté ta demande : vous êtes amis ! 🎉' : 'accepted: you are friends! 🎉') : i.type === 'ami' ? (deja(i) ? (fr ? 'est aussi ton ami·e maintenant' : 'is now your friend too') : (fr ? 'veut être ton ami·e' : 'wants to be your friend')) : i.salon ? (fr ? 't’invite dans son salon' : 'invites you to a room') : (fr ? 'te défie en duel !' : 'challenges you to a duel!')}</small>
          </span>
          {deja(i)
            ? <button className="btn btn-g" onClick={() => fermer(i)}>OK</button>
            : <>
              <button className="btn btn-p" onClick={() => accepter(i)}>{i.type === 'jour' ? (fr ? 'Jouer' : 'Play') : i.type === 'msg' ? (fr ? 'Répondre' : 'Reply') : i.type === 'ami' ? (fr ? 'Accepter' : 'Accept') : i.type === 'clan' ? (fr ? 'Rejoindre' : 'Join') : i.type === 'defi' ? (fr ? 'Relever' : 'Accept') : (fr ? 'Jouer' : 'Play')}</button>
              <button className="btn btn-g" aria-label={fr ? 'Refuser' : 'Decline'} onClick={() => decliner(i)}>✕</button>
            </>}
        </div>
      ))}
    </div>
    </>
  )
}
