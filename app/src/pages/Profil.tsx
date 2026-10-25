import { BadgeClan } from '../components/BlasonClan'
import Img from '../components/Img'
import { cartesDe } from './Album'
import ChoixTheme from '../components/ChoixTheme'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { niveau, useAuth, xpPourNiveau } from '../auth'
import { usePrefs, type Lang } from '../i18n'
import { FAMILLES } from '../themes'
import { BADGES, PALIERS, palierAtteint } from '../badges'
import { BOUTIQUE, SECRETS, possede } from '../meta'
import { FONDS_ANIMES, Particules, Pseudo, fondAnime } from '../components/Cosmetiques'
import { accesQuiz } from '../progression'
import { prevenirAmi, profilPublic, publierVitrine, resumePublic, type ProfilPublic } from '../social'
import Avatar from '../components/Avatar'
import CarteCouverture from '../components/CarteCouverture'
import { Icon, ICONS } from '../components/ui'

// Médaille d'un badge (vitrine : « id:palier »)
function Medaille({ v, lang, taille = 56 }: { v: string; lang: Lang; taille?: number }) {
  const [id, n] = v.split(':')
  const b = BADGES.find((x) => x.id === id)
  if (!b) return null
  const pl = PALIERS[Math.max(0, Number(n) - 1)]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 84, textAlign: 'center' }}>
      <span className={Number(n) === 3 ? 'medaille-or' : ''} style={{ width: taille, height: taille, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `var(--${b.couleur}-t)`, color: `var(--${b.couleur}-i)`, border: `3px solid ${pl.couleur}`, position: 'relative', overflow: 'hidden' }}>
        <Icon d={b.icon} size={taille * 0.45} />
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.15 }}>{b.nom[lang]}</span>
    </div>
  )
}

