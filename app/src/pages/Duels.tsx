import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { onValue, ref, remove } from 'firebase/database'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { ajouterAmi, profilsDe, retirerAmi, trouverParPseudo, type ProfilPublic } from '../social'
import { annulerRecherche, chercherAdversaire, inviter, refuser, rejoindre, type Duel } from '../duel'
import { ICONS, Icon, Logo } from '../components/ui'
import { MAX_JOUEURS, creerSalon, normaliserCode, rejoindreSalon } from '../salon'

export default function Duels() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [amis, setAmis] = useState<ProfilPublic[]>([])
  const [invitations, setInvitations] = useState<{ id: string; de: string; salon?: string }[]>([])
  const [codeSalon, setCodeSalon] = useState('')
  const [msgSalon, setMsgSalon] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [message, setMessage] = useState('')
  const [recherche, setRecherche] = useState<string | null>(null)
  const [attenteAmi, setAttenteAmi] = useState<string | null>(null)
  const uid = user!.uid
  const moi = profile?.pseudo ?? '?'

  useEffect(() => { profilsDe(profile?.amis ?? []).then(setAmis).catch(console.error) }, [profile?.amis])

  useEffect(() => onValue(ref(rtdb, `invitations/${uid}`), (s) => {
    const v = (s.val() ?? {}) as Record<string, { de: string; salon?: string }>
    setInvitations(Object.entries(v).map(([id, x]) => ({ id, de: x.de, salon: x.salon })))
  }), [uid])

  // Dès que l'adversaire rejoint (recherche ou invitation), on part au duel
  const enAttente = recherche ?? attenteAmi
  useEffect(() => {
    if (!enAttente) return
    return onValue(ref(rtdb, `duels/${enAttente}`), (s) => {
      const d = s.val() as Duel | null
      if (d?.etat === 'jeu') nav(`/duel/${enAttente}`)
      if (d?.etat === 'fini') { setAttenteAmi(null); setMessage(fr ? 'Invitation refusée.' : 'Invitation declined.') }
    })
  }, [enAttente, nav, fr])

  const ajouter = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    const p = await trouverParPseudo(pseudo)
    if (!p) return setMessage(fr ? 'Aucun joueur avec ce pseudo.' : 'No player with this username.')
    if (p.uid === uid) return setMessage(fr ? 'C’est vous !' : 'That’s you!')
    await ajouterAmi(uid, p.uid)
    setPseudo('')
    setMessage(fr ? `${p.pseudo} ajouté à vos amis.` : `${p.pseudo} added to your friends.`)
  }

  if (enAttente) {
    return (
      <section className="card rise" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center', maxWidth: 560, margin: '40px auto' }}>
        <div className="attente"><Logo width={110} /></div>
        <h1 className="t" style={{ fontSize: 28, fontWeight: 900 }}>{recherche ? (fr ? 'Recherche d’un adversaire…' : 'Looking for an opponent…') : (fr ? 'En attente de votre ami…' : 'Waiting for your friend…')}</h1>
        <p style={{ color: 'var(--muted)' }}>{fr ? 'Le duel démarre dès qu’il rejoint.' : 'The duel starts as soon as they join.'}</p>
        <button className="btn btn-g" onClick={async () => { if (recherche) await annulerRecherche(uid, recherche); else if (attenteAmi) await refuser(attenteAmi, uid); setRecherche(null); setAttenteAmi(null) }}>{fr ? 'Annuler' : 'Cancel'}</button>
      </section>
    )
  }

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{fr ? 'Multijoueur' : 'Multiplayer'}</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)' }}>{fr ? 'Joue en direct avec tes amis : un salon jusqu’à 12 joueurs, ou un duel en face à face.' : 'Play live with friends: a room for up to 12, or a one-on-one duel.'}</p>
      </header>

      {/* Salon : la grande nouveauté, mise en avant */}
      <section className="card salon-accueil rise">
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="eyebrow" style={{ color: 'inherit', opacity: .85 }}>{fr ? `Jusqu’à ${MAX_JOUEURS} joueurs` : `Up to ${MAX_JOUEURS} players`}</span>
          <h2 className="t" style={{ fontSize: 26, fontWeight: 900 }}>{fr ? 'Salon entre amis' : 'Room with friends'}</h2>
          <p style={{ opacity: .9 }}>{fr ? 'Crée un salon, partage le code, et tout le monde répond aux mêmes questions en même temps. Classement en direct après chaque question.' : 'Create a room, share the code, everyone answers the same questions at once.'}</p>
          <button className="btn salon-creer" onClick={async () => { setMsgSalon(''); try { nav(`/salon/${await creerSalon({ uid, pseudo: moi, avatar: profile?.avatar, cadre: profile?.cadre })}`) } catch { setMsgSalon(fr ? 'Impossible de créer le salon (connexion ?).' : 'Could not create the room.') } }}>{fr ? 'Créer un salon' : 'Create a room'}<Icon d={ICONS.arrowR} /></button>
        </div>
        <form className="salon-rejoindre" onSubmit={async (e) => {
          e.preventDefault(); setMsgSalon('')
          const c = normaliserCode(codeSalon)
          if (c.length !== 5) return setMsgSalon(fr ? 'Le code fait 5 caractères.' : 'Codes are 5 characters.')
          const r = await rejoindreSalon(c, { uid, pseudo: moi, avatar: profile?.avatar, cadre: profile?.cadre })
          if (r === 'ok') nav(`/salon/${c}`)
          else setMsgSalon(r === 'introuvable' ? (fr ? 'Aucun salon avec ce code.' : 'No room with this code.') : r === 'plein' ? (fr ? 'Ce salon est complet.' : 'This room is full.') : (fr ? 'La partie a déjà commencé.' : 'The game has started.'))
        }}>
          <label htmlFor="code-salon" style={{ fontWeight: 800 }}>{fr ? 'Rejoindre avec un code' : 'Join with a code'}</label>
          <input id="code-salon" className="input t" value={codeSalon} onChange={(e) => setCodeSalon(normaliserCode(e.target.value))} placeholder="ABCDE" autoComplete="off" autoCapitalize="characters" style={{ fontSize: 26, fontWeight: 900, letterSpacing: 8, textAlign: 'center' }} />
          <button className="btn btn-p">{fr ? 'Rejoindre' : 'Join'}</button>
          {msgSalon && <p role="status" style={{ fontSize: 14, fontWeight: 700 }}>{msgSalon}</p>}
        </form>
      </section>
      <h2 className="t" style={{ fontSize: 22, fontWeight: 900 }}>{fr ? 'Duels en face à face' : 'One-on-one duels'}</h2>

      {invitations.length > 0 && (
        <section className="card rise" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--his-t)', borderColor: 'transparent', color: 'var(--his-i)' }}>
          <span className="eyebrow" style={{ color: 'var(--his-i)' }}>{fr ? 'Invitations' : 'Invitations'}</span>
          {invitations.map((inv) => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <strong style={{ flex: 1 }}>{inv.de} {inv.salon ? (fr ? `t’invite dans son salon (${inv.salon})` : `invites you to room ${inv.salon}`) : (fr ? 'vous défie !' : 'challenges you!')}</strong>
              <button className="btn btn-p" onClick={async () => { if (inv.salon) { await refuser(inv.id, uid).catch(() => {}); nav(`/salon/${inv.salon}`); return } if (await rejoindre(inv.id, uid, moi)) nav(`/duel/${inv.id}`); else setMessage(fr ? 'Ce duel a été annulé.' : 'This duel was cancelled.') }}>{fr ? 'Accepter' : 'Accept'}</button>
              <button className="btn btn-g" style={{ background: 'var(--surface)' }} onClick={() => (inv.salon ? remove(ref(rtdb, `invitations/${uid}/${inv.id}`)) : refuser(inv.id, uid))}>{fr ? 'Refuser' : 'Decline'}</button>
            </div>
          ))}
        </section>
      )}

      <div className="grid-auto">
        <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--mus-t)', borderColor: 'transparent', color: 'var(--mus-i)' }}>
          <Icon d={ICONS.duels} size={34} />
          <h2 className="t" style={{ fontSize: 24, fontWeight: 800 }}>{fr ? 'Adversaire au hasard' : 'Random opponent'}</h2>
          <p>{fr ? 'Affrontez le premier joueur disponible.' : 'Face the first available player.'}</p>
          <button className="btn btn-p" style={{ alignSelf: 'flex-start' }} onClick={async () => setRecherche(await chercherAdversaire(uid, moi))}>{fr ? 'Chercher' : 'Search'}<Icon d={ICONS.arrowR} /></button>
        </section>

        <section className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 className="t" style={{ fontSize: 22, fontWeight: 800 }}>{fr ? 'Vos amis' : 'Your friends'}</h2>
          <form onSubmit={ajouter} style={{ display: 'flex', gap: 10 }}>
            <label htmlFor="ami" className="sr">{fr ? 'Pseudo de l’ami' : 'Friend’s username'}</label>
            <input id="ami" className="input" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder={fr ? 'Ajouter par pseudo…' : 'Add by username…'} style={{ minHeight: 48 }} />
            <button className="btn btn-s" style={{ minHeight: 48 }}>{fr ? 'Ajouter' : 'Add'}</button>
          </form>
          {message && <p role="status" style={{ fontSize: 14, color: 'var(--muted)' }}>{message}</p>}
          {amis.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 15 }}>{fr ? `Partagez votre pseudo « ${moi} » pour qu’on vous ajoute.` : `Share your username “${moi}” so friends can add you.`}</p>}
          {amis.map((a) => (
            <div key={a.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 16, background: 'var(--surface2)' }}>
              <span className="t" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--geo-t)', color: 'var(--geo-i)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{a.pseudo[0]?.toUpperCase()}</span>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => nav(`/joueur/${a.uid}`)}><div style={{ fontWeight: 700 }}>{a.pseudo}</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Niveau' : 'Level'} {a.niveau}</div></div>
              <button className="btn btn-p" style={{ minHeight: 44 }} onClick={async () => setAttenteAmi(await inviter(uid, moi, a.uid))}>{fr ? 'Défier' : 'Challenge'}</button>
              <button className="btn btn-g" style={{ minHeight: 44, padding: '0 12px' }} aria-label={fr ? 'Retirer' : 'Remove'} onClick={() => retirerAmi(uid, a.uid)}><Icon d={ICONS.close} size={18} /></button>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
