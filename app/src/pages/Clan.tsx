import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { noterActivite } from '../activite'
import type { Clan as ClanT } from '../clans'
import { AVANTAGES, clansPublics, inviterClan, BLASON_DEFAUT, FORMES, MOTIFS, NIVEAU_FORME, NIVEAU_MOTIF, PALETTE, SYMBOLES, cleNom, creerClan, lireClan, maxMembres, modifierClan, niveauClan, nomPris, objectifSemaine, quitterClan, rejoindreClan, scoresClan, xpNiveau, type Blason, type Clan as TClan, type EntreeIndex } from '../clans'
import BlasonClan from '../components/BlasonClan'
import Avatar from '../components/Avatar'
import { profilsDe, type ProfilPublic } from '../social'
import { ICONS, Icon } from '../components/ui'

type Score = Awaited<ReturnType<typeof scoresClan>>[number]
const nf = (n: number) => n.toLocaleString('fr-FR')

// Atelier du blason : formes et motifs débloqués selon le niveau du clan
function Atelier({ b, setB, niveau }: { b: Blason; setB: (b: Blason) => void; niveau: number }) {
  return (
    <div className="atelier">
      <div className="atelier-apercu"><BlasonClan b={b} niveau={niveau} taille={110} /></div>
      <div className="atelier-reglages">
        <span className="atelier-titre">Forme</span>
        <div className="atelier-choix">{FORMES.map((f) => { const ok = niveau >= NIVEAU_FORME[f]; return <button key={f} type="button" disabled={!ok} aria-pressed={b.forme === f} onClick={() => setB({ ...b, forme: f })} title={ok ? f : `Niveau ${NIVEAU_FORME[f]}`}><BlasonClan b={{ ...b, forme: f, motif: 'uni', symbole: b.symbole }} taille={34} />{!ok && <em>🔒{NIVEAU_FORME[f]}</em>}</button> })}</div>
        <span className="atelier-titre">Motif</span>
        <div className="atelier-choix">{MOTIFS.map((m) => { const ok = niveau >= NIVEAU_MOTIF[m]; return <button key={m} type="button" disabled={!ok} aria-pressed={b.motif === m} onClick={() => setB({ ...b, motif: m })}><BlasonClan b={{ ...b, motif: m }} taille={34} />{!ok && <em>🔒{NIVEAU_MOTIF[m]}</em>}</button> })}</div>
        <span className="atelier-titre">Symbole</span>
        <div className="atelier-choix">{SYMBOLES.map((s) => <button key={s} type="button" aria-pressed={b.symbole === s} onClick={() => setB({ ...b, symbole: s })}><BlasonClan b={{ ...b, symbole: s }} taille={34} /></button>)}</div>
        <span className="atelier-titre">Couleurs</span>
        <div className="atelier-couleurs">{PALETTE.map((c) => <button key={c} type="button" aria-pressed={b.c1 === c} style={{ background: c }} aria-label={c} onClick={() => setB({ ...b, c1: c })} />)}</div>
        <div className="atelier-couleurs">{PALETTE.map((c) => <button key={c} type="button" aria-pressed={b.c2 === c} style={{ background: c }} aria-label={c} onClick={() => setB({ ...b, c2: c })} />)}</div>
      </div>
    </div>
  )
}

export function CarteClanIndex({ c, onRejoindre }: { c: EntreeIndex & { code: string }; onRejoindre?: () => void }) {
  return (
    <div className="clan-suggestion">
      <BlasonClan b={c.blason} niveau={niveauClan(c.xp)} taille={44} />
      <div><strong>{c.nom}</strong><small>Niv. {niveauClan(c.xp)} · {c.n} / {maxMembres(niveauClan(c.xp))} membres</small></div>
      {onRejoindre && <button type="button" className="btn btn-p" disabled={c.n >= maxMembres(niveauClan(c.xp))} onClick={onRejoindre}>Rejoindre</button>}
    </div>
  )
}

