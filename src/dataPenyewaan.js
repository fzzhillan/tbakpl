// Import Firebase dari file firebase.js
import { db } from "./firebase.js";
import {
  getDocs,
  collection,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Mendapatkan informasi pengguna yang sedang login
const auth = getAuth();
const user = auth.currentUser; // Dapatkan user yang sedang login
const username = user
  ? user.displayName || "Nama Pengguna Tidak Ditemukan"
  : "Tidak ada pengguna yang login";
if (user) {
  const username = user.displayName || "Nama Pengguna Tidak Ditemukan";
  const userEmail = user.email || "Email Tidak Ditemukan";
} else {
  console.log("Tidak ada pengguna yang sedang login.");
}


// Fungsi untuk mengambil dan menampilkan data dari koleksi transaksi
export async function fetchAndDisplayTransaksi() {
  try {
    const transaksiRef = collection(db, "transaksi");
    const querySnapshot = await getDocs(transaksiRef);

    const dataPenyewaanDiv = document.getElementById("dataPenyewaanContainer");

    // Menambahkan header tabel hanya sekali
    if (!dataPenyewaanDiv.querySelector("thead")) {
      dataPenyewaanDiv.innerHTML =
        '' +
        `<div class="overflow-x-auto">
          <table class="table-auto w-full min-w-max mb-4">
            <thead>
              <tr>
                <th class="border px-4 py-2 w-[200px] text-center">Nama Penyewa</th>
                <th class="border px-4 py-2 w-[200px] text-center">No HP Penyewa</th>
                <th class="border px-4 py-2 w-[200px] text-center">Tanggal Pengembalian</th>
                <th class="border px-4 py-2 w-[200px] text-center">Tujuan</th>
                <th class="border px-4 py-2 w-[200px] text-center">Nama Barang</th>
                <th class="border px-4 py-2 w-[200px] text-center">Jumlah (Qty)</th>
                <th class="border px-4 py-2 w-[200px] text-center">Diskon</th>
                <th class="border px-4 py-2 w-[200px] text-center">Harga Sewa</th>
                <th class="border px-4 py-2 w-[200px] text-center">Harga Total</th>
                <th class="border px-4 py-2 w-[200px] text-center">Jaminan</th>
                <th class="border px-4 py-2 w-[200px] text-center">Total Pembayaran</th>
                <th class="border px-4 py-2 w-[200px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody id="transaksi-tbody"></tbody>
          </table>
        </div>`;
    }

    // Ambil referensi tbody untuk ditambahkan data transaksi
    const transaksiTbody = document.getElementById("transaksi-tbody");

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Parsing string yang memuat beberapa nilai menjadi array
      const namaBarang = data.namaBarang.split(", ").map((item) => item.trim());
      const qty = data.qty.split(", ").map((item) => parseInt(item.trim(), 10));
      const hargaSewa = data.hargaSewa
        .split(", ")
        .map((item) => parseInt(item.trim().replace(/,/g, ""), 10));
      const hargaTotal = data.hargaTotal
        .split(", ")
        .map((item) => parseInt(item.trim().replace(/,/g, ""), 10));

      // Menambahkan HTML untuk setiap data transaksi
      const transaksiHTML = `
        <tr >
          <td class="border px-4 py-2 text-center">${
            data.namePenyewa || "-"
          }</td>
          <td class="border px-4 py-2 text-center">${
            data.noHpPenyewa || "-"
          }</td>
          <td class="border px-4 py-2 text-center"> ${
            data.tanggalSewa || "-"
          }</td>
          <td class="border px-4 py-2 text-center">${data.tujuan || "-"}</td>
          <td class="border px-4 py-2 text-center">
            <ul>${namaBarang.map((item) => `<li>${item}</li>`).join("")}</ul>
          </td>
          <td class="border px-4 py-2 text-center">
            <ul>${qty.map((item) => `<li>${item}</li>`).join("")}</ul>
          </td>
          <td class="border px-4 py-2 text-center">${data.diskon || "-"}</td>
          <td class="border px-4 py-2 text-center">
            <ul>${hargaSewa
              .map((item) => `<li>Rp ${item.toLocaleString()}</li>`)
              .join("")}</ul>
          </td>
          <td class="border px-4 py-2 text-center">
            <ul>${hargaTotal
              .map((item) => `<li>Rp ${item.toLocaleString()}</li>`)
              .join("")}</ul>
          </td>
          <td class="border px-4 py-2 text-center">${data.jaminan || "-"}</td>
          <td class="border px-4 py-2 text-center">${data.total || "-"}</td>
          <td class="border px-4 py-2 text-center">
            <button  class="konfirmasiButton bg-green-500 text-white px-4 py-2 rounded text-center">Selesai</button>

          </td>
        </tr>
      `;

      // Menambahkan data transaksi ke tbody
      transaksiTbody.innerHTML += transaksiHTML;
    });

    dataPenyewaanDiv.classList.remove("hidden");
    dataPenyewaanDiv.addEventListener("click", (event) => {
      // Pastikan yang diklik adalah tombol cekBarangButton
      if (event.target && event.target.classList.contains("cekBarangButton")) {
        (async () => {
          try {
            const barang = await fetchBarang(); // Mengambil data barang dari Firestore
            createCekBarangModal(barang);
          } catch (error) {
            console.error("Gagal memuat data barang:", error);
          }
        })();
      }
    });
    document.querySelectorAll(".konfirmasiButton").forEach((button) => {
      button.addEventListener("click", () => {
        createKonfirmasiModal();
      });
    });
    // Tambahkan fitur pencarian setelah data dimuat
    setupSearchBar();
  } catch (error) {
    console.error("Error fetching transaksi:", error);
  }
}

