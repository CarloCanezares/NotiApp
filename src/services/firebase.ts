import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtdzx_-Z59rjxZEd-qUetecAM0KDV3e30",
  authDomain: "notiapp-bb533.firebaseapp.com",
  projectId: "notiapp-bb533",
  storageBucket: "notiapp-bb533.firebasestorage.app",
  messagingSenderId: "1021850521988",
  appId: "1:1021850521988:web:aafd11e3204978f902cdd1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);