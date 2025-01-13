import { db } from "./firebase.js"; // Sesuaikan dengan lokasi file firebase.js Anda
import {
  query,
  where,
  getDocs,
  collection,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

async function fetchAndRenderData(query = "") {
  try {
    const querySnapshot = await getDocs(collection(db, "dataPenyewaan"));
    const dataPenyewaan = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Ambil ID dokumen
      ...doc.data(), // Ambil data dokumen
    }));


    // Verifikasi apakah dataPenyewaan sudah diterima
    console.log("Data yang diterima: ", dataPenyewaan);

    // Filter data jika ada query pencarian
    const filteredData = query
      ? filterDataBySearch(dataPenyewaan, query)
      : dataPenyewaan;

    renderDataPengembalian(filteredData); // Render data yang sudah difilter
  } catch (error) {
    console.error("Error fetching data from Firestore:", error);
  }
}

async function updateStatusInTransaksi(namePenyewa, tanggalSewa, newStatus) {
  try {
    const transaksiRef = collection(db, "transaksi");
    const q = query(
      transaksiRef,
      where("namePenyewa", "==", namePenyewa),
      where("tanggalSewa", "==", tanggalSewa)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("Dokumen tidak ditemukan:", { namePenyewa, tanggalSewa });
      alert("Dokumen tidak ditemukan.");
      return;
    }

    querySnapshot.forEach(async (docSnapshot) => {
      const docRef = doc(db, "transaksi", docSnapshot.id);
      await updateDoc(docRef, { status: newStatus });
      console.log("Status berhasil diperbarui:", docSnapshot.id);
    });
  } catch (error) {
    console.error("Error memperbarui status:", error);
    alert("Gagal memperbarui status.");
  }
}
async function deleteDocFromTransaksi(namePenyewa, tanggalSewa) {
  try {
    const transaksiRef = collection(db, "transaksi");
    const q = query(
      transaksiRef,
      where("namePenyewa", "==", namePenyewa),
      where("tanggalSewa", "==", tanggalSewa)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("Dokumen tidak ditemukan:", { namePenyewa, tanggalSewa });
      alert("Dokumen tidak ditemukan.");
      return;
    }

    querySnapshot.forEach(async (docSnapshot) => {
      const docRef = doc(db, "transaksi", docSnapshot.id);
      await deleteDoc(docRef); // Hapus dokumen
      console.log("Dokumen berhasil dihapus:", docSnapshot.id);
    });

    // alert("Dokumen berhasil dihapus.");
  } catch (error) {
    console.error("Error menghapus dokumen:", error);
    // alert("Gagal menghapus dokumen.");
  }
}

document.getElementById("dataPengembalianBtn").addEventListener("click", function(){
  fetchAndRenderData();
  console.log("Refresh")
});

