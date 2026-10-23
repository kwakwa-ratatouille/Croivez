import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'fr' | 'en'

const fr = {
  'nav.home': 'Accueil', 'nav.themes': 'Thèmes', 'nav.review': 'Révision', 'nav.duels': 'Duels',
  'nav.ranking': 'Classements', 'nav.profile': 'Profil', 'nav.settings': 'Paramètres',
  'level': 'Niveau', 'offline': 'Hors ligne · votre progression sera synchronisée',
  'home.hello': 'Bonjour', 'home.sub': 'Prêt·e pour quelques minutes de curiosité ?',
  'home.streak': 'jours de série', 'home.start': 'Commencer une partie', 'home.favorites': 'Vos thèmes',
  'home.all': 'Tous les thèmes', 'home.daily': 'Défi du jour', 'home.dailyGo': 'Relever le défi',
  'themes.title': 'Thèmes', 'themes.sub': 'Sept familles, une couleur chacune. Choisissez un sous-thème pour lancer une partie.',
  'themes.soon': 'Bientôt', 'mastered': 'maîtrisé',
  'cfg.new': 'Nouvelle partie', 'cfg.sub': 'Sous-thème', 'cfg.diff': 'Difficulté', 'cfg.count': 'Nombre de questions',
  'cfg.mode': 'Mode de réponse', 'cfg.timer': 'Chrono', 'cfg.zen': 'Mode zen, sans chrono', 'cfg.yours': 'Votre partie',
  'cfg.go': 'Lancer la partie', 'cfg.qcm': 'QCM · 4 choix', 'cfg.qcmHint': 'Choisissez parmi quatre propositions, au clic ou avec les touches 1 à 4.',
  'cfg.free': 'Saisie libre', 'cfg.freeHint': 'Tapez la réponse. Les fautes de frappe et les accents sont pardonnés.',
  'diff.auto': 'Auto', 'diff.autoHint': 'S’adapte à votre niveau', 'diff.1': 'Facile', 'diff.1h': 'Les plus connus',
  'diff.2': 'Moyen', 'diff.2h': 'Un peu de flair', 'diff.3': 'Difficile', 'diff.3h': 'Pour les explorateurs',
  'diff.4': 'Expert', 'diff.4h': 'Le monde entier',
  'q.of': 'sur', 'q.quit': 'Quitter', 'q.validate': 'Valider', 'q.next': 'Suivant', 'q.placeholder': 'Votre réponse…',
  'q.right': 'Bonne réponse !', 'q.wrong': 'Pas tout à fait', 'q.answerWas': 'La réponse était', 'q.didyouknow': 'Le saviez-vous ?',
  'q.more': 'En savoir plus sur Wikipédia', 'q.capital': 'Capitale', 'q.population': 'Population', 'q.continent': 'Continent',
  'q.area': 'Superficie', 'q.skip': 'Je ne sais pas',
  'res.title': 'Partie terminée', 'res.score': 'bonnes réponses', 'res.xp': 'XP gagnés', 'res.replay': 'Rejouer',
  'res.errors': 'Rejouer mes erreurs', 'res.home': 'Accueil', 'res.review': 'À revoir',
  'login.title': 'Bienvenue sur Croivez', 'login.sub': 'Apprenez un peu chaque jour, à votre rythme.',
  'login.email': 'E-mail', 'login.password': 'Mot de passe', 'login.pseudo': 'Pseudo', 'login.signin': 'Se connecter',
  'login.signup': 'Créer un compte', 'login.google': 'Continuer avec Google', 'login.toSignup': 'Pas encore de compte ? Inscrivez-vous',
  'login.toSignin': 'Déjà un compte ? Connectez-vous', 'login.or': 'ou',
  'soon.title': 'En construction', 'soon.sub': 'Cet écran arrive dans une prochaine étape.',
  'set.lang': 'Langue', 'set.theme': 'Apparence', 'set.light': 'Clair', 'set.dark': 'Sombre', 'set.logout': 'Se déconnecter',
  'set.account': 'Compte',
}
const en: typeof fr = {
  'nav.home': 'Home', 'nav.themes': 'Topics', 'nav.review': 'Review', 'nav.duels': 'Duels',
  'nav.ranking': 'Leaderboards', 'nav.profile': 'Profile', 'nav.settings': 'Settings',
  'level': 'Level', 'offline': 'Offline · your progress will sync later',
  'home.hello': 'Hello', 'home.sub': 'Ready for a few minutes of curiosity?',
  'home.streak': 'day streak', 'home.start': 'Start a game', 'home.favorites': 'Your topics',
  'home.all': 'All topics', 'home.daily': 'Daily challenge', 'home.dailyGo': 'Take the challenge',
  'themes.title': 'Topics', 'themes.sub': 'Seven families, one colour each. Pick a sub-topic to start a game.',
  'themes.soon': 'Soon', 'mastered': 'mastered',
  'cfg.new': 'New game', 'cfg.sub': 'Sub-topic', 'cfg.diff': 'Difficulty', 'cfg.count': 'Number of questions',
  'cfg.mode': 'Answer mode', 'cfg.timer': 'Timer', 'cfg.zen': 'Zen mode, no timer', 'cfg.yours': 'Your game',
  'cfg.go': 'Start the game', 'cfg.qcm': 'Multiple choice · 4', 'cfg.qcmHint': 'Pick one of four answers, by clicking or with keys 1 to 4.',
  'cfg.free': 'Free typing', 'cfg.freeHint': 'Type the answer. Typos and accents are forgiven.',
  'diff.auto': 'Auto', 'diff.autoHint': 'Adapts to your level', 'diff.1': 'Easy', 'diff.1h': 'The best known',
  'diff.2': 'Medium', 'diff.2h': 'A bit of flair', 'diff.3': 'Hard', 'diff.3h': 'For explorers',
  'diff.4': 'Expert', 'diff.4h': 'The whole world',
  'q.of': 'of', 'q.quit': 'Quit', 'q.validate': 'Submit', 'q.next': 'Next', 'q.placeholder': 'Your answer…',
  'q.right': 'Correct!', 'q.wrong': 'Not quite', 'q.answerWas': 'The answer was', 'q.didyouknow': 'Did you know?',
  'q.more': 'Learn more on Wikipedia', 'q.capital': 'Capital', 'q.population': 'Population', 'q.continent': 'Continent',
  'q.area': 'Area', 'q.skip': 'I don’t know',
  'res.title': 'Game over', 'res.score': 'correct answers', 'res.xp': 'XP earned', 'res.replay': 'Play again',
  'res.errors': 'Replay my mistakes', 'res.home': 'Home', 'res.review': 'To review',
  'login.title': 'Welcome to Croivez', 'login.sub': 'Learn a little every day, at your own pace.',
  'login.email': 'Email', 'login.password': 'Password', 'login.pseudo': 'Username', 'login.signin': 'Sign in',
  'login.signup': 'Create an account', 'login.google': 'Continue with Google', 'login.toSignup': 'No account yet? Sign up',
  'login.toSignin': 'Already have an account? Sign in', 'login.or': 'or',
  'soon.title': 'Under construction', 'soon.sub': 'This screen is coming in a later step.',
  'set.lang': 'Language', 'set.theme': 'Appearance', 'set.light': 'Light', 'set.dark': 'Dark', 'set.logout': 'Sign out',
  'set.account': 'Account',
}

export type Key = keyof typeof fr
const dicts = { fr, en }

function read(key: string, fallback: string) {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
function save(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* stockage indisponible */ }
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string; dark: boolean; setDark: (d: boolean) => void }
const I18n = createContext<Ctx>(null!)

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (read('lang', 'fr') === 'en' ? 'en' : 'fr'))
  const [dark, setDarkState] = useState(() => read('theme', 'light') === 'dark')
  document.documentElement.lang = lang
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  const setLang = (l: Lang) => { save('lang', l); setLangState(l) }
  const setDark = (d: boolean) => { save('theme', d ? 'dark' : 'light'); setDarkState(d) }
  return <I18n.Provider value={{ lang, setLang, t: (k) => dicts[lang][k], dark, setDark }}>{children}</I18n.Provider>
}

export const usePrefs = () => useContext(I18n)
