import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Fungsi untuk mengambil data dari Firestore
async function fetchPengadaanData() {
  const pengadaanRef = collection(db, "riwayatPengadaan");
  const pengadaanSnapshot = await getDocs(pengadaanRef);
  return pengadaanSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function formatDate(date) {
  const d = new Date(date.seconds * 1000); // Mengambil timestamp dan mengkonversinya ke milidetik
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}



// Fungsi untuk menampilkan data pengadaan ke dalam elemen HTML
function renderPengadaan(data) {
  const pengadaanList = document.getElementById("pengadaanList");
  pengadaanList.innerHTML = ""; // Reset list

  data.forEach((pengadaan) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="border px-4 py-2">${pengadaan.aksi}</td>
      <td class="border px-4 py-2">${formatDate(pengadaan.date)}</td>
      
      <td class="border px-4 py-2">${pengadaan.nama}</td>
      <td class="border px-4 py-2">${pengadaan.namaPencatat}</td>
    `;

    pengadaanList.appendChild(tr);
  });
}

// Fungsi pencarian
document
  .getElementById("searchInput-riwayatPengadaan")
  .addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filteredData = allPengadaan.filter(
      (pengadaan) =>
        pengadaan.nama.toLowerCase().includes(keyword) ||
        pengadaan.namaPencatat.toLowerCase().includes(keyword)
    );
    renderPengadaan(filteredData);
  });

// Ambil data saat halaman dimuat
let allPengadaan = [];
document.addEventListener("DOMContentLoaded", async () => {
  allPengadaan = await fetchPengadaanData();
  renderPengadaan(allPengadaan);
});