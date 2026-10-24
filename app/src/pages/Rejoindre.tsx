import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { signInAnonymously } from 'firebase/auth'
import { auth, natif } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { normaliserCode, rejoindreSalon } from '../salon'
import { Logo, Wordmark } from '../components/ui'

// Rejoindre un salon (QR code du mode télé) : pas besoin de compte, un pseudo suffit
export const pseudoInvite = () => { try { return localStorage.getItem('pseudoInvite') ?? '' } catch { return '' } }

// Sur le web (QR code scanné avec l'appareil photo) : proposer d'ouvrir l'appli Croivez, avec son compte.
// Le choix est retenu : la fois suivante, l'appli s'ouvre directement.
// Liens croivez:// reconnus à partir de l'appli v0.11.0 : bouton caché tant que cette version n'est pas installée partout
export const LIENS_APPLI = false
const mobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const prefereAppli = () => { try { return localStorage.getItem('ouvrirAppli') === '1' } catch { return false } }
const retenir = (v: boolean) => { try { localStorage.setItem('ouvrirAppli', v ? '1' : '0') } catch { /* stockage indisponible */ } }

export default function Rejoindre() {
  const { code: param = '' } = useParams()
  const nav = useNavigate()
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [code, setCode] = useState(normaliserCode(param))
  const [pseudo, setPseudo] = useState(profile?.pseudo ?? pseudoInvite())
  const [msg, setMsg] = useState('')
  const [enCours, setEnCours] = useState(false)
  const proposerAppli = LIENS_APPLI && !natif && mobile() && normaliserCode(param).length === 5
  const ouvrirAppli = () => { retenir(true); window.location.href = `croivez://rejoindre/${normaliserCode(param)}` }
  const redirige = useRef(false)
  useEffect(() => { if (proposerAppli && prefereAppli() && !redirige.current) { redirige.current = true; ouvrirAppli() } }, [proposerAppli]) // eslint-disable-line react-hooks/exhaustive-deps

  const valider = async (e: FormEvent) => {
    e.preventDefault()
    const p = (natif && user && !user.isAnonymous && profile?.pseudo ? profile.pseudo : pseudo).trim().slice(0, 16)
    if (p.length < 2) return setMsg(fr ? 'Choisis un pseudo (2 lettres minimum).' : 'Pick a nickname.')
    if (code.length !== 5) return setMsg(fr ? 'Le code fait 5 caractères.' : 'Codes are 5 characters.')
    setEnCours(true); setMsg('')
    try {
      try { localStorage.setItem('pseudoInvite', p) } catch { /* stockage indisponible */ }
      const u = user ?? (await signInAnonymously(auth)).user
      const r = await rejoindreSalon(code, { uid: u.uid, pseudo: p, avatar: profile?.avatar, cadre: profile?.cadre })
      if (r === 'ok') nav(`/salon/${code}`)
      else setMsg(r === 'introuvable' ? (fr ? 'Aucun salon avec ce code.' : 'No room with this code.') : r === 'plein' ? (fr ? 'Ce salon est complet.' : 'Room is full.') : (fr ? 'La partie a déjà commencé, attends la suivante !' : 'The game has started.'))
    } catch (err) {
      console.error(err)
      setMsg(fr ? 'Connexion impossible. Vérifie le réseau (ou crée un compte Croivez).' : 'Could not connect.')
    }
    setEnCours(false)
  }

  const auto = useRef(false)
  useEffect(() => {
    if (auto.current || !natif || !user || user.isAnonymous || !profile?.pseudo || normaliserCode(param).length !== 5) return
    auto.current = true
    setPseudo(profile.pseudo)
    valider({ preventDefault() {} } as FormEvent)
  }, [user, profile, param]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rejoindre">
      <form className="card rejoindre-carte rise" onSubmit={valider}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}><Logo width={48} /><Wordmark size={28} /></div>
        <h1 className="t" style={{ fontSize: 26, fontWeight: 900, textAlign: 'center' }}>{fr ? 'On joue ensemble ?' : 'Let’s play together!'}</h1>
        {proposerAppli && (
          <div className="choix-appli">
            <button type="button" className="btn btn-p btn-lg" onClick={ouvrirAppli}>📱 {fr ? 'Ouvrir dans l’appli Croivez' : 'Open in the Croivez app'}</button>
            <small>{fr ? 'Avec ton compte, ton avatar et tes récompenses. Sinon, joue ici avec un simple pseudo :' : 'With your account. Or play here with a nickname:'}</small>
          </div>
        )}
        <label className="salon-champ"><span>{fr ? 'Code du salon' : 'Room code'}</span>
          <input className="input t" value={code} onChange={(e) => setCode(normaliserCode(e.target.value))} placeholder="ABCDE" autoCapitalize="characters" style={{ fontSize: 28, fontWeight: 900, letterSpacing: 8, textAlign: 'center' }} />
        </label>
        <label className="salon-champ"><span>{fr ? 'Ton pseudo' : 'Your nickname'}</span>
          <input className="input" value={pseudo} onChange={(e) => setPseudo(e.target.value)} maxLength={16} placeholder={fr ? 'Ex. : Mamie Jo' : 'e.g. Granny Jo'} autoFocus style={{ fontSize: 20, fontWeight: 700 }} />
        </label>
        <button className={`btn btn-lg ${proposerAppli ? 'btn-s' : 'btn-p'}`} disabled={enCours} onClick={() => proposerAppli && retenir(false)}>{enCours ? '…' : proposerAppli ? (fr ? 'Jouer ici sans l’appli' : 'Play here without the app') : (fr ? 'Rejoindre la partie' : 'Join the game')}</button>
        {msg && <p role="status" style={{ color: 'var(--ko-i)', fontWeight: 700, textAlign: 'center' }}>{msg}</p>}
        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>{fr ? 'Pas besoin de compte : tes réponses s’affichent sur la télé.' : 'No account needed.'}</p>
      </form>
    </div>
  )
}
