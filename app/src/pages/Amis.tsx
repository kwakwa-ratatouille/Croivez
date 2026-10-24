import AjoutAmi from '../components/AjoutAmi'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { profilsDe, retirerAmi, type ProfilPublic } from '../social'
import { inviter } from '../duel'
import { creerSalon, inviterAuSalon } from '../salon'
import { ecouterMessages, envoyerMessage, type Message } from '../chat'
import Avatar from '../components/Avatar'
import { ICONS, Icon } from '../components/ui'

// Amis : ajout par pseudo, liste, messages, défi en duel ou invitation dans un salon
export default function Amis() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const uid = auth.currentUser?.uid ?? ''
  const nav = useNavigate()
  const [amis, setAmis] = useState<ProfilPublic[]>([])
  const [ouvert, setOuvert] = useState<ProfilPublic | null>(null)
  const [copie, setCopie] = useState(false)
  const [aRetirer, setARetirer] = useState<ProfilPublic | null>(null)
  useEffect(() => { profilsDe(profile?.amis ?? []).then(setAmis).catch(() => setAmis([])) }, [profile?.amis])


  const partagerPseudo = async () => {
    const texte = fr ? `Ajoute-moi sur Croivez : mon pseudo est « ${profile?.pseudo} » 🧠` : `Add me on Croivez: ${profile?.pseudo}`
    try { if (navigator.share) { await navigator.share({ text: texte }); return } } catch { /* annulé */ }
    try { await navigator.clipboard.writeText(texte); setCopie(true) } catch { /* indisponible */ }
  }

  const confirmation = aRetirer && (
    <div className="fiche-voile" onClick={() => setARetirer(null)}>
      <div className="card confirmer-retrait rise" onClick={(e) => e.stopPropagation()}>
        <Avatar pseudo={aRetirer.pseudo} avatar={aRetirer.avatar} cadre={aRetirer.cadre} taille={64} />
        <strong className="t">{fr ? `Retirer ${aRetirer.pseudo} de tes amis ?` : `Remove ${aRetirer.pseudo}?`}</strong>
        <p>{fr ? 'Tu pourras toujours l’ajouter à nouveau plus tard.' : 'You can add them again later.'}</p>
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button className="btn btn-g btn-lg" style={{ flex: 1 }} onClick={() => setARetirer(null)}>{fr ? 'Annuler' : 'Cancel'}</button>
          <button className="btn btn-lg" style={{ flex: 1, background: 'var(--ko)', color: '#fff' }} onClick={async () => { await retirerAmi(uid, aRetirer.uid); setARetirer(null) }}>🗑️ {fr ? 'Retirer' : 'Remove'}</button>
        </div>
      </div>
    </div>
  )

  if (ouvert) return <Conversation ami={ouvert} uid={uid} onRetour={() => setOuvert(null)} />

  return (
    <>
      {confirmation}
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Amis' : 'Friends'}</h1>
      <section className="card amis-ajout">
        <strong className="t">{fr ? 'Ajouter un ami' : 'Add a friend'}</strong>
        <AjoutAmi uid={uid} />
        <button type="button" className="btn btn-s" style={{ alignSelf: 'flex-start' }} onClick={partagerPseudo}><Icon d={ICONS.link} size={16} />{copie ? (fr ? 'Copié !' : 'Copied!') : (fr ? `Partager mon pseudo (${profile?.pseudo})` : 'Share my username')}</button>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h2 className="t" style={{ fontSize: 17, fontWeight: 900 }}>{fr ? 'Mes amis' : 'My friends'} · {amis.length}</h2>
        {amis.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Pas encore d’amis : ajoute-les avec leur pseudo, ou partage le tien.' : 'No friends yet.'}</p>}
        {amis.map((a) => (
          <div key={a.uid} className="ami-ligne">
            <Link to={`/joueur/${a.uid}`} className="ami-identite"><Avatar pseudo={a.pseudo} avatar={a.avatar} cadre={a.cadre} taille={46} /><span><strong>{a.pseudo}</strong><small>{fr ? 'Niveau' : 'Level'} {a.niveau}</small></span></Link>
            <div className="ami-actions">
              <button className="btn btn-s" title={fr ? 'Message' : 'Message'} onClick={() => setOuvert(a)}>💬<span className="ami-txt">{fr ? 'Message' : 'Chat'}</span></button>
              <button className="btn btn-s" title={fr ? 'Défier en duel' : 'Duel'} onClick={async () => { const id = await inviter(uid, profile?.pseudo ?? '', a.uid); nav(`/duels?attente=${id}`) }}>⚔️<span className="ami-txt">{fr ? 'Duel' : 'Duel'}</span></button>
              <button className="btn btn-s" title={fr ? 'Inviter dans un salon' : 'Invite to a room'} onClick={async () => { const m = { uid, pseudo: profile?.pseudo ?? '', avatar: profile?.avatar, cadre: profile?.cadre }; const code = await creerSalon(m); await inviterAuSalon(code, m, a.uid); nav(`/salon/${code}`) }}>👥<span className="ami-txt">{fr ? 'Salon' : 'Room'}</span></button>
              <button className="btn btn-g ami-poubelle" aria-label={fr ? 'Retirer de mes amis' : 'Remove friend'} title={fr ? 'Retirer' : 'Remove'} onClick={() => setARetirer(a)}>🗑️</button>
            </div>
          </div>
        ))}
      </section>
    </>
  )
}

