// Taille d'affichage : agrandit toute l'appli (pour mieux voir de près), mémorisée sur l'appareil
export const TAILLES = [{ v: 0.9, fr: 'Petite', en: 'Small' }, { v: 1, fr: 'Normale', en: 'Normal' }, { v: 1.15, fr: 'Grande', en: 'Large' }, { v: 1.3, fr: 'Très grande', en: 'Extra large' }]
export const lireTaille = () => { try { return Number(localStorage.getItem('taille')) || 1 } catch { return 1 } }
export function appliquerTaille(v = lireTaille()) {
  try { localStorage.setItem('taille', String(v)) } catch { /* stockage indisponible */ }
  document.documentElement.style.setProperty('zoom', String(v))
}
