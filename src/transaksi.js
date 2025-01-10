// Import Firebase functions
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { currentUserData } from "./userInfo.js";



// Fungsi untuk mengambil data barang dari koleksi "pengadaanBarang"

async function fetchPenyewa() {
  const penyewaRef = collection(db, "penyewa");
  const querySnapshot = await getDocs(penyewaRef);

  const penyewa = [];
  querySnapshot.forEach((doc) => {
    console.log("Document ID:", doc.id);
    console.log("Document data:", doc.data());

    const data = doc.data();
    if (!data.namePenyewa) {
      console.error(`Document ${doc.id} is missing 'namePenyewa' field:`, data);
    } else {
      penyewa.push({ id: doc.id, namePenyewa: data.namePenyewa });
    }
  });

  console.log("Final penyewa array:", penyewa);
  return penyewa;
}

// Fungsi untuk menampilkan nama penyewa di dropdown
function renderPenyewa(penyewa) {
  const penyewaSelect = document.querySelector("#transaksi-penyewa");

  if (!penyewaSelect) {
    console.error("Dropdown penyewa tidak ditemukan!");
    return;
  }

  penyewaSelect.innerHTML = `<option value="" disabled selected>Pilih Penyewa</option>`; // Reset pilihan

  penyewa.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.namePenyewa;
    penyewaSelect.appendChild(option);
  });
}

// Fungsi untuk mengisi dropdown dengan nama penyewa

async function fetchBarang() {
  const barangRef = collection(db, "pengadaanBarang");
  const querySnapshot = await getDocs(barangRef);

  const barang = [];
  querySnapshot.forEach((doc) => {
    // Add detailed logging
    console.log("Document ID:", doc.id);
    console.log("Document data:", doc.data());

    const data = doc.data();
    // Validate the data before pushing
    if (!data.nama) {
      console.error(`Document ${doc.id} is missing 'nama' field:`, data);
    }

    barang.push({ id: doc.id, ...data });
  });

  // Log the final array
  console.log("Final barang array:", barang);
  console.log(
    "Dokumen yang diambil:",
    querySnapshot.docs.map((doc) => doc.data())
  );


  return barang;
}


function searchBarang(barang, searchTerm) {
  console.log("Barang yang diterima di searchBarang:", barang);
  console.log("Search term:", searchTerm);

  const filteredBarang = barang.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Barang yang difilter:", filteredBarang);

  renderBarang(filteredBarang);
}


// Event listener untuk search bar
function attachSearchBarListener(barang) {
  const searchBar = document.querySelector("#search-bar-transaksi");

  if (!searchBar) {
    console.error("Search bar tidak ditemukan!");
    return;
  }

  console.log("Search bar ditemukan:", searchBar);

  searchBar.addEventListener("input", (event) => {
    const searchTerm = event.target.value;
    console.log("Input dari search bar:", searchTerm);

    searchBarang(barang, searchTerm);
  });
}


// Render barang ke dalam transaksi-container
// Dalam fungsi renderBarang:
function renderBarang(barang) {
  const transaksiContainer = document.querySelector("#transaksi-container");

  if (!transaksiContainer) {
    console.error("Transaksi container tidak ditemukan!");
    return;
  }

  transaksiContainer.innerHTML = ""; // Kosongkan container sebelumnya

  barang.forEach((item) => {
    // Jika ID barang sudah ada, skip rendering ulang
    if (!item.id || !item.nama) {
      console.warn(`Barang dengan ID ${item.id} atau nama tidak valid!`);
      return; // Skip item yang tidak valid
    }

    if (item.jumlah <= 0) {
      console.warn(`Barang dengan ID ${item.id} tidak tersedia (jumlah <= 0)`);
      return; // Skip barang yang tidak tersedia
    }
    console.log(`Rendering item dengan ID ${item.id}:`, item.nama);
    // Validasi nama barang
    const namaBarang =
      item.nama && item.nama.trim() !== "" ? item.nama : "Nama tidak ditemukan";

    const hargaSewa = item.hargaSewa || 0;

    // Elemen transaksi
    const transaksiElement = document.createElement("div");
    
    transaksiElement.classList.add(
      "w-full",
      "h-[120px]",
      "justify-around",
      "items-stretch",
      "gap-y-2",
      "bg-white",
      "flex",
      "rounded-xl",
      "border",
      "shadow-md"
    );

    transaksiElement.innerHTML = `
      <div id="transaksi-barang-img" class="flex items-center">
        <div class="relative aspect-square w-[120px] max-w-[120px] overflow-hidden rounded-xl">
          <img src="${item.gambar}" alt="${item.nama}" class="absolute inset-0 w-full h-full object-cover">
        </div>
      </div>

      <div id="transaksi-barang-name" class="flex items-center w-[150px] text-ellipsis overflow-hidden whitespace-nowrap">
        <p>${namaBarang}</p>
      </div>

      <div id="transaksi-qty-button" class="flex items-center gap-4 border-x px-2 border-black w-[150px] justify-center">
        <button class="btn-increment bg-blue-500 text-white px-4 py-4 rounded-full" data-id="${item.id}">+</button>
        <button class="btn-decrement bg-red-500 text-white px-4 py-4 rounded-full" data-id="${item.id}">-</button>
      </div>

      <div id="transaksi-qty" class="flex justify-center items-center text-center w-[50px] text-lg" data-id="${item.id}">
        0
      </div>
    `;
    transaksiElement.setAttribute("data-id", item.id);
    transaksiContainer.appendChild(transaksiElement);
    transaksiElement.dataset.hargaSewa = hargaSewa;
  });

  attachButtonListeners(barang);
}





