import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKfvRAtNJ5MRuXzrCCbR8dzrXBLvJDmE8",
  authDomain: "plant-disease-d077e.firebaseapp.com",
  databaseURL: "https://plant-disease-d077e-default-rtdb.firebaseio.com",
  projectId: "plant-disease-d077e",
  storageBucket: "plant-disease-d077e.firebasestorage.app",
  messagingSenderId: "383122295958",
  appId: "1:383122295958:web:d1efc1cca6557c397346b7",
  measurementId: "G-YXRRKPSCKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
