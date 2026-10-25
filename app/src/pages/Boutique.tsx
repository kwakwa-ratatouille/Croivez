import { noterActivite } from '../activite'
import { feter, sonReponse } from '../effets'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { doc, deleteField, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs, type Lang } from '../i18n'
import { BOUTIQUE, acheterObjet, equiper, possede, type Objet } from '../meta'
import Avatar from '../components/Avatar'
import { Particules, Pseudo, fondAnime } from '../components/Cosmetiques'
import { ICONS, Icon, Piece, Pieces } from '../components/ui'

type Onglet = 'avatar' | 'cadre' | 'fond' | 'pseudo' | 'titre' | 'effet'
const ONGLETS: Onglet[] = ['avatar', 'cadre', 'fond', 'pseudo', 'titre', 'effet']
const NOMS_ONGLETS: Record<Onglet, Record<Lang, string>> = {
  avatar: { fr: 'Avatars', en: 'Avatars' }, cadre: { fr: 'Cadres', en: 'Frames' }, fond: { fr: 'Vitrines', en: 'Showcases' },
  pseudo: { fr: 'Pseudos', en: 'Names' }, titre: { fr: 'Titres', en: 'Titles' }, effet: { fr: 'Effets', en: 'Effects' },
}
type Vue = 'tout' | 'moi' | 'acheter' | 'gagner'
type Tri = 'conseil' | 'prix-' | 'prix+' | 'nom'

// Origine d'un objet : sert à ranger la boutique en sections claires
type Origine = 'album' | 'jetons' | 'boutique' | 'luxe' | 'exploits' | 'familles' | 'histoire' | 'evenements' | 'rangs'
const ORIGINES: { k: Origine; nom: Record<Lang, string>; emoji: string }[] = [
  { k: 'album', nom: { fr: 'Récompenses de l’album', en: 'Album rewards' }, emoji: '📖' },
  { k: 'boutique', nom: { fr: 'En vente', en: 'For sale' }, emoji: '🛍️' },
  { k: 'jetons', nom: { fr: 'Boutique des rangs (jetons)', en: 'Rank shop (tokens)' }, emoji: '🎖️' },
  { k: 'luxe', nom: { fr: 'Luxe et ultra', en: 'Luxury & ultra' }, emoji: '👑' },
  { k: 'exploits', nom: { fr: 'Exploits à réussir', en: 'Feats' }, emoji: '🎯' },
  { k: 'rangs', nom: { fr: 'Récompenses de rang', en: 'Rank rewards' }, emoji: '🏆' },
  { k: 'evenements', nom: { fr: 'Événements et saisons', en: 'Events & seasons' }, emoji: '🎃' },
  { k: 'histoire', nom: { fr: 'Mode histoire', en: 'Story mode' }, emoji: '🗺️' },
  { k: 'familles', nom: { fr: 'Maîtres des familles', en: 'Family masters' }, emoji: '📚' },
]
const origine = (o: Objet): Origine =>
  o.album ? 'album'
  : o.jetons ? 'jetons'
  : /-rang-/.test(o.id) ? 'rangs'
    : o.evenement || o.saison || /saison/.test(o.id) ? 'evenements'
      : /tour-du-monde|mi-parcours|premier-boss|avatar-boss|astronaute-or|legendes-histoire|legende-histoire|cadre-arcade/.test(o.id) ? 'histoire'
        : /maitre-/.test(o.id) || (o.categorie === 'famille' && !o.luxe) ? 'familles'
          : o.condition ? 'exploits'
            : o.luxe ? 'luxe' : 'boutique'
