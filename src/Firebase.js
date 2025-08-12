// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKTJmDrc7JwxwKeqEoK0eQD4jsUyr3j5U",
  authDomain: "sris-48310.firebaseapp.com",
  projectId: "sris-48310",
  storageBucket: "sris-48310.firebasestorage.app",
  messagingSenderId: "956019106871",
  appId: "1:956019106871:web:ff035322907793261e4bb2",
  measurementId: "G-8J23M517YD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);