function Conversation({ ami, uid, onRetour }: { ami: ProfilPublic; uid: string; onRetour: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [messages, setMessages] = useState<Message[]>([])
  const [txt, setTxt] = useState('')
  const bas = useRef<HTMLDivElement>(null)
  useEffect(() => ecouterMessages(uid, ami.uid, setMessages), [uid, ami.uid])
  useEffect(() => { bas.current?.scrollIntoView({ block: 'end' }) }, [messages.length])
  const envoyer = (e: FormEvent) => { e.preventDefault(); if (txt.trim()) { envoyerMessage(uid, ami.uid, txt).catch(console.error); setTxt('') } }
  const rapides = fr ? ['On fait un duel ? ⚔️', 'Bats mon score ! 🏆', 'GG 👏', 'Revanche ? 😤'] : ['Duel? ⚔️', 'Beat my score! 🏆', 'GG 👏', 'Rematch? 😤']
  return (
    <div className="chat">
      <header className="chat-tete">
        <button className="btn btn-g" onClick={onRetour} aria-label={fr ? 'Retour' : 'Back'}><Icon d={ICONS.arrowL} /></button>
        <Avatar pseudo={ami.pseudo} avatar={ami.avatar} cadre={ami.cadre} taille={40} />
        <strong className="t" style={{ fontSize: 18 }}>{ami.pseudo}</strong>
      </header>
      <div className="chat-fil">
        {messages.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', fontSize: 14 }}>{fr ? 'Dis bonjour 👋' : 'Say hi 👋'}</p>}
        {messages.map((m, i) => <div key={i} className={`chat-bulle${m.de === uid ? ' moi' : ''}`}>{m.txt}<small>{new Date(m.t).toLocaleTimeString(fr ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</small></div>)}
        <div ref={bas} />
      </div>
      <div className="chat-rapides">{rapides.map((r) => <button key={r} type="button" className="pill" onClick={() => envoyerMessage(uid, ami.uid, r).catch(console.error)}>{r}</button>)}</div>
      <form className="chat-saisie" onSubmit={envoyer}>
        <input className="input" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={fr ? 'Écris un message…' : 'Type a message…'} maxLength={500} style={{ flex: 1, minHeight: 48 }} />
        <button className="btn btn-p" disabled={!txt.trim()}>{fr ? 'Envoyer' : 'Send'}</button>
      </form>
    </div>
  )
}
