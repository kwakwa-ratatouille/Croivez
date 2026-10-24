import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { doc, deleteField, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { BOUTIQUE, acheterObjet, equiper, possede, type Objet } from '../meta'
import Avatar from '../components/Avatar'
import { Particules, Pseudo, fondAnime } from '../components/Cosmetiques'
import { ICONS, Icon, Piece, Pieces } from '../components/ui'

type Onglet = 'avatar' | 'cadre' | 'titre' | 'fond' | 'pseudo'
const ONGLETS: Onglet[] = ['avatar', 'cadre', 'fond', 'pseudo', 'titre']
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
  const [params] = useSearchParams()
  const [onglet, setOnglet] = useState<Onglet>(ONGLETS.find((o) => o === params.get('o')) ?? 'avatar')
  const [filtre, setFiltre] = useState('tout')

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
  const equipe = (o: Objet) => ({ avatar: profile?.avatar, cadre: profile?.cadre, titre: profile?.titre, fond: profile?.vitrineFond, pseudo: profile?.pseudoStyle })[o.type] === o.id

  const Carte = ({ o }: { o: Objet }) => {
    const a = possede(profile, o)
    const porte = equipe(o)
    return (
      <button type="button" onClick={() => action(o)} className={`objet${porte ? ' porte' : ''}${!a ? ' bloque' : ''}${o.luxe ? ` luxe luxe-${o.luxe}` : ''}`}>
        {o.luxe && <span className="badge-luxe">{o.luxe === 2 ? 'ULTRA' : (fr ? 'LUXE' : 'LUXURY')}</span>}
        {o.type === 'fond' ? (() => { const f = fondAnime(o.id)!; return <span className="apercu-fond" style={{ background: f.fond }}><Particules f={f} nb={8} /></span> })()
          : o.type === 'pseudo' ? <span className="apercu-pseudo t"><Pseudo nom={profile?.pseudo || 'Croivez'} style={o.id} /></span>
          : <Avatar pseudo={profile?.pseudo} avatar={o.type === 'avatar' ? o.id : profile?.avatar} cadre={o.type === 'cadre' ? o.id : profile?.cadre} taille={76} anime={o.type === 'cadre'} />}
        <span className="objet-nom">{o.nom[lang]}</span>
        <span className={`objet-etat${porte ? ' ok' : a ? '' : o.condition ? ' cond' : ' prix'}`}>
          {porte ? (fr ? 'Équipé' : 'Equipped') : a ? (fr ? 'Équiper' : 'Equip') : o.condition ? <><Icon d={ICONS.lock} size={13} />{o.condition.desc[lang]}</> : <><Piece size={15} />{o.prix}</>}
        </span>
      </button>
    )
  }

  // Filtres : on trouve vite ce qu'on cherche (débloqués, à gagner, familles, histoire, événements…)
  const groupe = (o: Objet) => /maitre-/.test(o.id) ? 'familles' : /tour-du-monde|mi-parcours|premier-boss|avatar-boss|astronaute-or|legendes-histoire|legende-histoire|cadre-arcade/.test(o.id) ? 'histoire' : /-rang-/.test(o.id) ? 'rangs' : o.evenement || o.saison || /saison/.test(o.id) ? 'evenements' : o.condition ? 'gagner' : 'acheter'
  const garder = (o: Objet) => filtre === 'tout' || (filtre === 'debloques' ? possede(profile, o) : filtre === 'gagner' ? !!o.condition && !possede(profile, o) : filtre === 'acheter' ? !o.condition && !possede(profile, o) : groupe(o) === filtre)
  const liste = BOUTIQUE.filter((o) => o.type === onglet && garder(o))
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
        {([['avatar', fr ? 'Avatars' : 'Avatars'], ['cadre', fr ? 'Cadres' : 'Frames'], ['fond', fr ? '✨ Vitrines' : '✨ Showcases'], ['pseudo', fr ? '🌈 Pseudos' : '🌈 Names'], ['titre', fr ? 'Titres' : 'Titles']] as [Onglet, string][]).map(([id, l]) => (
          <button key={id} role="tab" aria-selected={onglet === id} className="onglet" onClick={() => { setOnglet(id); setMsg('') }}>{l}</button>
        ))}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
        {onglet === 'fond' ? (fr ? 'Des fonds animés pour ta vitrine de profil (pièces qui tombent, neige, confettis…), visibles par tous tes visiteurs. Un fond exclusif chaque mois au palier 15 du passe de combat.' : 'Animated backgrounds for your profile showcase. One exclusive each month at battle pass tier 15.')
          : onglet === 'pseudo' ? (fr ? 'Ton pseudo en couleur sur ton profil et dans les classements.' : 'Your name in colour on your profile and leaderboards.')
          : onglet === 'titre'
          ? (fr ? 'Les titres se gagnent par des exploits (succès secrets, multijoueur, maîtrise…) et s’affichent sous ton pseudo.' : 'Titles are earned through feats and shown under your name.')
          : (fr ? `Certains s’achètent avec des pièces, d’autres se gagnent en jouant : ${gagnes} / ${aGagner} gagnés.` : `Some are bought, others earned: ${gagnes} / ${aGagner} earned.`)}
      </p>
      <div className="filtres-boutique" role="group" aria-label={fr ? 'Filtrer' : 'Filter'}>
        {([['tout', fr ? 'Tout' : 'All'], ['debloques', fr ? '✅ Débloqués' : '✅ Unlocked'], ['gagner', fr ? '🎯 À gagner' : '🎯 To earn'], ['acheter', fr ? '🪙 À acheter' : '🪙 To buy'], ['familles', fr ? '👑 Familles' : '👑 Families'], ['histoire', fr ? '🗺️ Histoire' : '🗺️ Story'], ['evenements', fr ? '🎃 Événements' : '🎃 Events'], ['rangs', fr ? '🏆 Rangs' : '🏆 Ranks']] as [string, string][]).map(([k, l]) => <button key={k} type="button" className="pill" aria-pressed={filtre === k} onClick={() => setFiltre(k)}>{l}</button>)}
      </div>
      {liste.length === 0 && <p style={{ color: 'var(--muted)' }}>{fr ? 'Rien dans ce filtre pour l’instant.' : 'Nothing here yet.'}</p>}
      {msg && <p role="status" className="card" style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--ko-i)' }}>{msg}</p>}

      {onglet === 'avatar' && CATEGORIES.map((c) => (
        <section key={c.k} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 className="t titre-section">{c[lang]}</h2>
          <div className="grille-objets">{liste.filter((o) => o.categorie === c.k).map((o) => <Carte key={o.id} o={o} />)}</div>
        </section>
      ))}
      {onglet === 'cadre' && (
        <>
          {([['gagner', fr ? 'À gagner en jouant (animés)' : 'Earned (animated)'], ['familles', fr ? 'Maîtres des familles' : 'Family masters'], ['histoire', fr ? 'Mode histoire' : 'Story mode'], ['evenements', fr ? 'Événements et saisons' : 'Events & seasons'], ['rangs', fr ? 'Récompenses de rang' : 'Rank rewards'], ['acheter', fr ? 'À acheter' : 'To buy']] as [string, string][]).map(([g, titre]) => {
            const l = liste.filter((o) => groupe(o) === g)
            return l.length > 0 && (
              <details key={g} className="groupe-objets" open>
                <summary className="t">{titre} <span>{l.filter((o) => possede(profile, o)).length} / {l.length}</span></summary>
                <div className="grille-objets">{l.map((o) => <Carte key={o.id} o={o} />)}</div>
              </details>
            )
          })}
        </>
      )}
      {(onglet === 'fond' || onglet === 'pseudo') && <div className="grille-objets large">{liste.map((o) => <Carte key={o.id} o={o} />)}</div>}
      {onglet === 'titre' && (
        <div className="liste-titres">
          {profile?.titre && <button type="button" className="titre-ligne" onClick={retirerTitre}><span className="titre-badge" style={{ opacity: .6 }}>—</span><span style={{ flex: 1 }}>{fr ? 'Ne pas afficher de titre' : 'No title'}</span></button>}
          {liste.map((o) => {
            const a = possede(profile, o)
            const porte = equipe(o)
            return (
              <button key={o.id} type="button" className={`titre-ligne${porte ? ' porte' : ''}${a ? '' : ' bloque'}${o.luxe ? ` luxe luxe-${o.luxe}` : ''}`} onClick={() => action(o)}>
                <span className="titre-badge">{a ? '🏅' : o.condition ? '🔒' : o.luxe === 2 ? '👑' : '💰'}</span>
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <strong className="t">{o.nom[lang]}</strong>
                  <small>{o.condition?.desc[lang] ?? (fr ? 'À acheter en boutique' : 'Buy in the shop')}</small>
                </span>
                <span className={`objet-etat${porte ? ' ok' : !a && !o.condition ? ' prix' : ''}`}>{porte ? (fr ? 'Équipé' : 'Equipped') : a ? (fr ? 'Équiper' : 'Equip') : !o.condition ? <><Piece size={15} />{o.prix}</> : ''}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
