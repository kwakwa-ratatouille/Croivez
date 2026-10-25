import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jour, useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { classementJour, type ScoreJour } from '../jour'
import { defiDuJour } from '../quiz/defi'
import { URL_WEB } from '../partage'
import Avatar from '../components/Avatar'
import { envoyerQuizJour } from '../chat'
import { profilsDe, type ProfilPublic } from '../social'
import { ICONS, Icon } from '../components/ui'

// Classement du quiz du jour : tout le monde a eu les mêmes questions
export default function ClassementJour() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const today = jour()
  const defi = defiDuJour(today)
  const [lignes, setLignes] = useState<ScoreJour[] | null>(null)
  const [copie, setCopie] = useState(false)
  const [choixAmi, setChoixAmi] = useState(false) // liste des amis à qui envoyer le quiz du jour
  const [amis, setAmis] = useState<ProfilPublic[]>([])
  const [envoyes, setEnvoyes] = useState<string[]>([])
  useEffect(() => { if (choixAmi) profilsDe(profile?.amis ?? []).then(setAmis).catch(() => setAmis([])) }, [choixAmi, profile?.amis])
  useEffect(() => { classementJour(today).then(setLignes).catch(() => setLignes([])) }, [today])
  const fait = profile?.defiJour === today
  const moi = lignes?.find((l) => l.uid === user?.uid)
  const rang = moi ? lignes!.indexOf(moi) + 1 : 0
  const inviter = async () => {
    const texte = `Croivez ✗✓ · Quiz du jour (${defi.titre[lang]})\n${moi?.grille ?? ''}\n${moi ? `${moi.bonnes}/${moi.total} · ${moi.score} pts · ${rang}ᵉ` : ''}\nMêmes questions pour tout le monde, tu fais mieux ? 👉 ${URL_WEB}#/jour${user ? `?parrain=${user.uid}` : ''}`
    try { if (navigator.share) { await navigator.share({ text: texte }); return } } catch { /* annulé */ }
    try { await navigator.clipboard.writeText(texte); setCopie(true) } catch { /* indisponible */ }
  }
  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="eyebrow">{new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Quiz du jour' : 'Daily quiz'} · {defi.titre[lang]}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Les mêmes 10 questions pour tout le monde. Un seul essai compte : ton meilleur score.' : 'Same 10 questions for everyone.'}</p>
      </header>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!fait && <Link className="btn btn-p btn-lg" to={defi.url}>{fr ? 'Jouer le quiz du jour' : 'Play'}<Icon d={ICONS.arrowR} /></Link>}
        {user && !user.isAnonymous && <button className="btn btn-p btn-lg" onClick={() => setChoixAmi((c) => !c)}>📨 {fr ? 'Envoyer à un ami' : 'Send to a friend'}</button>}
        <button className="btn btn-s btn-lg" onClick={inviter}>{copie ? (fr ? 'Copié !' : 'Copied!') : (fr ? 'Partager ailleurs' : 'Share elsewhere')}</button>
      </div>
      {choixAmi && (
        <section className="card envoi-jour rise">
          <strong className="t">{fr ? 'À qui envoyer le quiz du jour ?' : 'Send to whom?'}</strong>
          {amis.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Ajoute d’abord des amis (Multi → Mes amis).' : 'Add friends first.'}</p>}
          {amis.map((a) => (
            <div key={a.uid} className="envoi-jour-ami">
              <Avatar pseudo={a.pseudo} avatar={a.avatar} cadre={a.cadre} taille={36} />
              <span>{a.pseudo}</span>
              <button type="button" className={`btn ${envoyes.includes(a.uid) ? 'btn-g' : 'btn-p'}`} disabled={envoyes.includes(a.uid)}
                onClick={async () => { if (!user || !profile) return; await envoyerQuizJour(user.uid, profile.pseudo, a.uid, defi.titre[lang], moi ? { bonnes: moi.bonnes, total: moi.total } : null); setEnvoyes((e) => [...e, a.uid]) }}>
                {envoyes.includes(a.uid) ? (fr ? '✓ Envoyé' : '✓ Sent') : (fr ? 'Envoyer' : 'Send')}
              </button>
            </div>
          ))}
          <small style={{ color: 'var(--muted)' }}>{moi ? (fr ? `Il recevra une notification avec ton score à battre (${moi.bonnes}/${moi.total}).` : 'They get a notification with your score.') : (fr ? 'Il recevra une notification pour jouer le même quiz que toi.' : 'They get a notification to play.')}</small>
        </section>
      )}
      <section className="card" style={{ padding: 10 }}>
        {!lignes && <p style={{ padding: 16, color: 'var(--muted)' }}>…</p>}
        {lignes?.length === 0 && <p style={{ padding: 16, color: 'var(--muted)' }}>{fr ? 'Personne n’a encore joué aujourd’hui : sois le premier !' : 'Nobody played yet today!'}</p>}
        {lignes?.map((l, n) => (
          <Link key={l.uid} to={l.uid === user?.uid ? '/profil' : `/joueur/${l.uid}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, textDecoration: 'none', color: 'inherit', background: l.uid === user?.uid ? 'var(--geo-t)' : 'transparent' }}>
            <span className="t" style={{ width: 30, textAlign: 'center', fontWeight: 900 }}>{n < 3 ? ['🥇', '🥈', '🥉'][n] : n + 1}</span>
            <Avatar pseudo={l.pseudo} avatar={l.avatar} cadre={l.cadre} taille={36} />
            <span style={{ flex: 1, minWidth: 0 }}><strong>{l.pseudo}</strong><span style={{ display: 'block', fontSize: 12, letterSpacing: 1 }}>{l.grille}</span></span>
            <span className="t" style={{ fontWeight: 900 }}>{l.score}</span>
          </Link>
        ))}
      </section>
    </>
  )
}
