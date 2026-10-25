import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { COULEURS_CLAN, EMBLEMES, MAX_MEMBRES, OBJECTIF_CLAN, creerClan, lireClan, noterActivite, quitterClan, rejoindreClan, scoresClan, type Clan as TClan } from '../activite'
import Avatar from '../components/Avatar'
import { ICONS, Icon } from '../components/ui'

type Score = Awaited<ReturnType<typeof scoresClan>>[number]

// Clan : jusqu'à 20 joueurs qui cumulent leur XP de la semaine vers un objectif commun
export default function Clan() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const code = profile?.clan || ''
  const [clan, setClan] = useState<TClan | null | undefined>(undefined)
  const [scores, setScores] = useState<Score[]>([])
  const [nom, setNom] = useState('')
  const [embleme, setEmbleme] = useState(EMBLEMES[0])
  const [couleur, setCouleur] = useState(COULEURS_CLAN[0])
  const [saisie, setSaisie] = useState('')
  const [msg, setMsg] = useState('')
  const [quitter, setQuitter] = useState(false)
  const moi = { pseudo: profile?.pseudo ?? '?', depuis: Date.now(), ...(profile?.avatar ? { avatar: profile.avatar } : {}), ...(profile?.cadre ? { cadre: profile.cadre } : {}) }

  useEffect(() => {
    if (!code) { setClan(null); return }
    lireClan(code).then(async (c) => { setClan(c); if (c) setScores(await scoresClan(c)) }).catch(() => setClan(null))
  }, [code])

  const creer = async () => {
    if (!user || nom.trim().length < 3) { setMsg(fr ? 'Il faut un nom d’au moins 3 lettres.' : 'Name needs 3+ letters.'); return }
    const c = await creerClan(user.uid, moi, nom, embleme, couleur)
    noterActivite(user.uid, embleme, fr ? `a fondé le clan ${nom.trim()}` : `founded ${nom.trim()}`).catch(() => {})
    setMsg(fr ? `Clan créé ! Code : ${c}` : `Clan created! Code: ${c}`)
  }
  const rejoindre = async () => {
    if (!user || saisie.trim().length < 5) return
    const r = await rejoindreClan(user.uid, moi, saisie.trim())
    if (r === 'introuvable') setMsg(fr ? 'Aucun clan avec ce code.' : 'No clan with this code.')
    else if (r === 'plein') setMsg(fr ? `Ce clan est complet (${MAX_MEMBRES} membres).` : 'This clan is full.')
    else { const c = await lireClan(saisie.trim()); if (c) noterActivite(user.uid, c.embleme, fr ? `a rejoint le clan ${c.nom}` : `joined ${c.nom}`).catch(() => {}) }
  }
  const copier = () => { navigator.clipboard?.writeText(code).catch(() => {}); setMsg(fr ? `Code ${code} copié : envoie-le à tes amis !` : 'Code copied!') }

  if (clan === undefined) return <p style={{ color: 'var(--muted)', padding: 24 }}>{fr ? 'Chargement…' : 'Loading…'}</p>

  if (!clan) return (
    <>
      <Link to="/duels" className="lien-retour"><Icon d={ICONS.arrowL} />Multi</Link>
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>🛡️ {fr ? 'Clans' : 'Clans'}</h1>
      <p style={{ color: 'var(--muted)', marginTop: -6 }}>{fr ? `Jusqu’à ${MAX_MEMBRES} joueurs : chaque partie fait grimper l’XP du clan vers l’objectif de la semaine.` : 'Up to 20 players pooling weekly XP.'}</p>
      <section className="card clan-bloc">
        <h2 className="t">{fr ? 'Rejoindre avec un code' : 'Join with a code'}</h2>
        <div className="clan-ligne">
          <input className="input clan-code" value={saisie} maxLength={5} onChange={(e) => setSaisie(e.target.value.toUpperCase())} placeholder="ABCDE" />
          <button className="btn btn-p" disabled={saisie.trim().length < 5} onClick={rejoindre}>{fr ? 'Rejoindre' : 'Join'}</button>
        </div>
      </section>
      <section className="card clan-bloc">
        <h2 className="t">{fr ? 'Fonder mon clan' : 'Found my clan'}</h2>
        <input className="input" value={nom} maxLength={24} onChange={(e) => setNom(e.target.value)} placeholder={fr ? 'Nom du clan' : 'Clan name'} />
        <div className="clan-emblemes">{EMBLEMES.map((e) => <button key={e} type="button" aria-pressed={embleme === e} onClick={() => setEmbleme(e)}>{e}</button>)}</div>
        <div className="clan-couleurs">{COULEURS_CLAN.map((c) => <button key={c} type="button" aria-pressed={couleur === c} aria-label={c} style={{ background: c }} onClick={() => setCouleur(c)} />)}</div>
        <div className="clan-apercu" style={{ background: couleur }}><span>{embleme}</span><strong>{nom.trim() || (fr ? 'Mon clan' : 'My clan')}</strong></div>
        <button className="btn btn-p btn-lg" onClick={creer}>{fr ? 'Créer le clan' : 'Create clan'}</button>
      </section>
      {msg && <p role="status" style={{ fontWeight: 700 }}>{msg}</p>}
    </>
  )

  const total = scores.reduce((s, m) => s + m.xp, 0)
  return (
    <>
      <Link to="/duels" className="lien-retour"><Icon d={ICONS.arrowL} />Multi</Link>
      <header className="clan-tete" style={{ ['--clan' as string]: clan.couleur }}>
        <span className="clan-embleme">{clan.embleme}</span>
        <div>
          <h1 className="t">{clan.nom}</h1>
          <small>{Object.keys(clan.membres ?? {}).length} / {MAX_MEMBRES} {fr ? 'membres' : 'members'}</small>
        </div>
        <button type="button" className="clan-code-btn" onClick={copier}>📋 {code}</button>
      </header>
      <section className="card clan-bloc">
        <div className="clan-objectif-tete"><strong>{fr ? 'Objectif de la semaine' : 'Weekly goal'}</strong><span>{total.toLocaleString(fr ? 'fr-FR' : 'en-GB')} / {OBJECTIF_CLAN.toLocaleString(fr ? 'fr-FR' : 'en-GB')} XP</span></div>
        <div className="bar clan-barre"><span style={{ width: `${Math.min(100, (total / OBJECTIF_CLAN) * 100)}%`, background: clan.couleur }} /></div>
        <small style={{ color: 'var(--muted)' }}>{total >= OBJECTIF_CLAN ? (fr ? '🎉 Objectif atteint, bravo à tout le clan !' : '🎉 Goal reached!') : (fr ? 'Chaque partie de chaque membre compte. Remise à zéro le lundi.' : 'Every game counts. Resets Monday.')}</small>
      </section>
      <section className="card clan-bloc">
        <h2 className="t">{fr ? 'Classement du clan' : 'Clan ranking'}</h2>
        <ol className="clan-membres">
          {scores.map((m, i) => (
            <li key={m.uid}>
              <span className="clan-rang">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
              <Link to={`/joueur/${m.uid}`} className="clan-membre"><Avatar pseudo={m.pseudo} avatar={m.avatar} cadre={m.cadre} taille={36} /><span>{m.pseudo}{clan.chef === m.uid && ' 👑'}</span></Link>
              <strong>{m.xp.toLocaleString(fr ? 'fr-FR' : 'en-GB')} XP</strong>
            </li>
          ))}
        </ol>
      </section>
      {msg && <p role="status" style={{ fontWeight: 700 }}>{msg}</p>}
      {quitter
        ? <div className="clan-ligne"><span>{fr ? 'Quitter le clan ?' : 'Leave clan?'}</span><button className="btn btn-g" onClick={() => setQuitter(false)}>{fr ? 'Non' : 'No'}</button><button className="btn btn-p" style={{ background: 'var(--ko)' }} onClick={() => user && quitterClan(user.uid, code)}>{fr ? 'Oui, quitter' : 'Leave'}</button></div>
        : <button className="btn btn-g" style={{ alignSelf: 'flex-start' }} onClick={() => setQuitter(true)}>{fr ? 'Quitter le clan' : 'Leave clan'}</button>}
    </>
  )
}