export default function Clan() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const code = profile?.clan || ''
  const [clan, setClan] = useState<TClan | null | undefined>(undefined)
  const [scores, setScores] = useState<Score[]>([])
  const [index, setIndex] = useState<(EntreeIndex & { code: string })[]>([])
  const [cherche, setCherche] = useState('')
  const [creation, setCreation] = useState(false)
  const [edition, setEdition] = useState(false)
  const [nom, setNom] = useState('')
  const [devise, setDevise] = useState('')
  const [prive, setPrive] = useState(false) // clan privé : sur invitation seulement
  const [blason, setBlason] = useState<Blason>(BLASON_DEFAUT)
  const [msg, setMsg] = useState('')
  const [quitter, setQuitter] = useState(false)
  const moi = { pseudo: profile?.pseudo ?? '?', depuis: Date.now(), ...(profile?.avatar ? { avatar: profile.avatar } : {}), ...(profile?.cadre ? { cadre: profile.cadre } : {}) }

  const charger = () => {
    if (!code) { setClan(null); clansPublics().then(setIndex).catch(() => setIndex([])); return }
    lireClan(code).then(async (c) => { setClan(c); if (c) { setScores(await scoresClan(c)); setNom(c.nom); setDevise(c.devise ?? ''); setPrive(!!c.prive); setBlason(c.blason) } }).catch(() => setClan(null))
  }
  useEffect(charger, [code]) // eslint-disable-line react-hooks/exhaustive-deps
  const resultats = useMemo(() => { const q = cleNom(cherche); return (q ? index.filter((c) => c.cle.includes(q)) : index).slice(0, 12) }, [index, cherche])

  const creer = async () => {
    if (!user) return
    if (nom.trim().length < 3) { setMsg(fr ? 'Il faut un nom d’au moins 3 lettres.' : 'Name needs 3+ letters.'); return }
    if (await nomPris(nom)) { setMsg(fr ? 'Ce nom de clan existe déjà.' : 'Name taken.'); return }
    await creerClan(user.uid, moi, nom, devise, blason)
    noterActivite(user.uid, '🛡️', `a fondé le clan ${nom.trim()}`).catch(() => {})
  }
  const rejoindre = async (c: string, n: string) => {
    if (!user) return
    const r = await rejoindreClan(user.uid, moi, c)
    if (r === 'introuvable') setMsg(fr ? 'Ce clan n’existe plus.' : 'Clan not found.')
    else if (r === 'plein') setMsg(fr ? 'Ce clan est complet.' : 'Clan is full.')
    else if (r === 'prive') setMsg(fr ? 'Ce clan est privé : il faut qu’un membre t’invite.' : 'Private clan: invitation only.')
    else noterActivite(user.uid, '🛡️', `a rejoint le clan ${n}`).catch(() => {})
  }
  const enregistrer = async () => {
    if (!clan) return
    if (nom.trim().length < 3) { setMsg(fr ? 'Il faut un nom d’au moins 3 lettres.' : 'Name needs 3+ letters.'); return }
    if (cleNom(nom) !== cleNom(clan.nom) && await nomPris(nom)) { setMsg(fr ? 'Ce nom de clan existe déjà.' : 'Name taken.'); return }
    await modifierClan(clan, { nom: nom.trim().slice(0, 24), devise: devise.trim().slice(0, 60), blason, prive })
    setEdition(false); setMsg(fr ? 'Clan mis à jour ✨' : 'Saved'); charger()
  }

  if (clan === undefined) return <p style={{ color: 'var(--muted)', padding: 24 }}>{fr ? 'Chargement…' : 'Loading…'}</p>

  // ——— Pas encore de clan : chercher, rejoindre, fonder ———
  if (!clan) return (
    <>
      <Link to="/duels" className="lien-retour"><Icon d={ICONS.arrowL} />Multi</Link>
      <header className="clan-hero vide">
        <BlasonClan b={BLASON_DEFAUT} niveau={5} taille={84} />
        <div><h1 className="t">{fr ? 'Les clans' : 'Clans'}</h1><p>{fr ? 'Faites monter votre clan de niveau ensemble : chaque partie de chaque membre compte. Plus le clan grandit, plus son blason devient beau.' : 'Level up your clan together.'}</p></div>
      </header>
      {!creation && (
        <section className="card clan-bloc">
          <h2 className="t">{fr ? 'Trouver un clan' : 'Find a clan'}</h2>
          <input className="input" value={cherche} onChange={(e) => setCherche(e.target.value)} placeholder={fr ? 'Nom du clan…' : 'Clan name…'} />
          <div className="clan-suggestions">
            {resultats.length === 0 && <p style={{ color: 'var(--muted)', margin: 0 }}>{index.length ? (fr ? 'Aucun clan avec ce nom.' : 'No match.') : (fr ? 'Aucun clan pour l’instant : fonde le premier !' : 'No clans yet.')}</p>}
            {resultats.map((c) => <CarteClanIndex key={c.code} c={c} onRejoindre={() => rejoindre(c.code, c.nom)} />)}
          </div>
          <button className="btn btn-s btn-lg" onClick={() => setCreation(true)}>🛡️ {fr ? 'Fonder mon propre clan' : 'Found my clan'}</button>
        </section>
      )}
      {creation && (
        <section className="card clan-bloc">
          <h2 className="t">{fr ? 'Fonder mon clan' : 'Found my clan'}</h2>
          <input className="input" value={nom} maxLength={24} onChange={(e) => setNom(e.target.value)} placeholder={fr ? 'Nom du clan (unique)' : 'Clan name'} />
          <input className="input" value={devise} maxLength={60} onChange={(e) => setDevise(e.target.value)} placeholder={fr ? 'Devise (facultatif)' : 'Motto (optional)'} />
          <Atelier b={blason} setB={setBlason} niveau={1} />
          <div className="clan-ligne"><button className="btn btn-g" onClick={() => setCreation(false)}>{fr ? 'Annuler' : 'Cancel'}</button><button className="btn btn-p btn-lg" onClick={creer}>{fr ? 'Créer le clan' : 'Create'}</button></div>
        </section>
      )}
      {msg && <p role="status" style={{ fontWeight: 700 }}>{msg}</p>}
    </>
  )

  // ——— Mon clan ———
  const niv = niveauClan(clan.xp)
  const debut = xpNiveau(niv), fin = xpNiveau(niv + 1)
  const semaineXp = scores.reduce((s, m) => s + m.xp, 0)
  const objectif = objectifSemaine(niv)
  const chef = clan.chef === user?.uid
  return (
    <>
      <Link to="/duels" className="lien-retour"><Icon d={ICONS.arrowL} />Multi</Link>
      <header className="clan-hero" style={{ ['--c1' as string]: clan.blason.c1, ['--c2' as string]: clan.blason.c2 }}>
        <BlasonClan b={clan.blason} niveau={niv} taille={96} />
        <div className="clan-hero-texte">
          <span className="clan-niveau">{fr ? 'Niveau' : 'Level'} {niv}</span>
          <h1 className="t">{clan.nom}</h1>
          {clan.devise && <p>« {clan.devise} »</p>}
          <small className="clan-visibilite">{clan.prive ? (fr ? '🔒 Clan privé · sur invitation' : '🔒 Private') : (fr ? '🌍 Clan public' : '🌍 Public')}</small>
          <div className="clan-xp"><span style={{ width: `${((clan.xp ?? 0) - debut) / (fin - debut) * 100}%` }} /></div>
          <small>{nf((clan.xp ?? 0) - debut)} / {nf(fin - debut)} XP {fr ? `vers le niveau ${niv + 1}` : `to level ${niv + 1}`}</small>
        </div>
      </header>
      <section className="card clan-bloc">
        <div className="clan-objectif-tete"><strong>{fr ? 'Objectif de la semaine' : 'Weekly goal'}</strong><span>{nf(semaineXp)} / {nf(objectif)} XP</span></div>
        <div className="bar clan-barre"><span style={{ width: `${Math.min(100, (semaineXp / objectif) * 100)}%`, background: clan.blason.c1 }} /></div>
        <small style={{ color: 'var(--muted)' }}>{semaineXp >= objectif ? (fr ? '🎉 Objectif atteint, bravo à tout le clan !' : '🎉 Goal reached!') : (fr ? 'Remise à zéro chaque lundi.' : 'Resets Monday.')}</small>
      </section>
      <section className="card clan-bloc">
        <div className="clan-objectif-tete"><h2 className="t">{fr ? 'Membres' : 'Members'}</h2><span>{Object.keys(clan.membres ?? {}).length} / {maxMembres(niv)}</span></div>
        <ol className="clan-membres">
          {scores.map((m, i) => (
            <li key={m.uid}>
              <span className="clan-rang">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
              <Link to={`/joueur/${m.uid}`} className="clan-membre"><Avatar pseudo={m.pseudo} avatar={m.avatar} cadre={m.cadre} taille={36} /><span>{m.pseudo}{clan.chef === m.uid && ' 👑'}</span></Link>
              <strong>{nf(m.xp)} XP</strong>
            </li>
          ))}
        </ol>
        <InviterAmis clan={clan} />
      </section>
      <section className="card clan-bloc">
        <h2 className="t">{fr ? 'Récompenses de niveau' : 'Level rewards'}</h2>
        <ul className="clan-avantages">{AVANTAGES.map(([n, t]) => <li key={n} className={niv >= n ? 'ok' : ''}><span>{niv >= n ? '✓' : `🔒`}</span><strong>{fr ? 'Niv.' : 'Lv.'} {n}</strong> {t}</li>)}</ul>
      </section>
      {chef && !edition && <button className="btn btn-s" style={{ alignSelf: 'flex-start' }} onClick={() => setEdition(true)}>🎨 {fr ? 'Personnaliser le clan' : 'Customize clan'}</button>}
      {chef && edition && (
        <section className="card clan-bloc">
          <h2 className="t">{fr ? 'Personnaliser' : 'Customize'}</h2>
          <input className="input" value={nom} maxLength={24} onChange={(e) => setNom(e.target.value)} />
          <input className="input" value={devise} maxLength={60} onChange={(e) => setDevise(e.target.value)} placeholder={fr ? 'Devise' : 'Motto'} />
          <div className="segment" role="group" aria-label={fr ? 'Visibilité' : 'Visibility'}>
            <button type="button" aria-pressed={!prive} onClick={() => setPrive(false)}>🌍 {fr ? 'Public' : 'Public'}</button>
            <button type="button" aria-pressed={prive} onClick={() => setPrive(true)}>🔒 {fr ? 'Privé' : 'Private'}</button>
          </div>
          <small style={{ color: 'var(--muted)' }}>{prive ? (fr ? 'Privé : le clan n’apparaît pas dans la recherche, on y entre seulement sur invitation d’un membre.' : 'Private: invitation only.') : (fr ? 'Public : tout le monde peut trouver le clan et le rejoindre.' : 'Public: anyone can join.')}</small>
          <Atelier b={blason} setB={setBlason} niveau={niv} />
          <div className="clan-ligne"><button className="btn btn-g" onClick={() => setEdition(false)}>{fr ? 'Annuler' : 'Cancel'}</button><button className="btn btn-p" onClick={enregistrer}>{fr ? 'Enregistrer' : 'Save'}</button></div>
        </section>
      )}
      {msg && <p role="status" style={{ fontWeight: 700 }}>{msg}</p>}
      {quitter
        ? <div className="clan-ligne"><span>{fr ? 'Quitter le clan ?' : 'Leave clan?'}</span><button className="btn btn-g" onClick={() => setQuitter(false)}>{fr ? 'Non' : 'No'}</button><button className="btn btn-p" style={{ background: 'var(--ko)' }} onClick={() => user && quitterClan(user.uid, code)}>{fr ? 'Oui, quitter' : 'Leave'}</button></div>
        : <button className="btn btn-g" style={{ alignSelf: 'flex-start' }} onClick={() => setQuitter(true)}>{fr ? 'Quitter le clan' : 'Leave clan'}</button>}
    </>
  )
}

