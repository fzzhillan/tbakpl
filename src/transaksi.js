// Import Firebase functions
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Fungsi untuk mengambil data barang dari koleksi "pengadaanBarang"
async function fetchBarang() {
  const barangRef = collection(db, "pengadaanBarang");
  const querySnapshot = await getDocs(barangRef);

  const barang = [];
  querySnapshot.forEach((doc) => {
    barang.push({ id: doc.id, ...doc.data() });
  });

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
function renderBarang(barang) {

    
  const transaksiContainer = document.querySelector("#transaksi-container");

  if (!transaksiContainer) {
    console.error("Transaksi container tidak ditemukan!");
    return;
  }
  console.log("Barang yang akan dirender:", barang);
  transaksiContainer.innerHTML = ""; // Kosongkan container

  barang.forEach((item) => {
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
        <img src="${item.gambar}" alt="${item.nama}" class="h-[120px] w-[120px] rounded-xl py-2">
      </div>
      <div id="transaksi-barang-name" class="flex items-center">
        <p>${item.nama}</p>
      </div>
      <div id="transaksi-qty-button" class="flex items-center gap-y-4 border-x px-2 border-black">
        <button class="btn-increment bg-blue-500 text-white px-4 py-4 rounded-full" data-id="${item.id}">
          +
        </button>
        <button class="btn-decrement bg-red-500 text-white px-4 py-4 rounded-full" data-id="${item.id}">
          -
        </button>
      </div>
      <div id="transaksi-qty" class="flex justify-center text-lg items-center text-center" data-id="${item.id}">
        0
      </div>
    `;

    transaksiContainer.appendChild(transaksiElement);
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
});


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

        // Perbarui jumlah ke Firestore
        await updateDoc(doc(db, "pengadaanBarang", id), {
          jumlah: item.jumlah - newQty,
        });
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

        // Perbarui jumlah ke Firestore
        await updateDoc(doc(db, "pengadaanBarang", id), {
          jumlah: item.jumlah + (currentQty - newQty),
        });
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

// Panggil fungsi fetchBarang saat halaman dimuat
fetchBarang();
