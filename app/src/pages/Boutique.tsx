import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, deleteField, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { BOUTIQUE, acheterObjet, equiper, possede, type Objet } from '../meta'
import Avatar from '../components/Avatar'
import { ICONS, Icon, Piece, Pieces } from '../components/ui'

type Onglet = 'avatar' | 'cadre' | 'titre'
const CATEGORIES: { k: NonNullable<Objet['categorie']>; fr: string; en: string }[] = [
  { k: 'metier', fr: 'Métiers et personnages', en: 'Jobs & characters' }, { k: 'animal', fr: 'Animaux', en: 'Animals' },
  { k: 'fun', fr: 'Fun', en: 'Fun' }, { k: 'famille', fr: 'Familles de quiz', en: 'Quiz families' },
]

// Boutique : avatars, cadres et titres ; certains s'achètent, d'autres se gagnent par un exploit
export default function Boutique() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [msg, setMsg] = useState('')
  const [onglet, setOnglet] = useState<Onglet>('avatar')

  const action = async (o: Objet) => {
    if (!user) return
    setMsg('')
    if (o.condition && !possede(profile, o)) { setMsg(`🔒 ${o.nom[lang]} : ${o.condition.desc[lang]}`); return }
    if (!possede(profile, o) && !(await acheterObjet(user.uid, o).catch(() => false))) { setMsg(fr ? 'Pas assez de pièces.' : 'Not enough coins.'); return }
    await equiper(user.uid, o)
  }
  const retirerTitre = async () => {
    if (!user) return
    await Promise.all([setDoc(doc(db, 'users', user.uid), { titre: deleteField() }, { merge: true }), setDoc(doc(db, 'profils', user.uid), { titre: '' }, { merge: true })])
  }
  const equipe = (o: Objet) => (o.type === 'avatar' ? profile?.avatar : o.type === 'cadre' ? profile?.cadre : profile?.titre) === o.id

  const Carte = ({ o }: { o: Objet }) => {
    const a = possede(profile, o)
    const porte = equipe(o)
    return (
      <button type="button" onClick={() => action(o)} className={`objet${porte ? ' porte' : ''}${!a ? ' bloque' : ''}`}>
        <Avatar pseudo={profile?.pseudo} avatar={o.type === 'avatar' ? o.id : profile?.avatar} cadre={o.type === 'cadre' ? o.id : profile?.cadre} taille={76} anime={o.type === 'cadre'} />
        <span className="objet-nom">{o.nom[lang]}</span>
        <span className={`objet-etat${porte ? ' ok' : a ? '' : o.condition ? ' cond' : ' prix'}`}>
          {porte ? (fr ? 'Équipé' : 'Equipped') : a ? (fr ? 'Équiper' : 'Equip') : o.condition ? <><Icon d={ICONS.lock} size={13} />{o.condition.desc[lang]}</> : <><Piece size={15} />{o.prix}</>}
        </span>
      </button>
    )
  }

  const liste = BOUTIQUE.filter((o) => o.type === onglet)
  const gagnes = liste.filter((o) => o.condition && possede(profile, o)).length
  const aGagner = liste.filter((o) => o.condition).length

  return (
    <>
      <Link to="/profil" className="lien-retour"><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h1 className="t" style={{ fontSize: 32, fontWeight: 900 }}>{fr ? 'Boutique et récompenses' : 'Shop & rewards'}</h1>
        <Pieces n={profile?.pieces ?? 0} />
      </header>
      <div role="tablist" className="onglets">
        {([['avatar', fr ? 'Avatars' : 'Avatars'], ['cadre', fr ? 'Cadres' : 'Frames'], ['titre', fr ? 'Titres' : 'Titles']] as [Onglet, string][]).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={onglet === id} className="onglet" onClick={() => { setOnglet(id); setMsg('') }}>{l}</button>
        ))}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
        {onglet === 'titre'
          ? (fr ? 'Les titres se gagnent par des exploits (succès secrets, multijoueur, maîtrise…) et s’affichent sous ton pseudo.' : 'Titles are earned through feats and shown under your name.')
          : (fr ? `Certains s’achètent avec des pièces, d’autres se gagnent en jouant : ${gagnes} / ${aGagner} gagnés.` : `Some are bought, others earned: ${gagnes} / ${aGagner} earned.`)}
      </p>
      {msg && <p role="status" className="card" style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--ko-i)' }}>{msg}</p>}

      {onglet === 'avatar' && CATEGORIES.map((c) => (
        <section key={c.k} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="t titre-section">{c[lang]}</h2>
          <div className="grille-objets">{liste.filter((o) => o.categorie === c.k).map((o) => <Carte key={o.id} o={o} />)}</div>
        </section>
      ))}
      {onglet === 'cadre' && (
        <>
          <h2 className="t titre-section">{fr ? 'À gagner (animés)' : 'Earned (animated)'}</h2>
          <div className="grille-objets">{liste.filter((o) => o.condition).map((o) => <Carte key={o.id} o={o} />)}</div>
          <h2 className="t titre-section">{fr ? 'À acheter' : 'To buy'}</h2>
          <div className="grille-objets">{liste.filter((o) => !o.condition).map((o) => <Carte key={o.id} o={o} />)}</div>
        </>
      )}
      {onglet === 'titre' && (
        <div className="liste-titres">
          {profile?.titre && <button type="button" className="titre-ligne" onClick={retirerTitre}><span className="titre-badge" style={{ opacity: .6 }}>—</span><span style={{ flex: 1 }}>{fr ? 'Ne pas afficher de titre' : 'No title'}</span></button>}
          {liste.map((o) => {
            const a = possede(profile, o)
            const porte = equipe(o)
            return (
              <button key={o.id} type="button" className={`titre-ligne${porte ? ' porte' : ''}${a ? '' : ' bloque'}`} onClick={() => action(o)}>
                <span className="titre-badge">{a ? '🏅' : '🔒'}</span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <strong className="t">{o.nom[lang]}</strong>
                  <small>{o.condition?.desc[lang]}</small>
                </span>
                <span className={`objet-etat${porte ? ' ok' : ''}`}>{porte ? (fr ? 'Équipé' : 'Equipped') : a ? (fr ? 'Équiper' : 'Equip') : ''}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
