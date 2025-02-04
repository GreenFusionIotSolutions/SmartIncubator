importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = { 
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY_A,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN_A,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID_A,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_A,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID_A,
  appId: import.meta.env.VITE_FIREBASE_APP_ID_A,
 };
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background message handler
// public/firebase-messaging-sw.js
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png",
    badge: "/logo192.png"
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});