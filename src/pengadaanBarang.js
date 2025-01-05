// Import Firestore dan Firebase functions dari firebase.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  increment,
  
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { renderCategories } from "./kategori.js";


window.addEventListener("DOMContentLoaded", () => {
  fetchKategori("kategori-barang");
});

// Elemen DOM

const pengadaanContainer = document.getElementById("pengadaanbarang-container");
const searchBarPengadaan = document.getElementById(
  "search-bar-pengadaan-barang"
);
const addBarangModal = document.getElementById(
  "add-user-modal-pengadaan-barang"
);
const addBarangForm = document.getElementById("add-barang-form");


// Fungsi untuk memuat kategori dari Firestore
async function fetchKategori(targetSelectId, selectedKategori = "") {
  const dropdown = document.getElementById(targetSelectId);
  if (!dropdown) {
    console.error(`Dropdown dengan ID "${targetSelectId}" tidak ditemukan.`);
    return;
  }

  try {
    const kategoriRef = collection(db, "kategori");
    const querySnapshot = await getDocs(kategoriRef);

    let options = "";
    querySnapshot.forEach((doc) => {
      const kategori = doc.data();
      const isSelected = doc.id === selectedKategori ? "selected" : "";
      options += `<option value="${doc.id}" ${isSelected}>${kategori.name}</option>`;
    });

    dropdown.innerHTML = options;
  } catch (error) {
    console.error("Error fetching kategori:", error);
  }
}



// Fungsi untuk memuat data pengadaan barang
async function fetchPengadaanBarang(search = "") {
  pengadaanContainer.innerHTML = "";

  try {
    // Ambil data pengadaan barang dari Firestore
    const barangRef = collection(db, "pengadaanBarang");
    const kategoriRef = collection(db, "kategori");

    // Ambil kategori terlebih dahulu
    const kategoriSnapshot = await getDocs(kategoriRef);
    const kategoriMap = {};
    kategoriSnapshot.forEach((doc) => {
      const data = doc.data();
      kategoriMap[doc.id] = data.name; // Map ID kategori ke nama
    });

    const querySnapshot = await getDocs(barangRef);

    querySnapshot.forEach((doc) => {
      const barang = doc.data();

      // Filter pencarian
      if (
        search &&
        !(
          (
            barang.nama?.toLowerCase().includes(search.toLowerCase()) || // Pencarian berdasarkan nama barang
            kategoriMap[barang.kategori]
              ?.toLowerCase()
              .includes(search.toLowerCase())
          ) // Pencarian berdasarkan kategori
        )
      ) {
        return; // Abaikan barang yang tidak sesuai
      }


      // Buat elemen untuk setiap barang
      const row = document.createElement("div");
      row.className = "snap-start flex text-center gap-y-0 items-stretch";
      row.innerHTML = `
      <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-y-2 border-black">${
        barang.nama
      }</div>
        <div class="snap-start p-0 flex justify-center items-center flex-shrink-0 w-[240px] border-y-2 border-l-2 border-black">${
          kategoriMap[barang.kategori] || "Tidak Diketahui"
        }</div>
        <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-2 border-black">${
          barang.hargaSewa
        }</div>
        <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-y-2 border-black">${
          barang.dendaHilang
        }</div>
        <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-2 border-black">${
          barang.dendaRusakRingan
        }</div>
        <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-y-2 border-black">${
          barang.dendaRusakSedang
        }</div>
        <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-2 border-black">${
          barang.dendaRusakBerat
        }</div>
        <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-y-2 border-black">${
          barang.status
        }</div>
        <div class="snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-2 border-black">${
          barang.jumlah
        }</div>
        <div class="snap-start flex justify-center flex-shrink-0 w-[240px] border-y-2 border-r-2 border-black"><img src="${
          barang.gambar
        }" alt="Gambar" class=" rounded flex justify-center items-center object-cover p-1"></div>
        <div class="snap-start flex justify-center gap-x-2 items-center flex-shrink-0 w-[240px] border-y-2 border-black">
          <button class="edit-btn-pengadaan px-4 p-2 rounded bg-blue-500" data-id="${
            doc.id
          }">Edit</button>
          <button class="delete-btn-pengadaan px-4 p-2 rounded bg-red-500" data-id="${
            doc.id
          }">Hapus</button>
        </div>
      `;
      pengadaanContainer.appendChild(row);
    });

    // Tambahkan event listener untuk tombol edit dan hapus
    document
      .querySelectorAll(".edit-btn-pengadaan")
      .forEach((btn) => btn.addEventListener("click", handleEditBarang));
    document
      .querySelectorAll(".delete-btn-pengadaan")
      .forEach((btn) => btn.addEventListener("click", handleDeleteBarang));
  } catch (error) {
    console.error("Error fetching pengadaan barang:", error);
  }
}

searchBarPengadaan.addEventListener("input", (e) => {
  fetchPengadaanBarang(e.target.value);
});