function renderDataPengembalian(dataPenyewaan) {
  const container = document.getElementById("barangList-dataPengembalian"); // Pastikan elemen ini ada di HTML
  container.innerHTML = ""; // Menghapus konten lama sebelum merender yang baru

  // Membuat wrapper untuk tabel
  const tableWrapper = document.createElement("div");
  tableWrapper.classList.add("overflow-x-auto", "w-full");

  const table = document.createElement("div");
  table.classList.add("flex", "flex-col", "w-full");

  // Membuat header tabel
  const header = document.createElement("div");
  header.classList.add("flex", "w-full", "text-center");

  // Membuat header kolom menggunakan format yang diminta
  header.innerHTML = `
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Name Penyewa</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">No HP Penyewa</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Jaminan</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Tanggal Sewa</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Keterangan</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Total Denda</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Total Harga</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Tujuan</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Nama Barang</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Kondisi Barang</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-2 bg-[#D9D9D9] border-black">Aksi</div>
  `;
  table.appendChild(header);

  // Membuat body tabel
  const body = document.createElement("div");
  body.classList.add("flex", "flex-col", "w-full");

  // Mengisi baris tabel dengan data penyewaan
  dataPenyewaan.forEach((penyewaan) => {
    const row = document.createElement("div");
    row.classList.add("flex", "w-full", "items-strecth");

    // Menambahkan data penyewa
    row.innerHTML = `
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.namePenyewa}</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.noHpPenyewa}</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.jaminan}</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.tanggalSewa}</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.keteranganTerlambat}</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.totalDenda}</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.total}</div>
    <div class="snap-start flex-shrink-0 w-[200px] border-black border px-4 py-2">${penyewaan.tujuan}</div>
    
  `;

    // Membuat kolom Nama Barang
    const namaBarangCell = document.createElement("div");
    namaBarangCell.classList.add(
      "snap-start",
      "flex-shrink-0",
      "w-[200px]",
      "border",
      "border-black",
      "px-4",
      "py-2"
    );
    const namaBarangList = document.createElement("ul");
    namaBarangList.classList.add("list-disc", "pl-4");
    penyewaan.barang.forEach((item) => {
      const namaItem = document.createElement("li");
      namaItem.classList.add("text-sm");
      namaItem.textContent = item.nama;
      namaBarangList.appendChild(namaItem);
    });
    namaBarangCell.appendChild(namaBarangList);

    // Membuat kolom Kondisi Barang
    const kondisiBarangCell = document.createElement("div");
    kondisiBarangCell.classList.add(
      "snap-start",
      "flex-shrink-0",
      "w-[200px]",
      "border",
      "border-black",
      "px-4",
      "py-2"
    );
    const kondisiBarangList = document.createElement("ul");
    kondisiBarangList.classList.add("list-disc", "pl-4");
    penyewaan.barang.forEach((item) => {
      const kondisiItem = document.createElement("li");
      kondisiItem.classList.add("text-sm");
      kondisiItem.textContent = item.kondisi;
      kondisiBarangList.appendChild(kondisiItem);
    });
    kondisiBarangCell.appendChild(kondisiBarangList);

    // Menambahkan kolom Nama Barang dan Kondisi Barang ke dalam row
    row.appendChild(namaBarangCell);
    row.appendChild(kondisiBarangCell);

    const buttonRow = document.createElement("div");
    buttonRow.classList.add("snap-start", "flex-shrink-0", "w-[200px]", "border", "border-black", "px-4", "py-2", "flex", "items-center");

    buttonRow.innerHTML = `
    <button class="selesai-btn bg-blue-500 text-white px-4 py-2 rounded " data-id="${penyewaan.id}">Selesai</button>
    <button class="hapus-btn bg-red-500 text-white px-4 py-2 rounded ml-2" data-id="${penyewaan.id}">Hapus</button>
  `;

    // Menambahkan tombol setelah kolom barang dan kondisi
    row.appendChild(buttonRow);

    // Menambahkan row ke body tabel
    body.appendChild(row);

    // Menambahkan row ke dalam body tabel
    body.appendChild(row);
    


  });

  function getFormattedDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0"); // Tambahkan nol di depan jika kurang dari 10
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Bulan dimulai dari 0
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async function updatePengadaanBarang(penyewaanData) {
    try {
      const barangList = penyewaanData.barang; // Ambil barang dari dataPenyewaan

      for (const barang of barangList) {
        const pengadaanQuery = query(
          collection(db, "pengadaanBarang"),
          where("nama", "==", barang.nama) // Cocokkan berdasarkan nama barang
        );

        const pengadaanSnapshot = await getDocs(pengadaanQuery);
        if (pengadaanSnapshot.empty) {
          console.warn(
            `Barang dengan nama "${barang.nama}" tidak ditemukan di pengadaanBarang.`
          );
          continue;
        }

        pengadaanSnapshot.forEach(async (pengadaanDoc) => {
          const pengadaanData = pengadaanDoc.data();
          const pengadaanRef = doc(db, "pengadaanBarang", pengadaanDoc.id);

          // Hitung pembaruan
          let newJumlah = pengadaanData.jumlah;
          let newJumlahSewa = pengadaanData.jumlahSewa;

          if (barang.kondisi === "Baik") {
            newJumlah += 1; // Tambahkan ke jumlah
          } else {
            // Tambahkan ke barangRusak jika kondisi != "Baik"
            await addDoc(collection(db, "barangRusak"), {
              nama: barang.nama,
              kondisi: barang.kondisi,
              tanggalRusak: serverTimestamp(), // Tambahkan timestamp untuk tracking
            });
            console.log(
              `Barang "${barang.nama}" dengan kondisi "${barang.kondisi}" ditambahkan ke barangRusak.`
            );
          }
          newJumlahSewa -= 1; // Kurangi dari jumlahSewa

          // Perbarui dokumen
          await updateDoc(pengadaanRef, {
            jumlah: newJumlah,
            jumlahSewa: newJumlahSewa,
          });

          console.log(
            `Barang "${barang.nama}" diperbarui: jumlah=${newJumlah}, jumlahSewa=${newJumlahSewa}`
          );
        });
      }
    } catch (error) {
      console.error("Error memperbarui pengadaanBarang:", error);
    }
  }




  body.addEventListener("click", async (event) => {
    const target = event.target;

    if (target.classList.contains("selesai-btn")) {
      const penyewaanId = target.getAttribute("data-id");
      const penyewaanData = dataPenyewaan.find(
        (item) => item.id === penyewaanId
      );
      const { namePenyewa, tanggalSewa } = penyewaanData;

      if (!penyewaanData) {
        console.error("Data penyewaan tidak ditemukan:", penyewaanId);
        alert("Data penyewaan tidak valid.");
        return;
      }

      try {
        // Simpan data ke koleksi "riwayatTransaksi"
        const tanggalSekarang = getFormattedDate();
        await addDoc(collection(db, "riwayatTransaksi"), {
          ...penyewaanData,
          tanggalDiselesaikan: tanggalSekarang, // Tambahkan tanggal sekarang
        });

        await updatePengadaanBarang(penyewaanData);

        await deleteDoc(doc(db, "dataPenyewaan", penyewaanId));

        await deleteDocFromTransaksi(namePenyewa, tanggalSewa);

        // Hapus data dari UI
        target.closest(".flex").remove(); // Menghapus baris terkait
        alert(
          "Data berhasil diselesaikan dan dipindahkan ke riwayatTransaksi."
        );
      } catch (error) {
        console.error("Error menyelesaikan data:", error);
        alert("Gagal menyelesaikan data.");
      }
    }

    if (target.classList.contains("hapus-btn")) {
      const penyewaanId = target.getAttribute("data-id");
      const penyewaanData = dataPenyewaan.find(
        (item) => item.id === penyewaanId
      );

      if (!penyewaanData) {
        console.error("Data penyewaan tidak ditemukan:", penyewaanId);
        alert("Data penyewaan tidak valid.");
        return;
      }

      const { namePenyewa, tanggalSewa } = penyewaanData;

      try {
        // Panggil fungsi untuk memperbarui status di koleksi transaksi
        await updateStatusInTransaksi(namePenyewa, tanggalSewa, "Menunggu");
        
        await deleteDoc(doc(db, "dataPenyewaan", penyewaanId));

        // Hapus data dari UI
        target.closest(".flex").remove(); // Menghapus baris terkait
        alert("Data berhasil dihapus.");
        fetchAndRenderData();
      } catch (error) {
        console.error("Error menghapus data:", error);
        alert("Gagal menghapus data.");
      }
    }
  });
  table.appendChild(body);
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);
}















// Function to filter data based on search input
document
  .getElementById("searchBar-dataPengembalian")
  .addEventListener("input", (e) => {
    const query = e.target.value; // Ambil nilai input dari search bar
    fetchAndRenderData(query); // Panggil fungsi untuk fetch dan render data berdasarkan query
  });

function filterDataBySearch(dataPenyewaan, query) {
  // Mengabaikan perbedaan huruf kapital dan memfilter berdasarkan nama barang, kondisi barang, dan nama penyewa
  return dataPenyewaan.filter((penyewaan) => {
    // Periksa apakah nama penyewa atau salah satu barang dalam array barang cocok dengan query pencarian
    return (
      penyewaan.namePenyewa.toLowerCase().includes(query.toLowerCase()) || // Mencari nama penyewa
      penyewaan.barang.some(
        (item) =>
          item.nama.toLowerCase().includes(query.toLowerCase()) || // Mencari nama barang
          item.kondisi.toLowerCase().includes(query.toLowerCase()) // Mencari kondisi barang
      )
    );
  });
}


// Call the function to fetch and render data when the page loads
fetchAndRenderData();
