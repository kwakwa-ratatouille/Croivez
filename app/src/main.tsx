import { retenirParrain } from './parrainage'
import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App'
import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { signalerPlantage, surveillerPlantages } from './plantages'

// Affiche l'erreur au lieu d'un écran vide : indispensable pour diagnostiquer l'app iOS sans console
class Garde extends Component<{ children: ReactNode }, { erreur: Error | null }> {
  state = { erreur: null as Error | null }
  static getDerivedStateFromError(erreur: Error) { return { erreur } }
  // Rapport de plantage automatique (écran cassé)
  componentDidCatch(erreur: Error) { signalerPlantage(erreur, 'ecran') }
  render() {
    if (!this.state.erreur) return this.props.children
    return (
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 className="t" style={{ fontSize: 24 }}>Oups, Croivez a rencontré une erreur</h1>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: 'var(--ko-i)' }}>{String(this.state.erreur?.stack ?? this.state.erreur)}</pre>
        <p style={{ color: 'var(--muted)' }}>Un rapport a été envoyé automatiquement pour corriger le problème.</p>
        <button className="btn btn-p" onClick={() => location.reload()}>Recharger</button>
      </div>
    )
  }
}

window.addEventListener('error', (e) => console.error('Erreur globale', e.error))
surveillerPlantages()

// Mise à jour à chaud : signale que ce contenu démarre bien, sinon le module revient à la version précédente
if (Capacitor.isNativePlatform()) CapacitorUpdater.notifyAppReady().catch(() => {})

retenirParrain() // lien d'invitation « ?parrain=… » mémorisé avant l'inscription
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Garde><App /></Garde>
  </StrictMode>,
)
