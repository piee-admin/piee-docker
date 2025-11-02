import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Import isSupported to use the official Firebase check
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBR98ZwuhSW-8489TBrYLDT7VeRVkWWzHo",
  authDomain: "piee-web.firebaseapp.com",
  projectId: "piee-web",
  storageBucket: "piee-web.firebasestorage.app",
  messagingSenderId: "103993476533",
  appId: "1:103993476533:web:1a61bca0731346874085fc",
  measurementId: "G-98H0GV9Y2K"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics only on the client side
// This is the recommended approach from Firebase
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// You can still export 'analytics' but it might be undefined on the server
export { analytics };