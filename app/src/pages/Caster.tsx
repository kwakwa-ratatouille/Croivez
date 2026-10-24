import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { usePrefs } from '../i18n'
import { CAST_APP_ID, caster, chargerCast, chromeCompatible, estAndroid, estIos } from '../cast'
import { URL_WEB } from '../salon'
import { ICONS, Icon, Logo, Wordmark } from '../components/ui'

const ICONE_CAST = 'M3 18.5a2.5 2.5 0 0 1 2.5 2.5M3 14.5A6.5 6.5 0 0 1 9.5 21M3 10.5A10.5 10.5 0 0 1 13.5 21M3 7V5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5H17'

// Mettre Croivez sur la télé avec un Chromecast, en un geste : on touche le bouton, on choisit la télé,
// la partie se crée sur la télé et ce téléphone la rejoint tout seul. Les autres scannent le QR code.
export default function Caster() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const nav = useNavigate()
  const [dispo, setDispo] = useState<boolean | null>(null)
  const [etat, setEtat] = useState<'' | 'connexion' | 'attente' | 'erreur'>('')
  const [codeErreur, setCodeErreur] = useState('')
  const natif = Capacitor.isNativePlatform()

  useEffect(() => { if (!natif) chargerCast().then(setDispo) }, [natif])

  const lancer = async () => {
    setEtat('connexion')
    try {
      await caster((code) => nav(`/rejoindre/${code}`))
      setEtat('attente')
    } catch (e) {
      // Code renvoyé par Google Cast (cancel, receiver_unavailable, session_error, timeout…)
      const code = typeof e === 'string' ? e : (e as { code?: string })?.code ?? String(e)
      if (code === 'cancel') { setEtat(''); return }
      setCodeErreur(code)
      setEtat('erreur')
    }
  }

  // Dans l'appli Android, la diffusion passe par Chrome (le SDK de Google n'existe pas dans l'appli)
  const ouvrirDansChrome = () => { window.location.href = `${URL_WEB}#/cast` }

  return (
    <div className="tv tv-accueil caster">
      <Link to="/duels" className="btn tv-quitter" aria-label={fr ? 'Retour' : 'Back'}><Icon d={ICONS.arrowL} /></Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Logo width={64} /><Wordmark size={40} /></div>
      <h1 className="t">{fr ? 'Croivez sur la télé' : 'Croivez on the TV'}</h1>

      {!CAST_APP_ID ? (
        <p className="caster-note">{fr ? 'La diffusion Chromecast arrive très bientôt. En attendant, ouvre le mode télé directement sur la télé ou l’ordinateur branché dessus.' : 'Chromecast is coming soon. Meanwhile, open TV mode on the TV.'}</p>
      ) : natif && estAndroid() ? (
        <>
          <p className="caster-note">{fr ? 'La diffusion se fait depuis Chrome : touche le bouton, puis « Caster sur la télé ».' : 'Casting works from Chrome.'}</p>
          <button type="button" className="btn btn-lg tv-lancer" onClick={ouvrirDansChrome}><Icon d={ICONE_CAST} size={24} />{fr ? 'Ouvrir dans Chrome' : 'Open in Chrome'}</button>
        </>
      ) : estIos() || (!natif && !chromeCompatible()) ? (
        <p className="caster-note">{fr ? 'Le Chromecast se lance depuis un téléphone Android ou un ordinateur avec Chrome. Sur iPhone : ouvre le mode télé sur la télé (son navigateur, une console ou un ordi), puis scanne le QR code.' : 'Chromecast works from Android or Chrome on a computer.'}</p>
      ) : dispo === null ? (
        <p className="caster-note">{fr ? 'Recherche des télés…' : 'Looking for TVs…'}</p>
      ) : !dispo ? (
        <p className="caster-note">{fr ? 'Aucun Chromecast trouvé. Vérifie que le téléphone est sur le même Wi-Fi que la télé.' : 'No Chromecast found. Check you are on the same Wi-Fi.'}</p>
      ) : (
        <>
          <ol className="tv-etapes">
            <li><span>1</span>{fr ? 'Touche « Caster sur la télé » et choisis ta télé' : 'Tap Cast and pick your TV'}</li>
            <li><span>2</span>{fr ? 'La partie s’ouvre sur la télé, ton téléphone la rejoint tout seul' : 'The game opens on the TV, your phone joins'}</li>
            <li><span>3</span>{fr ? 'Les autres scannent le QR code affiché sur la télé' : 'Others scan the QR code on the TV'}</li>
          </ol>
          <button type="button" className="btn btn-lg tv-lancer" onClick={lancer} disabled={etat === 'connexion' || etat === 'attente'}>
            <Icon d={ICONE_CAST} size={24} />
            {etat === 'connexion' ? (fr ? 'Connexion à la télé…' : 'Connecting…') : etat === 'attente' ? (fr ? 'La télé prépare la partie…' : 'The TV is getting ready…') : (fr ? 'Caster sur la télé' : 'Cast to TV')}
          </button>
          {etat === 'erreur' && (
            <p className="caster-note" style={{ color: '#FDE68A' }}>
              {codeErreur === 'receiver_unavailable' || codeErreur === 'session_error'
                ? (fr ? 'La télé n’a pas pu ouvrir Croivez. Si l’appli vient d’être publiée chez Google, ça peut prendre quelques heures ; éteins et rallume la télé (ou le Chromecast), puis réessaie.' : 'The TV could not open Croivez. Restart the TV and retry.')
                : codeErreur === 'timeout'
                  ? (fr ? 'La télé a mis trop de temps à répondre. Vérifie que le téléphone et la télé sont sur le même Wi-Fi, puis réessaie.' : 'The TV took too long. Check the Wi-Fi and retry.')
                  : (fr ? 'La diffusion n’a pas démarré. Réessaie.' : 'Casting did not start. Try again.')}
              <br /><small style={{ opacity: .8 }}>{fr ? 'Code' : 'Code'} : {codeErreur}</small>
            </p>
          )}
        </>
      )}
      <Link to="/tv" className="caster-lien">{fr ? 'Pas de Chromecast ? Ouvrir le mode télé sur cet écran' : 'No Chromecast? Open TV mode here'}</Link>
    </div>
  )
}
