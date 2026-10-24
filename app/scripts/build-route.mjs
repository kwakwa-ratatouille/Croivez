// Code de la route : panneaux français (images Wikimedia Commons, vérifiées une à une) + règles rédigées.
// Usage : node scripts/build-route.mjs
import { writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }
const PANNEAUX = [
  ['A1a', 'Virage à droite'], ['A1b', 'Virage à gauche'], ['A1c', 'Succession de virages, le premier à droite'], ['A2b', 'Dos-d’âne'], ['A3', 'Chaussée rétrécie'], ['A4', 'Chaussée glissante'],
  ['A8', 'Passage à niveau sans barrière'], ['A13a', 'Endroit fréquenté par les enfants'], ['A13b', 'Passage pour piétons'], ['A14', 'Autres dangers'], ['A15a1', 'Passage d’animaux domestiques'], ['A15b', 'Passage d’animaux sauvages'],
  ['A16', 'Descente dangereuse'], ['A21', 'Débouché de cyclistes'], ['A17', 'Feux tricolores'], ['A18', 'Circulation dans les deux sens'], ['A19', 'Risque de chute de pierres'], ['A20', 'Débouché sur un quai ou une berge'], ['A23', 'Traversée d’aéronefs'],
  ['A7', 'Passage à niveau avec barrières'], ['AB1', 'Intersection où vous devez céder le passage à droite'], ['AB2', 'Intersection avec une route non prioritaire'], ['AB3a', 'Cédez le passage'], ['AB4', 'Stop'], ['AB6', 'Route prioritaire'],
  ['AB7', 'Fin de route prioritaire'], ['AB25', 'Carrefour à sens giratoire'], ['B0', 'Circulation interdite à tout véhicule'], ['B1', 'Sens interdit'], ['B2a', 'Interdiction de tourner à gauche'], ['B2c', 'Interdiction de faire demi-tour'],
  ['B3', 'Interdiction de dépasser'], ['B6a1', 'Stationnement interdit'], ['B6d', 'Arrêt et stationnement interdits'], ['B7b', 'Accès interdit aux véhicules à moteur'], ['B9a', 'Accès interdit aux piétons'], ['B9b', 'Accès interdit aux cycles'],
  ['B14', 'Limitation de vitesse'], ['B15', 'Céder le passage à la circulation en sens inverse'], ['B16', 'Signaux sonores interdits'], ['B21a1', 'Obligation de tourner à droite'], ['B21-1', 'Contournement obligatoire par la droite'], ['B22a', 'Piste cyclable obligatoire'],
  ['B31', 'Fin de toutes les interdictions'], ['B33', 'Fin de limitation de vitesse'], ['C1a', 'Parking'], ['C12', 'Sens unique'], ['C13a', 'Impasse'], ['C18', 'Priorité par rapport à la circulation en sens inverse'],
  ['C20a', 'Passage pour piétons (indication)'], ['C27', 'Ralentisseur'], ['CE15a', 'Restaurant'], ['C107', 'Route à accès réglementé'], ['C207', 'Début d’autoroute'], ['C208', 'Fin d’autoroute'],
]
async function existe(code) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/France_road_sign_${code}.svg?width=300`
  const r = await fetch(url, { method: 'HEAD', headers: UA, redirect: 'follow' }).catch(() => null)
  return r?.ok ? url : null
}
const items = []
for (const [code, nom] of PANNEAUX) {
  const img = await existe(code)
  if (img) items.push({ id: `panneau-${code}`, n: { fr: nom, en: nom }, img, d: { fr: `Panneau ${code}`, en: `Sign ${code}` }, g: code[0] })
  await new Promise((ok) => setTimeout(ok, 300))
}
await writeFile('public/packs/culture/panneaux.json', JSON.stringify(items))
console.log('panneaux', items.length, '/', PANNEAUX.length)

// Règles et chiffres de l'examen (rédigés)
const REGLES = [
  ['Vitesse maximale sur autoroute par temps sec', '130 km/h', 'v'], ['Vitesse maximale sur autoroute par temps de pluie', '110 km/h', 'v'], ['Vitesse maximale en agglomération', '50 km/h', 'v'],
  ['Vitesse maximale sur route bidirectionnelle sans séparateur (hors agglomération)', '80 km/h', 'v'], ['Vitesse maximale sur voie rapide à chaussées séparées', '110 km/h', 'v'], ['Vitesse maximale pour un jeune conducteur sur autoroute', '110 km/h', 'v'],
  ['Vitesse maximale en zone de rencontre', '20 km/h', 'v'], ['Vitesse maximale par visibilité inférieure à 50 m', '50 km/h', 'v'],
  ['Taux d’alcool maximal autorisé (permis probatoire), en g/L de sang', '0,2 g/L', 'a'], ['Taux d’alcool maximal autorisé (conducteur confirmé), en g/L de sang', '0,5 g/L', 'a'],
  ['Nombre de points d’un permis probatoire au départ', '6 points', 'p'], ['Nombre de points d’un permis confirmé', '12 points', 'p'], ['Points retirés pour un téléphone tenu en main', '3 points', 'p'], ['Points retirés pour un feu rouge grillé', '4 points', 'p'],
  ['Durée du permis probatoire (sans conduite accompagnée)', '3 ans', 'd'], ['Durée du permis probatoire après conduite accompagnée', '2 ans', 'd'],
  ['Distance de sécurité minimale, en secondes', '2 secondes', 'd'], ['À quelle distance placer le triangle de signalisation (au moins)', '30 mètres', 'm'],
  ['Âge minimum pour passer le permis B', '17 ans', 'd'], ['Couleur des panneaux de direction sur autoroute', 'Bleu', 'c'], ['Couleur des panneaux de signalisation temporaire (travaux)', 'Jaune', 'c'],
  ['Feu à allumer par forte pluie ou brouillard, en plus des feux de croisement', 'Feux de brouillard avant', 'f'], ['Feu interdit en agglomération sauf danger', 'Feux de route', 'f'],
  ['Qui a la priorité dans un rond-point (sauf panneau contraire) ?', 'Les véhicules déjà engagés', 'r'], ['Règle de priorité par défaut à une intersection sans panneau', 'Priorité à droite', 'r'],
]
await writeFile('public/packs/culture/code-route.json', JSON.stringify(REGLES.map(([n, r, g], i) => ({ id: 'code-route' + i, n: { fr: n, en: n }, r: { fr: r, en: r }, g }))))
console.log('code-route', REGLES.length)