document.addEventListener("DOMContentLoaded", async () => {
  



  try {
    const barang = await fetchBarang(); // Ambil data dari Firestore
    console.log("Data barang berhasil diambil:", barang);

    renderBarang(barang); // Render barang
    attachSearchBarListener(barang); // Pasang listener pada search bar
  } catch (error) {
    console.error("Gagal mengambil data barang:", error);
  }

  try {
    const penyewa = await fetchPenyewa(); // Ambil data dari Firestore
    renderPenyewa(penyewa); // Render nama penyewa ke dropdown
  } catch (error) {
    console.error("Gagal mengambil data penyewa:", error);
  }
  
});



let itemQuantities = {};
// Tambahkan event listener untuk tombol + dan -
function attachButtonListeners(barang) {
  const incrementButtons = document.querySelectorAll(".btn-increment");
  const decrementButtons = document.querySelectorAll(".btn-decrement");

  incrementButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const item = barang.find((b) => b.id === id);
      const qtyElement = document.querySelector(
        `#transaksi-qty[data-id="${id}"]`
      );
      const currentQty = parseInt(qtyElement.textContent, 10);

      if (currentQty < item.jumlah) {
        const newQty = currentQty + 1;
        qtyElement.textContent = newQty;
        itemQuantities[id] = newQty;
        console.log("ItemQuantities setelah perubahan:", itemQuantities);

        updateBadge();
      } else {
        alert("Jumlah barang tidak mencukupi!");
      }
    });
  });

  decrementButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const item = barang.find((b) => b.id === id);
      const qtyElement = document.querySelector(
        `#transaksi-qty[data-id="${id}"]`
      );
      const currentQty = parseInt(qtyElement.textContent, 10);

      if (currentQty > 0) {
        const newQty = currentQty - 1;
        qtyElement.textContent = newQty;
        itemQuantities[id] = newQty;
        console.log("ItemQuantities setelah perubahan:", itemQuantities);

        updateBadge();
      }
    });
  });
}

// Fungsi untuk memperbarui badge transaksi
function updateBadge() {
  const badge = document.querySelector("#transaksi-badge");
  const qtyElements = document.querySelectorAll("#transaksi-qty");
  let totalQty = 0;

  qtyElements.forEach((element) => {
    totalQty += parseInt(element.textContent, 10);
  });

  badge.textContent = totalQty;
}

// Ambil elemen tombol dan kontainer
const tambahTransaksiBtn = document.getElementById("tambahTransaksiBtn");
const transaksiSection = document.getElementById("transaksi");
const konfirmasiPembayaranSection = document.getElementById("konfirmasi-pembayaran");
const konfirmasiDataContainer = document.getElementById("konfirmasi-data-container");

let validTransaksiData = [];

