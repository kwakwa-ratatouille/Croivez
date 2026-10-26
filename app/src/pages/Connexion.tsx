import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { connexionParNavigateur, googleViaNavigateur } from '../connexionGoogle'
import { ensureProfile } from '../auth'
import { usePrefs } from '../i18n'
import { Logo } from '../components/ui'

const ERREURS: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail.',
  'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères.',
  'auth/invalid-email': 'Adresse e-mail invalide.',
  'auth/popup-closed-by-user': 'Connexion Google annulée.',
  'auth/network-request-failed': 'Pas de connexion internet.',
}

export default function Connexion() {
  const { t } = usePrefs()
  const [inscription, setInscription] = useState(false)
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [mdp2, setMdp2] = useState('') // confirmation à l'inscription
  const [voir, setVoir] = useState(false) // afficher les mots de passe en clair
  const [pseudo, setPseudo] = useState('')
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)
  // Appli (iPhone, Android, .exe) : connexion Google en cours dans le navigateur
  const [attenteNav, setAttenteNav] = useState(false)
  const annuler = useRef<(() => void) | null>(null)
  useEffect(() => () => annuler.current?.(), [])

  async function run(fn: () => Promise<void>) {
    setErreur('')
    setEnCours(true)
    try { await fn() } catch (e) {
      const code = (e as { code?: string }).code ?? ''
      setErreur(ERREURS[code] ?? `Erreur : ${code || (e as Error).message}`)
    } finally { setEnCours(false) }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (inscription && mdp !== mdp2) { setErreur('Les deux mots de passe ne sont pas identiques.'); return }
    run(async () => {
      if (inscription) {
        const { user } = await createUserWithEmailAndPassword(auth, email, mdp)
        await updateProfile(user, { displayName: pseudo })
        await ensureProfile(user, pseudo)
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, mdp)
        await ensureProfile(user)
      }
    })
  }

  const google = () => {
    if (!googleViaNavigateur) return run(async () => {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
      await ensureProfile(user)
    })
    // Dans les applis, Google refuse sa fenêtre : on passe par le navigateur, l'appli attend le retour
    setErreur('')
    setAttenteNav(true)
    connexionParNavigateur(async (e) => {
      annuler.current = null
      if (e) { setAttenteNav(false); setErreur(`Erreur : ${(e as { code?: string }).code ?? (e as Error).message}`); return }
      if (auth.currentUser) await ensureProfile(auth.currentUser).catch(() => {})
    }).then((f) => { annuler.current = f }, (e) => { setAttenteNav(false); setErreur(`Erreur : ${(e as Error).message}`) })
  }
  const arreterAttente = () => { annuler.current?.(); annuler.current = null; setAttenteNav(false) }

  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 400 300" width="620" aria-hidden="true" style={{ position: 'absolute', left: -160, top: -140, opacity: .6 }}><path d="M210 30c80-10 170 40 160 120s-90 130-180 120S20 200 40 120 130 40 210 30Z" style={{ fill: 'var(--geo-t)' }} /></svg>
      <svg viewBox="0 0 400 300" width="520" aria-hidden="true" style={{ position: 'absolute', right: -140, bottom: -120, opacity: .6 }}><path d="M210 30c80-10 170 40 160 120s-90 130-180 120S20 200 40 120 130 40 210 30Z" style={{ fill: 'var(--mus-t)' }} /></svg>
      <form onSubmit={submit} className="card rise" style={{ width: '100%', maxWidth: 440, padding: 40, display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', marginBottom: 8 }}>
          <Logo width={84} />
          <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{t('login.title')}</h1>
          <p style={{ color: 'var(--muted)' }}>{t('login.sub')}</p>
        </div>
        {inscription && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14 }}>{t('login.pseudo')}
            <input className="input" required minLength={2} maxLength={20} value={pseudo} onChange={(e) => setPseudo(e.target.value)} autoComplete="nickname" />
          </label>
        )}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14 }}>{t('login.email')}
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14 }}>{t('login.password')}
          <span className="champ-mdp">
            <input className="input" type={voir ? 'text' : 'password'} required minLength={6} value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete={inscription ? 'new-password' : 'current-password'} />
            <button type="button" className="voir-mdp" onClick={() => setVoir((v) => !v)} aria-label={voir ? 'Cacher le mot de passe' : 'Afficher le mot de passe'} aria-pressed={voir}>{voir ? '🙈' : '👁️'}</button>
          </span>
        </label>
        {/* Inscription : on retape le mot de passe pour éviter une faute de frappe */}
        {inscription && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14 }}>Confirmer le mot de passe
            <span className="champ-mdp">
              <input className="input" type={voir ? 'text' : 'password'} required minLength={6} value={mdp2} onChange={(e) => setMdp2(e.target.value)} autoComplete="new-password" aria-invalid={!!mdp2 && mdp2 !== mdp} />
              <button type="button" className="voir-mdp" onClick={() => setVoir((v) => !v)} aria-label={voir ? 'Cacher le mot de passe' : 'Afficher le mot de passe'} aria-pressed={voir}>{voir ? '🙈' : '👁️'}</button>
            </span>
            {mdp2 && <small style={{ fontWeight: 700, color: mdp2 === mdp ? 'var(--ok-i)' : 'var(--ko-i)' }}>{mdp2 === mdp ? '✓ Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}</small>}
          </label>
        )}
        {erreur && <p role="alert" style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--ko-t)', color: 'var(--ko-i)', fontSize: 14 }}>{erreur}</p>}
        <button className="btn btn-p" disabled={enCours}>{inscription ? t('login.signup') : t('login.signin')}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: 13 }}><span style={{ flex: 1, height: 1, background: 'var(--line)' }} />{t('login.or')}<span style={{ flex: 1, height: 1, background: 'var(--line)' }} /></div>
        {attenteNav ? (
          <div className="attente-google" role="status">
            <span className="spin" aria-hidden="true" />
            <strong>Termine la connexion dans ton navigateur</strong>
            <small>Puis reviens ici : Croivez se connectera tout seul.</small>
            <button type="button" className="btn btn-g" onClick={arreterAttente}>Annuler</button>
          </div>
        ) : <button type="button" className="btn btn-g" onClick={google} disabled={enCours}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
          {t('login.google')}
        </button>}
        <button type="button" onClick={() => { setInscription(!inscription); setErreur(''); setMdp2('') }} style={{ background: 'none', border: 0, color: 'var(--muted)', fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>
          {inscription ? t('login.toSignin') : t('login.toSignup')}
        </button>
      </form>
    </div>
  )
}
