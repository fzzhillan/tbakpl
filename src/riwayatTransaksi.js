import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

async function fetchData() {
  const transaksiRef = collection(db, "riwayatTransaksi");
  const transaksiSnapshot = await getDocs(transaksiRef);
  return transaksiSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function renderTransaksi(data) {
  const transaksiList = document.getElementById("transaksiList");
  transaksiList.innerHTML = ""; // Reset list

  data.forEach((transaksi) => {
    const item = document.createElement("div");
    item.classList.add("border", "p-4", "rounded", "shadow", "bg-white");

    item.innerHTML = `
      <p><strong>Nama Penyewa:</strong> ${transaksi.namePenyewa}</p>
      <p><strong>Tanggal Sewa:</strong> ${transaksi.tanggalSewa}</p>
      <p><strong>Tanggal Pengembalian:</strong> ${
        transaksi.tanggalDikembalikanFormatted || "Belum Kembali"
      }</p>
      <p><strong>Total Barang Disewa:</strong> ${transaksi.barang.length}</p>
      <p><strong>Pencatat:</strong> ${transaksi.pencatat}</p>
      <p><strong>Total Pembayaran:</strong> Rp ${transaksi.total}</p>
      <button class="btn btn-info" onclick="showDetailModal('${
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
    <p><strong>Nama Penyewa:</strong> ${transaksi.namePenyewa}</p>
    <p><strong>Tujuan:</strong> ${transaksi.tujuan}</p>
    <p><strong>Jaminan:</strong> ${transaksi.jaminan}</p>
    <p><strong>Barang yang Disewa:</strong></p>
    <ul>
      ${transaksi.barang
        .map(
          (b) => `
        <li>${b.nama} (Kondisi: ${b.kondisi})</li>`
        )
        .join("")}
    </ul>
    <p><strong>Tanggal Sewa:</strong> ${transaksi.tanggalSewa}</p>
    <p><strong>Tanggal Kembali:</strong> ${
      transaksi.tanggalDikembalikanFormatted || "Belum Kembali"
    }</p>
    <p><strong>Keterangan Terlambat:</strong> ${
      transaksi.keteranganTerlambat || "Tidak Terlambat"
    }</p>
    <p><strong>Denda:</strong> Rp ${transaksi.totalDenda}</p>
    <p><strong>Total yang Dibayar:</strong> Rp ${
      parseInt(transaksi.total.replace("Rp ", "").replace(",", "")) +
      transaksi.totalDenda
    }</p>
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
