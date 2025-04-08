import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyC1VxTveTNjSgtw0Oi9NklmCbtiEjivq9k",
  authDomain: "sophy-6564f.firebaseapp.com",
  databaseURL: "https://sophy-6564f.firebaseio.com",
  projectId: "sophy-6564f",
  storageBucket: "sophy-6564f.appspot.com",
  messagingSenderId: "899642822092",
  appId: "1:899642822092:android:d633b26c51bd0ee080e169",
  // measurementId: "G-QPFSMDKGRY",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
