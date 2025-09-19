// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtdzx_-Z59rjxZEd-qUetecAM0KDV3e30",
  authDomain: "notiapp-bb533.firebaseapp.com",
  projectId: "notiapp-bb533",
  storageBucket: "notiapp-bb533.firebasestorage.app",
  messagingSenderId: "1021850521988",
  appId: "1:1021850521988:web:aafd11e3204978f902cdd1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)