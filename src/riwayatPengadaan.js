import { db } from "./firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Fungsi untuk mengambil data dari Firestore
async function fetchPengadaanData() {
  const pengadaanRef = collection(db, "riwayatPengadaan");
  const pengadaanSnapshot = await getDocs(pengadaanRef);

  const data = pengadaanSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Urutkan data berdasarkan date (descending)
  data.sort((a, b) => b.date.seconds - a.date.seconds);

  return data;
}

document
  .getElementById("riwayatPengadaanBtn")
  .addEventListener("click", async function () {
    const data = await fetchPengadaanData(); // Ambil data dari Firestore
    renderPengadaan(data); // Render data ke dalam HTML
    console.log("Refresh Berhasil");
  });


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
    const tr = document.createElement("div");

    tr.innerHTML = `
    <div class="flex w-full rounded-xl bg-white shadow-md items-stretch">
    <div class="w-[30%] py-4 px-2 border-r border-black flex text-center justify-center items-center text-sm justify-around">
            <div>
            <img src="${pengadaan.gambar}" class="h-[80px]">
            </div>
            <div>
            ${pengadaan.nama}
            
            </div>
            <div>
            
            </div>
            </div>
            <div class="w-[30%] py-4 border-r border-black  text-center justify-center flex items-center text-sm">
              ${pengadaan.namaPencatat}
            </div>
            <div class="w-[30%] py-4 border-r border-black text-center justify-center flex items-center text-sm">
              ${formatDate(pengadaan.date)}
            </div>
            <div class="w-[10%] py-4  text-center flex justify-center items-center text-sm">
              ${pengadaan.aksi}
            </div>
            </div>
  
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

    // Urutkan data yang sudah difilter berdasarkan date
    filteredData.sort((a, b) => b.date.seconds - a.date.seconds);

    renderPengadaan(filteredData);
  });


// Ambil data saat halaman dimuat
let allPengadaan = [];
document.addEventListener("DOMContentLoaded", async () => {
  allPengadaan = await fetchPengadaanData();
  renderPengadaan(allPengadaan);
});
