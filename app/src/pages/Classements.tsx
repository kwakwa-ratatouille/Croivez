import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { BONUS_LEGENDE, POINTS_NIVEAU, classementGlobal, classementRang, classementRecord, classementSemaine, erudition, profilsDe, type PeriodeRecord } from '../social'
import { DIVISIONS, GRACE, TOUS_RANGS, infoRang, ptsEffectifs, recompensesRang, seuil } from '../ligues'
import { jour } from '../auth'
import BlasonRang from '../components/BlasonRang'
import { BOUTIQUE } from '../meta'
import { ICONS, Icon } from '../components/ui'
import Avatar from '../components/Avatar'
import { Pseudo } from '../components/Cosmetiques'

type Ligne = { uid: string; pseudo: string; valeur: number; niveau?: number; avatar?: string; cadre?: string; titre?: string; pseudoStyle?: string }
type Onglet = 'ligue' | 'semaine' | 'records' | 'global' | 'amis'

// Classements : la ligue et la semaine se jouent à l'XP (l'effort de la semaine),
// le classement de tous les temps et celui des amis à l'érudition (le savoir prouvé au sans-faute)
export default function Classements() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [onglet, setOnglet] = useState<Onglet>('ligue')
  const [lignes, setLignes] = useState<Ligne[] | null>(null)
  const [erreur, setErreur] = useState('')
  const [aide, setAide] = useState(false)
  const [jeuRecord, setJeuRecord] = useState<'express' | 'survie'>('express')
  const [periode, setPeriode] = useState<PeriodeRecord>('jour')

  useEffect(() => {
    setLignes(null)
    setErreur('')
    const charger: Promise<Ligne[]> = onglet === 'records'
      ? classementRecord(jeuRecord, periode).then((l) => l.map((x) => ({ ...x, valeur: x.score })))
      : onglet === 'ligue'
      ? classementRang().then((l) => l.map((x) => ({ ...x, valeur: ptsEffectifs(x.ligue, jour()) })).sort((a, b) => b.valeur - a.valeur))
      : onglet === 'semaine'
      ? classementSemaine().then((l) => l.map((x) => ({ ...x, valeur: x.xp })))
      : onglet === 'global'
        ? classementGlobal().then((l) => l.map((x) => ({ ...x, valeur: x.erudition ?? 0 })))
        : profilsDe([user!.uid, ...(profile?.amis ?? [])]).then((l) => l.map((x) => ({ ...x, valeur: x.uid === user!.uid && profile ? erudition(profile) : x.erudition ?? 0 })).sort((a, b) => b.valeur - a.valeur))
    charger.then(setLignes).catch((e) => { console.error(e); setErreur(fr ? 'Classement indisponible (connexion ou règles Firebase).' : 'Leaderboard unavailable.') })
  }, [onglet, user, profile, fr, jeuRecord, periode])

  const ONGLETS: [Onglet, string][] = [['ligue', fr ? 'Mon rang' : 'My rank'], ['semaine', fr ? 'Semaine' : 'Week'], ['records', 'Records'], ['global', fr ? 'Érudition' : 'Knowledge'], ['amis', fr ? 'Amis' : 'Friends']]
  const medaille = ['#E3A72F', '#9AA3AD', '#C98B5A']
  const mesPts = ptsEffectifs(profile?.ligue, jour())
  const monRang = infoRang(mesPts, lang)
  // Ma ligue : les joueurs du même rang (toutes divisions)
  const affichees = onglet === 'ligue' ? lignes?.filter((l) => infoRang(l.valeur).rang.id === monRang.rang.id) : lignes
  const unite = onglet === 'records' ? (fr ? 'bonnes' : 'correct') : onglet === 'global' || onglet === 'amis' || onglet === 'ligue' ? 'pts' : 'XP'
  const fmt = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB')

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{fr ? 'Classements' : 'Leaderboards'}</h1>
        <p style={{ color: 'var(--muted)' }}>{onglet === 'records' ? (fr ? 'Les meilleurs scores en Express (60 secondes) et en Survie (3 vies).' : 'Best Express and Survival scores.') : onglet === 'global' || onglet === 'amis'
          ? (fr ? 'Classés à l’érudition : les niveaux réussis au sans-faute, pas le temps passé.' : 'Ranked by knowledge: levels passed flawlessly, not time spent.')
          : onglet === 'ligue' ? (fr ? 'Les joueurs de ton rang, classés aux points de rang. Pas de remise à zéro : on baisse seulement si on ne joue plus.' : 'Players of your rank, by rank points.') : (fr ? 'Classés à l’XP gagnée cette semaine. Remise à zéro chaque lundi.' : 'Ranked by XP earned this week. Resets every Monday.')}</p>
      </header>
      <div role="tablist" className="onglets">
        {ONGLETS.map(([id, l]) => <button key={id} role="tab" aria-selected={onglet === id} className="onglet" onClick={() => setOnglet(id)}>{l}</button>)}
      </div>

      {onglet === 'records' && (
        <section className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="salon-choix">
            <button className="pill" aria-pressed={jeuRecord === 'express'} onClick={() => setJeuRecord('express')}>⚡ Express · 60 s</button>
            <button className="pill" aria-pressed={jeuRecord === 'survie'} onClick={() => setJeuRecord('survie')}>❤️ {fr ? 'Survie · 3 vies' : 'Survival · 3 lives'}</button>
          </div>
          <div role="tablist" className="onglets">
            {([['jour', fr ? 'Aujourd’hui' : 'Today'], ['mois', fr ? 'Ce mois' : 'This month'], ['annee', fr ? 'Cette année' : 'This year'], ['tout', fr ? 'Tous les temps' : 'All time']] as [PeriodeRecord, string][]).map(([id, l]) => <button key={id} role="tab" aria-selected={periode === id} className="onglet" onClick={() => setPeriode(id)}>{l}</button>)}
          </div>
          <Link to={`/partie?jeu=${jeuRecord}&d=0&m=qcm`} className="btn btn-p" style={{ alignSelf: 'flex-start' }}>{fr ? 'Battre le record' : 'Beat the record'}<Icon d={ICONS.arrowR} /></Link>
        </section>
      )}
      {onglet === 'ligue' && (
        <section className="card rise ligue-carte" style={{ ['--lc' as string]: monRang.rang.couleur }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <BlasonRang pts={mesPts} taille={64} />
            <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="eyebrow">{fr ? 'Ton rang' : 'Your rank'}</span>
              <strong className="t" style={{ fontSize: 26 }}>{monRang.nom}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                {monRang.suivant
                  ? (fr ? `${fmt.format(mesPts)} pts · encore ${fmt.format(monRang.suivant - mesPts)} pts pour ${infoRang(monRang.suivant, lang).nom}` : `${mesPts} pts · ${monRang.suivant - mesPts} to ${infoRang(monRang.suivant, lang).nom}`)
                  : (fr ? `${fmt.format(mesPts)} pts : rang ultime !` : `${mesPts} pts: top rank!`)}
              </span>
              {monRang.suivant && <div className="bar" style={{ height: 8 }}><span style={{ width: `${((mesPts - monRang.min) / (monRang.suivant - monRang.min)) * 100}%`, background: monRang.rang.couleur }} /></div>}
            </div>
          </div>
          {/* Échelle des rangs : 9 rangs de 4 divisions, puis le rang ultime */}
          <div className="rang-echelle">
            {TOUS_RANGS.map((r, i) => {
              const min = seuil(i * DIVISIONS)
              const n = profile?.ligue?.fins?.[r.id] ?? 0
              return (
                <div key={r.id} className={`rang-palier${r.id === monRang.rang.id ? ' actuelle' : ''}${mesPts >= min ? ' atteinte' : ''}`} style={{ ['--rc' as string]: r.couleur }}>
                  <BlasonRang pts={r.id === 'legende' ? min : seuil(i * DIVISIONS + DIVISIONS - 1)} taille={34} />
                  <strong>{r.nom[lang]}</strong>
                  <small>{fmt.format(min)}</small>
                  {n > 0 && <small className="rang-fins">{n}× ✓</small>}
                </div>
              )
            })}
          </div>
          <div className="rang-regles">
            <p>🎮 {fr ? 'Chaque XP gagnée en partie rapporte 1 point de rang. Chaque rang a 4 divisions (4 = la meilleure), puis vient le rang ultime.' : 'Each XP earned is 1 rank point. Each rank has 4 divisions, then the ultimate rank.'}</p>
            <p>💤 {fr ? `Pas de remise à zéro : après ${GRACE} jours sans jouer, tu descends d’une division par jour d’absence.` : `No reset: after ${GRACE} idle days you drop one division per day.`}</p>
            <p>🎁 {fr ? 'Chaque lundi, selon le rang où tu as fini la semaine : cadre et couleur de pseudo du rang. 3 semaines finies dans un rang : son titre et sa vitrine animée.' : 'Each Monday: the frame and name colour of your rank. 3 weeks: its title and animated showcase.'}</p>
            <div className="rang-lots">
              {[recompensesRang(monRang.rang)].map((rec) => [rec.cadre, rec.pseudo, rec.titre, rec.fond].map((id) => {
                const o = BOUTIQUE.find((x) => x.id === id)
                const a = !!profile?.possede?.includes(id)
                return o && <Link key={id} to={`/boutique?o=${o.type}`} className={`pill${a ? ' ok' : ''}`}>{a ? '✅' : '🔒'} {o.nom[lang]}</Link>
              }))}
            </div>
          </div>
        </section>
      )}

      {(onglet === 'global' || onglet === 'amis') && (
        <section className="card rise" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => setAide((a) => !a)} aria-expanded={aide} style={{ display: 'flex', alignItems: 'center', gap: 12, border: 0, background: 'none', padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit', textAlign: 'left' }}>
            <span className="ligue-blason" style={{ ['--lc' as string]: '#A35BE0', width: 46, height: 46 }}><Icon d={ICONS.bulb} size={24} /></span>
            <span style={{ flex: 1 }}>
              <strong className="t" style={{ display: 'block', fontSize: 18 }}>{fr ? 'Ton érudition' : 'Your knowledge'} : {fmt.format(profile ? erudition(profile) : 0)} pts</strong>
              <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{fr ? 'Comment gagner des points ?' : 'How to earn points?'}</span>
            </span>
            <Icon d={ICONS.arrowR} size={18} style={{ transform: aide ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
          </button>
          {aide && (
            <div className="bareme rise">
              {[1, 2, 3, 4].map((d) => <div key={d}><strong>+{POINTS_NIVEAU[d]}</strong><span>{[fr ? 'Facile' : 'Easy', fr ? 'Moyen' : 'Medium', fr ? 'Difficile' : 'Hard', 'Expert'][d - 1]}</span></div>)}
              <div><strong>+{BONUS_LEGENDE}</strong><span>{fr ? 'Légende ouverte' : 'Legend unlocked'}</span></div>
              <p>{fr ? 'Un niveau compte une seule fois, quand tu le réussis au sans-faute. Les niveaux sautés avec des pièces ne rapportent rien.' : 'Each level counts once, when passed flawlessly. Skipped levels earn nothing.'}</p>
            </div>
          )}
        </section>
      )}

      <section className="card" style={{ padding: 8 }}>
        {erreur && <p style={{ padding: 20, color: 'var(--ko-i)' }}>{erreur}</p>}
        {!lignes && !erreur && <p style={{ padding: 20, color: 'var(--muted)' }}>…</p>}
        {affichees?.length === 0 && <p style={{ padding: 20, color: 'var(--muted)' }}>{fr ? 'Personne pour l’instant. Joue une partie pour ouvrir le classement !' : 'Nobody yet. Play a game to open the leaderboard!'}</p>}
        {affichees?.map((l, n) => {
          const moi = l.uid === user?.uid
          return (
            <Link key={l.uid} to={moi ? '/profil' : `/joueur/${l.uid}`} className="ligne-classement" style={{ background: moi ? 'var(--geo-t)' : undefined }}>
              <span className="t rang" style={{ background: n < 3 ? medaille[n] : 'var(--surface2)', color: n < 3 ? '#fff' : 'var(--muted)' }}>{n + 1}</span>
              <Avatar pseudo={l.pseudo} avatar={l.avatar} cadre={l.cadre} taille={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><Pseudo nom={l.pseudo} style={l.pseudoStyle} />{moi && <span style={{ color: 'var(--muted)', fontWeight: 500 }}> ({fr ? 'toi' : 'you'})</span>}</div>
                {l.niveau && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Niveau' : 'Level'} {l.niveau}{onglet === 'ligue' ? ` · ${infoRang(l.valeur, lang).nom}` : ''}{l.titre && BOUTIQUE.find((o) => o.id === l.titre) ? ` · ${BOUTIQUE.find((o) => o.id === l.titre)!.nom[lang]}` : ''}</div>}
              </div>
              <span className="t" style={{ fontWeight: 900, fontSize: 17, whiteSpace: 'nowrap' }}>{fmt.format(l.valeur)} {unite}</span>
            </Link>
          )
        })}
      </section>
    </>
  )
}
