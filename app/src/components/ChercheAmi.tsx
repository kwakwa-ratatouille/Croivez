import { useId } from 'react'
import { usePrefs } from '../i18n'
import type { ProfilPublic } from '../social'

const sansAccents = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
// Amis qui correspondent à ce qu'on tape : ceux dont le pseudo commence par ces lettres d'abord, puis ceux qui les contiennent
export function filtrerAmis(amis: ProfilPublic[], q: string) {
  const c = sansAccents(q.trim())
  if (!c) return amis
  const n = (a: ProfilPublic) => sansAccents(a.pseudo ?? '')
  return [...amis.filter((a) => n(a).startsWith(c)), ...amis.filter((a) => !n(a).startsWith(c) && n(a).includes(c))]
}

// Champ « Chercher un ami » : la liste en dessous se réduit aux pseudos qui correspondent pendant la saisie
export default function ChercheAmi({ valeur, onChange, liste }: { valeur: string; onChange: (v: string) => void; liste: ProfilPublic[] }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const id = useId()
  return (
    <>
      <input className="input cherche-ami" type="search" value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={fr ? '🔍 Chercher un ami…' : '🔍 Find a friend…'} autoComplete="off" list={id} />
      <datalist id={id}>{liste.map((a) => <option key={a.uid} value={a.pseudo} />)}</datalist>
      {valeur.trim() && !filtrerAmis(liste, valeur).length && <p className="multi-astuce">{fr ? `Aucun ami nommé « ${valeur} ».` : 'No friend with this name.'}</p>}
    </>
  )
}
