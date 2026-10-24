import { Capacitor } from '@capacitor/core'
import { jour, type Profile } from './auth'
import { aReviser } from './quiz/revision'

// Notifications de rappel (téléphone uniquement) : série en danger, quiz du jour, révisions en attente.
// Replanifiées à chaque ouverture de l'appli ; désactivables dans Paramètres.
// Le module natif n'existe qu'à partir de la version native qui l'embarque : sinon, on ne fait rien.
export const rappelsActifs = () => { try { return localStorage.getItem('rappels') !== '0' } catch { return true } }
export const reglerRappels = (v: boolean) => { try { localStorage.setItem('rappels', v ? '1' : '0') } catch { /* stockage indisponible */ } }

const demain = (h: number) => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(h, 0, 0, 0); return d }

export async function planifierRappels(p: Profile | null) {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('LocalNotifications')) return
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] }).catch(() => {})
  if (!p || !rappelsActifs()) return
  if ((await LocalNotifications.checkPermissions()).display !== 'granted' && (await LocalNotifications.requestPermissions()).display !== 'granted') return
  const serie = p.dernierJour === jour() ? p.serie : 0
  const dues = aReviser(p.revision).length
  const n: { id: number; title: string; body: string; schedule: { at: Date } }[] = [
    { id: 1, title: 'Le quiz du jour est prêt 🏆', body: 'Mêmes questions pour tout le monde : fais mieux que tes potes !', schedule: { at: demain(12) } },
  ]
  if (serie >= 2) n.push({ id: 2, title: `🔥 ${serie} jours de série !`, body: 'Une petite partie aujourd’hui pour ne pas la perdre.', schedule: { at: demain(19) } })
  if (dues > 0) n.push({ id: 3, title: 'Révision 🧠', body: `${dues} question${dues > 1 ? 's' : ''} à revoir pour ne pas oublier.`, schedule: { at: demain(17) } })
  await LocalNotifications.schedule({ notifications: n }).catch(console.error)
}

// Invitation reçue pendant que l'appli est en arrière-plan : notification immédiate sur le téléphone
export async function notifierInvitation(titre: string, texte: string) {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('LocalNotifications') || !document.hidden) return
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  if ((await LocalNotifications.checkPermissions()).display !== 'granted') return
  await LocalNotifications.schedule({ notifications: [{ id: 100 + Math.floor(Math.random() * 1000), title: titre, body: texte, schedule: { at: new Date(Date.now() + 500) } }] }).catch(() => {})
}
