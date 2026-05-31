import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBneXi5CmWfzcGPs7CnaXj14sxRaLvHRiU",
  authDomain: "experience-platform-d0019.firebaseapp.com",
  projectId: "experience-platform-d0019",
  storageBucket: "experience-platform-d0019.firebasestorage.app",
  messagingSenderId: "809917558260",
  appId: "1:809917558260:web:cb513d79114b00c1b55da1",
  measurementId: "G-JLSXXEGBR9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = await addDoc(collection(db, "certificates"), {
      test: "data",
      certId: "TEST-123"
    });
    console.log("SUCCESS! Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("FAILED TO WRITE:", e);
  }
}

test();