// Inviter ses amis dans le clan : chacun reçoit une invitation à accepter en un appui
function InviterAmis({ clan }: { clan: ClanT }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [amis, setAmis] = useState<ProfilPublic[]>([])
  const [envoyes, setEnvoyes] = useState<string[]>([])
  const [ouvert, setOuvert] = useState(false)
  useEffect(() => { if (ouvert) profilsDe(profile?.amis ?? []).then(setAmis).catch(() => {}) }, [ouvert, profile?.amis])
  const libres = amis.filter((a) => !clan.membres?.[a.uid])
  const inviter = async (a: ProfilPublic) => {
    if (!user) return
    await inviterClan(clan, { uid: user.uid, pseudo: profile?.pseudo ?? '?' }, a.uid)
    setEnvoyes((e) => [...e, a.uid])
  }
  return (
    <div className="clan-inviter">
      <button type="button" className="btn btn-p" onClick={() => setOuvert((o) => !o)}>📣 {fr ? 'Inviter des amis' : 'Invite friends'} {ouvert ? '▴' : '▾'}</button>
      {ouvert && (libres.length === 0
        ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>{(profile?.amis?.length ?? 0) === 0 ? (fr ? 'Ajoute d’abord des amis (Multi → Mes amis).' : 'Add friends first.') : (fr ? 'Tous tes amis sont déjà dans le clan !' : 'All your friends are in.')}</p>
        : <div className="clan-inviter-liste">{libres.map((a) => (
            <div key={a.uid} className="clan-inviter-ami">
              <Avatar pseudo={a.pseudo} avatar={a.avatar} cadre={a.cadre} taille={34} />
              <span>{a.pseudo}</span>
              <button type="button" className={`btn ${envoyes.includes(a.uid) ? 'btn-g' : 'btn-p'}`} disabled={envoyes.includes(a.uid)} onClick={() => inviter(a)}>{envoyes.includes(a.uid) ? (fr ? '✓ Invité' : '✓ Invited') : (fr ? 'Inviter' : 'Invite')}</button>
            </div>
          ))}</div>)}
    </div>
  )
}
