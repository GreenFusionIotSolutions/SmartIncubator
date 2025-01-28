import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore";

// Firebase Config for Project A
const firebaseConfigA = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_A,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_A,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_A,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_A,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_A,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_A,
};

// Firebase Config for Project B
const firebaseConfigB = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_B,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_B,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_B,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_B,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_B,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_B,
};

// Initialize Firebase Apps for both configurations
const appA = initializeApp(firebaseConfigA, 'appA');
const appB = initializeApp(firebaseConfigB, 'appB');

// Initialize Firestore for both apps
const dbA = getFirestore(appA);
const dbB = getFirestore(appB);

// Export Firestore and other functions for each app
export { dbA, dbB, doc, getDoc, onSnapshot };
