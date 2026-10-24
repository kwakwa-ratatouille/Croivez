import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { BOUTIQUE, acheterObjet, equiper, possede, type Objet } from '../meta'
import Avatar from '../components/Avatar'
import { ICONS, Icon, Piece, Pieces } from '../components/ui'

// Boutique : avatars et cadres achetés avec les pièces, puis équipés d'un appui
export default function Boutique() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [msg, setMsg] = useState('')

  const action = async (o: Objet) => {
    if (!user) return
    setMsg('')
    if (o.condition && !possede(profile, o)) { setMsg(o.condition.desc[lang]); return }
    if (!possede(profile, o) && !(await acheterObjet(user.uid, o).catch(() => false))) { setMsg(fr ? 'Pas assez de pièces.' : 'Not enough coins.'); return }
    await equiper(user.uid, o)
  }

  const section = (type: Objet['type'], titre: string) => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 className="t" style={{ fontSize: 20, fontWeight: 900 }}>{titre}</h2>
      <div className="grid-auto" style={{ ['--min' as string]: '140px', gap: 12 }}>
        {BOUTIQUE.filter((o) => o.type === type).map((o) => {
          const a = possede(profile, o)
          const porte = (type === 'avatar' ? profile?.avatar : profile?.cadre) === o.id
          return (
            <button key={o.id} type="button" onClick={() => action(o)} className="card famille" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', font: 'inherit', color: 'inherit', borderColor: porte ? 'var(--ok)' : 'var(--line)', borderWidth: porte ? 2 : 1 }}>
              <Avatar pseudo={profile?.pseudo} avatar={type === 'avatar' ? o.id : profile?.avatar} cadre={type === 'cadre' ? o.id : profile?.cadre} taille={72} anime={porte} />
              <span style={{ fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{o.nom[lang]}</span>
              <span style={{ fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, color: porte ? 'var(--ok-i)' : a ? 'var(--muted)' : 'var(--his-i)' }}>
                {porte ? (fr ? 'Équipé' : 'Equipped') : a ? (fr ? 'Équiper' : 'Equip') : o.condition ? <><Icon d={ICONS.lock} size={14} />{o.condition.desc[lang]}</> : <><Piece size={15} />{o.prix}</>}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )

  return (
    <>
      <Link to="/profil" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, textDecoration: 'none', color: 'var(--muted)' }}><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h1 className="t" style={{ fontSize: 32, fontWeight: 900 }}>{fr ? 'Boutique' : 'Shop'}</h1>
        <Pieces n={profile?.pieces ?? 0} />
      </header>
      {msg && <p role="status" style={{ color: 'var(--ko-i)', fontWeight: 600 }}>{msg}</p>}
      {section('avatar', fr ? 'Avatars' : 'Avatars')}
      {section('cadre', fr ? 'Cadres (les animés se gagnent en jouant)' : 'Frames (animated ones are earned)')}
    </>
  )
}