// Event listener untuk tombol "Tambah Transaksi"
tambahTransaksiBtn.addEventListener("click", () => {
  // Ganti tampilan ke halaman konfirmasi pembayaran
  transaksiSection.classList.add("hidden");
  konfirmasiPembayaranSection.classList.remove("hidden");

  // Ambil data transaksi dari DOM dan objek barang
  // Dalam fungsi transaksi
  console.log(
    "Elemen DOM transaksi yang ditemukan:",
    document.querySelectorAll("#transaksi-container .flex")
  );

  const transaksiData = Array.from(
    document.querySelectorAll("#transaksi-container .flex")
  )
    .filter((item) => item.dataset.id)
    .map((item) => {
      const id = item.dataset.id; // Ambil ID barang
      const namaElement = item.querySelector("#transaksi-barang-name p");
      // console.log("Nama Element ditemukan:", namaElement);
      const nama = namaElement
        ? namaElement.textContent.trim()
        : "Nama tidak ditemukan";
      const hargaSewa = item.dataset.hargaSewa || 0; // Pastikan elemen ada
      if (nama) {
        console.log(`Nama untuk transaksi ID ${id}: ${nama}`);
      }

      const jumlah = itemQuantities[id] || 0; // Ambil quantity dari objek itemQuantities
      console.log(
        `ID: ${id}, Nama: ${nama}, Jumlah: ${jumlah}, harga: ${hargaSewa}`
      );
      return { id, nama, hargaSewa, jumlah };
    });
  const validTransaksiData = transaksiData.filter(
    (data) => data.nama && data.jumlah > 0
  );

  console.log("Data transaksi yang akan dimuat:", validTransaksiData); // Cek semua data transaksi sebelum dimuat

  // Load data ke konfirmasi pembayaran
  konfirmasiDataContainer.innerHTML = ""; // Kosongkan kontainer sebelumnya
  let nomor = 0;
  let subtotal = validTransaksiData.reduce((total, item) => {
    const hargaTotal = item.hargaSewa * item.jumlah;
    return total + hargaTotal;
  }, 0);

  // Menampilkan subtotal
  const transaksiSubtotalElement = document.querySelector(
    "#transaksi-subtotal"
  );
  if (transaksiSubtotalElement) {
    transaksiSubtotalElement.textContent = `Rp ${subtotal.toLocaleString()}`;
  }
  validTransaksiData.forEach((data) => {
    // Pastikan nama barang bukan "Nama tidak ditemukan"
    if (data.nama !== "Nama tidak ditemukan") {
      const hargaTotal = data.hargaSewa * data.jumlah;
      nomor++;
      const row = document.createElement("tr");
      row.className = "text-center";
      row.setAttribute("data-id", data.id); // Tambahkan atribut data-id pada elemen tr
      row.innerHTML = `
  <td class="border-r border-b border-black">${nomor}</td>
  <td class="border-r border-b border-black">${data.nama}</td>
  <td class="border-r border-b border-black jumlah">${data.jumlah}</td> <!-- Pastikan class 'jumlah' sesuai -->
  <td class=" border-b border-black harga-total" data-harga-sewa="${data.hargaSewa}">${hargaTotal}</td>
  
`;

      konfirmasiDataContainer.appendChild(row);
    }
  });

  const diskonInput = document.querySelector("#transaksi-diskon");
  const bayarInput = document.querySelector("#transaksi-bayar");
  const waktuSewaInput = document.querySelector("#transaksi-waktu");
  const waktuSewaHari = document.querySelector("#waktu-sewa-hari");

  function updateTotalAndKembalian() {
    // Ambil nilai diskon dan bayar
    const diskon = parseFloat(diskonInput.value) || 0; // Default diskon 0 jika kosong
    const bayar = parseFloat(bayarInput.value) || 0; // Default bayar 0 jika kosong

    const selectedDate = new Date(waktuSewaInput.value);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.ceil(
      (selectedDate - currentDate) / (1000 * 60 * 60 * 24)
    );
    const hari = dayDifference > 0 ? dayDifference : 0;

    if (hari > 0) {
      waktuSewaHari.textContent = `${hari} hari`;
    } else {
      waktuSewaHari.textContent = "Tanggal tidak valid";
    }

    // Hitung total setelah diskon
    const totalAfterDiscount = hari * (subtotal - (subtotal * diskon) / 100);

    // Menampilkan total setelah diskon
    const transaksiTotalElement = document.querySelector("#transaksi-total");
    if (transaksiTotalElement) {
      transaksiTotalElement.textContent = `Rp ${totalAfterDiscount.toLocaleString()}`;
    }

    // Menghitung kembalian
    const kembalian = bayar - totalAfterDiscount;

    // Menampilkan kembalian
    const transaksiKembalianElement = document.querySelector(
      "#transaksi-kembalian"
    );
    if (transaksiKembalianElement) {
      transaksiKembalianElement.textContent = `Rp ${kembalian.toLocaleString()}`;
    }
  }

  // Tambahkan event listener pada perubahan input diskon dan bayar
  waktuSewaInput.addEventListener("input", updateTotalAndKembalian);
  diskonInput.addEventListener("input", updateTotalAndKembalian);
  bayarInput.addEventListener("input", updateTotalAndKembalian);

  // Panggil pertama kali untuk perhitungan langsung
  updateTotalAndKembalian();
});



