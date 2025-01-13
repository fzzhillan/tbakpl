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
  serverTimestamp,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { renderCategories } from "./kategori.js";


const resetBtn = document.getElementById("resetRusakBtn");

document.getElementById("dashboardBtn").addEventListener("click", function() {
  getTotalQty();
  loadJumlahBarangRusak();
  getTotalJumlah();
  console.log("Refresh Berhasil")
});

resetBtn.addEventListener("click", async () => {
  const barangRusakRef = collection(db, "barangRusak"); // Referensi koleksi
  const snapshot = await getDocs(barangRusakRef);

  if (snapshot.empty) {
    alert("Tidak ada barang rusak untuk direset.");
    return;
  }

  try {
    // Iterasi dokumen dan hapus satu per satu
    const promises = snapshot.docs.map((docItem) =>
      deleteDoc(doc(db, "barangRusak", docItem.id))
    );
    await Promise.all(promises);

    alert("Semua barang rusak berhasil direset!");
  } catch (error) {
    console.error("Terjadi kesalahan saat mereset barang rusak:", error);
    alert("Gagal mereset barang rusak.");
  }
});

async function getTotalQty() {
  try {
    const transaksiRef = collection(db, "transaksi"); // Referensi ke koleksi transaksi
    const transaksiSnapshot = await getDocs(transaksiRef); // Ambil semua dokumen
    const totalQty = transaksiSnapshot.docs.reduce((total, doc) => {
      const qty = parseInt(doc.data().qty, 10) || 0; // Ambil qty, konversi ke angka, default 0
      return total + qty; // Jumlahkan qty ke total
    }, 0);
    return totalQty; // Kembalikan hasil jumlah
  } catch (error) {
    console.error("Error fetching total qty:", error);
    return 0;
  }
}

async function loadJumlahBarangRusak() {
  const barangRusakContainer = document.querySelector(".barang-rusak");
  if (!barangRusakContainer) {
    console.error('Elemen dengan kelas "barang-rusak" tidak ditemukan.');
    return;
  }

  try {
    // Ambil semua dokumen dari koleksi barangRusak
    const barangRusakRef = collection(db, "barangRusak");
    const querySnapshot = await getDocs(barangRusakRef);

    // Hitung jumlah dokumen
    const totalBarangRusak = querySnapshot.size;

    // Tampilkan jumlah barang rusak di elemen HTML
    barangRusakContainer.textContent = `${totalBarangRusak}`;
  } catch (error) {
    console.error("Error mengambil jumlah barang rusak:", error);
    barangRusakContainer.textContent = `Gagal memuat data barang rusak.`;
  }
}


async function getTotalJumlah() {
  try {
    const pengadaanRef = collection(db, "pengadaanBarang");
    const pengadaanSnapshot = await getDocs(pengadaanRef);

    // Hitung total jumlah
    const totalJumlahBarang = pengadaanSnapshot.docs.reduce((total, doc) => {
      const data = doc.data();
      return total + (data.jumlah || 0); // Tambahkan jumlah jika ada, jika tidak, gunakan 0
    }, 0);

    console.log(`Total Jumlah: ${totalJumlahBarang}`);
    return totalJumlahBarang;
  } catch (error) {
    console.error("Error fetching data: ", error);
    return 0; // Default nilai jika terjadi error
  }
}



