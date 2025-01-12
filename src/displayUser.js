import { db, auth } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const userContainer = document.getElementById("user-container");
const searchBar = document.getElementById("search-bar");
const addUserModal = document.getElementById("add-user-modal-admin");
const editUserModal = document.getElementById("edit-user-modal-admin");
const addUserForm = document.getElementById("add-user-form");
const cancelBtn = document.getElementById("cancel-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn"); // Tombol cancel edit modal

let selectedUserId = null; // Menyimpan ID pengguna yang dipilih untuk diedit atau dihapus

document.addEventListener("click", (e) => {
  const target = e.target.getAttribute("data-target");
  if (target) {
    document.getElementById(target).classList.remove("hidden");
  }
});

async function preserveSession(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

// Fungsi untuk mengonversi timestamp ke format tanggal, bulan, dan tahun
function formatDate(timestamp) {
  const date = timestamp.toDate(); // Mengonversi Timestamp ke objek Date JavaScript
  const day = date.getDate().toString().padStart(2, "0"); // Mengambil tanggal dan memastikan dua digit
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mengambil bulan (1-12)
  const year = date.getFullYear(); // Mengambil tahun (4 digit)

  return `${day}-${month}-${year}`; // Format DD-MM-YYYY
}

document.getElementById("kelolaAdminBtn").addEventListener("click", function() {
  fetchUsers();
  console.log("Membuka Kelola Admin");
})

// Fungsi untuk memuat pengguna berdasarkan role dan pencarian
async function fetchUsersByRole(role, search = "") {
  const section = document.createElement("div");
  const list = document.createElement("ul");
  list.className = "";
  section.appendChild(list);

  try {
    const q = query(collection(db, "users"), where("role", "==", role));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const user = doc.data();

      // Filter hasil berdasarkan input search
      if (
        search &&
        !(
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.username.toLowerCase().includes(search.toLowerCase())
        )
      ) {
        return;
      }

      const listItem = document.createElement("li");
      listItem.className = "font-light flex text-center items-stretch";
      listItem.innerHTML = `
        <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-black p-2">
          <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
            ${user.role}
          </div>
        
        </div>
        <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-x-2 border-black p-2">
        <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
            ${user.username}
          </div>
        </div>
        <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center  border-black p-2">
  <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
    ${user.name}
  </div>
</div>
<div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-x-2 border-black p-2">
  <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
    ${user.email}
  </div>
</div>
<div class="snap-start flex-shrink-0 w-[180px] flex items-center  justify-center border-black p-2">
  <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
    ${user.address}
  </div>
</div>
<div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-x-2 border-black p-2">
  <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
    ${user.phoneNumber}
  </div>
</div>
<div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-r-2 border-black p-2">
  <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
    ${user.dateRegistered ? formatDate(user.dateRegistered) : ""}
  </div>
</div>
<div class="snap-start flex-shrink-0 w-[180px] flex justify-center items-center border-r-2 border-black p-2">
    <img class="h-[100px] rounded-xl" src="${user.gambar}" alt="${user.name}"> 
</div>
<div class="snap-start flex-shrink-0 w-[180px] items-center justify-center flex border-black gap-x-2 p-2">
          <button class="edit-btn px-4 rounded-xl text-white bg-[#177209]" data-uid="${
            doc.id
          }">Edit</button>
          <button class="delete-btn px-4 rounded-xl text-white bg-[#FF0000]" data-uid="${
            doc.id
          }">Hapus</button>
        </div>
</div>

      `;
      list.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  userContainer.appendChild(section);
}

// Event: Edit User
userContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    selectedUserId = e.target.getAttribute("data-uid");
    openEditModal(selectedUserId);
  }
});

// Event: Delete User
userContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    selectedUserId = e.target.getAttribute("data-uid");
    openDeleteModal(selectedUserId);
  }
});

// Fungsi untuk membuka modal edit
async function openEditModal(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnapshot = await getDoc(docRef);
    const user = docSnapshot.data();

    // Isi form dengan data pengguna
    document.getElementById("edit-name").value = user.name;
    document.getElementById("edit-username").value = user.username;
    document.getElementById("edit-email").value = user.email;
    document.getElementById("edit-address").value = user.address;
    document.getElementById("edit-phoneNumber").value = user.phoneNumber;
    document.getElementById("edit-role").value = user.role;

    document.getElementById("edit-user-modal-admin").classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching user data for edit:", error);
  }
}

