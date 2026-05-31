import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBneXi5CmWfzcGPs7CnaXj14sxRaLvHRiU",
  authDomain: "experience-platform-d0019.firebaseapp.com",
  projectId: "experience-platform-d0019",
  storageBucket: "experience-platform-d0019.firebasestorage.app",
  messagingSenderId: "809917558260",
  appId: "1:809917558260:web:cb513d79114b00c1b55da1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
