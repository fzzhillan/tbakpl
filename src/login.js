import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const errorMessage = document.getElementById("errorMessage");

    try {
      // Cari email berdasarkan username di Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Username tidak ditemukan");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.email; // Dapatkan email terkait username

      // Login dengan email yang ditemukan
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const role = userData.role;

      // Redirect sesuai role
      if (role === "admin") {
        window.location.href = "admindashboard.html";
      } else if (role === "petugas") {
        window.location.href = "petugasdashboard.html";
      }
    } catch (error) {
      console.error("Error saat login:", error.message);
      errorMessage.textContent = "Username atau password salah";
      errorMessage.classList.remove("hidden");
    }
  });

  async function preserveSession(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }
