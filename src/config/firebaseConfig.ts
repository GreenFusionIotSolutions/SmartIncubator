import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore";
import { getMessaging, getToken } from 'firebase/messaging';

// Firebase Config for Project A
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_A,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_A,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_A,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_A,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_A,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_A,
};

// Initialize Firebase Apps for both configurations
const app = initializeApp(firebaseConfig, 'app');

// Initialize Firestore for both apps
const db = getFirestore(app);
const messaging = getMessaging(app);

// Export Firestore and other functions for each app
export { db, doc, getDoc, onSnapshot, messaging, getToken };
