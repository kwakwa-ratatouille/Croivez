import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { niveau, useAuth, xpPourNiveau } from '../auth'
import { usePrefs, type Lang } from '../i18n'
import { FAMILLES } from '../themes'
import { BADGES, PALIERS, palierAtteint } from '../badges'
import { SECRETS } from '../meta'
import { accesQuiz } from '../progression'
import { profilPublic, publierVitrine, resumePublic, type ProfilPublic } from '../social'
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
          <h1 className="t" style={{ fontSize: 26, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.pseudo}</h1>
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

function Vitrine({ p, moi, onModifier }: { p: ProfilPublic; moi: boolean; onModifier?: () => void }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  return (
    <section className="card" style={{ padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="t" style={{ fontSize: 17, fontWeight: 900 }}>{fr ? 'Vitrine' : 'Showcase'}</h2>
          {moi && <button className="btn btn-g" style={{ minHeight: 36, fontSize: 14 }} onClick={onModifier}><Icon d={ICONS.settings} size={16} />{fr ? 'Modifier' : 'Edit'}</button>}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-around' }}>
          {(p.vitrine?.length ? p.vitrine : []).map((v) => <Medaille key={v} v={v} lang={lang} />)}
          {!p.vitrine?.length && <span style={{ color: 'var(--muted)', fontSize: 14 }}>{moi ? (fr ? 'Choisis jusqu’à 3 badges à exposer.' : 'Pick up to 3 badges.') : (fr ? 'Vitrine vide' : 'Empty')}</span>}
        </div>
      </div>
      {p.favori && (
        <div style={{ width: 150, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="eyebrow">{fr ? 'Thème favori' : 'Favourite'}</span>
          <CarteCouverture id={p.favori} largeur={150} />
        </div>
      )}
    </section>
  )
}

// Mon profil : compact, détails repliables
export default function Profil() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [edition, setEdition] = useState(false)
  if (!profile || !user) return null
  const pub: ProfilPublic = { uid: user.uid, pseudo: profile.pseudo, xp: profile.xp, niveau: niveau(profile.xp), serie: profile.serie, avatar: profile.avatar, cadre: profile.cadre, ...resumePublic(profile) }
  const obtenus = BADGES.map((b) => ({ b, n: palierAtteint(b, profile) })).filter((x) => x.n > 0)
  const vitrine = profile.vitrine ?? []
  const basculer = (v: string) => {
    const sans = vitrine.filter((x) => x.split(':')[0] !== v.split(':')[0])
    publierVitrine(user.uid, profile, { vitrine: sans.length < vitrine.length ? sans : [...vitrine, v].slice(-3) })
  }
  const possedes = FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable && accesQuiz(s.id, profile)))

  return (
    <>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Link className="btn btn-s" to="/album">Album</Link>
        <Link className="btn btn-s" to="/boutique">{fr ? 'Boutique' : 'Shop'}</Link>
        <Link className="btn btn-g" to="/parametres" aria-label={fr ? 'Paramètres' : 'Settings'}><Icon d={ICONS.settings} /></Link>
      </div>
      <CarteJoueur p={pub} moi />
      <Vitrine p={pub} moi onModifier={() => setEdition((e) => !e)} />
      {edition && (
        <section className="card rise" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>{fr ? 'Badges à exposer (3 max)' : 'Badges to show (max 3)'}</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {obtenus.length === 0 && <span style={{ color: 'var(--muted)' }}>{fr ? 'Aucun badge pour l’instant.' : 'No badge yet.'}</span>}
            {obtenus.map(({ b, n }) => <button key={b.id} type="button" className="pill" aria-pressed={vitrine.some((v) => v.startsWith(b.id + ':'))} onClick={() => basculer(`${b.id}:${n}`)}>{b.nom[lang]} · {PALIERS[n - 1].nom[lang]}</button>)}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>{fr ? 'Thème favori' : 'Favourite'}
            <select className="input" style={{ flex: 1, minHeight: 44 }} value={profile.favori ?? ''} onChange={(e) => publierVitrine(user.uid, profile, { favori: e.target.value })}>
              <option value="">—</option>
              {possedes.map((s) => <option key={s.id} value={s.id}>{s.nom[lang]}</option>)}
            </select>
          </label>
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
  useEffect(() => { if (uid) profilPublic(uid).then(setP).catch(() => setP(null)) }, [uid])
  return (
    <>
      <button type="button" onClick={() => history.back()} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, fontWeight: 600, border: 0, background: 'none', color: 'var(--muted)', cursor: 'pointer', font: 'inherit' }}><Icon d={ICONS.arrowL} />{fr ? 'Retour' : 'Back'}</button>
      {p === undefined && <p style={{ color: 'var(--muted)' }}>…</p>}
      {p === null && <p style={{ color: 'var(--muted)' }}>{fr ? 'Joueur introuvable.' : 'Player not found.'}</p>}
      {p && <><CarteJoueur p={p} /><Vitrine p={p} moi={false} /></>}
    </>
  )
}