// Modal edit quantity
const editModal = document.getElementById('editModal-transaksi');
const closeEditModalBtn = document.getElementById('closeEditModalBtn-transaksi');
const saveEditQtyBtn = document.getElementById('saveEditQtyBtn-transaksi');
const editQtyInput = document.getElementById('edit-qty');

// Modal konfirmasi hapus
const deleteModal = document.getElementById('deleteModal-transaksi');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Simpan ID untuk edit atau hapus
let editingItemId = null;
let editingItemRow = null;

// Event listener untuk tombol edit
document
  .getElementById("konfirmasi-data-container")
  .addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn-transaksi")) {
      const itemId = e.target.dataset.id;
      const itemRow = e.target.closest(`[data-id="${itemId}"]`); // Gunakan closest untuk menemukan elemen induk
      console.log("Item Row:", itemRow); // Debugging

      if (itemRow) {
        const qtyElement = itemRow.querySelector(".jumlah");
        console.log("Qty Element:", qtyElement); // Debugging

        if (qtyElement) {
          const qty = qtyElement.textContent;

          // Set ID item untuk di-edit dan simpan row untuk referensi
          editingItemId = itemId;
          editingItemRow = itemRow;
          document.getElementById("edit-qty").value = qty;

          // Tampilkan modal edit
          editModal.classList.remove("hidden");
          document.body.style.overflow = "hidden"; // Disable scroll behind modal
        } else {
          console.error("Elemen qty tidak ditemukan di dalam itemRow!");
        }
      } else {
        console.error(`Item row dengan data-id "${itemId}" tidak ditemukan!`);
      }
    }

    if (e.target.classList.contains("delete-btn-transaksi")) {
      const itemId = e.target.dataset.id;
      const itemRow = e.target.closest(`[data-id="${itemId}"]`); // Gunakan closest untuk elemen induk

      if (itemRow) {
        // Set ID item untuk dihapus
        editingItemId = itemId;
        editingItemRow = itemRow;

        // Tampilkan modal konfirmasi hapus
        document
          .getElementById("deleteModal-transaksi")
          .classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Disable scroll behind modal
      } else {
        console.error(`Item row dengan data-id "${itemId}" tidak ditemukan!`);
      }
    }
  });


// Event listener untuk menyimpan perubahan quantity
document
  .getElementById("saveEditQtyBtn-transaksi")
  .addEventListener("click", () => {
    const newQty = parseInt(document.getElementById("edit-qty").value, 10);

    if (newQty > 0 && editingItemId) {
      // Update qty di DOM
      editingItemRow.querySelector(".jumlah").textContent = newQty;

      // Update harga total
      const hargaSewa = parseFloat(editingItemRow.dataset.hargaSewa || 0);
      const hargaTotal = newQty * hargaSewa;
      editingItemRow.querySelector(".harga-total").textContent =
        hargaTotal.toLocaleString();

      // Tutup modal edit
      document.getElementById("editModal-transaksi").classList.add("hidden");
      document.body.style.overflow = ""; // Enable scroll again
    } else {
      alert("Jumlah barang harus lebih dari 0!");
    }
  });

// Event listener untuk menutup modal edit
document
  .getElementById("closeEditModalBtn-transaksi")
  .addEventListener("click", () => {
    document.getElementById("editModal-transaksi").classList.add("hidden");
    document.body.style.overflow = ""; // Enable scroll again
  });

// Event listener untuk tombol hapus


// Event listener untuk mengonfirmasi penghapusan barang
// Event listener untuk konfirmasi hapus
document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
  if (editingItemId && editingItemRow) {
    // Update jumlah barang menjadi 0
    editingItemRow.querySelector(".jumlah").textContent = 0;

    // Hapus elemen dari DOM
    editingItemRow.remove();

    // Reset variabel setelah penghapusan
    editingItemId = null;
    editingItemRow = null;

    // Tutup modal
    document.getElementById("deleteModal-transaksi").classList.add("hidden");
    document.body.style.overflow = ""; // Enable scroll again
  }
});


