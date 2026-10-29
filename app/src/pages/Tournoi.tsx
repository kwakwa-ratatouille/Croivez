import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { trouverSousTheme } from '../themes'
import { ESSAIS, NB_QUESTIONS, classementTournoi, finSemaine, monTournoi, reclamerTournoi, recompense, semainePrecedente, themeTournoi, urlTournoi, type ScoreTournoi } from '../tournoi'
import { feter } from '../effets'
import Avatar from '../components/Avatar'
import { ICONS, Icon, Piece } from '../components/ui'

const nf = (n: number) => n.toLocaleString('fr-FR')
function resteAvant(d: Date) {
  const ms = Math.max(0, d.getTime() - Date.now())
  const j = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4)
  return j ? `${j} j ${h} h` : h ? `${h} h ${m} min` : `${m} min`
}

// Tournoi de la semaine : même quiz pour tous, 3 essais, classement en direct, récompenses le lundi
export default function Tournoi() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [liste, setListe] = useState<ScoreTournoi[] | null>(null)
  const [moi, setMoi] = useState<Awaited<ReturnType<typeof monTournoi>>>(null)
  const [passe, setPasse] = useState<{ rang: number; total: number } | null>(null)
  const [recu, setRecu] = useState(false)
  const theme = trouverSousTheme(themeTournoi())
  const avant = semainePrecedente()

  useEffect(() => {
    classementTournoi().then(setListe).catch(() => setListe([]))
    if (!user) return
    monTournoi(user.uid).then(setMoi).catch(() => {})
    // Semaine passée : ma place, pour la récompense
    classementTournoi(avant, 500).then((l) => { const r = l.findIndex((x) => x.uid === user.uid); if (r >= 0) setPasse({ rang: r + 1, total: l.length }) }).catch(() => {})
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const dejaRecu = recu || !!(profile as { tournoisRecus?: string[] } | null)?.tournoisRecus?.includes(avant)
  const essaisRestants = ESSAIS - (moi?.essais ?? 0)
  const monRang = liste && user ? liste.findIndex((x) => x.uid === user.uid) + 1 : 0

  return (
    <>
      <Link to="/" className="lien-retour"><Icon d={ICONS.arrowL} />{fr ? 'Accueil' : 'Home'}</Link>
      <header className="tournoi-hero">
        <span className="tournoi-trophee" aria-hidden="true">🏆</span>
        <div className="tournoi-hero-texte">
          <span className="clan-niveau">{fr ? 'Tournoi de la semaine' : 'Weekly tournament'}</span>
          <h1 className="t">{theme?.sous.nom[lang] ?? themeTournoi()}</h1>
          <p>{fr ? `${NB_QUESTIONS} questions, toutes difficultés, les mêmes pour tout le monde. ${ESSAIS} essais : ton meilleur score compte.` : `${NB_QUESTIONS} questions, same for everyone. ${ESSAIS} tries.`}</p>
          <small>⏳ {fr ? `Fin dans ${resteAvant(finSemaine())}` : `Ends in ${resteAvant(finSemaine())}`}</small>
        </div>
      </header>

      {passe && !dejaRecu && (
        <section className="card tournoi-recompense rise">
          <span>{passe.rang <= 3 ? ['🥇', '🥈', '🥉'][passe.rang - 1] : passe.rang <= 10 ? '🏅' : '🎟️'}</span>
          <div><strong className="t">{fr ? `Semaine dernière : ${passe.rang}${passe.rang === 1 ? 'er' : 'e'} sur ${passe.total}` : `Last week: #${passe.rang}`}</strong><small>{fr ? 'Ta récompense t’attend' : 'Your reward is waiting'}</small></div>
          <button className="btn btn-p" onClick={async () => { if (!user) return; await reclamerTournoi(user.uid, avant, passe.rang); setRecu(true); feter(undefined, passe.rang <= 3 ? 2 : 1) }}><Piece size={16} />+{nf(recompense(passe.rang))}</button>
        </section>
      )}

      <section className="card tournoi-moi">
        <div className="tournoi-chiffres">
          <div><strong className="t">{moi ? nf(moi.score) : '—'}</strong><small>{fr ? 'mon meilleur score' : 'my best'}</small></div>
          <div><strong className="t">{monRang || '—'}</strong><small>{fr ? 'ma place' : 'my rank'}</small></div>
          <div><strong className="t">{Math.max(0, essaisRestants)} / {ESSAIS}</strong><small>{fr ? 'essais restants' : 'tries left'}</small></div>
        </div>
        {essaisRestants > 0
          ? <Link to={urlTournoi()} className="btn btn-lg tv-lancer tournoi-jouer">{moi ? (fr ? 'Retenter ma chance' : 'Try again') : (fr ? 'Jouer le tournoi' : 'Play')}<Icon d={ICONS.arrowR} /></Link>
          : <p className="tournoi-fini">{fr ? 'Plus d’essai cette semaine : rendez-vous lundi pour le prochain tournoi !' : 'No tries left this week.'}</p>}
        <small className="tournoi-lots">🥇 1 500 · 🥈 1 000 · 🥉 700 · {fr ? 'top 10' : 'top 10'} 300 · {fr ? 'participation' : 'taking part'} 50 <Piece size={12} /></small>
      </section>

      <section className="card tournoi-classement">
        <h2 className="t">{fr ? 'Classement en direct' : 'Live ranking'}</h2>
        {liste === null && <p style={{ color: 'var(--muted)' }}>{fr ? 'Chargement…' : 'Loading…'}</p>}
        {liste?.length === 0 && <p style={{ color: 'var(--muted)' }}>{fr ? 'Personne n’a encore joué : prends la première place !' : 'Nobody yet: grab first place!'}</p>}
        <ol>
          {liste?.map((x, i) => (
            <li key={x.uid} className={`${i < 3 ? `podium-${i + 1}` : ''}${x.uid === user?.uid ? ' moi' : ''}`}>
              <span className="tournoi-rang">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
              <Link to={`/joueur/${x.uid}`} className="tournoi-joueur"><Avatar pseudo={x.pseudo} avatar={x.avatar} cadre={x.cadre} taille={36} /><span>{x.pseudo}</span></Link>
              <small>{x.bonnes}/{x.total}</small>
              <strong className="t">{nf(x.score)}</strong>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
