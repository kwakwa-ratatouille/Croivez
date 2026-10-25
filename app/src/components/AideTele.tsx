import { useState } from 'react'
import { usePrefs } from '../i18n'

// Mettre le mode télé sur la télé sans Chromecast : recopier l'écran d'un iPhone, d'un Android ou d'un PC.
// L'appareil branché affiche la partie (QR code, questions) ; tout le monde joue sur son propre téléphone.
const IPHONE = /iPhone|iPad|iPod/i.test(navigator.userAgent)
const ANDROID = /Android/i.test(navigator.userAgent)

export default function AideTele() {
  const { lang } = usePrefs()
  const fr = lang === 'fr'
  const [onglet, setOnglet] = useState<'iphone' | 'android' | 'pc'>(IPHONE ? 'iphone' : ANDROID ? 'android' : 'pc')
  if (!fr) return null
  const etapes = {
    iphone: [
      'Ouvre le Centre de contrôle (glisse depuis le coin en haut à droite).',
      'Touche « Recopie de l’écran » et choisis ta télé : Apple TV, ou télé compatible AirPlay (la plupart des Samsung, LG, Sony et Philips récentes).',
      'Pas d’AirPlay ? Un adaptateur USB-C ou Lightning vers HDMI marche aussi, branché sur la télé.',
      'Sur l’iPhone recopié, ouvre ce mode télé et touche « Créer la partie » : la télé affiche le QR code.',
    ],
    android: [
      'Ouvre les réglages rapides (glisse deux fois depuis le haut).',
      'Touche « Smart View » (Samsung), « Diffuser l’écran » ou « Cast » et choisis ta télé.',
      'Sur le téléphone recopié, ouvre ce mode télé et touche « Créer la partie ».',
    ],
    pc: [
      'Branche l’ordinateur à la télé avec un câble HDMI, ou appuie sur Windows + K pour l’envoyer sans fil (Miracast).',
      'Ouvre Croivez dans le navigateur, puis le mode télé, et mets la page en plein écran (F11).',
      'Touche « Créer la partie » : la télé affiche le QR code.',
    ],
  }
  return (
    <details className="aide-tele">
      <summary>📺 {fr ? 'Pas de Chromecast ? Brancher un iPhone, un Android ou un PC' : 'No Chromecast?'}</summary>
      <div className="segment" role="group">
        {([['iphone', '📱 iPhone'], ['android', '🤖 Android'], ['pc', '💻 PC']] as const).map(([k, l]) => <button key={k} type="button" aria-pressed={onglet === k} onClick={() => setOnglet(k)}>{l}</button>)}
      </div>
      <ol>{etapes[onglet].map((e) => <li key={e}>{e}</li>)}</ol>
      <p className="aide-tele-note">💡 L’appareil branché sert d’écran : chacun joue avec son propre téléphone en scannant le QR code (même sans compte). Si tu veux jouer aussi, scanne le QR code avec un autre téléphone.</p>
    </details>
  )
}