document.getElementById("closeDeleteModalBtn").addEventListener("click", () => {
  document.getElementById("deleteModal-transaksi").classList.add("hidden");
  document.body.style.overflow = ""; // Enable scroll again
});





const kembaliBtn = document.getElementById("kembaliBtn");

kembaliBtn.addEventListener("click", () => {
  // Ganti tampilan kembali ke halaman transaksi
  konfirmasiPembayaranSection.classList.add("hidden");
  transaksiSection.classList.remove("hidden");
});

// const submitPembayaranBtn = document.getElementById("submitPembayaranBtn");

// Ambil elemen modal dan tombol tutup
const notaModal = document.querySelector("#notaModal");
const closeModalBtn = document.querySelector("#closeModalBtn");
const konfirmasiPembayaranBtn = document.querySelector("#konfirmasiPembayaranBtn");

konfirmasiPembayaranBtn.addEventListener("click", () => {
  // Ambil data dari form transaksi
  const transaksiData = Array.from(
    document.querySelectorAll("#transaksi-container .flex")
  )
    .filter((item) => item.dataset.id)
    .map((item) => {
      const id = item.dataset.id;
      const namaElement = item.querySelector("#transaksi-barang-name p");
      const nama = namaElement
        ? namaElement.textContent.trim()
        : "Nama tidak ditemukan";
      const hargaSewa = item.dataset.hargaSewa || 0;
      const qty = itemQuantities[id] || 0;
      const hargaTotal = hargaSewa * qty;
      if (qty > 0 && nama !== "Nama tidak ditemukan") {
        return { id, nama, hargaSewa, qty, hargaTotal };
      }
    })
    .filter(Boolean);


    
  // Ambil data lainnya dari input form
  const diskonInput = document.querySelector("#transaksi-diskon");
  const tujuanInput = document.querySelector("#transaksi-tujuan");
  const jaminanInput = document.querySelector("#transaksi-jaminan");
  const bayarInput = document.querySelector("#transaksi-bayar");

  const diskon = parseFloat(diskonInput.value) || 0;
  const total = transaksiData.reduce((sum, item) => sum + item.hargaTotal, 0) * (1 - diskon / 100);

  // Ambil data Penyewa berdasarkan input
  const penyewaSelect = document.querySelector("#transaksi-penyewa");
  const penyewaId = penyewaSelect.value;

  // Ambil data penyewa dari database
  getPenyewaData(penyewaId).then((penyewa) => {
    // Set data di modal
    if (penyewa && penyewa.noHpPenyewa) {
      console.log(`Nomor HP Penyewa: ${penyewa.noHpPenyewa}`);
      document.querySelector("#nota-noHpPenyewa").textContent =
        penyewa.noHpPenyewa;
    } else {
      console.error("Data penyewa tidak valid atau nomor HP tidak ditemukan.");
      document.querySelector("#nota-noHpPenyewa").textContent =
        "Tidak tersedia";
    }
    if (penyewa && penyewa.namePenyewa) {
      console.log(`Nomor HP Penyewa: ${penyewa.namePenyewa}`);
      document.querySelector("#nota-namePenyewa").textContent =
        penyewa.namePenyewa;
    } else {
      console.error("Data penyewa tidak valid atau nomor HP tidak ditemukan.");
      document.querySelector("#nota-namePenyewa").textContent =
        "Tidak tersedia";
    }
    

    const tanggalSewa = document.querySelector("#transaksi-waktu").value.trim();
    const notaNomor = 1; // Nomor nota, bisa Anda sesuaikan
    const notaNamaBarang = transaksiData.map(item => item.nama).join(", ");
    const notaHargaSewa = transaksiData.map(item => item.hargaSewa).join(", ");
    const notaQty = transaksiData.map(item => item.qty).join(", ");
    const notaHargaTotal = transaksiData.map(item => item.hargaTotal).join(", ");
    const notaDiskon = diskon;
    const notaTotal = total;
    const notaNoHpPenyewa = penyewa.noHpPenyewa;
    const notaNamePenyewa = penyewa.namePenyewa;
    const thirdUserNameElement = document.getElementById("thirdUserName");
    const pencatat = thirdUserNameElement
      ? thirdUserNameElement.textContent.trim()
      : "Tidak Diketahui";
    const notaTujuan = tujuanInput.value;
    const notaJaminan = jaminanInput.value;
    console.log("Current user data in transaksi:", currentUserData);

    // Isi modal dengan data transaksi dan penyewa
    document.querySelector("#nota-nomor").textContent = notaNomor;
    document.querySelector("#nota-namaBarang").textContent = notaNamaBarang;
    document.querySelector("#nota-hargaSewa").textContent = notaHargaSewa;
    document.querySelector("#nota-qty").textContent = notaQty;
    document.querySelector("#nota-hargaTotal").textContent = notaHargaTotal;
    document.querySelector("#nota-diskon").textContent = `${notaDiskon}%`;
    document.querySelector("#nota-total").textContent = `Rp ${notaTotal.toLocaleString()}`;
    document.querySelector("#nota-noHpPenyewa").textContent = notaNoHpPenyewa;
    document.querySelector("#nota-namePenyewa").textContent = notaNamePenyewa;
    // document.querySelector("#nota-pencatat").textContent = pencatat;
    document.querySelector("#nota-tujuan").textContent = notaTujuan;
    document.querySelector("#nota-jaminan").textContent = notaJaminan;
    document.querySelector("#nota-tanggalSewa").textContent =
      tanggalSewa || "Tanggal tidak diatur";

    // Tampilkan modal
    notaModal.classList.remove("hidden");
  });
});

