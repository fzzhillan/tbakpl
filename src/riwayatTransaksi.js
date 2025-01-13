import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


function parseDate(dateString) {
  // Format: "DD-MM-YYYY"
  const parts = dateString.split("-");
  return new Date(parts[2], parts[1] - 1, parts[0]); // new Date(year, month, day)
}

document
  .getElementById("riwayatTransaksiBtn")
  .addEventListener("click", async function () {
    const data = await fetchData(); // Ambil data dari Firestore
    renderTransaksi(data); // Render data ke dalam HTML
    console.log("Refresh Berhasil");
  });


async function fetchData() {
  const transaksiRef = collection(db, "riwayatTransaksi");
  const transaksiSnapshot = await getDocs(transaksiRef);
  const data = transaksiSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Urutkan berdasarkan tanggalDiselesaikan (misalnya format "DD-MM-YYYY")
  data.sort(
    (a, b) =>
      parseDate(b.tanggalDiselesaikan) - parseDate(a.tanggalDiselesaikan)
  ); // descending order

  return data;
}

function renderTransaksi(data) {
  const transaksiList = document.getElementById("transaksiList");
  transaksiList.innerHTML = ""; // Reset list

  data.forEach((transaksi) => {
    const item = document.createElement("div");
    item.classList.add(
      "border",
      "p-4",
      "rounded-xl",
      "shadow-md",
      "bg-[#EBEBEB]",
      "flex",
      "flex-col"
    );

    item.innerHTML = `
      <p><strong>Nama Penyewa:</strong></p>
      <p class="bg-[white] p-2 rounded-lg shadow-md mb-2"> ${
        transaksi.namePenyewa
      }</p>
      <p><strong>Tanggal Sewa:</strong></p>
<p class="bg-white p-2 rounded-lg shadow-md mb-2">${transaksi.tanggalSewa}</p>

<p><strong>Tanggal Pengembalian:</strong></p>
<p class="bg-white p-2 rounded-lg shadow-md mb-2">${
      transaksi.tanggalDikembalikanFormatted || "Belum Kembali"
    }</p>

<p><strong>Total Barang Disewa:</strong></p>
<p class="bg-white p-2 rounded-lg shadow-md mb-2">${transaksi.barang.length}</p>

<p><strong>Pencatat:</strong></p>
<p class="bg-white p-2 rounded-lg shadow-md mb-2">${transaksi.pencatat}</p>

<p><strong>Total Pembayaran:</strong></p>
<p class="bg-white p-2 rounded-lg shadow-md mb-2">${transaksi.total}</p>

      <button class="btn btn-info bg-blue-500 flex justify-center rounded-xl text-white" onclick="showDetailModal('${
        transaksi.id
      }')">Lihat Detail</button>
    `;
    transaksiList.appendChild(item);
  });
}


async function showDetailModal(transaksiId) {
  const transaksi = allData.find((transaksi) => transaksi.id === transaksiId);
  const modalBody = document.getElementById("modalBody-riwayatTransaksi");

  modalBody.innerHTML = `
    <div class="bg-white border border-gray-300 p-6 rounded-lg max-w-4xl w-full mx-auto">
      <table class="w-full text-sm text-gray-700">
        
        <tr class="border-b">
          <td class="py-2 font-bold">Nama Penyewa</td>
          <td class="py-2">: ${transaksi.namePenyewa}</td>
        </tr>
        <tr class="border-b">
          <td class="py-2 font-bold">Tujuan</td>
          <td class="py-2">: ${transaksi.tujuan}</td>
        </tr>
        <tr class="border-b">
          <td class="py-2 font-bold">Jaminan</td>
          <td class="py-2">: ${transaksi.jaminan}</td>
        </tr>
        <tr class="border-b">
          <td class="py-2 font-bold">Barang Yang Disewa</td>
          <td class="py-2">
            <ul class="list-disc list-inside">
              ${transaksi.barang
                .map(
                  (b) => `
                <li>${b.nama} (Kondisi: ${b.kondisi})</li>`
                )
                .join("")}
            </ul>
          </td>
        </tr>
        <tr class="border-b">
          <td class="py-2 font-bold">Tanggal Di Sewa & Di Kembalikan</td>
          <td class="py-2">: ${transaksi.tanggalSewa} & ${
    transaksi.tanggalDikembalikanFormatted || "Belum Kembali"
  }</td>
        </tr>
        <tr class="border-b">
          <td class="py-2 font-bold">Kerusakan/Terlambat</td>
          <td class="py-2">: ${
            transaksi.keteranganTerlambat || "Tidak Terlambat"
          }</td>
        </tr>
        <tr class="border-b">
          <td class="py-2 font-bold">Denda</td>
          <td class="py-2">: Rp ${transaksi.totalDenda}</td>
        </tr>
        <tr>
          <td class="py-2 font-bold">Total yang Dibayar</td>
          <td class="py-2">: Rp ${
            parseInt(transaksi.total.replace("Rp ", "").replace(",", "")) +
            transaksi.totalDenda
          }</td>
        </tr>
      </table>
    </div>
  `;

  const modal = document.getElementById("detailModal-riwayatTransaksi");
  modal.classList.remove("hidden"); // Show modal
}


function closeModal() {
  const modal = document.getElementById("detailModal-riwayatTransaksi");
  modal.classList.add("hidden"); // Hide modal
}

document
  .getElementById("searchInput-riwayatTransaksi")
  .addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filteredData = allData.filter(
      (transaksi) =>
        transaksi.namePenyewa.toLowerCase().includes(keyword) ||
        transaksi.barang.some((b) => b.nama.toLowerCase().includes(keyword))
    );
    renderTransaksi(filteredData);
  });

let allData = [];
document.addEventListener("DOMContentLoaded", async () => {
  allData = await fetchData();
  renderTransaksi(allData);
});

window.showDetailModal = showDetailModal;
window.closeModal = closeModal;
