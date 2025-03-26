import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBH2vfHaCilrVk6MGUHaOjY8oRjxYo7mLk",
  authDomain: "sophy-ec7d5.firebaseapp.com",
  projectId: "sophy-ec7d5",
  storageBucket: "sophy-ec7d5.firebasestorage.app",
  messagingSenderId: "325730902328",
  appId: "1:325730902328:web:0597f070be694b6a7361cd",
  measurementId: "G-4DKEKXZC5L",
};

// Khởi tạo Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
