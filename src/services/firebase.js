import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDk8wlUU7HjlLPlckszluX42a_gzfje1TM",
  authDomain: "qbank-bb945.firebaseapp.com",
  projectId: "qbank-bb945",
  storageBucket: "qbank-bb945.firebasestorage.app",
  messagingSenderId: "557778634942",
  appId: "1:557778634942:web:2105d2d9d84eda4c73b6ef",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
