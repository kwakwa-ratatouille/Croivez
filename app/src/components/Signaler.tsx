import { push, ref, serverTimestamp, set } from 'firebase/database'
import { useState } from 'react'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'

// Signaler une question (image manquante, réponse fausse, affichage buggé…).
// Rangé sous duels/signalement-… : chemin déjà ouvert en écriture aux joueurs connectés, lisible dans la console Firebase.
const RAISONS: [string, string, string][] = [
  ['image-manquante', '🖼️ Image manquante', 'Missing image'],
  ['image-fausse', '🙈 Mauvaise image', 'Wrong image'],
  ['reponse-fausse', '❌ Réponse fausse', 'Wrong answer'],
  ['affichage', '🐛 Affichage buggé', 'Display bug'],
  ['autre', '💬 Autre', 'Other'],
]

export default function Signaler({ id, enonce, reponse, image }: { id: string; enonce: string; reponse: string; image?: string }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user } = useAuth()
  const [ouvert, setOuvert] = useState(false)
  const [fait, setFait] = useState(false)
  const envoyer = async (raison: string) => {
    setOuvert(false); setFait(true)
    const r = push(ref(rtdb, 'duels'))
    await set(ref(rtdb, `duels/signalement-${r.key}`), { type: 'signalement', raison, id, enonce, reponse, image: image ?? null, uid: user?.uid ?? null, ua: navigator.userAgent.slice(0, 120), quand: serverTimestamp() }).catch(() => {})
  }
  if (fait) return <span className="signaler-ok">✓ {fr ? 'Merci, on regarde ça !' : 'Thanks, we’ll check!'}</span>
  return (
    <span className="signaler">
      <button type="button" className="signaler-btn" onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert}>⚑ {fr ? 'Signaler' : 'Report'}</button>
      {ouvert && <span className="signaler-menu" role="menu">{RAISONS.map(([k, f, e]) => <button key={k} type="button" role="menuitem" onClick={() => envoyer(k)}>{fr ? f : e}</button>)}</span>}
    </span>
  )
}
