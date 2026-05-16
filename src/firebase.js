import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Project: checkers-835bf | Project number: 319354736647
// To complete setup: go to Firebase Console → Project Settings → Your apps → Add web app
// Copy the apiKey and appId values into this config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',           // from Firebase Console → Project Settings
  authDomain: 'checkers-835bf.firebaseapp.com',
  projectId: 'checkers-835bf',
  storageBucket: 'checkers-835bf.appspot.com',
  messagingSenderId: '319354736647',
  appId: 'YOUR_APP_ID',             // from Firebase Console → Project Settings
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