// Fungsi untuk mengambil data penyewa dari DB
async function getPenyewaData(penyewaId) {
  try {
    const penyewaRef = doc(db, "penyewa", penyewaId);
    const docSnap = await getDoc(penyewaRef);

    if (docSnap.exists()) {
      const penyewaData = docSnap.data();
      if (penyewaData && penyewaData.noHpPenyewa) {
        return penyewaData; // Return seluruh data penyewa
      } else {
        console.error("Field 'noHpPenyewa' tidak ditemukan dalam dokumen!");
        return null;
      }
    } else {
      console.error("Dokumen dengan ID tersebut tidak ditemukan di Firestore!");
      return null;
    }
  } catch (error) {
    console.error("Error saat mengambil dokumen penyewa:", error);
    return null;
  }
}



async function getPenyewaDataByName(namePenyewa) {
  try {
    // Referensi ke koleksi "penyewa"
    const penyewaRef = collection(db, "penyewa");

    // Buat query untuk mencari dokumen berdasarkan nama
    const penyewaQuery = query(
      penyewaRef,
      where("namePenyewa", "==", namePenyewa)
    );
    const querySnapshot = await getDocs(penyewaQuery);

    // Ambil data dokumen pertama yang ditemukan
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const penyewaData = docSnap.data();
      return penyewaData.noHpPenyewa || null; // Kembalikan nomor HP penyewa
      return penyewaData.namePenyewa || null;
    } else {
      console.error("Penyewa dengan nama tersebut tidak ditemukan!");
      return null;
    }
  } catch (error) {
    console.error("Error mendapatkan data penyewa:", error);
    return null;
  }
}

// Contoh penggunaan fungsi
getPenyewaDataByName("Nama Penyewa").then((noHp) => {
  if (noHp) {
    console.log("Nomor HP Penyewa:", noHp);
  } else {
    console.log("Data penyewa tidak ditemukan.");
  }
});



// Tutup modal
closeModalBtn.addEventListener("click", () => {
  notaModal.classList.add("hidden");
});




