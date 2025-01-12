// Import Firestore dan Firebase functions dari firebase.js
import { db } from "./firebase.js"; // Import db dari firebase.js
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


document.getElementById("kategoriBtn").addEventListener("click", function() {
  renderCategories();
  console.log("Refresh Berhasil");
});
// Fungsi untuk menampilkan kategori dalam tabel
async function renderCategories(search = "") {
  const kategoriTable = document.getElementById("kategoriTable");
  kategoriTable.innerHTML = "";

  const kategoriRef = collection(db, "kategori");
  const querySnapshot = await getDocs(kategoriRef);

  querySnapshot.forEach((doc) => {
    const kategori = doc.data();

    // Filter pencarian berdasarkan nama kategori
    if (search && !kategori.name.toLowerCase().includes(search.toLowerCase())) {
      return;
    }

    // Tambahkan kategori ke tabel
    const row = document.createElement("li");
    row.className = "font-light flex text-center items-stretch";

    row.innerHTML = `
  <div class="snap-start flex-shrink-0 w-1/3 flex items-center justify-center border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${kategori.name}
    </div>
  </div>
  <div class="snap-start flex-shrink-0 w-1/3 flex items-center justify-center border-x-2 border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${kategori.jumlah}
    </div>
  </div>
  <div class="snap-start flex-shrink-0 w-1/3 items-center justify-center flex border-black gap-x-2 p-2">
    <button class="edit-btn-kategori px-4 rounded-xl text-white bg-[#177209]" data-uid="${doc.id}">Edit</button>
    <button class="delete-btn-kategori px-4 rounded-xl text-white bg-[#FF0000]" data-uid="${doc.id}">Hapus</button>
  </div>
`;

    kategoriTable.appendChild(row);
  });
}

async function addCategory(name) {
  const kategoriRef = collection(db, "kategori");
  await addDoc(kategoriRef, {
    name: name,
    jumlah: 0,
  });
  alert("Kategori berhasil ditambahkan!");
  renderCategories();
}


document.getElementById("tambahKategoriBtn").addEventListener("click", () => {
  document.getElementById("kategori-modal").classList.remove("hidden");
});

document
  .getElementById("saveKategoriBtn")
  .addEventListener("click", async () => {
    const kategoriInput = document.getElementById("kategoriInput");
    const newCategoryName = kategoriInput.value.trim();

    if (newCategoryName) {
      await addCategory(newCategoryName);
      document.getElementById("kategori-modal").classList.add("hidden");
      kategoriInput.value = "";
    }
  });

  document.getElementById("closeKategoriBtn").addEventListener("click", () => {
    document.getElementById("kategori-modal").classList.add("hidden");
  });

// Fungsi untuk membuka modal edit
async function openEditModal(id) {
  try {
    const docRef = doc(db, "kategori", id);
    const docSnapshot = await getDoc(docRef);
    const kategori = docSnapshot.data();

    document.getElementById("editKategoriInput").value = kategori.name;

    // Tampilkan modal edit
    document.getElementById("edit-kategori-modal").classList.remove("hidden");

    // Event listener untuk menyimpan perubahan
    document.getElementById("editSaveKategoriBtn").onclick = async () => {
      const newName = document.getElementById("editKategoriInput").value.trim();
      if (newName) {
        await updateDoc(docRef, { name: newName });
        alert("Kategori berhasil diperbarui!");
        document.getElementById("edit-kategori-modal").classList.add("hidden");
        renderCategories();
      }
    };
  } catch (error) {
    console.error("Error opening edit modal:", error);
  }
}

// close
document.getElementById("editCloseKategoriBtn").onclick = function () {
  document.getElementById("edit-kategori-modal").classList.add("hidden"); // Menutup modal tanpa menyimpan
};

// Fungsi untuk membuka modal hapus
async function openDeleteModal(id) {
  try {
    const docRef = doc(db, "kategori", id);
    const docSnapshot = await getDoc(docRef);
    const kategori = docSnapshot.data();

    document.getElementById("delete-kategori-name").textContent = kategori.name;

    // Tampilkan modal hapus
    document.getElementById("delete-kategori-modal").classList.remove("hidden");

    // Event listener untuk konfirmasi hapus
    document.getElementById("confirm-delete-btn-kategori").onclick =
      async () => {
        // Ambil data kategori terlebih dahulu
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          // Cek apakah jumlah barang adalah 0
          if (data.jumlah === 0) {
            // Jika jumlah 0, lakukan penghapusan
            await deleteDoc(docRef);
            alert("Kategori berhasil dihapus!");

            // Menyembunyikan modal
            document
              .getElementById("delete-kategori-modal")
              .classList.add("hidden");

            // Render ulang kategori
            renderCategories();
          } else {
            // Jika jumlah tidak 0, tampilkan peringatan
            alert("Penghapusan gagal. Pastikan jumlah barang adalah 0.");
          }
        } else {
          alert("Kategori tidak ditemukan.");
        }
      };

      document.getElementById("cancel-delete-btn-kategori").onclick =
        async () => {
          document
            .getElementById("delete-kategori-modal")
            .classList.add("hidden");
          
        };
  } catch (error) {
    console.error("Error opening delete modal:", error);
  }
}

// Event listener untuk tombol Edit
kategoriTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn-kategori")) {
    const id = e.target.getAttribute("data-uid");
    openEditModal(id);
  }
});

// Event listener untuk tombol Hapus
kategoriTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn-kategori")) {
    const id = e.target.getAttribute("data-uid");
    openDeleteModal(id);
  }
});

// Event listener untuk pencarian kategori
document
  .getElementById("searchInputKategori")
  .addEventListener("input", (e) => {
    renderCategories(e.target.value);
  });

// Render kategori pertama kali saat halaman dimuat
renderCategories();

export { renderCategories };