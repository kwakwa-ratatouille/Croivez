import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth'
import { usePrefs } from '../i18n'
import { envoyerDefi, noterActivite, repondreDefi } from '../activite'
import { profilsDe, type ProfilPublic } from '../social'
import Avatar from './Avatar'

// Défi de score : en fin de partie, on envoie les mêmes questions à un ami avec le score à battre.
// Quand on joue un défi reçu (paramètre « contre »), on voit tout de suite qui gagne et l'autre est prévenu.
export default function DefiScore({ ids, bonnes, score, quiz }: { ids: string[]; bonnes: number; score: number; quiz: string }) {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const { user, profile } = useAuth()
  const p = new URLSearchParams(location.hash.split('?')[1] ?? '')
  const contre = p.get('contre')
  const cuid = p.get('cuid')
  const cbonnes = Number(p.get('cbonnes') ?? NaN)
  const [ouvert, setOuvert] = useState(false)
  const [amis, setAmis] = useState<ProfilPublic[] | null>(null)
  const [envoyes, setEnvoyes] = useState<string[]>([])
  const repondu = useRef(false)
  const envoyerA = p.get('envoyerA')
  const pseudoA = p.get('pseudoA') ?? ''
  const envoye = useRef(false)
  useEffect(() => {
    if (!envoyerA || !user || envoye.current || !ids.length) return
    envoye.current = true
    envoyerDefi(user.uid, profile?.pseudo ?? '?', envoyerA, { s: p.get('s') ?? 'drapeaux', m: 'qcm', d: Number(p.get('d') ?? 2), ids, score, bonnes, total: ids.length, quiz }).catch(() => {})
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps
  const gagne = contre && !Number.isNaN(cbonnes) ? (bonnes > cbonnes ? true : bonnes < cbonnes ? false : null) : undefined

  useEffect(() => {
    if (gagne === undefined || !user || !cuid || repondu.current) return
    repondu.current = true
    repondreDefi(user.uid, profile?.pseudo ?? '?', cuid, gagne, bonnes, ids.length).catch(() => {})
    if (gagne) noterActivite(user.uid, '⚔️', fr ? `a relevé le défi de ${contre} (${bonnes}/${ids.length})` : `beat ${contre}'s challenge`).catch(() => {})
  }, [gagne]) // eslint-disable-line react-hooks/exhaustive-deps

  const ouvrir = async () => { setOuvert(true); if (!amis) setAmis(await profilsDe(profile?.amis ?? []).catch(() => [])) }
  const defier = async (a: ProfilPublic) => {
    if (!user) return
    setEnvoyes((l) => [...l, a.uid])
    await envoyerDefi(user.uid, profile?.pseudo ?? '?', a.uid, { s: p.get('s') ?? 'drapeaux', m: p.get('m') ?? 'qcm', d: Number(p.get('d') ?? 2), ids, score, bonnes, total: ids.length, quiz }).catch(() => {})
  }

  return (
    <>
      {envoyerA && <p className="defi-verdict egal">📨 {fr ? `Défi envoyé à ${pseudoA} : à son tour de battre ton ${bonnes}/${ids.length} ! Tu seras prévenu du résultat.` : `Challenge sent to ${pseudoA}!`}</p>}
      {gagne !== undefined && (
        <p className={`defi-verdict ${gagne ? 'gagne' : gagne === false ? 'perdu' : 'egal'}`}>
          {gagne ? '🏆 ' : gagne === false ? '😤 ' : '🤝 '}
          {fr
            ? gagne ? `Tu bats ${contre} : ${bonnes} contre ${cbonnes} !` : gagne === false ? `${contre} garde l’avantage : ${cbonnes} contre ${bonnes}.` : `Égalité parfaite avec ${contre} : ${bonnes} partout.`
            : gagne ? `You beat ${contre}!` : gagne === false ? `${contre} wins.` : 'Draw!'}
        </p>
      )}
      {(profile?.amis?.length ?? 0) > 0 && <button type="button" className="btn btn-s btn-lg" onClick={ouvrir}>⚔️ {fr ? 'Défier un ami' : 'Challenge a friend'}</button>}
      {ouvert && (
        <div className="fiche-voile" onClick={() => setOuvert(false)}>
          <div className="card defi-feuille" onClick={(e) => e.stopPropagation()}>
            <strong className="t">{fr ? `Qui peut battre ton ${bonnes}/${ids.length} ?` : `Who can beat ${bonnes}/${ids.length}?`}</strong>
            <small>{fr ? 'Ton ami reçoit exactement les mêmes questions.' : 'Same questions for your friend.'}</small>
            <div className="defi-amis">
              {amis === null && <span>{fr ? 'Chargement…' : 'Loading…'}</span>}
              {amis?.map((a) => (
                <button key={a.uid} type="button" disabled={envoyes.includes(a.uid)} onClick={() => defier(a)}>
                  <Avatar pseudo={a.pseudo} avatar={a.avatar} cadre={a.cadre} taille={34} /><span>{a.pseudo}</span><em>{envoyes.includes(a.uid) ? '✓' : '⚔️'}</em>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-g" onClick={() => setOuvert(false)}>{fr ? 'Fermer' : 'Close'}</button>
          </div>
        </div>
      )}
    </>
  )
}