const CATEGORIES: { k: NonNullable<Objet['categorie']>; nom: Record<Lang, string>; emoji: string }[] = [
  { k: 'portrait', nom: { fr: 'Personnages illustrés', en: 'Illustrated characters' }, emoji: '🎨' }, { k: 'metier', nom: { fr: 'Métiers et personnages', en: 'Jobs & characters' }, emoji: '🧑‍🚀' }, { k: 'animal', nom: { fr: 'Animaux', en: 'Animals' }, emoji: '🐾' },
  { k: 'fun', nom: { fr: 'Fun', en: 'Fun' }, emoji: '🎈' }, { k: 'famille', nom: { fr: 'Familles de quiz', en: 'Quiz families' }, emoji: '📚' },
]
const sansAccents = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Boutique : on choisit un type d'objet, puis on filtre (à moi, à acheter, à gagner), on cherche et on trie.
// Rien ne s'achète sans confirmation.
export default function Boutique() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [params] = useSearchParams()
  const [onglet, setOnglet] = useState<Onglet>(ONGLETS.find((o) => o === params.get('o')) ?? 'avatar')
  const [vue, setVue] = useState<Vue>('tout')
  const [mode, setMode] = useState<'pieces' | 'rangs' | 'album'>(params.get('rangs') === '1' ? 'rangs' : params.get('album') === '1' ? 'album' : 'pieces') // boutique des pièces, des rangs (jetons) ou de l'album
  const rangs = mode === 'rangs'
  const [filtres, setFiltres] = useState(false)
  const [cat, setCat] = useState('')
  const [tri, setTri] = useState<Tri>('conseil')
  const [cherche, setCherche] = useState('')
  const [confirmer, setConfirmer] = useState(false) // 2ᵉ étape avant de payer
  const [choisi, setChoisi] = useState<Objet | null>(null) // fiche de l'objet touché (achat, équipement, condition)
  const [msg, setMsg] = useState('')
  const solde = profile?.pieces ?? 0
  const jetons = profile?.jetons ?? 0
  // Ce que coûte un objet, dans sa monnaie (pièces ou jetons de rang)
  const peutPayer = (o: Objet) => (o.jetons ? jetons >= o.jetons : solde >= o.prix)
  const valeur = (o: Objet) => (o.jetons ? o.jetons * 200 : o.prix)
  const Prix = ({ o }: { o: Objet }) => o.jetons ? <span className="prix-jetons">🎖️ {o.jetons}</span> : <><Piece size={15} />{o.prix.toLocaleString(fr ? 'fr-FR' : 'en-GB')}</>

  const equipe = (o: Objet) => ({ avatar: profile?.avatar, cadre: profile?.cadre, titre: profile?.titre, fond: profile?.vitrineFond, pseudo: profile?.pseudoStyle, effet: o.sorte === 'couleur' ? (profile?.couleurApp || 'couleur-defaut') : o.sorte === 'son' ? (profile?.sonReponse || 'son-classique') : (profile?.victoire || 'victoire-confettis') })[o.type] === o.id
  const retirerTitre = async () => {
    if (!user) return
    await Promise.all([setDoc(doc(db, 'users', user.uid), { titre: deleteField() }, { merge: true }), setDoc(doc(db, 'profils', user.uid), { titre: '' }, { merge: true })])
  }
  const acheter = async (o: Objet) => {
    if (!user) return
    if (!(await acheterObjet(user.uid, o).catch(() => false))) { setMsg(o.jetons ? (fr ? 'Pas assez de jetons de rang.' : 'Not enough rank tokens.') : (fr ? 'Pas assez de pièces.' : 'Not enough coins.')); return }
    await equiper(user.uid, o)
    if (o.luxe || o.prix >= 1000) noterActivite(user.uid, o.luxe === 2 ? '👑' : '🛍️', `s’est offert « ${o.nom.fr} »`).catch(() => {})
    setMsg(fr ? `🎉 ${o.nom.fr} acheté et équipé !` : `🎉 ${o.nom.en} bought and equipped!`)
    setChoisi(null)
  }
  const toucher = async (o: Objet) => {
    setMsg('')
    if (o.type === 'effet' && o.sorte === 'son') sonReponse(true, o.id)
    if (o.type === 'effet' && o.sorte === 'victoire') feter(o.id, 1)
    if (possede(profile, o) && user) { if (!equipe(o)) await equiper(user.uid, o); return }
    setConfirmer(false)
    setChoisi(o)
  }

  const duType = useMemo(() => BOUTIQUE.filter((o) => o.type === onglet && !o.cache && (o.album ? mode === 'album' : mode !== 'album' && !!o.jetons === rangs)), [onglet, rangs])
  const liste = useMemo(() => {
    const q = sansAccents(cherche.trim())
    const l = duType.filter((o) => {
      const a = possede(profile, o)
      if (vue === 'moi' && !a) return false
      if (vue === 'acheter' && (a || o.condition)) return false
      if (vue === 'gagner' && (a || !o.condition)) return false
      return !q || sansAccents(o.nom[lang]).includes(q)
    })
    // Conseillé : ce que je possède, puis ce que je peux m'offrir (du moins cher au plus cher), puis le reste
    const rangConseil = (o: Objet) => (possede(profile, o) ? 0 : !o.condition && peutPayer(o) ? 1 : !o.condition ? 2 : 3)
    return [...l].sort((a, b) =>
      tri === 'prix-' ? valeur(a) - valeur(b)
        : tri === 'prix+' ? valeur(b) - valeur(a)
          : tri === 'nom' ? a.nom[lang].localeCompare(b.nom[lang], lang)
            : rangConseil(a) - rangConseil(b) || valeur(a) - valeur(b))
  }, [duType, vue, cherche, tri, profile, lang, solde, jetons]) // eslint-disable-line react-hooks/exhaustive-deps

  const nb = (l: Objet[]) => `${l.filter((o) => possede(profile, o)).length} / ${l.length}`

  const Apercu = ({ o, taille = 76 }: { o: Objet; taille?: number }) => o.type === 'effet'
    ? <span className={`apercu-effet effet-${o.sorte}`} data-couleur-apercu={o.sorte === 'couleur' ? o.id.replace('couleur-', '') : undefined}>{o.emoji}</span>
    : o.type === 'fond'
    ? (() => { const f = fondAnime(o.id); return f ? <span className="apercu-fond" style={{ background: f.fond }}><Particules f={f} nb={8} /></span> : null })()
    : o.type === 'pseudo' ? <span className="apercu-pseudo t"><Pseudo nom={profile?.pseudo || 'Croivez'} style={o.id} /></span>
      : o.type === 'titre' ? <span className={`apercu-titre t${o.anim ? ' titre-affiche ' + o.anim.split(' ').map((x) => 'titre-fx-' + x).join(' ') : ''}`}>{o.nom[lang]}</span>
        : <Avatar pseudo={profile?.pseudo} avatar={o.type === 'avatar' ? o.id : profile?.avatar} cadre={o.type === 'cadre' ? o.id : profile?.cadre} taille={taille} anime={o.type === 'cadre' || !!o.luxe} />

  const Carte = ({ o }: { o: Objet }) => {
    const a = possede(profile, o)
    const porte = equipe(o)
    const abordable = !a && !o.condition && peutPayer(o)
    return (
      <button type="button" onClick={() => toucher(o)} className={`objet${porte ? ' porte' : ''}${!a ? ' bloque' : ''}${abordable ? ' abordable' : ''}${o.luxe ? ` luxe luxe-${o.luxe}` : ''}${o.type === 'titre' ? ' objet-titre' : ''}`}>
        {o.luxe && <span className="badge-luxe">{o.luxe === 2 ? 'ULTRA' : (fr ? 'LUXE' : 'LUXURY')}</span>}
        <Apercu o={o} />
        {o.type !== 'titre' && <span className="objet-nom">{o.nom[lang]}</span>}
        <span className={`objet-etat${porte ? ' ok' : a ? '' : o.condition ? ' cond' : ' prix'}`}>
          {porte ? (fr ? '✓ Équipé' : '✓ Equipped') : a ? (fr ? 'Équiper' : 'Equip') : o.condition ? <><Icon d={ICONS.lock} size={13} />{fr ? 'À gagner' : 'To earn'}</> : <Prix o={o} />}
        </span>
      </button>
    )
  }

  const grille = onglet === 'fond' || onglet === 'pseudo' || onglet === 'titre' ? 'grille-objets large' : 'grille-objets'
  // Tri « conseillé » : sections par origine ; autres tris : une seule liste triée
  const sections = tri !== 'conseil' ? null
    : onglet === 'avatar'
      // Avatars : par catégorie (métiers, animaux, fun, familles), le luxe à part
      ? [...CATEGORIES.map((c) => ({ g: { k: c.k, nom: c.nom, emoji: c.emoji }, l: liste.filter((o) => o.categorie === c.k && !o.luxe) })), { g: { k: 'luxe', nom: { fr: 'Luxe et ultra', en: 'Luxury & ultra' }, emoji: '👑' }, l: liste.filter((o) => o.luxe) }].filter((s) => s.l.length)
      : onglet === 'effet'
        // Effets : thèmes de couleur, fêtes de victoire, sons
        ? ([['couleur', { fr: 'Thèmes de couleur', en: 'Colour themes' }, '🎨'], ['victoire', { fr: 'Fêtes de victoire', en: 'Victory effects' }, '🎉'], ['son', { fr: 'Sons des réponses', en: 'Answer sounds' }, '🔊']] as const).map(([k, nom, emoji]) => ({ g: { k, nom, emoji }, l: liste.filter((o) => o.sorte === k) })).filter((s) => s.l.length)
        : ORIGINES.map((g) => ({ g, l: liste.filter((o) => origine(o) === g.k) })).filter((s) => s.l.length)

  return (
    <>
      <Link to="/profil" className="lien-retour"><Icon d={ICONS.arrowL} />{fr ? 'Profil' : 'Profile'}</Link>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h1 className="t" style={{ fontSize: 32, fontWeight: 900 }}>{fr ? 'Boutique' : 'Shop'}</h1>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="solde-jetons" title={fr ? 'Jetons de rang : gagnés chaque lundi selon ton rang' : 'Rank tokens'}>🎖️ {jetons}</span>
          <Pieces n={solde} />
        </span>
      </header>

      {/* Deux boutiques : pièces ou jetons de rang, un seul interrupteur */}
      <div className="bascule-boutique" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'pieces'} onClick={() => { setMode('pieces'); setCat('') }}><Piece size={18} /> {fr ? 'Boutique' : 'Shop'}</button>
        <button type="button" role="tab" aria-selected={mode === 'rangs'} onClick={() => { setMode('rangs'); setCat('') }}>🎖️ {fr ? 'Rangs' : 'Ranks'}</button>
        <button type="button" role="tab" aria-selected={mode === 'album'} onClick={() => { setMode('album'); setCat('') }}>📖 Album</button>
      </div>
      {rangs && <p className="aide-rangs">{fr ? 'Objets exclusifs, payés en jetons de rang : tu en gagnes chaque lundi selon ton rang en classé.' : 'Exclusive items paid with rank tokens.'}</p>}

      {/* Types d'objets en grosses tuiles */}
      <div className="tuiles-boutique" role="tablist">
        {ONGLETS.map((id) => {
          const l = BOUTIQUE.filter((o) => o.type === id && !o.cache && (o.album ? mode === 'album' : mode !== 'album' && !!o.jetons === rangs))
          if (!l.length) return null
          return <button key={id} type="button" role="tab" aria-selected={onglet === id} className="tuile-boutique" onClick={() => { setOnglet(id); setCat(''); setMsg('') }}><span>{{ avatar: '🧑‍🎨', cadre: '🖼️', fond: '🌈', pseudo: '✍️', titre: '🏷️', effet: '✨' }[id]}</span><strong>{NOMS_ONGLETS[id][lang]}</strong><small>{nb(l)}</small></button>
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="button" className="btn btn-g" style={{ minHeight: 36, fontSize: 14 }} onClick={() => setFiltres((x) => !x)}>🔍 {filtres ? (fr ? 'Masquer les filtres' : 'Hide filters') : (fr ? 'Chercher et trier' : 'Search & sort')}</button></div>
      {filtres && (
      <div className="barre-boutique">
        <label className="recherche-boutique">
          <Icon d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM15.5 15.5 20 20" size={16} />
          <input className="input" type="search" value={cherche} onChange={(e) => setCherche(e.target.value)} placeholder={fr ? `Chercher dans les ${NOMS_ONGLETS[onglet].fr.toLowerCase()}…` : 'Search…'} />
        </label>
        <div className="segment" role="group" aria-label={fr ? 'Afficher' : 'Show'}>
          {([['tout', fr ? 'Tout' : 'All'], ['moi', fr ? 'À moi' : 'Mine'], ['acheter', fr ? 'À acheter' : 'To buy'], ['gagner', fr ? 'À gagner' : 'To earn']] as [Vue, string][]).map(([k, l]) => <button key={k} type="button" aria-pressed={vue === k} onClick={() => setVue(k)}>{l}</button>)}
        </div>
        <label className="tri-boutique">
          <span>{fr ? 'Trier' : 'Sort'}</span>
          <select className="input" value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
            <option value="conseil">{fr ? 'Par origine (conseillé)' : 'By origin'}</option>
            <option value="prix-">{fr ? 'Prix croissant' : 'Price: low to high'}</option>
            <option value="prix+">{fr ? 'Prix décroissant' : 'Price: high to low'}</option>
            <option value="nom">{fr ? 'Nom (A → Z)' : 'Name (A → Z)'}</option>
          </select>
        </label>
      </div>

      )}

      {msg && <p role="status" className="card" style={{ padding: '12px 16px', fontWeight: 700 }}>{msg}</p>}
      {onglet === 'titre' && profile?.titre && <button type="button" className="btn btn-g" style={{ alignSelf: 'flex-start' }} onClick={retirerTitre}>{fr ? 'Ne plus afficher de titre' : 'Hide my title'}</button>}
      {liste.length === 0 && <p style={{ color: 'var(--muted)' }}>{fr ? 'Rien ici avec ces filtres.' : 'Nothing matches.'}</p>}

      {sections && sections.length > 1 && (
        <div className="pastilles-boutique">
          {sections.map(({ g, l }) => <button key={g.k} type="button" className="pill" aria-pressed={(cat || sections[0].g.k) === g.k} onClick={() => setCat(g.k)}>{g.emoji} {g.nom[lang]} <small>{nb(l)}</small></button>)}
        </div>
      )}
      <div className={grille}>{(sections ? (sections.find((x) => x.g.k === cat) ?? sections[0])?.l ?? [] : liste).map((o) => <Carte key={o.id} o={o} />)}</div>

      {/* Fiche d'un objet pas encore possédé : acheter (avec confirmation) ou voir comment le gagner */}
      {choisi && (
        <div className="fiche-objet-fond" role="dialog" aria-modal="true" aria-label={choisi.nom[lang]} onClick={() => setChoisi(null)}>
          <div className={`fiche-objet rise${choisi.luxe ? ` luxe-${choisi.luxe}` : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="fiche-objet-apercu"><Apercu o={choisi} taille={110} /></div>
            <strong className="t" style={{ fontSize: 22 }}>{choisi.nom[lang]}</strong>
            {confirmer && !choisi.condition && <p className="confirmer-achat">{choisi.jetons ? (fr ? `Dépenser ${choisi.jetons} jetons de rang pour « ${choisi.nom.fr} » ? Il t’en restera ${jetons - choisi.jetons}.` : `Spend ${choisi.jetons} tokens?`) : (fr ? `Dépenser ${choisi.prix.toLocaleString('fr-FR')} pièces pour « ${choisi.nom.fr} » ? Il te restera ${(solde - choisi.prix).toLocaleString('fr-FR')} pièces.` : `Spend ${choisi.prix} coins?`)}</p>}
            {confirmer && !choisi.condition ? null : choisi.condition
              ? <p style={{ color: 'var(--muted)' }}>🔒 {choisi.condition.desc[lang]}</p>
              : <p style={{ color: 'var(--muted)' }}>{choisi.jetons ? (jetons >= choisi.jetons ? (fr ? 'Exclusif à la boutique des rangs. Il sera équipé tout de suite.' : 'Rank shop exclusive.') : (fr ? `Il te manque ${choisi.jetons - jetons} jetons de rang. Tu en gagnes chaque lundi selon ton rang (5 en Bronze … 75 en Légende).` : `You need ${choisi.jetons - jetons} more tokens.`)) : peutPayer(choisi) ? (fr ? 'Il sera équipé tout de suite.' : 'It will be equipped right away.') : (fr ? `Il te manque ${(choisi.prix - solde).toLocaleString('fr-FR')} pièces.` : `You need ${choisi.prix - solde} more coins.`)}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-g" onClick={() => setChoisi(null)}>{confirmer ? (fr ? 'Annuler' : 'Cancel') : (fr ? 'Fermer' : 'Close')}</button>
              {!choisi.condition && !confirmer && <button type="button" className="btn btn-p" disabled={!peutPayer(choisi)} onClick={() => setConfirmer(true)}>{fr ? 'Acheter' : 'Buy'} · <Prix o={choisi} /></button>}
              {!choisi.condition && confirmer && <button type="button" className="btn btn-p" onClick={() => acheter(choisi)}>✓ {fr ? 'Oui, acheter' : 'Yes, buy'}</button>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
