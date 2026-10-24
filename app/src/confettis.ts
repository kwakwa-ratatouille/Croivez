// Pluie de confettis légère (DOM + animations CSS, retirée toute seule) pour fêter les réussites.
// intensite : 1 = petite fête (partie réussie), 2 = grosse fête (sans-faute, victoire, boss)
const COULEURS = ['#FF4FD8', '#5B8DEF', '#4FAE6A', '#FFE08A', '#E3574B', '#A35BE0', '#2FB5B0']

export function confettis(intensite: 1 | 2 = 1) {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const zone = document.createElement('div')
    zone.className = 'confettis'
    zone.setAttribute('aria-hidden', 'true')
    const n = intensite === 2 ? 90 : 45
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i')
      const taille = 6 + Math.random() * 7
      c.style.cssText = `left:${Math.random() * 100}%;width:${taille}px;height:${taille * (Math.random() < .5 ? .45 : 1)}px;background:${COULEURS[i % COULEURS.length]};animation-delay:${Math.random() * .5}s;animation-duration:${1.8 + Math.random() * 1.4}s;--dx:${(Math.random() - .5) * 160}px;--r:${Math.random() * 720 - 360}deg;border-radius:${Math.random() < .3 ? '50%' : '2px'}`
      zone.appendChild(c)
    }
    document.body.appendChild(zone)
    setTimeout(() => zone.remove(), 3800)
  } catch { /* pas de DOM */ }
}
