import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'
import { Capacitor } from '@capacitor/core'
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

// Config publique du projet Firebase « croivez » (non secrète : les règles protègent les données)
const firebaseConfig = {
  apiKey: 'AIzaSyCgRlhYLcDqhDs2O-_7NMQpVMlvqXqK11g',
  authDomain: 'croivez.firebaseapp.com',
  databaseURL: 'https://croivez-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'croivez',
  storageBucket: 'croivez.firebasestorage.app',
  messagingSenderId: '364265607923',
  appId: '1:364265607923:web:92e808b4772192b6b9dd86',
}

export const app = initializeApp(firebaseConfig)
export const natif = Capacitor.isNativePlatform()
// Dans l'app iOS, getAuth() charge une iframe de connexion Google qui ne répond jamais (WKWebView) :
// l'état de connexion n'arrive pas et l'app reste bloquée sur le logo. On initialise donc l'auth sans elle.
export const auth = natif
  ? initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] })
  : getAuth(app)
// Cache local persistant : la progression fonctionne hors ligne et se synchronise au retour du réseau
export const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }) })
export const rtdb = getDatabase(app)