// Carte de joueur : partagée entre mon profil et celui des autres
export function CarteJoueur({ p, moi = false }: { p: ProfilPublic; moi?: boolean }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const fmt = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB')
  const nv = niveau(p.xp ?? 0)
  const debut = xpPourNiveau(nv), fin = xpPourNiveau(nv + 1)
  const pct = Math.round((((p.xp ?? 0) - debut) / (fin - debut)) * 100)
  const stats: [string | number, string][] = [
    [fmt.format(p.parties ?? 0), fr ? 'parties' : 'games'], [fmt.format(p.bonnes ?? 0), fr ? 'bonnes' : 'correct'],
    [p.meilleureSerie ?? p.serie ?? 0, fr ? 'série max' : 'best streak'], [fmt.format(p.xp ?? 0), 'XP'],
  ]
  // Familles triées par maîtrise : les points forts d'abord
  const familles = FAMILLES.map((f) => ({ f, v: p.familles?.[f.k] ?? 0 })).sort((a, b) => b.v - a.v)
  return (
    <>
      <section className="card profil-tete">
        {moi ? <Link to="/boutique" aria-label={fr ? 'Changer d’avatar' : 'Change avatar'}><Avatar pseudo={p.pseudo} avatar={p.avatar} cadre={p.cadre} taille={84} anime /></Link> : <Avatar pseudo={p.pseudo} avatar={p.avatar} cadre={p.cadre} taille={84} anime />}
        <div style={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="t" style={{ fontSize: 26, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis' }}><Pseudo nom={p.pseudo} style={p.pseudoStyle} /></h1>
          {/* Titre équipé (gagné par un exploit) */}
          {(() => { const o = BOUTIQUE.find((x) => x.id === p.titre); return o && <span className={`titre-affiche${o.anim ? ' ' + o.anim.split(' ').map((x) => 'titre-fx-' + x).join(' ') : ''}`}>{o.luxe ? '✦' : '🏅'} {o.nom[lang]}</span> })()}
          <BadgeClan code={(p as { clan?: string }).clan} />
          {moi && !p.titre && <Link to="/boutique" className="titre-affiche vide">+ {fr ? 'Choisir un titre' : 'Pick a title'}</Link>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="chip" style={{ background: 'var(--mus-t)', color: 'var(--mus-i)' }}>{fr ? 'Niv.' : 'Lv.'} {nv}</span>
            <div className="bar" style={{ flex: 1 }}><span style={{ width: `${pct}%`, background: 'var(--mus)' }} /></div>
          </div>
          <div className="profil-stats">{stats.map(([v, l]) => <div key={l}><strong className="t">{v}</strong><span>{l}</span></div>)}</div>
        </div>
      </section>
      <section className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="t" style={{ fontSize: 17, fontWeight: 900 }}>{fr ? 'Maîtrise par famille' : 'Mastery by family'}</h2>
        <div className="profil-familles">
          {familles.map(({ f, v }) => (
            <div key={f.k} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr) 70px 38px', alignItems: 'center', gap: 8 }}>
              <span style={{ color: `var(--${f.k}-i)` }}><Icon d={f.icon} size={18} /></span>
              <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.nom[lang]}</span>
              <div className="bar" style={{ height: 7 }}><span style={{ width: `${v}%`, background: `var(--${f.k})` }} /></div>
              <span style={{ textAlign: 'right', fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>{v} %</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

// Fonds de vitrine au choix
export const FONDS_VITRINE: Record<string, string> = {
  aurore: 'linear-gradient(120deg, #7B5CF0, #E25FA8 55%, #F39A4E)', ocean: 'linear-gradient(120deg, #0EA5E9, #6366F1)', foret: 'linear-gradient(120deg, #14532D, #22C55E)',
  braise: 'linear-gradient(120deg, #7F1D1D, #F97316)', nuit: 'linear-gradient(120deg, #0F0C29, #302B63 60%, #24243E)', or: 'linear-gradient(120deg, #B8862E, #F4C430 60%, #FFF2B8)',
  bonbon: 'linear-gradient(120deg, #F472B6, #FBCFE8 50%, #A5F3FC)', ardoise: 'linear-gradient(120deg, #334155, #64748B)',
  // Fonds à motifs
  etoiles: 'radial-gradient(circle at 20% 30%, #fff 0 1.5px, transparent 2px) 0 0 / 46px 46px, radial-gradient(circle at 70% 60%, #fff 0 1px, transparent 1.5px) 0 0 / 31px 31px, linear-gradient(140deg, #0F0C29, #3B2B8C)',
  pois: 'radial-gradient(circle, rgba(255,255,255,.35) 0 6px, transparent 7px) 0 0 / 34px 34px, linear-gradient(120deg, #F97316, #EC4899)',
  rayures: 'repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 16px, transparent 16px 32px), linear-gradient(120deg, #0EA5E9, #22C55E)',
  damier: 'conic-gradient(rgba(255,255,255,.12) 25%, transparent 0 50%, rgba(255,255,255,.12) 0 75%, transparent 0) 0 0 / 40px 40px, linear-gradient(120deg, #7C3AED, #2563EB)',
  vagues: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,.25) 0 30%, transparent 31%) 0 0 / 80px 40px, linear-gradient(180deg, #38BDF8, #1E3A8A)',
  coucher: 'radial-gradient(circle at 70% 75%, #FFE08A 0 12%, transparent 13%), linear-gradient(180deg, #F97316, #DB2777 55%, #4C1D95)',
}

// Vitrine : une bannière personnalisable (fond, phrase, 3 badges, thème favori, chiffres forts)
function Vitrine({ p, moi, onModifier }: { p: ProfilPublic; moi: boolean; onModifier?: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const fmt = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB')
  const anime = fondAnime(p.vitrineFond)
  const fond = anime?.fond ?? FONDS_VITRINE[p.vitrineFond ?? ''] ?? FONDS_VITRINE.aurore
  const cases = [0, 1, 2].map((i) => p.vitrine?.[i])
  return (
    <section className="vitrine rise" style={{ background: fond }}>
      {anime && <Particules f={anime} />}
      <div className="vitrine-haut">
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>{fr ? 'Vitrine' : 'Showcase'}</span>
          <p className="t vitrine-bio">{p.bio || (moi ? (fr ? 'Ajoute une phrase qui te ressemble…' : 'Add a line about you…') : '')}</p>
        </div>
        {moi && <button className="btn vitrine-modifier" onClick={onModifier}><Icon d={ICONS.settings} size={16} />{fr ? 'Personnaliser' : 'Customize'}</button>}
      </div>
      <div className="vitrine-corps">
        <div className="vitrine-badges">
          {cases.map((v, i) => v
            ? <div key={i} className="vitrine-case"><Medaille v={v} lang={lang} taille={64} /></div>
            : <div key={i} className="vitrine-case vide">{moi ? '+' : ''}</div>)}
        </div>
        <div className="vitrine-chiffres">
          <div><strong className="t">{fmt.format(p.erudition ?? 0)}</strong><span>{fr ? 'érudition' : 'knowledge'}</span></div>
          <div><strong className="t">{p.meilleureSerie ?? 0}</strong><span>{fr ? 'jours de série max' : 'best streak'}</span></div>
          <div><strong className="t">{fmt.format(p.bonnes ?? 0)}</strong><span>{fr ? 'bonnes réponses' : 'correct answers'}</span></div>
        </div>
      </div>
      {/* Cartes d'album exposées */}
      {!!p.vitrineCartes?.length && (
        <div className="vitrine-ligne">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.85)' }}>{fr ? 'Ma collection' : 'My collection'}</span>
          <div className="vitrine-cartes">{p.vitrineCartes.map((c) => <div key={c.s + c.id} className="vitrine-carte">{c.img ? <Img src={c.img} alt="" /> : <span />}<strong>{c.nom}</strong></div>)}</div>
        </div>
      )}
      {/* Familles et thèmes préférés */}
      {(!!p.famillesFav?.length || !!(p.quizFav?.length || p.favori)) && (
        <div className="vitrine-ligne">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,.85)' }}>{fr ? 'Ce que j’adore' : 'What I love'}</span>
          {!!p.famillesFav?.length && <div className="vitrine-familles">{p.famillesFav.map((k) => { const f = FAMILLES.find((x) => x.k === k); return f && <span key={k} className="vitrine-famille"><Icon d={f.icon} size={14} />{f.nom[lang]}</span> })}</div>}
          <div className="vitrine-quiz">{(p.quizFav?.length ? p.quizFav : p.favori ? [p.favori] : []).map((id) => <CarteCouverture key={id} id={id} largeur={130} />)}</div>
        </div>
      )}
    </section>
  )
}

// Choisir des cartes d'album à exposer : un quiz, puis ses cartes obtenues
function ChoixCartes() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [quiz, setQuiz] = useState('mix')
  const [cartes, setCartes] = useState<{ id: string; nom: string; img?: string }[]>([])
  const album = profile?.album ?? {}
  useEffect(() => { if (quiz !== 'mix') cartesDe(quiz, lang).then((l) => setCartes(l.filter((c) => album[quiz]?.includes(c.id)))).catch(() => setCartes([])) }, [quiz, lang]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!user || !profile) return null
  const expo = profile.vitrineCartes ?? []
  const basculer = (c: { id: string; nom: string; img?: string }) => {
    const deja = expo.some((x) => x.s === quiz && x.id === c.id)
    publierVitrine(user.uid, profile, { vitrineCartes: deja ? expo.filter((x) => !(x.s === quiz && x.id === c.id)) : [...expo, { s: quiz, id: c.id, nom: c.nom, ...(c.img ? { img: c.img } : {}) }].slice(-3) })
  }
  const quizAvecCartes = Object.keys(album).filter((s) => album[s]?.length)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {expo.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{expo.map((c) => <button key={c.s + c.id} type="button" className="pill" aria-pressed onClick={() => publierVitrine(user.uid, profile, { vitrineCartes: expo.filter((x) => x !== c) })}>{c.nom} ✕</button>)}</div>}
      {quizAvecCartes.length === 0 ? <span style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? 'Joue pour gagner des cartes d’album, puis expose les plus belles ici.' : 'Play to collect cards first.'}</span>
        : <ChoixTheme valeur={quiz} quiz={quizAvecCartes} onChange={setQuiz} />}
      {quiz !== 'mix' && <div className="choix-cartes">{cartes.slice(0, 60).map((c) => <button key={c.id} type="button" className={`choix-carte${expo.some((x) => x.s === quiz && x.id === c.id) ? ' choisi' : ''}`} onClick={() => basculer(c)}>{c.img ? <Img src={c.img} alt="" loading="lazy" /> : <span />}<small>{c.nom}</small></button>)}</div>}
    </div>
  )
}

// Mon profil : compact, détails repliables
export default function Profil() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [edition, setEdition] = useState(false)
  if (!profile || !user) return null
  const pub: ProfilPublic = { uid: user.uid, pseudo: profile.pseudo, xp: profile.xp, niveau: niveau(profile.xp), serie: profile.serie, avatar: profile.avatar, cadre: profile.cadre, ...resumePublic(profile), titre: profile.titre }
  const obtenus = BADGES.map((b) => ({ b, n: palierAtteint(b, profile) })).filter((x) => x.n > 0)
  const vitrine = profile.vitrine ?? []
  const basculer = (v: string) => {
    const sans = vitrine.filter((x) => x.split(':')[0] !== v.split(':')[0])
    publierVitrine(user.uid, profile, { vitrine: sans.length < vitrine.length ? sans : [...vitrine, v].slice(-3) })
  }
  const possedes = FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable && accesQuiz(s.id, profile)))

  return (
    <>
      {/* Raccourcis du profil : la boutique en grand, puis amis, album, stats, saison, réglages */}
      <nav className="profil-raccourcis" aria-label={fr ? 'Raccourcis du profil' : 'Profile shortcuts'}>
        <Link to="/boutique" className="raccourci grand" style={{ ['--c' as string]: '#E3A72F' }}><span>🛍️</span><strong>{fr ? 'Boutique' : 'Shop'}</strong><small>{fr ? 'Avatars, cadres et titres · plein d’objets gratuits à débloquer' : 'Avatars, frames, titles · lots of free items'}</small><em className="raccourci-badge">{fr ? 'Nouveautés' : 'New'}</em></Link>
        <Link to="/album" className="raccourci" style={{ ['--c' as string]: '#A35BE0' }}><span>🃏</span><strong>Album</strong><small>{Object.values(profile.album ?? {}).reduce((n, l) => n + l.length, 0)} {fr ? 'cartes' : 'cards'}</small></Link>
        <Link to="/stats" className="raccourci" style={{ ['--c' as string]: '#4FAE6A' }}><span>📊</span><strong>Stats</strong><small>{profile.parties ?? 0} {fr ? 'parties' : 'games'}</small></Link>
        <Link to="/parametres" className="raccourci" style={{ ['--c' as string]: '#64748B' }}><span>⚙️</span><strong>{fr ? 'Réglages' : 'Settings'}</strong><small>{fr ? 'Taille, sons…' : 'Size, sounds…'}</small></Link>
      </nav>
      <CarteJoueur p={pub} moi />
      <Vitrine p={pub} moi onModifier={() => setEdition((e) => !e)} />
      {edition && (
        <section className="card rise" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>{fr ? 'Badges à exposer (3 max)' : 'Badges to show (max 3)'}</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {obtenus.length === 0 && <span style={{ color: 'var(--muted)' }}>{fr ? 'Aucun badge pour l’instant.' : 'No badge yet.'}</span>}
            {obtenus.map(({ b, n }) => <button key={b.id} type="button" className="pill" aria-pressed={vitrine.some((v) => v.startsWith(b.id + ':'))} onClick={() => basculer(`${b.id}:${n}`)}>{b.nom[lang]} · {PALIERS[n - 1].nom[lang]}</button>)}
          </div>
          <strong>{fr ? 'Fond de la vitrine' : 'Showcase background'}</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(FONDS_VITRINE).map(([id, g]) => <button key={id} type="button" aria-label={id} aria-pressed={(profile.vitrineFond ?? 'aurore') === id} className="pastille-fond" style={{ background: g }} onClick={() => publierVitrine(user.uid, profile, { vitrineFond: id })} />)}
            {FONDS_ANIMES.filter((f) => BOUTIQUE.some((o) => o.id === f.id && possede(profile, o))).map((f) => <button key={f.id} type="button" aria-label={f.nom[lang]} title={f.nom[lang]} aria-pressed={profile.vitrineFond === f.id} className="pastille-fond anime" style={{ background: f.fond }} onClick={() => publierVitrine(user.uid, profile, { vitrineFond: f.id })}><Particules f={f} /></button>)}
            <Link to="/boutique?o=fond" className="pastille-fond plus" aria-label={fr ? 'Plus de fonds animés en boutique' : 'More animated backgrounds'}>🛍️</Link>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600 }}>{fr ? 'Ta phrase (60 caractères)' : 'Your line (60 chars)'}
            <input className="input" maxLength={60} defaultValue={profile.bio ?? ''} placeholder={fr ? 'Ex. : Imbattable sur les drapeaux 🌍' : 'e.g. Unbeatable on flags'} onBlur={(e) => publierVitrine(user.uid, profile, { bio: e.target.value.trim().slice(0, 60) })} />
          </label>
          <strong>{fr ? 'Familles préférées (3 max)' : 'Favourite families (max 3)'}</strong>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FAMILLES.map((f) => { const l = profile.famillesFav ?? []; const on = l.includes(f.k); return <button key={f.k} type="button" className="pill" aria-pressed={on} onClick={() => publierVitrine(user.uid, profile, { famillesFav: on ? l.filter((x) => x !== f.k) : [...l, f.k].slice(-3) })}>{f.nom[lang].split(/ [&,]/)[0]}</button> })}
          </div>
          <strong>{fr ? 'Thèmes favoris (3 max)' : 'Favourite topics (max 3)'}</strong>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {(profile.quizFav ?? (profile.favori ? [profile.favori] : [])).map((id) => <button key={id} type="button" className="pill" aria-pressed onClick={() => publierVitrine(user.uid, profile, { quizFav: (profile.quizFav ?? [profile.favori ?? '']).filter((x) => x && x !== id) })}>{possedes.find((s) => s.id === id)?.nom[lang] ?? id} ✕</button>)}
            {(profile.quizFav?.length ?? (profile.favori ? 1 : 0)) < 3 && <div style={{ flex: '1 1 220px' }}><ChoixTheme valeur="mix" quiz={possedes.map((s) => s.id)} onChange={(id) => { if (id !== 'mix') publierVitrine(user.uid, profile, { quizFav: [...new Set([...(profile.quizFav ?? (profile.favori ? [profile.favori] : [])), id])].slice(-3) }) }} /></div>}
          </div>
          <strong>{fr ? 'Cartes d’album à exposer (3 max)' : 'Album cards to show (max 3)'}</strong>
          <ChoixCartes />
        </section>
      )}

      <details className="card repli">
        <summary className="t">{fr ? 'Badges' : 'Badges'} <span>{BADGES.reduce((a, b) => a + palierAtteint(b, profile), 0)} / {BADGES.length * 3}</span></summary>
        <div className="grid-auto" style={{ ['--min' as string]: '150px', gap: 10 }}>
          {[...BADGES].sort((a, b) => palierAtteint(b, profile) - palierAtteint(a, profile)).map((b) => {
            const n = palierAtteint(b, profile)
            const v = b.valeur(profile)
            const prochain = b.paliers[Math.min(n, 2)]
            const prec = n ? b.paliers[n - 1] : 0
            return (
              <div key={b.id} style={{ padding: 12, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 6, background: n ? `var(--${b.couleur}-t)` : 'var(--surface2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: n ? `var(--${b.couleur}-i)` : 'var(--muted)' }}><Icon d={b.icon} size={20} /></span>
                  <span className="t" style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2, flex: 1 }}>{b.nom[lang]}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>{PALIERS.map((pl, i) => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i < n ? pl.couleur : 'transparent', border: `1.5px solid ${pl.couleur}` }} />)}</div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{n === 3 ? b.desc[lang](b.paliers[2]) + ' ✓' : b.desc[lang](prochain)}</span>
                {n < 3 && <div className="bar" style={{ height: 5 }}><span style={{ width: `${Math.min(100, ((v - prec) / Math.max(1, prochain - prec)) * 100)}%`, background: `var(--${b.couleur})` }} /></div>}
              </div>
            )
          })}
        </div>
      </details>

      <details className="card repli">
        <summary className="t">{fr ? 'Succès secrets' : 'Secret achievements'} <span>{profile.secrets?.length ?? 0} / {SECRETS.length}</span></summary>
        <div className="grid-auto" style={{ ['--min' as string]: '150px', gap: 8 }}>
          {SECRETS.map((s) => {
            const ok = profile.secrets?.includes(s.id)
            return (
              <div key={s.id} style={{ padding: 12, borderRadius: 14, background: ok ? 'var(--his-t)' : 'var(--surface2)', color: ok ? 'var(--his-i)' : 'var(--muted)' }}>
                <div className="t" style={{ fontWeight: 800 }}>{ok ? s.nom[lang] : '???'}</div>
                <div style={{ fontSize: 12 }}>{ok ? s.indice[lang] : (fr ? 'Continue à jouer…' : 'Keep playing…')}</div>
              </div>
            )
          })}
        </div>
      </details>
    </>
  )
}

