// Comparaison tolérante pour la saisie libre : casse, accents, tirets, articles et petites fautes
const ARTICLES = /^(le|la|les|l|the)\s+/

export function normaliser(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[''`\-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(ARTICLES, '')
}

function levenshtein(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}

export function estCorrect(saisie: string, acceptees: string[]) {
  const s = normaliser(saisie)
  if (!s) return false
  return acceptees.some((a) => {
    const n = normaliser(a)
    // 1 faute tolérée jusqu'à 6 lettres, 2 au-delà
    const tolerance = n.length <= 3 ? 0 : n.length <= 6 ? 1 : 2
    return levenshtein(s, n) <= tolerance
  })
}
