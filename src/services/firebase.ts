import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCtdzx_-Z59rjxZEd-qUetecAM0KDV3e30",
  authDomain: "notiapp-bb533.firebaseapp.com",
  projectId: "notiapp-bb533",
  storageBucket: "notiapp-bb533.firebasestorage.app",
  messagingSenderId: "1021850521988",
  appId: "1:1021850521988:web:aafd11e3204978f902cdd1"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth differently for web vs mobile
let auth;
if (Platform.OS === 'web') {
  // Web version - use regular getAuth
  auth = getAuth(app);
} else {
  // Mobile version - use initializeAuth with AsyncStorage
  try {
    const { getReactNativePersistence } = require("firebase/auth");
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // Fallback if AsyncStorage not available
    auth = getAuth(app);
  }
}

export { auth };
export const db = getFirestore(app);