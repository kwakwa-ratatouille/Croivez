import { useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { PRIX_PSEUDO, changerPseudo } from '../social'
import { retourFin } from '../retour'
import { Piece } from './ui'

// Changer de pseudo : 1 500 pièces ; amis, progression et classements suivent (ils sont liés au compte)
export default function ChangerPseudo() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [ouvert, setOuvert] = useState(false)
  const [nom, setNom] = useState('')
  const [confirmer, setConfirmer] = useState(false)
  const [msg, setMsg] = useState('')
  const [envoi, setEnvoi] = useState(false)
  if (!user || !profile) return null
  const solde = profile.pieces ?? 0
  const valide = nom.trim().length >= 3 && nom.trim().length <= 20
  const go = async () => {
    setEnvoi(true); setMsg('')
    const r = await changerPseudo(user.uid, profile.pseudo, nom.trim()).catch(() => 'erreur' as const)
    setEnvoi(false); setConfirmer(false)
    const MSG: Record<string, string> = { ok: fr ? `C’est fait, tu t’appelles maintenant ${nom.trim()} !` : 'Done!', pris: fr ? 'Ce pseudo est déjà pris.' : 'This name is taken.', pieces: fr ? `Il te faut ${PRIX_PSEUDO} pièces.` : `You need ${PRIX_PSEUDO} coins.`, invalide: fr ? 'Entre 3 et 20 caractères, lettres et chiffres.' : '3 to 20 characters.', erreur: fr ? 'Impossible pour le moment (connexion ?).' : 'Not possible right now.' }
    setMsg(MSG[r] ?? MSG.erreur)
    if (r === 'ok') { retourFin(true); setNom(''); setOuvert(false) }
  }
  return (
    <div className="changer-pseudo">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span><strong className="t">{fr ? 'Pseudo' : 'Username'}</strong> · {profile.pseudo}</span>
        {!ouvert && <button className="btn btn-s" onClick={() => setOuvert(true)}>✏️ {fr ? 'Changer' : 'Change'} · <Piece size={14} />{PRIX_PSEUDO}</button>}
      </div>
      {ouvert && (
        <>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Tu gardes tes amis, ta progression et tes classements. Seul le nom affiché change.' : 'You keep friends and progress.'}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" value={nom} maxLength={20} onChange={(e) => { setNom(e.target.value); setConfirmer(false); setMsg('') }} placeholder={fr ? 'Nouveau pseudo' : 'New username'} style={{ flex: 1, minHeight: 46 }} />
            <button className="btn btn-g" onClick={() => { setOuvert(false); setConfirmer(false); setNom('') }}>{fr ? 'Annuler' : 'Cancel'}</button>
          </div>
          {confirmer && <p className="confirmer-achat">{fr ? `Dépenser ${PRIX_PSEUDO} pièces pour t’appeler « ${nom.trim()} » ? Il te restera ${solde - PRIX_PSEUDO} pièces.` : `Spend ${PRIX_PSEUDO} coins?`}</p>}
          <button className="btn btn-p" disabled={!valide || envoi || solde < PRIX_PSEUDO} onClick={() => (confirmer ? go() : setConfirmer(true))}>
            {solde < PRIX_PSEUDO ? (fr ? `Encore ${PRIX_PSEUDO - solde} pièces` : `${PRIX_PSEUDO - solde} more coins`) : confirmer ? (fr ? '✓ Oui, changer' : '✓ Yes') : (fr ? 'Valider' : 'Confirm')} · <Piece size={15} />{PRIX_PSEUDO}
          </button>
        </>
      )}
      {msg && <p role="status" style={{ fontSize: 14, fontWeight: 700 }}>{msg}</p>}
    </div>
  )
}
