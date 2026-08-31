import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDfDXTjkTurRlI3KoQ7f3LCMXsa0sRaO3Y",
  authDomain: "khanansathi.firebaseapp.com",
  projectId: "khanansathi",
  storageBucket: "khanansathi.firebasestorage.app",
  messagingSenderId: "27824245632",
  appId: "1:27824245632:web:9b8f5cb93e3119f827cf65",
  measurementId: "G-CG83BFPYJL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
