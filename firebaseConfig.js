import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGDCN-PFRi0s4xeVin0_JFGbu4lLH-omQ",
  authDomain: "sophy-e19fb.firebaseapp.com",
  databaseURL: "https://sophy-e19fb.firebaseio.com",
  projectId: "sophy-e19fb",
  storageBucket: "sophy-e19fb.appspot.com",
  messagingSenderId: "1010969527968",
  appId: "1:1010969527968:android:129a4b61a1ce96bba8abc5",
  // measurementId: "G-QPFSMDKGRY",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
