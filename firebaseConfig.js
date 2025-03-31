import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzIGvwZY9QZIXUaEKAWsMoypcfg641mls",
  authDomain: "sophy-23b5b.firebaseapp.com",
  databaseURL: "https://sophy-23b5b.firebaseio.com",
  projectId: "sophy-23b5b",
  storageBucket: "sophy-23b5b.appspot.com",
  messagingSenderId: "719068932506",
  appId: "1:719068932506:android:c475f45b62644351863223",
  // measurementId: "G-QPFSMDKGRY",   
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
