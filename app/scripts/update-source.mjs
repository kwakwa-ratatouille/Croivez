// Ajoute une version en tête de la source SideStore/AltStore.
// Usage : node update-source.mjs <source.json> <version> <build> <downloadURL> <taille>
import { readFile, writeFile } from 'node:fs/promises'

const [file, version, build, downloadURL, size] = process.argv.slice(2)
const source = JSON.parse(await readFile(file, 'utf8'))
const app = source.apps[0]

const entry = {
  version,
  buildVersion: build,
  date: new Date().toISOString(),
  localizedDescription: `Croivez ${version}, build ${build}.`,
  downloadURL,
  size: Number(size),
  minOSVersion: '15.0',
}
// Champs « plats » lus par les anciennes versions de SideStore
Object.assign(app, { version, versionDate: entry.date, downloadURL, size: entry.size })
app.versions = [entry, ...(app.versions ?? []).filter((v) => v.buildVersion !== build)].slice(0, 10)

await writeFile(file, JSON.stringify(source, null, 2) + '\n')
console.log(`Source mise à jour : ${version} (${build})`)
