import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { creerSalon } from '../salon'
import { ICONS, Icon, Logo, Wordmark } from '../components/ui'

// Mode télé : à ouvrir sur la télé ou l'ordinateur branché dessus. Crée un salon dont l'écran est l'hôte ;
// les joueurs scannent le QR code et répondent sur leur téléphone. Pas besoin de compte.
export default function Tv() {
  const nav = useNavigate()
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user } = useAuth()
  const [msg, setMsg] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [params] = useSearchParams()
  const auto = params.get('auto') === '1' // lancé par Chromecast : la partie se crée toute seule
  const lance = useRef(false)
  const creer = async () => {
    setEnCours(true); setMsg('')
    try {
      const u = user ?? (await signInAnonymously(auth)).user
      const code = await creerSalon({ uid: u.uid, pseudo: 'Télé' }, { tv: true })
      // Sur Chromecast, la page est dans le récepteur : on lui donne le code pour le téléphone qui diffuse
      if (window.parent !== window) window.parent.postMessage({ croivez: 'salon', code }, '*')
      nav(`/salon/${code}`)
    } catch (e) {
      console.error(e)
      setMsg(fr ? 'Impossible de créer la partie (connexion ?).' : 'Could not create the game.')
      setEnCours(false)
    }
  }
  useEffect(() => { if (auto && !lance.current) { lance.current = true; creer() } }, [auto]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="tv tv-accueil">
      {user && !user.isAnonymous && <button className="btn tv-quitter" onClick={() => nav('/duels')} aria-label={fr ? 'Retour' : 'Back'}><Icon d={ICONS.arrowL} /></button>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Logo width={80} /><Wordmark size={52} /></div>
      <h1 className="t">{fr ? 'Soirée quiz sur la télé' : 'Quiz night on the TV'}</h1>
      <ol className="tv-etapes">
        <li><span>1</span>{fr ? 'Ouvre cette page sur la télé ou l’ordinateur branché dessus' : 'Open this page on the TV'}</li>
        <li><span>2</span>{fr ? 'Chacun scanne le QR code avec son téléphone et choisit son pseudo' : 'Everyone scans the QR code'}</li>
        <li><span>3</span>{fr ? 'Les questions s’affichent en grand, on répond sur son téléphone' : 'Questions on the TV, answers on phones'}</li>
      </ol>
      <button className="btn btn-lg tv-lancer" onClick={creer} disabled={enCours}>{enCours ? '…' : (fr ? 'Créer la partie' : 'Create the game')}<Icon d={ICONS.arrowR} /></button>
      {msg && <p style={{ color: '#FFB4A8', fontWeight: 700 }}>{msg}</p>}
    </div>
  )
}
