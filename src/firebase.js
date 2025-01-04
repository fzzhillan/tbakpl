// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2WGBQwbi5R3rh0aCO11kQnP14SY5mAy8",
  authDomain: "dbabxy.firebaseapp.com",
  projectId: "dbabxy",
  storageBucket: "dbabxy.firebasestorage.app",
  messagingSenderId: "490694504862",
  appId: "1:490694504862:web:f1d0aac20ee1c54dabe68f",
  measurementId: "G-3QBFYL3K28",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };
