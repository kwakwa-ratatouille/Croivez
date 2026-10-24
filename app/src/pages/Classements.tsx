import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { classementGlobal, classementSemaine, profilsDe } from '../social'
import { ligueDe, ligueSuivante } from '../meta'
import { ICONS, Icon } from '../components/ui'
import Avatar from '../components/Avatar'

type Ligne = { uid: string; pseudo: string; xp: number; niveau?: number; avatar?: string; cadre?: string }
type Onglet = 'ligue' | 'semaine' | 'global' | 'amis'

export default function Classements() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const [onglet, setOnglet] = useState<Onglet>('ligue')
  const [lignes, setLignes] = useState<Ligne[] | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    setLignes(null)
    setErreur('')
    const charger = onglet === 'semaine' || onglet === 'ligue' ? classementSemaine()
      : onglet === 'global' ? classementGlobal()
      : profilsDe([user!.uid, ...(profile?.amis ?? [])]).then((l) => l.sort((a, b) => b.xp - a.xp))
    charger.then(setLignes).catch((e) => { console.error(e); setErreur(fr ? 'Classement indisponible (connexion ou règles Firebase).' : 'Leaderboard unavailable.') })
  }, [onglet, user, profile?.amis, fr])

  const ONGLETS: [Onglet, string][] = [['ligue', fr ? 'Ma ligue' : 'My league'], ['semaine', fr ? 'Cette semaine' : 'This week'], ['global', fr ? 'Tout temps' : 'All time'], ['amis', fr ? 'Amis' : 'Friends']]
  const medaille = ['var(--his)', 'var(--brd)', 'var(--cine)']
  const monXp = lignes?.find((l) => l.uid === user?.uid)?.xp ?? 0
  const maLigue = ligueDe(monXp)
  const suivante = ligueSuivante(monXp)
  const affichees = onglet === 'ligue' ? lignes?.filter((l) => ligueDe(l.xp).id === maLigue.id) : lignes

  return (
    <>
      <h1 className="t" style={{ fontSize: 36, fontWeight: 900 }}>{fr ? 'Classements' : 'Leaderboards'}</h1>
      <div role="tablist" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {ONGLETS.map(([id, l]) => <button key={id} role="tab" aria-selected={onglet === id} className="pill" aria-pressed={onglet === id} onClick={() => setOnglet(id)}>{l}</button>)}
      </div>
      {onglet === 'ligue' && lignes && (
        <section className="card rise" style={{ padding: 20, maxWidth: 760, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <span style={{ width: 64, height: 64, borderRadius: 20, background: maLigue.couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon d={ICONS.sparkle} size={32} /></span>
          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <strong className="t" style={{ fontSize: 22 }}>{fr ? 'Ligue' : 'League'} {maLigue.nom[lang]}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>
              {suivante
                ? (fr ? `${monXp} XP cette semaine · encore ${suivante.min - monXp} XP pour la ligue ${suivante.nom.fr}` : `${monXp} XP this week · ${suivante.min - monXp} XP to ${suivante.nom.en}`)
                : (fr ? `${monXp} XP : ligue la plus haute !` : `${monXp} XP: top league!`)}
            </span>
            {suivante && <div className="bar" style={{ height: 8 }}><span style={{ width: `${((monXp - maLigue.min) / (suivante.min - maLigue.min)) * 100}%`, background: suivante.couleur }} /></div>}
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fr ? 'Remise à zéro chaque lundi : chaque semaine, une nouvelle chance de monter.' : 'Resets every Monday: a new chance to climb each week.'}</span>
          </div>
        </section>
      )}
      <section className="card" style={{ padding: 12, maxWidth: 760 }}>
        {erreur && <p style={{ padding: 20, color: 'var(--ko-i)' }}>{erreur}</p>}
        {!lignes && !erreur && <p style={{ padding: 20, color: 'var(--muted)' }}>…</p>}
        {lignes?.length === 0 && <p style={{ padding: 20, color: 'var(--muted)' }}>{fr ? 'Personne pour l’instant. Jouez une partie pour ouvrir le classement !' : 'Nobody yet. Play a game to open the leaderboard!'}</p>}
        {affichees?.map((l, n) => {
          const moi = l.uid === user?.uid
          return (
            <Link key={l.uid} to={moi ? '/profil' : `/joueur/${l.uid}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 16, background: moi ? 'var(--geo-t)' : 'transparent', color: 'inherit', textDecoration: 'none' }}>
              <span className="t" style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, background: n < 3 ? medaille[n] : 'var(--surface2)', color: n < 3 ? 'var(--surface)' : 'var(--muted)' }}>{n + 1}</span>
              <Avatar pseudo={l.pseudo} avatar={l.avatar} cadre={l.cadre} taille={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{l.pseudo}{moi && <span style={{ color: 'var(--muted)', fontWeight: 500 }}> ({fr ? 'vous' : 'you'})</span>}</div>
                {l.niveau && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{fr ? 'Niveau' : 'Level'} {l.niveau}</div>}
              </div>
              <span className="t" style={{ fontWeight: 900, fontSize: 18 }}>{new Intl.NumberFormat(fr ? 'fr-FR' : 'en-GB').format(l.xp)} XP</span>
            </Link>
          )
        })}
      </section>
    </>
  )
}
