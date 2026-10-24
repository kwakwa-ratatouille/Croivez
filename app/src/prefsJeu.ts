// Réglages de jeu de l'appareil (Paramètres → Partie) : valeurs par défaut de la fiche de lancement,
// affichage en partie, confort de lecture. Tout est gardé dans le stockage local.
import type { Format } from './quiz/formats'

export type PrefsJeu = {
  n: number // questions par partie
  m: Format // format de réponse par défaut
  chrono: boolean
  duree: number // secondes par question quand le chrono est activé
  rapide: boolean
  bonus: boolean // afficher les bonus payants (+10 s, passer…) en partie
  fiches: boolean // afficher la fiche « Le saviez-vous ? » après chaque réponse
  texte: 'normal' | 'grand'
  calme: boolean // animations réduites
}
const DEFAUT: PrefsJeu = { n: 10, m: 'qcm', chrono: false, duree: 15, rapide: false, bonus: true, fiches: true, texte: 'normal', calme: false }

export function lirePrefsJeu(): PrefsJeu {
  try {
    const p = { ...DEFAUT, ...JSON.parse(localStorage.getItem('prefsJeu') ?? '{}') }
    // Le QCM devient le format par défaut (le plus simple) : l'ancien « Auto » par défaut est remplacé une fois
    if (!localStorage.getItem('qcmDefaut')) { localStorage.setItem('qcmDefaut', '1'); if (p.m === 'auto') { p.m = 'qcm'; localStorage.setItem('prefsJeu', JSON.stringify(p)) } }
    return p
  } catch { return DEFAUT }
}
export function ecrirePrefsJeu(maj: Partial<PrefsJeu>) {
  const p = { ...lirePrefsJeu(), ...maj }
  try { localStorage.setItem('prefsJeu', JSON.stringify(p)) } catch { /* stockage indisponible */ }
  appliquerAffichage(p)
  return p
}
// Taille du texte et animations : attributs sur <html>, lus par la feuille de style
export function appliquerAffichage(p = lirePrefsJeu()) {
  document.documentElement.dataset.texte = p.texte
  document.documentElement.dataset.calme = p.calme ? '1' : '0'
}
