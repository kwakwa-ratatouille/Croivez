import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { deposerJetons } from '../connexionGoogle'
import { Logo } from '../components/ui'

// Page ouverte dans le vrai navigateur par l'appli (iPhone, Android, .exe) pour se connecter avec Google :
// le jeton est chiffré puis renvoyé à l'appli, qui se connecte toute seule. Il suffit ensuite d'y revenir.
export default function RelaisGoogle() {
  const p = new URLSearchParams(location.hash.split('?')[1] ?? '')
  const id = p.get('id') ?? ''
  const k = p.get('k') ?? ''
  const [etat, setEtat] = useState<'attente' | 'encours' | 'fini' | 'erreur'>(id && k ? 'attente' : 'erreur')
  const [erreur, setErreur] = useState('')

  const go = async () => {
    setEtat('encours')
    try {
      const avant = auth.currentUser
      const res = await signInWithPopup(auth, new GoogleAuthProvider())
      const c = GoogleAuthProvider.credentialFromResult(res)
      if (!c?.idToken && !c?.accessToken) throw new Error('Google n’a pas renvoyé de jeton.')
      await deposerJetons(id, k, { i: c.idToken ?? null, a: c.accessToken ?? null })
      // Le navigateur n'était pas connecté à Croivez avant : on le laisse comme il était
      if (!avant) signOut(auth).catch(() => {})
      setEtat('fini')
      setTimeout(() => window.close(), 1500)
    } catch (e) {
      const code = (e as { code?: string }).code ?? ''
      setErreur(code === 'auth/popup-closed-by-user' ? 'Connexion annulée.' : code === 'auth/popup-blocked' ? 'La fenêtre Google a été bloquée : réessaie.' : (e as Error).message)
      setEtat('attente')
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card rise" style={{ width: '100%', maxWidth: 420, padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
        <Logo width={76} />
        {etat === 'fini' ? <>
          <div style={{ fontSize: 54 }} aria-hidden="true">✅</div>
          <h1 className="t" style={{ fontSize: 26, fontWeight: 900 }}>C’est bon !</h1>
          <p style={{ color: 'var(--muted)' }}>Retourne dans l’appli Croivez : tu y es déjà connecté. Tu peux fermer cette page.</p>
        </> : etat === 'erreur' ? <>
          <h1 className="t" style={{ fontSize: 24, fontWeight: 900 }}>Lien incomplet</h1>
          <p style={{ color: 'var(--muted)' }}>Relance la connexion Google depuis l’appli Croivez.</p>
        </> : <>
          <h1 className="t" style={{ fontSize: 26, fontWeight: 900 }}>Connexion à l’appli</h1>
          <p style={{ color: 'var(--muted)' }}>Connecte-toi avec Google ici, puis reviens dans l’appli Croivez : elle se connectera toute seule.</p>
          {erreur && <p role="alert" style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--ko-t)', color: 'var(--ko-i)', fontSize: 14 }}>{erreur}</p>}
          <button type="button" className="btn btn-p" onClick={go} disabled={etat === 'encours'} style={{ width: '100%' }}>{etat === 'encours' ? 'Connexion…' : 'Continuer avec Google'}</button>
        </>}
      </div>
    </div>
  )
}
