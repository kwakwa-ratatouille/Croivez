import { Capacitor } from '@capacitor/core'
import { jour, type Profile } from './auth'
import { aReviser } from './quiz/revision'

// Notifications de rappel (téléphone uniquement) : série en danger, quiz du jour, révisions en attente.
// Replanifiées à chaque ouverture de l'appli ; désactivables dans Paramètres.
// Le module natif n'existe qu'à partir de la version native qui l'embarque : sinon, on ne fait rien.
export const rappelsActifs = () => { try { return localStorage.getItem('rappels') !== '0' } catch { return true } }
export const reglerRappels = (v: boolean) => { try { localStorage.setItem('rappels', v ? '1' : '0') } catch { /* stockage indisponible */ } }

const dans = (jours: number, h: number) => { const d = new Date(); d.setDate(d.getDate() + jours); d.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0); return d }
const pioche = <T,>(l: T[]) => l[Math.floor(Math.random() * l.length)]

// Heure habituelle de jeu : moyenne glissante des heures d'ouverture (les rappels tombent quand on joue d'habitude)
function heureHabituelle() {
  const h = new Date().getHours() + new Date().getMinutes() / 60
  let m = h
  try { const v = parseFloat(localStorage.getItem('heureJeu') ?? ''); m = isNaN(v) ? h : v * 0.8 + h * 0.2; localStorage.setItem('heureJeu', String(m)) } catch { /* stockage indisponible */ }
  return Math.min(21, Math.max(9, m))
}

const QUIZ_JOUR = [
  ['Le quiz du jour est prêt 🏆', 'Mêmes questions pour tout le monde : fais mieux que tes potes !'],
  ['Nouveau quiz du jour ☀️', '10 questions, 2 minutes. Ton record t’attend.'],
  ['Tu connais la réponse ? 🤔', 'Le quiz du jour vient de sortir, viens tester ta culture.'],
  ['XP ×2 sur le quiz du jour ⚡', 'C’est le moment de grimper au classement.'],
]
const SERIE = [
  ['🔥 Ta série de {n} jours t’attend', 'Une petite partie pour ne pas la perdre !'],
  ['Ne casse pas ta série ! 🔥', '{n} jours d’affilée… ce serait dommage de s’arrêter là.'],
  ['⏳ Plus que quelques heures', 'Ta série de {n} jours s’éteint à minuit.'],
]
const RETOUR = [
  ['Tu nous manques 👀', 'De nouvelles questions sont arrivées depuis ta dernière partie.'],
  ['Tes amis avancent sans toi 🏃', 'Viens leur montrer qui est le ou la plus cultivé·e.'],
  ['Un petit duel ? ⚔️', 'Défie un ami en 2 minutes chrono.'],
]

export async function planifierRappels(p: Profile | null) {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('LocalNotifications')) return
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  await LocalNotifications.cancel({ notifications: [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id })) }).catch(() => {})
  if (!p || !rappelsActifs()) return
  if ((await LocalNotifications.checkPermissions()).display !== 'granted' && (await LocalNotifications.requestPermissions()).display !== 'granted') return
  const h = heureHabituelle()
  const serie = p.dernierJour === jour() ? p.serie : 0
  const dues = aReviser(p.revision).length
  const [qt, qb] = pioche(QUIZ_JOUR)
  const n: { id: number; title: string; body: string; schedule: { at: Date } }[] = [
    { id: 1, title: qt, body: qb, schedule: { at: dans(1, Math.min(h, 12.5)) } },
  ]
  if (serie >= 2) {
    const [st, sb] = pioche(SERIE)
    n.push({ id: 2, title: st.replace('{n}', String(serie)), body: sb.replace('{n}', String(serie)), schedule: { at: dans(1, Math.max(h, 18.5)) } })
    n.push({ id: 4, title: `🚨 Dernier appel : ${serie} jours de série`, body: 'Il reste une heure pour la sauver.', schedule: { at: dans(1, 22.75) } })
  }
  if (dues > 0) n.push({ id: 3, title: 'Révision 🧠', body: `${dues} question${dues > 1 ? 's' : ''} à revoir pour ne pas oublier.`, schedule: { at: dans(1, 17) } })
  if (new Date().getDay() !== 0) n.push({ id: 5, title: '🎁 Coffre de la semaine', body: 'Joue le quiz du jour pour avancer vers ton coffre hebdo.', schedule: { at: dans(7 - new Date().getDay(), 11) } })
  const [r1t, r1b] = pioche(RETOUR)
  n.push({ id: 6, title: r1t, body: r1b, schedule: { at: dans(3, h) } })
  n.push({ id: 7, title: 'On t’a gardé une place 🪑', body: 'Reviens jouer : ta série repart dès le premier quiz.', schedule: { at: dans(7, h) } })
  await LocalNotifications.schedule({ notifications: n }).catch(console.error)
}

// Invitation reçue pendant que l'appli est en arrière-plan : notification immédiate sur le téléphone
export async function notifierInvitation(titre: string, texte: string) {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('LocalNotifications') || !document.hidden) return
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  if ((await LocalNotifications.checkPermissions()).display !== 'granted') return
  await LocalNotifications.schedule({ notifications: [{ id: 100 + Math.floor(Math.random() * 1000), title: titre, body: texte, schedule: { at: new Date(Date.now() + 500) } }] }).catch(() => {})
}
