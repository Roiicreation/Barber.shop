// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlFshRUjs2NyBLiy9Ji31mnKX0BOxncTo",
  authDomain: "sito-parrucchiere.firebaseapp.com",
  databaseURL: "https://sito-parrucchiere-default-rtdb.firebaseio.com",
  projectId: "sito-parrucchiere",
  storageBucket: "sito-parrucchiere.appspot.com",
  messagingSenderId: "994870656654",
  appId: "1:994870656654:web:bd76ac68d508d9115a53df",
  measurementId: "G-8RSEH2EKSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);