// Mendapatkan tombol konfirmasi
function createKonfirmasiModal() {
  const modalContainer = document.createElement("div");
  modalContainer.id = "konfirmasiModal";
  modalContainer.classList.add(
    "fixed",
    "inset-0",
    "bg-gray-800",
    "bg-opacity-50",
    "flex",
    "justify-center",
    "items-center"
  );

  modalContainer.innerHTML = `
    <div class="bg-white flex flex-col p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-xl text-center font-bold mb-4">Konfirmasi</h2>
      <p class="text-center">Apakah Anda yakin ingin melanjutkan ke pengolahan data barang?</p>
      <div class="flex justify-end space-x-4 mt-4">
        <button id="cancelButtonkonfirmasi" class="bg-red-500 text-white px-4 py-2 rounded">Batal</button>
        <button id="submitButtonkonfirmasi" class="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // Tombol Batal
  document
    .getElementById("cancelButtonkonfirmasi")
    .addEventListener("click", () => {
      document.body.removeChild(modalContainer); // Menghapus modal jika batal
    });

  // Tombol Submit
  document
    .getElementById("submitButtonkonfirmasi")
    .addEventListener("click", () => {
      // Proses setelah konfirmasi (misalnya, memproses barang)
      console.log("Konfirmasi Submit: Data barang akan diproses");

      // Hapus modal setelah submit
      document.body.removeChild(modalContainer);

      
    });
}


// Fungsi untuk setup search bar
function setupSearchBar() {
  const searchInput = document.getElementById("searchInput-dataPenyewaan");

  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#transaksi-tbody tr");

    rows.forEach((row) => {
      const namaPenyewaCell = row.querySelector("td:first-child"); // Kolom pertama adalah nama penyewa
      const namaPenyewa = namaPenyewaCell
        ? namaPenyewaCell.textContent.toLowerCase()
        : "";

      if (namaPenyewa.includes(searchValue)) {
        row.style.display = ""; // Tampilkan baris jika sesuai
      } else {
        row.style.display = "none"; // Sembunyikan baris jika tidak sesuai
      }
    });
  });
}

// Tambahkan event listener global untuk tombol cek barang


// Fungsi untuk mengambil data barang dari Firestore
async function fetchBarang() {
  try {
    const barangRef = collection(db, "pengadaanBarang"); // Koleksi barang di Firestore
    const querySnapshot = await getDocs(barangRef);
    
    // Menyusun data barang dari querySnapshot
    const barangList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      barangList.push({
        id: doc.id,  // ID dokumen Firestore
        nama: data.nama || "-",  // Nama barang
        dendaRusakRingan: data.dendaRusakRingan || 0,
        dendaRusakSedang: data.dendaRusakSedang || 0,
        dendaRusakBerat: data.dendaRusakBerat || 0,
        dendaHilang: data.dendaHilang || 0,
      });
    });

    return barangList;  // Mengembalikan data barang
  } catch (error) {
    console.error("Error fetching barang:", error);
    throw new Error("Gagal memuat data barang");
  }
}


function createCekBarangModal(barang) {
  const modalContainer = document.createElement("div");
  modalContainer.id = "cekBarangModal";
  modalContainer.classList.add(
    "fixed",
    "inset-0",
    "bg-gray-800",
    "bg-opacity-50",
    "flex",
    "justify-center",
    "items-center"
  );

  modalContainer.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
      <h2 class="text-xl font-bold mb-4">Cek Barang</h2>
      <div id="barangList" class="space-y-4"></div>
      <div class="flex justify-end space-x-4 mt-4">
        <button id="cancelButton" class="bg-red-500 text-white px-4 py-2 rounded">Batal</button>
        <button id="submitButton" class="bg-blue-500 text-white px-4 py-2 rounded">Selesai</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);
  renderBarangList(barang);

  document.getElementById("cancelButton").addEventListener("click", () => {
    document.body.removeChild(modalContainer);
  });

  document.getElementById("submitButton").addEventListener("click", () => {
    const barangConditions = Array.from(
      document.querySelectorAll(".barang-condition")
    ).map((select) => {
      const id = select.dataset.id;
      const condition = select.value;
      return { id, condition };
    });

    console.log("Barang Conditions:", barangConditions);

    calculateTotalDenda(barangConditions, barang);

    document.body.removeChild(modalContainer);
  });
}

function renderBarangList(barang) {
  const barangListContainer = document.getElementById("barangList");
  barang.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.classList.add(
      "flex",
      "justify-between",
      "items-center",
      "border",
      "p-2",
      "rounded-lg"
    );

    itemElement.innerHTML = `
      <span>${item.nama}</span>
      <select class="barang-condition" data-id="${item.id}">
        <option value="baik">Baik</option>
        <option value="ringan">Denda Ringan</option>
        <option value="sedang">Denda Sedang</option>
        <option value="berat">Denda Berat</option>
        <option value="hilang">Hilang</option>
      </select>
    `;

    barangListContainer.appendChild(itemElement);
  });
}

function calculateTotalDenda(conditions, barang) {
  let totalDenda = 0;

  conditions.forEach(({ id, condition }) => {
    const item = barang.find((b) => b.id === id);
    if (item) {
      switch (condition) {
        case "ringan":
          totalDenda += item.dendaRusakRingan || 0;
          break;
        case "sedang":
          totalDenda += item.dendaRusakSedang || 0;
          break;
        case "berat":
          totalDenda += item.dendaRusakBerat || 0;
          break;
        case "hilang":
          totalDenda += item.dendaHilang || 0;
          break;
      }
    }
  });

  alert(`Total Denda: Rp ${totalDenda.toLocaleString()}`);
}





// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayTransaksi();

  
});


