import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCndZ4-rFBE4ZV17VJUmtivZxfZ6nVz8Aw",
  authDomain: "pepepedidos-b4bd0.firebaseapp.com",
  projectId: "pepepedidos-b4bd0",
  storageBucket: "pepepedidos-b4bd0.firebasestorage.app",
  messagingSenderId: "173538610989",
  appId: "1:173538610989:web:e3a4a1552a160ef94e4da4",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
