// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_ykSAEt5AJst6d2xtsPEDUU26Q4T-5PA",
  authDomain: "maskfitting-2363a.firebaseapp.com",
  projectId: "maskfitting-2363a",
  storageBucket: "maskfitting-2363a.firebasestorage.app",
  messagingSenderId: "360723382276",
  appId: "1:360723382276:web:17d3c021689ed71be3f551",
  measurementId: "G-BJTNE8D2BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