// Profil d'un autre joueur (adversaire, classement, ami)
export function Joueur() {
  const { uid } = useParams()
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [p, setP] = useState<ProfilPublic | null | undefined>(undefined)
  const { user, profile } = useAuth()
  const [demande, setDemande] = useState(false)
  useEffect(() => { if (uid) profilPublic(uid).then(setP).catch(() => setP(null)) }, [uid])
  // Ajouter en ami directement depuis son profil (il reçoit une demande à accepter)
  const dejaAmi = !!uid && !!profile?.amis?.includes(uid)
  const ajouter = async () => { if (!user || !uid || !profile) return; await prevenirAmi(user.uid, profile.pseudo, uid); setDemande(true) }
  return (
    <>
      <button type="button" onClick={() => history.back()} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, border: 0, background: 'none', color: 'var(--muted)', cursor: 'pointer', font: 'inherit' }}><Icon d={ICONS.arrowL} />{fr ? 'Retour' : 'Back'}</button>
      {p === undefined && <p style={{ color: 'var(--muted)' }}>…</p>}
      {p === null && <p style={{ color: 'var(--muted)' }}>{fr ? 'Joueur introuvable.' : 'Player not found.'}</p>}
      {p && user && !user.isAnonymous && uid !== user.uid && (
        <div className="joueur-actions">
          {dejaAmi
            ? <span className="pill ok">✓ {fr ? 'Vous êtes amis' : 'Friends'}</span>
            : <button type="button" className="btn btn-p" disabled={demande} onClick={ajouter}>{demande ? (fr ? '✓ Demande envoyée' : '✓ Request sent') : (fr ? '👋 Ajouter en ami' : '👋 Add friend')}</button>}
        </div>
      )}
      {p && <><CarteJoueur p={p} /><Vitrine p={p} moi={false} /></>}
    </>
  )
}
