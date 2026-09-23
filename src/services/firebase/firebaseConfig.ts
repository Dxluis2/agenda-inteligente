import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

// TypeScript resuelve las definiciones web,
// pero Expo usa la implementación React Native.
// @ts-ignore
import {
  getAuth,
  // @ts-ignore
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD4F0CQYeWN9KvoeAm_cEsXJWI41kcX_B8',
  authDomain: 'agenda-inteligente-b0cef.firebaseapp.com',
  projectId: 'agenda-inteligente-b0cef',
  storageBucket:
    'agenda-inteligente-b0cef.firebasestorage.app',
  messagingSenderId: '515409510652',
  appId:
    '1:515409510652:web:c51ca0a39dbb06a9f6d779',
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence:
      getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export {
  app,
  auth,
  db,
};