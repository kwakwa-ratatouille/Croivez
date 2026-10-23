// Crée la clé de signature Android (une seule fois) : toutes les APK signées avec la même clé
// se mettent à jour par-dessus l'ancienne, sans désinstaller ni perdre les données.
// Usage : node scripts/creer-cle-android.cjs   (ne rien faire si android/croivez.p12 existe déjà)
const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

const sortie = path.join(__dirname, '..', 'android', 'croivez.p12')
if (fs.existsSync(sortie)) { console.log('Clé déjà présente, rien à faire.'); process.exit(0) }

const cles = forge.pki.rsa.generateKeyPair(2048)
const cert = forge.pki.createCertificate()
cert.publicKey = cles.publicKey
cert.serialNumber = '01' + forge.util.bytesToHex(forge.random.getBytesSync(8))
cert.validity.notBefore = new Date()
cert.validity.notAfter = new Date()
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 30)
const sujet = [{ name: 'commonName', value: 'Croivez' }, { name: 'organizationName', value: 'Croivez (perso)' }]
cert.setSubject(sujet)
cert.setIssuer(sujet)
cert.sign(cles.privateKey, forge.md.sha256.create())

// Application personnelle : le mot de passe est volontairement simple et versionné avec la clé
const p12 = forge.pkcs12.toPkcs12Asn1(cles.privateKey, [cert], 'croivez', { algorithm: '3des', friendlyName: 'croivez' })
fs.writeFileSync(sortie, Buffer.from(forge.asn1.toDer(p12).getBytes(), 'binary'))
console.log('Clé créée :', sortie)