// Event listener untuk tombol Tambah Barang
addBarangForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Ambil nilai dari form tambah barang
  const nama = document.getElementById("nama-barang").value;
  const kategori = document.getElementById("kategori-barang").value;
  const hargaSewa = document.getElementById("harga-sewa-barang").value;
  const dendaHilang = document.getElementById("denda-hilang-barang").value;
  const dendaRusakRingan = document.getElementById(
    "denda-rusak-ringan-barang"
  ).value;
  const dendaRusakSedang = document.getElementById(
    "denda-rusak-sedang-barang"
  ).value;
  const dendaRusakBerat = document.getElementById(
    "denda-rusak-berat-barang"
  ).value;
  const status = document.getElementById("status-barang").value;
  const jumlah = document.getElementById("jumlah-barang").value;
  const gambarFile = document.getElementById("gambar-barang").files[0];

  let gambarUrl = "";
  if (gambarFile) {
    gambarUrl = await uploadImageToServer(gambarFile);
    if (!gambarUrl) {
      alert("Gagal mengupload gambar.");
      return;
    }
  }

  try {
    await addDoc(collection(db, "pengadaanBarang"), {
      nama,
      kategori,
      hargaSewa: parseFloat(hargaSewa),
      dendaHilang: parseFloat(dendaHilang),
      dendaRusakRingan: parseFloat(dendaRusakRingan),
      dendaRusakSedang: parseFloat(dendaRusakSedang),
      dendaRusakBerat: parseFloat(dendaRusakBerat),
      status,
      jumlah: parseInt(jumlah),
      gambar: gambarUrl,
    });

    const kategoriRef = doc(db, "kategori", kategori);
    await updateDoc(kategoriRef, {
      jumlah: increment(1), // Tambahkan 1 ke field jumlah
    });
    alert("Barang berhasil ditambahkan!");
    addBarangModal.classList.add("hidden");
    renderCategories();
    addBarangForm.reset();
    fetchPengadaanBarang(); // Refresh data barang
  } catch (error) {
    console.error("Error adding barang:", error);
  }
});


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

async function handleEditBarang(e) {
  const id = e.target.dataset.id;

  try {
    const docRef = doc(db, "pengadaanBarang", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const barang = docSnap.data();

      // Isi form edit dengan data barang
      document.getElementById("edit-barang-id").value = id;
      document.getElementById("edit-nama-barang").value = barang.nama;
      document.getElementById("edit-harga-sewa-barang").value =
        barang.hargaSewa;
      document.getElementById("edit-denda-hilang-barang").value =
        barang.dendaHilang;
      document.getElementById("edit-denda-rusak-ringan-barang").value =
        barang.dendaRusakRingan;
      document.getElementById("edit-denda-rusak-sedang-barang").value =
        barang.dendaRusakSedang;
      document.getElementById("edit-denda-rusak-berat-barang").value =
        barang.dendaRusakBerat;
      document.getElementById("edit-status-barang").value = barang.status;
      document.getElementById("edit-jumlah-barang").value = barang.jumlah;

      // Muat kategori ke dropdown di modal edit barang
      await fetchKategori("edit-kategori-barang", barang.kategori);

      // Tampilkan modal edit
      document.getElementById("edit-barang-modal").classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error fetching barang:", error);
  }
}



document
  .getElementById("edit-barang-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("edit-barang-id").value;
    const nama = document.getElementById("edit-nama-barang").value;
    const kategoriBaru = document.getElementById("edit-kategori-barang").value; // ID kategori baru
    const hargaSewa = document.getElementById("edit-harga-sewa-barang").value;
    const dendaHilang = document.getElementById(
      "edit-denda-hilang-barang"
    ).value;
    const dendaRusakRingan = document.getElementById(
      "edit-denda-rusak-ringan-barang"
    ).value;
    const dendaRusakSedang = document.getElementById(
      "edit-denda-rusak-sedang-barang"
    ).value;
    const dendaRusakBerat = document.getElementById(
      "edit-denda-rusak-berat-barang"
    ).value;
    const status = document.getElementById("edit-status-barang").value;
    const jumlah = document.getElementById("edit-jumlah-barang").value;

    try {
      const docRef = doc(db, "pengadaanBarang", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const barangLama = docSnap.data();
        const kategoriLama = barangLama.kategori; // ID kategori lama

        // Update kategori jika berubah
        if (kategoriLama !== kategoriBaru) {
          // Kurangi jumlah pada kategori lama
          const kategoriLamaRef = doc(db, "kategori", kategoriLama);
          await updateDoc(kategoriLamaRef, {
            jumlah: increment(-1),
            
          });

          // Tambah jumlah pada kategori baru
          const kategoriBaruRef = doc(db, "kategori", kategoriBaru);
          await updateDoc(kategoriBaruRef, {
            jumlah: increment(1),
          });
        }
        renderCategories();
      }

      // Update dokumen barang
      await updateDoc(docRef, {
        nama,
        kategori: kategoriBaru,
        hargaSewa: parseFloat(hargaSewa),
        dendaHilang: parseFloat(dendaHilang),
        dendaRusakRingan: parseFloat(dendaRusakRingan),
        dendaRusakSedang: parseFloat(dendaRusakSedang),
        dendaRusakBerat: parseFloat(dendaRusakBerat),
        status,
        jumlah: parseInt(jumlah),
      });

      alert("Barang berhasil diperbarui!");
      document.getElementById("edit-barang-modal").classList.add("hidden");
      fetchPengadaanBarang();
    } catch (error) {
      console.error("Error updating barang:", error);
      alert("Terjadi kesalahan saat memperbarui barang.");
    }
  });


  async function handleDeleteBarang(e) {
    const id = e.target.dataset.id;
    document.getElementById("delete-barang-modal").classList.remove("hidden");

    document.getElementById("confirm-delete-btn").onclick = async () => {
      try {
         const kategoriRef = doc(db, "kategori", barang.kategori);
      await updateDoc(kategoriRef, {
        jumlah: increment(-1), // Kurangi 1 dari field jumlah
      });
        renderCategories();
        await deleteDoc(doc(db, "pengadaanBarang", id));
        alert("Barang berhasil dihapus!");
        document.getElementById("delete-barang-modal").classList.add("hidden");
        fetchPengadaanBarang();
      } catch (error) {
        console.error("Error deleting barang:", error);
      }
    };
  }


// Load kategori saat halaman dimuat
fetchKategori();
// Render data pengadaan barang saat halaman dimuat
fetchPengadaanBarang();