window.addEventListener("DOMContentLoaded", async () => {
  try {
    loadJumlahBarangRusak();
    // Ambil data kategori (jika diperlukan)
    fetchKategori("kategori-barang");

    // Ambil total jumlah barang dari database
    const totalJumlah = await getTotalJumlah();
    console.log("Total Jumlah Barang:", totalJumlah);

    // Perbarui elemen dengan class 'barang-tersedia'
    const totalBarangElement = document.querySelector(".barang-tersedia");
    if (totalBarangElement) {
      totalBarangElement.textContent = totalJumlah; // Tampilkan total jumlah barang
    } else {
      console.error("Elemen dengan class 'barang-tersedia' tidak ditemukan.");
    }
    const totalQty = await getTotalQty();
    console.log("Total Qty Barang Tersewa:", totalQty);

    // Perbarui elemen dengan class 'barang-tersewa'
    const tersewaElement = document.querySelector(".barang-tersewa");
    if (tersewaElement) {
      tersewaElement.textContent = totalQty; // Tampilkan total qty
    } else {
      console.error("Elemen dengan class 'barang-tersewa' tidak ditemukan.");
    }
  } catch (error) {
    console.error("Error initializing page:", error);
  }
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

document.getElementById("pengadaanBarangBtn").addEventListener("click",function(){
  fetchPengadaanBarang();
  console.log("reload pengadaan barang");
});

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
      <div class="p-2 snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-black"><div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.nama}
    </div></div>
        <div class="p-2 snap-start  flex justify-center items-center flex-shrink-0 w-[240px] border-x-2 border-black"><div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${kategoriMap[barang.kategori] || "Tidak Diketahui"}
    </div></div>
        <div class="p-2 snap-start flex justify-center items-center flex-shrink-0 w-[240px]  border-black"><div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.hargaSewa}
    </div></div>
        <div class="p-2 snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-x-2 border-black"> <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.dendaHilang}
    </div></div>
        <div class="p-2 snap-start flex justify-center items-center flex-shrink-0 w-[240px]  border-black"> <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.dendaRusakRingan}
    </div></div>
        <div class="p-2 snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-x-2 border-black"><div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.dendaRusakSedang}
    </div></div>
        <div class="p-2 snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-black"><div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.dendaRusakBerat}
    </div></div>
        
        <div class="p-2 snap-start flex justify-center items-center border-x-2 flex-shrink-0 w-[240px] border-x-w border-black"><div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.jumlah}
    </div></div>
        <div class="p-2 snap-start flex justify-center flex-shrink-0 w-[240px] border-black"><img src="${
          barang.gambar
        }" alt="Gambar" class=" rounded flex justify-center h-[100px] items-center object-cover p-1"></div>
        <div class="p-2 snap-start flex justify-center items-center flex-shrink-0 w-[240px] border-x-2 border-black"> <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${barang.status}
    </div></div>
        <div class="p-2 snap-start flex justify-center gap-x-2 items-center flex-shrink-0 w-[240px]  border-black">
          <button class="edit-btn-pengadaan px-4 p-2 rounded text-white bg-[#177209]" data-id="${
            doc.id
          }">Edit</button>
          <button class="delete-btn-pengadaan px-4 p-2 rounded text-white bg-[#FF0000]" data-id="${
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
  const thirdUserName = document
    .querySelector("#thirdUserName")
    .textContent.trim();

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
      jumlahSewa: 0,
      gambar: gambarUrl,
    });
    await addDoc(collection(db, "riwayatPengadaan"), {
      nama,
      namaPencatat: thirdUserName,
      jumlah: parseInt(jumlah),
      date: serverTimestamp(),
      aksi: "Tambah",
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

    const thirdUserName = document
      .querySelector("#thirdUserName")
      .textContent.trim();

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

    let gambarUrl = "";
    

    try {

      const querySnapshot = await getDocs(
        query(collection(db, "pengadaanBarang"), where("nama", "==", nama))
      );

      if (!querySnapshot.empty) {
        // Jika barang ditemukan, ambil field gambar dari dokumen pertama
        const doc = querySnapshot.docs[0];
        gambarUrl = doc.data().gambar; // Ambil URL gambar
      }

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

      await addDoc(collection(db, "riwayatPengadaan"), {
        nama,
        namaPencatat: thirdUserName,
        jumlah: parseInt(jumlah),
        date: serverTimestamp(),
        aksi: "Edit",
        gambar: gambarUrl,
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

  document.getElementById("confirm-delete-btn-barang").onclick = async () => {
    const thirdUserName = document
      .querySelector("#thirdUserName")
      .textContent.trim();

    try {
      // Ambil data barang berdasarkan ID
      const docRef = doc(db, "pengadaanBarang", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Barang tidak ditemukan.");
        return;
      }

      const barang = docSnap.data();
      const nama = barang.nama; // Ambil nama barang
      const kategori = barang.kategori; // Ambil kategori barang
      const kategoriRef = doc(db, "kategori", kategori);
      const gambarUrl = barang.gambar;

      // Kurangi jumlah di kategori terkait
      await updateDoc(kategoriRef, {
        jumlah: increment(-1),
      });

      // Render ulang kategori
      renderCategories();
      
      await addDoc(collection(db, "riwayatPengadaan"), {
        nama: nama, // Pastikan nama berasal dari barang
        namaPencatat: thirdUserName,
        date: serverTimestamp(),
        aksi: "Hapus",
        gambarUrl: gambarUrl,
      });
      // Hapus dokumen barang
      await deleteDoc(doc(db, "pengadaanBarang", id));

      // Tambahkan log ke riwayatPengadaan

      alert("Barang berhasil dihapus!");
      document.getElementById("delete-barang-modal").classList.add("hidden");

      // Refresh data barang
      fetchPengadaanBarang();
    } catch (error) {
      console.error("Error deleting barang:", error);
      alert("Terjadi kesalahan saat menghapus barang.");
    }
  };
}


// Load kategori saat halaman dimuat
fetchKategori();
// Render data pengadaan barang saat halaman dimuat
fetchPengadaanBarang();
