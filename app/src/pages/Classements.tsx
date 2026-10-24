import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { BONUS_LEGENDE, POINTS_NIVEAU, classementGlobal, classementSemaine, erudition, profilsDe } from '../social'
import { BOUTIQUE, LIGUES, ligueDe, ligueSuivante } from '../meta'
import { ICONS, Icon } from '../components/ui'
import Avatar from '../components/Avatar'

type Ligne = { uid: string; pseudo: string; valeur: number; niveau?: number; avatar?: string; cadre?: string; titre?: string }
type Onglet = 'ligue' | 'semaine' | 'global' | 'amis'

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

  useEffect(() => {
    setLignes(null)
    setErreur('')
    const charger: Promise<Ligne[]> = onglet === 'semaine' || onglet === 'ligue'
      ? classementSemaine().then((l) => l.map((x) => ({ ...x, valeur: x.xp })))
      : onglet === 'global'
        ? classementGlobal().then((l) => l.map((x) => ({ ...x, valeur: x.erudition ?? 0 })))
        : profilsDe([user!.uid, ...(profile?.amis ?? [])]).then((l) => l.map((x) => ({ ...x, valeur: x.uid === user!.uid && profile ? erudition(profile) : x.erudition ?? 0 })).sort((a, b) => b.valeur - a.valeur))
    charger.then(setLignes).catch((e) => { console.error(e); setErreur(fr ? 'Classement indisponible (connexion ou règles Firebase).' : 'Leaderboard unavailable.') })
  }, [onglet, user, profile, fr])

  const ONGLETS: [Onglet, string][] = [['ligue', fr ? 'Ma ligue' : 'My league'], ['semaine', fr ? 'Semaine' : 'Week'], ['global', fr ? 'Érudition' : 'Knowledge'], ['amis', fr ? 'Amis' : 'Friends']]
  const medaille = ['#E3A72F', '#9AA3AD', '#C98B5A']
  const xpSemaine = onglet === 'ligue' || onglet === 'semaine' ? lignes?.find((l) => l.uid === user?.uid)?.valeur ?? 0 : 0
  const maLigue = ligueDe(xpSemaine)
  const suivante = ligueSuivante(xpSemaine)
  const affichees = onglet === 'ligue' ? lignes?.filter((l) => ligueDe(l.valeur).id === maLigue.id) : lignes
  const unite = onglet === 'global' || onglet === 'amis' ? (fr ? 'pts' : 'pts') : 'XP'
  const fmt = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB')

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 className="t" style={{ fontSize: 34, fontWeight: 900 }}>{fr ? 'Classements' : 'Leaderboards'}</h1>
        <p style={{ color: 'var(--muted)' }}>{onglet === 'global' || onglet === 'amis'
          ? (fr ? 'Classés à l’érudition : les niveaux réussis au sans-faute, pas le temps passé.' : 'Ranked by knowledge: levels passed flawlessly, not time spent.')
          : (fr ? 'Classés à l’XP gagnée cette semaine. Remise à zéro chaque lundi.' : 'Ranked by XP earned this week. Resets every Monday.')}</p>
      </header>
      <div role="tablist" className="onglets">
        {ONGLETS.map(([id, l]) => <button key={id} role="tab" aria-selected={onglet === id} className="onglet" onClick={() => setOnglet(id)}>{l}</button>)}
      </div>

      {onglet === 'ligue' && lignes && (
        <section className="card rise ligue-carte" style={{ ['--lc' as string]: maLigue.couleur }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span className="ligue-blason"><Icon d={ICONS.sparkle} size={30} /></span>
            <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="eyebrow">{fr ? 'Ta ligue cette semaine' : 'Your league this week'}</span>
              <strong className="t" style={{ fontSize: 24 }}>{fr ? 'Ligue' : 'League'} {maLigue.nom[lang]}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                {suivante
                  ? (fr ? `${fmt.format(xpSemaine)} XP · encore ${fmt.format(suivante.min - xpSemaine)} XP pour la ligue ${suivante.nom.fr}` : `${xpSemaine} XP · ${suivante.min - xpSemaine} XP to ${suivante.nom.en}`)
                  : (fr ? `${fmt.format(xpSemaine)} XP : ligue la plus haute !` : `${xpSemaine} XP: top league!`)}
              </span>
              {suivante && <div className="bar" style={{ height: 8 }}><span style={{ width: `${((xpSemaine - maLigue.min) / (suivante.min - maLigue.min)) * 100}%`, background: suivante.couleur }} /></div>}
            </div>
          </div>
          {/* Échelle des ligues : on voit d'un coup d'œil où l'on est et ce qui reste */}
          <div className="ligue-echelle">
            {LIGUES.map((l) => (
              <div key={l.id} className={`ligue-palier${l.id === maLigue.id ? ' actuelle' : ''}${xpSemaine >= l.min ? ' atteinte' : ''}`} style={{ ['--lc' as string]: l.couleur }}>
                <span className="ligue-point" />
                <strong>{l.nom[lang]}</strong>
                <small>{fmt.format(l.min)} XP</small>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Chaque partie rapporte de l’XP. Ta ligue dépend de l’XP gagnée depuis lundi : chaque semaine, une nouvelle chance de monter.' : 'Every game earns XP. Your league depends on XP earned since Monday.'}</p>
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
                <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.pseudo}{moi && <span style={{ color: 'var(--muted)', fontWeight: 500 }}> ({fr ? 'toi' : 'you'})</span>}</div>
                {l.niveau && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Niveau' : 'Level'} {l.niveau}{onglet === 'semaine' ? ` · ${ligueDe(l.valeur).nom[lang]}` : ''}{l.titre && BOUTIQUE.find((o) => o.id === l.titre) ? ` · ${BOUTIQUE.find((o) => o.id === l.titre)!.nom[lang]}` : ''}</div>}
              </div>
              <span className="t" style={{ fontWeight: 900, fontSize: 17, whiteSpace: 'nowrap' }}>{fmt.format(l.valeur)} {unite}</span>
            </Link>
          )
        })}
      </section>
    </>
  )
}
