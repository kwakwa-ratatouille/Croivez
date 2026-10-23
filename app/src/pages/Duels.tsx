import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { onValue, ref } from 'firebase/database'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { ajouterAmi, profilsDe, retirerAmi, trouverParPseudo, type ProfilPublic } from '../social'
import { annulerRecherche, chercherAdversaire, inviter, refuser, rejoindre, type Duel } from '../duel'
import { ICONS, Icon, Logo } from '../components/ui'

export default function Duels() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [amis, setAmis] = useState<ProfilPublic[]>([])
  const [invitations, setInvitations] = useState<{ id: string; de: string }[]>([])
  const [pseudo, setPseudo] = useState('')
  const [message, setMessage] = useState('')
  const [recherche, setRecherche] = useState<string | null>(null)
  const [attenteAmi, setAttenteAmi] = useState<string | null>(null)
  const uid = user!.uid
  const moi = profile?.pseudo ?? '?'

  useEffect(() => { profilsDe(profile?.amis ?? []).then(setAmis).catch(console.error) }, [profile?.amis])

  useEffect(() => onValue(ref(rtdb, `invitations/${uid}`), (s) => {
    const v = (s.val() ?? {}) as Record<string, { de: string }>
    setInvitations(Object.entries(v).map(([id, x]) => ({ id, de: x.de })))
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
        <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{fr ? 'Duels' : 'Duels'}</h1>
        <p style={{ fontSize: 17, color: 'var(--muted)' }}>{fr ? '10 questions en temps réel, 15 secondes chacune. Plus vous répondez vite, plus vous marquez.' : '10 real-time questions, 15 seconds each. The faster you answer, the more you score.'}</p>
      </header>

      {invitations.length > 0 && (
        <section className="card rise" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--his-t)', borderColor: 'transparent', color: 'var(--his-i)' }}>
          <span className="eyebrow" style={{ color: 'var(--his-i)' }}>{fr ? 'Invitations' : 'Invitations'}</span>
          {invitations.map((inv) => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <strong style={{ flex: 1 }}>{inv.de} {fr ? 'vous défie !' : 'challenges you!'}</strong>
              <button className="btn btn-p" onClick={async () => { if (await rejoindre(inv.id, uid, moi)) nav(`/duel/${inv.id}`); else setMessage(fr ? 'Ce duel a été annulé.' : 'This duel was cancelled.') }}>{fr ? 'Accepter' : 'Accept'}</button>
              <button className="btn btn-g" style={{ background: 'var(--surface)' }} onClick={() => refuser(inv.id, uid)}>{fr ? 'Refuser' : 'Decline'}</button>
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
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{a.pseudo}</div><div style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Niveau' : 'Level'} {a.niveau}</div></div>
              <button className="btn btn-p" style={{ minHeight: 44 }} onClick={async () => setAttenteAmi(await inviter(uid, moi, a.uid))}>{fr ? 'Défier' : 'Challenge'}</button>
              <button className="btn btn-g" style={{ minHeight: 44, padding: '0 12px' }} aria-label={fr ? 'Retirer' : 'Remove'} onClick={() => retirerAmi(uid, a.uid)}><Icon d={ICONS.close} size={18} /></button>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
