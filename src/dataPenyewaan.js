// Import Firebase dari file firebase.js
import { db } from "./firebase.js";
import {
  getDocs,
  collection,
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
    '<p class="flex w-full justify-center font-bold text-lg mb-4">Data Penyewaan</p>' +
    `<div class="overflow-x-auto">
      <table class="table-auto w-full min-w-max mb-4">
        <thead>
          <tr>
          <th class="border px-4 py-2 w-[200px] text-center">Nama Penyewa</th> <!-- Kolom baru -->
           
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
        <tbody id="transaksi-tbody">
        </tbody>
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
    <tr>
    <td class="border px-4 py-2">${
      data.namePenyewa || "-"
    }</td> <!-- Menampilkan nama penyewa -->
      
      <td class="border px-4 py-2">${data.noHpPenyewa || "-"}</td>
      <td class="border px-4 py-2">${data.tanggalSewa || "-"}</td>
      <td class="border px-4 py-2">${data.tujuan || "-"}</td>
      <td class="border px-4 py-2">
        <ul>
          ${namaBarang.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </td>
      <td class="border px-4 py-2">
        <ul>
          ${qty.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </td>
      <td class="border px-4 py-2">${data.diskon || "-"}</td>
      <td class="border px-4 py-2">
        <ul>
          ${hargaSewa
            .map((item) => `<li>Rp ${item.toLocaleString()}</li>`)
            .join("")}
        </ul>
      </td>
      <td class="border px-4 py-2">
        <ul>
          ${hargaTotal
            .map((item) => `<li>Rp ${item.toLocaleString()}</li>`)
            .join("")}
        </ul>
      </td>
      <td class="border px-4 py-2">${data.jaminan || "-"}</td>
      <td class="border px-4 py-2">${data.total || "-"}</td>
      <td class="border px-4 py-2">
            <button class="bg-blue-500 text-white px-4 py-2 rounded-md mr-2" onclick="editTransaction('${
              doc.id
            }')">Edit</button>
            <button class="bg-green-500 text-white px-4 py-2 rounded-md">Cek Barang</button>
          </td>
    </tr>
  `;

  // Menambahkan data transaksi ke tbody
  transaksiTbody.innerHTML += transaksiHTML;
});


    dataPenyewaanDiv.classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching transaksi:", error);
  }
}

// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayTransaksi();

  
});
