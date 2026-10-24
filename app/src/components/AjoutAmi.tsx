import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { chercherPseudos, prevenirAmi, trouverParPseudo, type ProfilPublic } from '../social'
import Avatar from './Avatar'

// Ajouter un ami : les pseudos correspondants apparaissent pendant la saisie
export default function AjoutAmi({ uid }: { uid: string }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { profile } = useAuth()
  const [pseudo, setPseudo] = useState('')
  const [sugg, setSugg] = useState<ProfilPublic[]>([])
  const [msg, setMsg] = useState('')
  useEffect(() => {
    const t = setTimeout(() => { chercherPseudos(pseudo).then((l) => setSugg(l.filter((p) => p.uid !== uid))).catch(() => setSugg([])) }, 250)
    return () => clearTimeout(t)
  }, [pseudo, uid])
  const ajouter = async (p: ProfilPublic) => {
    // Demande d'ami : l'autre doit accepter, puis vous êtes amis tous les deux
    await prevenirAmi(uid, profile?.pseudo ?? '?', p.uid)
    setPseudo(''); setSugg([]); setMsg(fr ? `Demande envoyée à ${p.pseudo} : il ou elle doit accepter.` : `Request sent to ${p.pseudo}.`)
  }
  const valider = async (e: FormEvent) => {
    e.preventDefault()
    const p = sugg[0] ?? await trouverParPseudo(pseudo).catch(() => null)
    if (!p) { setMsg(fr ? 'Aucun joueur avec ce pseudo.' : 'No player with this name.'); return }
    if (p.uid === uid) { setMsg(fr ? 'C’est toi 😄' : 'That’s you!'); return }
    await ajouter(p)
  }
  return (
    <form className="ajout-ami" onSubmit={valider}>
      <div className="ajout-ami-champ">
        <input className="input" value={pseudo} onChange={(e) => { setPseudo(e.target.value); setMsg('') }} placeholder={fr ? 'Pseudo d’un ami…' : 'Friend’s name…'} autoComplete="off" />
        <button className="btn btn-p" disabled={!pseudo.trim()}>{fr ? 'Envoyer' : 'Send'}</button>
      </div>
      {sugg.length > 0 && (
        <ul className="ajout-ami-sugg" role="listbox">
          {sugg.map((p) => {
            const deja = profile?.amis?.includes(p.uid)
            return <li key={p.uid}><button type="button" disabled={deja} onClick={() => ajouter(p)}><Avatar pseudo={p.pseudo} avatar={p.avatar} cadre={p.cadre} taille={32} /><span>{p.pseudo}<small>{fr ? 'Niv.' : 'Lv.'} {p.niveau}</small></span><em>{deja ? (fr ? 'Déjà ami' : 'Friend') : (fr ? 'Demander' : 'Request')}</em></button></li>
          })}
        </ul>
      )}
      {msg && <p role="status" className="ajout-ami-msg">{msg}</p>}
    </form>
  )
}
