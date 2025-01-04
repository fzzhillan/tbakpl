import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Jika tidak ada user yang terautentikasi, arahkan ke halaman login
    
    window.location.href = "index.html";
  } else {
    // Jika pengguna sudah login, cek role-nya
    const userRef = doc(db, "users", user.uid); // Pastikan UID yang digunakan di sini adalah UID dari Firestore
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;

      // Cek apakah role pengguna adalah admin
      if (role !== "admin" && role !== "petugas") {
        window.location.href = "index.html"; // Misalnya halaman dashboard pengguna biasa
      }
    }
  }
});

const userNameElement = document.getElementById("userName");
const logoutLink = document.getElementById("logoutLink");

// Fungsi untuk mendapatkan nama pengguna
async function fetchUserName(user) {
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", user.email) // Mencari berdasarkan email
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Perbarui elemen pertama
        userNameElement.textContent = ` ${userData.username}`;
        // Perbarui elemen kedua
        const secondaryUserNameElement = document.getElementById("secondaryUserName");
        if (secondaryUserNameElement) {
          secondaryUserNameElement.textContent = ` ${userData.username}`;
        }
        
      });
    } else {
      userNameElement.textContent = "User not found";
      const secondaryUserNameElement = document.getElementById("secondaryUserName");
      if (secondaryUserNameElement) {
        secondaryUserNameElement.textContent = "User not found";
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    userNameElement.textContent = "Error loading user";
    const secondaryUserNameElement = document.getElementById("secondaryUserName");
    if (secondaryUserNameElement) {
      secondaryUserNameElement.textContent = "Error loading user";
    }
  }
}


// Fungsi logout
const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
    userNameElement.textContent = "Not logged in";
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
};

// Periksa status login pengguna
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchUserName(user);
    console.log("User logged in: ", user.uid);
  } else {
    userNameElement.textContent = "Not logged in";
    console.log("No user is logged in.");
  }
});

// Event listener untuk logout
logoutLink.addEventListener("click", (event) => {
  event.preventDefault();
  handleLogout();
});