document
  .getElementById("submitPembayaranBtn")
  .addEventListener("click", async () => {
    try {
      // Ambil data dari modal nota
      
      const notaData = {
        nomor: document.querySelector("#nota-nomor").textContent.trim(),
        namaBarang: document
          .querySelector("#nota-namaBarang")
          .textContent.trim(),
        hargaSewa: document.querySelector("#nota-hargaSewa").textContent.trim(),
        qty: document.querySelector("#nota-qty").textContent.trim(),
        hargaTotal: document
          .querySelector("#nota-hargaTotal")
          .textContent.trim(),
        diskon: document.querySelector("#nota-diskon").textContent.trim(),
        total: document.querySelector("#nota-total").textContent.trim(),
        namePenyewa: document.querySelector("#nota-namePenyewa").textContent.trim(),
        noHpPenyewa: document
          .querySelector("#nota-noHpPenyewa")
          .textContent.trim(),
        pencatat: document.querySelector("#thirdUserName").textContent.trim(),
        tujuan: document.querySelector("#nota-tujuan").textContent.trim(),
        
        jaminan: document.querySelector("#nota-jaminan").textContent.trim(),
        tanggalSewa: formatTanggal(
          document.querySelector("#transaksi-waktu").value.trim()
        ),
        status: "Menunggu",
      };

      function formatTanggal(tanggal) {
        if (!tanggal) return "Tanggal tidak diatur"; // Jika tanggal kosong
        const [year, month, day] = tanggal.split("-"); // Pisahkan tahun, bulan, dan hari
        return `${day}-${month}-${year}`; // Susun kembali dalam format dd-mm-yyyy
      }

      // Simpan ke Firestore
      const docRef = await addDoc(collection(db, "transaksi"), notaData);
      console.log("Transaksi berhasil disimpan dengan ID:", docRef.id);

      const barangNamaArray = notaData.namaBarang.split(", "); // Pisahkan jika ada banyak barang
      const qtyArray = notaData.qty.split(", "); // Pisahkan jika qty banyak barang

      for (let i = 0; i < barangNamaArray.length; i++) {
        const namaBarang = barangNamaArray[i];
        const qty = parseInt(qtyArray[i]);

        // Query untuk mendapatkan barang berdasarkan nama
        const barangRef = collection(db, "pengadaanBarang");
        const q = query(barangRef, where("nama", "==", namaBarang));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const barangDoc = querySnapshot.docs[0];
          const barangId = barangDoc.id;
          const barangData = barangDoc.data();

          // Perbarui jumlah barang
          const newJumlah = barangData.jumlah - qty;
          const newJumlahSewa = barangData.jumlahSewa + qty; 
          if (newJumlah < 0) {
            console.warn(`Jumlah barang "${namaBarang}" tidak mencukupi.`);
          } else {
            await updateDoc(doc(db, "pengadaanBarang", barangId), {
              jumlah: newJumlah,
              jumlahSewa: newJumlahSewa,
            });
            console.log(
              `Jumlah barang "${namaBarang}" diperbarui ke: ${newJumlah}`
            );
          }
        } else {
          console.error(`Barang dengan nama "${namaBarang}" tidak ditemukan.`);
        }
      }

      // Tampilkan pesan sukses
      alert("Pembayaran berhasil diselesaikan dan data telah disimpan!");
      // fetchPengadaanBarang(); 
      

      // Reset tampilan dan modal seperti di kode Anda
      konfirmasiPembayaranSection.classList.add("hidden");
      transaksiSection.classList.remove("hidden");
      notaModal.classList.add("hidden");

      // Reset form dan elemen terkait
      const penyewaSelect = document.querySelector("#transaksi-penyewa");
      const tujuanInput = document.querySelector("#transaksi-tujuan");
      const jaminanInput = document.querySelector("#transaksi-jaminan");

      if (penyewaSelect) penyewaSelect.selectedIndex = 0;
      if (tujuanInput) tujuanInput.value = "";
      if (jaminanInput) jaminanInput.value = "";

      const qtyElements = document.querySelectorAll("#transaksi-qty");
      qtyElements.forEach((qtyElement) => {
        qtyElement.textContent = "0";
      });

      updateBadge();
      

      const diskonInput = document.querySelector("#transaksi-diskon");
      const bayarInput = document.querySelector("#transaksi-bayar");
      const waktuSewaInput = document.querySelector("#transaksi-waktu");
      const waktuSewaHari = document.querySelector("#waktu-sewa-hari");

      konfirmasiDataContainer.innerHTML = "";
      itemQuantities = {};

      if (diskonInput) diskonInput.value = "";
      if (bayarInput) bayarInput.value = "";
      if (waktuSewaInput) waktuSewaInput.value = "";
      if (waktuSewaHari) waktuSewaHari.textContent = "";

      
      const transaksiSubtotalElement = document.querySelector(
        "#transaksi-subtotal"
      );

      if (transaksiSubtotalElement) {
        transaksiSubtotalElement.textContent = "Rp 0";
      }

      const rows = konfirmasiDataContainer.querySelectorAll("tr");
      rows.forEach((row) => row.remove());
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan data transaksi:", error);
      alert("Gagal menyimpan data transaksi. Silakan coba lagi.");
    }
  });



// Panggil fungsi fetchBarang saat halaman dimuat
fetchBarang();
