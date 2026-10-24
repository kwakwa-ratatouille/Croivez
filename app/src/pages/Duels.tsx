import ChoixTheme from '../components/ChoixTheme'
import { legendeOuverte } from '../progression'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onValue, ref, remove } from 'firebase/database'
import { rtdb } from '../firebase'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { profilsDe, type ProfilPublic } from '../social'
import { annulerRecherche, chercherAdversaire, inviter, refuser, rejoindre, type Duel } from '../duel'
import { ICONS, Icon, Logo } from '../components/ui'
import Avatar from '../components/Avatar'
import AjoutAmi from '../components/AjoutAmi'
import { MAX_JOUEURS, creerSalon, normaliserCode, rejoindreSalon } from '../salon'
import { FAMILLES } from '../themes'
import { CAST_APP_ID, estIos } from '../cast'
import { natureQuiz, type SousThemeId } from '../quiz/engine'

export default function Duels() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [amis, setAmis] = useState<ProfilPublic[]>([])
  const [invitations, setInvitations] = useState<{ id: string; de: string; salon?: string }[]>([])
  const [codeSalon, setCodeSalon] = useState('')
  const [msgSalon, setMsgSalon] = useState('')
  const [themeDuel, setThemeDuel] = useState('mix') // thème des duels contre un ami (« mix » = au hasard)
  const [message, setMessage] = useState('')
  const [recherche, setRecherche] = useState<string | null>(null)
  const [attenteAmi, setAttenteAmi] = useState<string | null>(() => new URLSearchParams(location.hash.split('?')[1] ?? '').get('attente'))
  const uid = user!.uid
  const aLegende = FAMILLES.some((f) => legendeOuverte(f.k, profile))
  const [legendeDuel, setLegendeDuel] = useState(false)
  const [nbDuel, setNbDuel] = useState(10)
  const [secDuel, setSecDuel] = useState(15)
  const [diffDuel, setDiffDuel] = useState(2)
  const moi = profile?.pseudo ?? '?'

  useEffect(() => { profilsDe(profile?.amis ?? []).then(setAmis).catch(console.error) }, [profile?.amis])

  useEffect(() => onValue(ref(rtdb, `invitations/${uid}`), (s) => {
    const v = (s.val() ?? {}) as Record<string, { de: string; salon?: string; type?: string }>
    setInvitations(Object.entries(v).filter(([, x]) => x.type !== 'ami' && x.type !== 'ami-ok').map(([id, x]) => ({ id, de: x.de, salon: x.salon })))
  }), [uid])

  // Dès que l'adversaire rejoint (recherche ou invitation), on part au duel
  const enAttente = recherche ?? attenteAmi
  useEffect(() => {
    if (!enAttente) return
    return onValue(ref(rtdb, `duels/${enAttente}`), (s) => {
      const d = s.val() as Duel | null
      if (d?.etat === 'pret' || d?.etat === 'jeu') nav(`/duel/${enAttente}`)
      if (d?.etat === 'fini') { setAttenteAmi(null); setMessage(fr ? 'Invitation refusée.' : 'Invitation declined.') }
    })
  }, [enAttente, nav, fr])

  if (enAttente) {
    return (
      <section className="card rise" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center', maxWidth: 560, margin: '40px auto' }}>
        <div className="attente"><Logo width={110} /></div>
        <h1 className="t" style={{ fontSize: 28, fontWeight: 900 }}>{recherche ? (fr ? 'Recherche d’un adversaire…' : 'Looking for an opponent…') : (fr ? 'En attente de votre ami…' : 'Waiting for your friend…')}</h1>
        <p style={{ color: 'var(--muted)' }}>{fr ? 'Le duel démarre dès qu’il rejoint.' : 'The duel starts as soon as they join.'}</p>
        <button className="btn btn-g" onClick={async () => { if (recherche) await annulerRecherche(uid, recherche); else if (attenteAmi) await refuser(attenteAmi, uid); setRecherche(null); setAttenteAmi(null) }}>{fr ? 'Annuler' : 'Cancel'}</button>
      </section>
    )
  }

  const defier = async (ami: string) => setAttenteAmi(await inviter(uid, moi, ami, themeDuel === 'mix' ? undefined : themeDuel as SousThemeId, legendeDuel ? 5 : diffDuel, nbDuel, secDuel))

  return (
    <>
      <h1 className="t" style={{ fontSize: 30, fontWeight: 900 }}>{fr ? 'Multijoueur' : 'Multiplayer'}</h1>

      {/* Invitations reçues, tout en haut */}
      {invitations.length > 0 && (
        <section className="multi-invits rise">
          {invitations.map((inv) => (
            <div key={inv.id} className="multi-invit">
              <span className="multi-invit-emoji">{inv.salon ? '👥' : '⚔️'}</span>
              <strong>{inv.de} <small>{inv.salon ? (fr ? 't’invite dans son salon' : 'invites you to a room') : (fr ? 'te défie en duel !' : 'challenges you!')}</small></strong>
              <button className="btn btn-p" onClick={async () => { if (inv.salon) { await remove(ref(rtdb, `invitations/${uid}/${inv.id}`)); nav(`/salon/${inv.salon}`); return } if (await rejoindre(inv.id, uid, moi)) nav(`/duel/${inv.id}`); else setMessage(fr ? 'Ce duel a été annulé.' : 'This duel was cancelled.') }}>{fr ? 'Accepter' : 'Accept'}</button>
              <button className="btn btn-g" aria-label={fr ? 'Refuser' : 'Decline'} onClick={() => (inv.salon ? remove(ref(rtdb, `invitations/${uid}/${inv.id}`)) : refuser(inv.id, uid))}>✕</button>
            </div>
          ))}
        </section>
      )}

      {/* Bandeau amis : bien visible, en haut ; un appui sur ⚔️ lance l'invitation au duel */}
      <section className="card multi-amis">
        <div className="multi-amis-tete">
          <h2 className="t">👋 {fr ? 'Mes amis' : 'My friends'} <span>{amis.length}</span></h2>
          <Link to="/amis" className="btn btn-g">{fr ? 'Messages et plus' : 'Chat & more'}<Icon d={ICONS.arrowR} size={16} /></Link>
        </div>
        {amis.length > 0
          ? <div className="multi-amis-liste">{amis.map((a) => (
              <div key={a.uid} className="multi-ami">
                <Link to={`/joueur/${a.uid}`} className="multi-ami-id"><Avatar pseudo={a.pseudo} avatar={a.avatar} cadre={a.cadre} taille={54} /><strong>{a.pseudo}</strong><small>{fr ? 'Niv.' : 'Lv.'} {a.niveau}</small></Link>
                <button className="btn btn-p multi-ami-defi" onClick={() => defier(a.uid)}>⚔️ {fr ? 'Défier' : 'Duel'}</button>
              </div>
            ))}</div>
          : <p style={{ color: 'var(--muted)', fontSize: 14 }}>{fr ? `Ajoute tes amis ci-dessous, ou partage ton pseudo « ${moi} ».` : `Add friends below, or share “${moi}”.`}</p>}
        <AjoutAmi uid={uid} />
        {message && <p role="status" style={{ fontSize: 14, color: 'var(--muted)' }}>{message}</p>}
      </section>

      {/* Défier un ami : tous les réglages, puis le choix de l'ami */}
      <section className="card multi-duel">
        <div className="multi-duel-tete"><span className="multi-duel-icone">🤝</span><div><h2 className="t">{fr ? 'Défier un ami' : 'Challenge a friend'}</h2><p>{fr ? 'Tu choisis tout : thème, difficulté, nombre de questions et temps. Ton ami confirme « Prêt » et c’est parti.' : 'You pick the rules, your friend confirms.'}</p></div></div>
        <div className="multi-duel-reglages">
          <label><span>{fr ? 'Thème' : 'Topic'}</span>
            <ChoixTheme valeur={themeDuel} onChange={setThemeDuel} quiz={FAMILLES.flatMap((f) => f.subs.filter((s) => s.jouable && natureQuiz(s.id) !== 'carte').map((s) => s.id))} />
          </label>
        </div>
        <div className="multi-duel-grille">
          <span>{fr ? 'Difficulté' : 'Difficulty'}</span>
          <div className="multi-duel-choix">
            {[[1, fr ? 'Facile' : 'Easy'], [2, fr ? 'Moyen' : 'Medium'], [3, fr ? 'Difficile' : 'Hard'], [4, 'Expert']].map(([v, l]) => <button key={v} type="button" className="pill" aria-pressed={!legendeDuel && diffDuel === v} onClick={() => { setLegendeDuel(false); setDiffDuel(v as number) }}>{l}</button>)}
            <button type="button" className="pill pill-legende" aria-pressed={legendeDuel} disabled={!aLegende} title={aLegende ? '' : (fr ? 'Débloque une Légende pour l’utiliser' : 'Unlock a Legend first')} onClick={() => setLegendeDuel(true)}>{aLegende ? '👑' : '🔒'} Légende</button>
          </div>
          <span>{fr ? 'Questions' : 'Questions'}</span>
          <div className="multi-duel-choix">{[5, 10, 15, 20].map((n) => <button key={n} type="button" className="pill" aria-pressed={nbDuel === n} onClick={() => setNbDuel(n)}>{n}</button>)}</div>
          <span>{fr ? 'Temps' : 'Time'}</span>
          <div className="multi-duel-choix">{[8, 15, 20, 30].map((n) => <button key={n} type="button" className="pill" aria-pressed={secDuel === n} onClick={() => setSecDuel(n)}>{n} s</button>)}</div>
        </div>
        <div className="multi-duel-amis">
          {amis.length === 0 && <p className="multi-astuce">{fr ? 'Ajoute d’abord des amis dans « Mes amis » juste au-dessus.' : 'Add friends above first.'}</p>}
          {amis.map((a) => <button key={a.uid} type="button" className="multi-duel-ami" onClick={() => defier(a.uid)}><Avatar pseudo={a.pseudo} avatar={a.avatar} cadre={a.cadre} taille={34} /><span>{a.pseudo}</span><em>⚔️</em></button>)}
        </div>

      </section>

      {/* Duel aléatoire : règles de base, thèmes au hasard, aucun réglage */}
      <section className="card multi-aleatoire">
        <span className="multi-duel-icone">🎲</span>
        <div style={{ flex: 1, minWidth: 0 }}><h2 className="t">{fr ? 'Duel aléatoire' : 'Random duel'}</h2><p>{fr ? 'Un adversaire au hasard, un thème au hasard, règles classiques (10 questions, 15 s).' : 'Random opponent and topic, classic rules.'}</p></div>
        <button className="btn btn-lg multi-hasard" onClick={async () => setRecherche(await chercherAdversaire(uid, moi))}>{fr ? 'Jouer' : 'Play'}<Icon d={ICONS.arrowR} /></button>
      </section>

      {/* Salon : la grande nouveauté, mise en avant */}
      <section className="card salon-accueil rise">
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="eyebrow" style={{ color: 'inherit', opacity: .85 }}>{fr ? `Jusqu’à ${MAX_JOUEURS} joueurs` : `Up to ${MAX_JOUEURS} players`}</span>
          <h2 className="t" style={{ fontSize: 26, fontWeight: 900 }}>{fr ? 'Salon entre amis' : 'Room with friends'}</h2>
          <p style={{ opacity: .9 }}>{fr ? 'Crée un salon, partage le code, et tout le monde répond aux mêmes questions en même temps. Classement en direct après chaque question.' : 'Create a room, share the code, everyone answers the same questions at once.'}</p>
          <button className="btn salon-creer" onClick={async () => { setMsgSalon(''); try { nav(`/salon/${await creerSalon({ uid, pseudo: moi, avatar: profile?.avatar, cadre: profile?.cadre })}`) } catch { setMsgSalon(fr ? 'Impossible de créer le salon (connexion ?).' : 'Could not create the room.') } }}>{fr ? 'Créer un salon' : 'Create a room'}<Icon d={ICONS.arrowR} /></button>
        </div>
        <form className="salon-rejoindre" onSubmit={async (e) => {
          e.preventDefault(); setMsgSalon('')
          const c = normaliserCode(codeSalon)
          if (c.length !== 5) return setMsgSalon(fr ? 'Le code fait 5 caractères.' : 'Codes are 5 characters.')
          const r = await rejoindreSalon(c, { uid, pseudo: moi, avatar: profile?.avatar, cadre: profile?.cadre })
          if (r === 'ok') nav(`/salon/${c}`)
          else setMsgSalon(r === 'introuvable' ? (fr ? 'Aucun salon avec ce code.' : 'No room with this code.') : r === 'plein' ? (fr ? 'Ce salon est complet.' : 'This room is full.') : (fr ? 'La partie a déjà commencé.' : 'The game has started.'))
        }}>
          <label htmlFor="code-salon" style={{ fontWeight: 800 }}>{fr ? 'Rejoindre avec un code' : 'Join with a code'}</label>
          <input id="code-salon" className="input t" value={codeSalon} onChange={(e) => setCodeSalon(normaliserCode(e.target.value))} placeholder="ABCDE" autoComplete="off" autoCapitalize="characters" style={{ fontSize: 26, fontWeight: 900, letterSpacing: 8, textAlign: 'center' }} />
          <button className="btn btn-p">{fr ? 'Rejoindre' : 'Join'}</button>
          {msgSalon && <p role="status" style={{ fontSize: 14, fontWeight: 700 }}>{msgSalon}</p>}
        </form>
      </section>
      {/* Mode télé : QR code sur la télé, tout le monde joue sur son téléphone, même sans compte */}
      <Link to="/tv" className="card tv-carte rise">
        <span style={{ fontSize: 42 }} aria-hidden="true">📺</span>
        <span style={{ flex: 1 }}>
          <strong className="t" style={{ display: 'block', fontSize: 21 }}>{fr ? 'Mode télé' : 'TV mode'}</strong>
          <span style={{ fontSize: 14, opacity: .9 }}>{fr ? 'Affiche la partie sur la télé : chacun scanne le QR code et joue sur son téléphone, même sans compte. Parfait en famille ou entre potes.' : 'Show the game on the TV, everyone plays on their phone.'}</span>
        </span>
        <Icon d={ICONS.arrowR} />
      </Link>
      {/* Chromecast : une seule touche depuis Android (ou Chrome sur ordinateur) */}
      {CAST_APP_ID && !estIos() && (
        <Link to="/cast" className="card tv-carte cast-carte rise">
          <span style={{ fontSize: 42 }} aria-hidden="true">📡</span>
          <span style={{ flex: 1 }}>
            <strong className="t" style={{ display: 'block', fontSize: 21 }}>{fr ? 'Caster sur la télé (Chromecast)' : 'Cast to TV (Chromecast)'}</strong>
            <span style={{ fontSize: 14, opacity: .9 }}>{fr ? 'Touche, choisis ta télé : la partie s’affiche toute seule et tu la rejoins directement.' : 'Tap, pick your TV, the game appears and you join.'}</span>
          </span>
          <Icon d={ICONS.arrowR} />
        </Link>
      )}
    </>
  )
}
