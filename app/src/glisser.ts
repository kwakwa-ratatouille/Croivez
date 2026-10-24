// Cliquer-glisser à la souris sur toutes les rangées qui défilent horizontalement (sur PC).
// La molette n'est jamais détournée : elle fait défiler la page, comme partout ailleurs.
// Le doigt (téléphone) défile déjà nativement, on ne touche qu'à la souris.
function rangeeDe(el: Element | null): HTMLElement | null {
  for (let n = el as HTMLElement | null; n && n !== document.body; n = n.parentElement) {
    const ox = getComputedStyle(n).overflowX
    if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return n
  }
  return null
}

export function activerGlisser() {
  let g: { el: HTMLElement; x: number; gauche: number; bouge: boolean } | null = null
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    // Pas dans les champs de saisie ni sur la carte du monde (qui a son propre glisser)
    if ((e.target as Element).closest('input, textarea, select, .carte-quiz, svg[data-carte]')) return
    const el = rangeeDe(e.target as Element)
    if (el) g = { el, x: e.clientX, gauche: el.scrollLeft, bouge: false }
  })
  document.addEventListener('pointermove', (e) => {
    if (!g) return
    const dx = e.clientX - g.x
    if (!g.bouge && Math.abs(dx) > 6) { g.bouge = true; g.el.classList.add('glisse'); document.body.classList.add('glisse-en-cours') }
    if (g.bouge) { g.el.scrollLeft = g.gauche - dx; e.preventDefault() }
  })
  const fin = () => {
    if (!g) return
    const bougeait = g.bouge
    g.el.classList.remove('glisse'); document.body.classList.remove('glisse-en-cours')
    // Après un glissé, le relâchement ne doit pas ouvrir la carte sous la souris
    if (bougeait) { const stop = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }; window.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 50) }
    g = null
  }
  document.addEventListener('pointerup', fin)
  document.addEventListener('pointercancel', fin)
  // Les images ne doivent pas partir en « glisser-déposer » du navigateur
  document.addEventListener('dragstart', (e) => { if ((e.target as Element).closest?.('.carrousel, [class*="onglets"], .defileur')) e.preventDefault() })
}