async function uploadImageToServer(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://tbakpl.vercel.app/api/cloudinary", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response Error:", errorText);
      throw new Error(`Error: ${errorText}`);
    }

    const data = await response.json();
    return data.url; // URL gambar dari Cloudinary
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

// Event: Simpan Edit User
document
  .getElementById("edit-user-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("edit-name").value;
    const username = document.getElementById("edit-username").value;
    const email = document.getElementById("edit-email").value;
    const address = document.getElementById("edit-address").value;
    const phoneNumber = document.getElementById("edit-phoneNumber").value;
    const role = document.getElementById("edit-role").value;
    

    const userRef = doc(db, "users", selectedUserId);
    await updateDoc(userRef, {
      name,
      username,
      email,
      address,
      phoneNumber,
      role,
    });

    alert("User berhasil diperbarui!");
    document.getElementById("edit-user-modal-admin").classList.add("hidden");

    reloadUsers();
  });

// Fungsi untuk membuka modal delete

async function openDeleteModal(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnapshot = await getDoc(docRef);
    const user = docSnapshot.data();

    if (user) {
      // Tampilkan nama pengguna di modal
      document.getElementById("delete-user-name").textContent = user.name;

      // Tampilkan modal delete
      document
        .getElementById("delete-user-modal-admin")
        .classList.remove("hidden");

      // Menangani klik pada tombol hapus
      document.getElementById("confirm-delete-btn").onclick = async () => {
        await deleteDoc(docRef); // Menghapus pengguna
        alert("User berhasil dihapus!");
        document
          .getElementById("delete-user-modal-admin")
          .classList.add("hidden");
        fetchUsers(); // Memuat ulang daftar pengguna
      };
    } else {
      console.error("User data not found for deletion");
    }
  } catch (error) {
    console.error("Error fetching user data for delete:", error);
  }
}

// Event listener untuk tombol batal
document.getElementById("cancel-delete-btn").addEventListener("click", () => {
  document.getElementById("delete-user-modal-admin").classList.add("hidden");
});

cancelEditBtn.addEventListener("click", () => {
  editUserModal.classList.add("hidden");
});

// Fungsi untuk reload data pengguna
async function fetchUsers(search = "") {
  userContainer.innerHTML = "";
  await fetchUsersByRole("admin", search);
  await fetchUsersByRole("pegawai", search);
}

// Event: Pencarian
searchBar.addEventListener("input", (e) => {
  fetchUsers(e.target.value);
});

// Event: Tambah User

// Event: Batal Tambah User
cancelBtn.addEventListener("click", () => {
  document.getElementById("add-user-modal-admin").classList.add("hidden");
});

// Event: Form Tambah User
addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;
  const gambarFile = document.getElementById("gambar-user").files[0];

  let gambarUrl = "";
  if (gambarFile) {
    gambarUrl = await uploadImageToServer(gambarFile);
    if (!gambarUrl) {
      alert("Gagal mengupload gambar.");
      return;
    }
  }

  try {
    // Cek apakah email sudah terdaftar
    const userQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      // Email sudah terdaftar di Firestore
      alert("Email sudah digunakan, silakan pilih email lain.");
      return;
    }

    const currentUser = auth.currentUser;
    const currentEmail = currentUser.email;
    const currentPassword = prompt("Konfirmasi password anda: (Akun yang sedang login)");
    if (!currentPassword) {
      alert("Password tidak boleh kosong.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
    } catch (error) {
      alert("Password salah. Coba lagi.");
      return;
    }
    // Buat akun pengguna di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Simpan data pengguna di Firestore
    await addDoc(collection(db, "users"), {
      name,
      username,
      email,
      role,
      address,
      phoneNumber,
      dateRegistered: serverTimestamp(),
      uid: user.uid,
      gambar: gambarUrl,
    });
    if (currentEmail && currentPassword) {
      await preserveSession(currentEmail, currentPassword);
    }

    alert("User berhasil ditambahkan!");
    fetchUsers();
    addUserModal.classList.add("hidden");
    addUserForm.reset();
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Email sudah terdaftar, silakan pilih email lain.");
    } else {
      console.error("Error adding user:", error.message);
      alert("Gagal menambahkan user: " + error.message);
    }
  }
});

// Muat data awal
fetchUsers();
