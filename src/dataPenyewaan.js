// Import Firebase dari file firebase.js
import { db } from "./firebase.js";
import {
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  collection,
  query,
  where,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.getElementById("dataPenyewaanBtn").addEventListener("click", function() {
  fetchAndDisplayTransaksi();
  console.log("Refresh Berhasil");
});

// Fungsi untuk mengambil dan menampilkan data dari koleksi transaksi
export async function fetchAndDisplayTransaksi() {
  try {
    const transaksiRef = collection(db, "transaksi");
    const querySnapshot = await getDocs(transaksiRef);

    const dataPenyewaanDiv = document.getElementById("dataPenyewaanContainer");

    dataPenyewaanDiv.innerHTML = "";

    // Menambahkan header tabel hanya sekali
    if (!dataPenyewaanDiv.querySelector("thead")) {
      dataPenyewaanDiv.innerHTML =
        "" +
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
                <th class="border px-4 py-2 w-[200px] text-center">Pencatat</th>
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

      if (data.status !== "Menunggu") return;

      // Parsing string yang memuat beberapa nilai menjadi array
      const namaBarang = [
        ...new Set(data.namaBarang.split(", ").map((item) => item.trim())),
      ];
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
          <td class="border px-4 py-2 text-center">${data.pencatat || "-"}</td>
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
            <button data-transaksi-id="${
              doc.id
            }" data-nama-barang="${namaBarang.join(",")}, qty: ${qty.join(
        ","
      )}" data-data-penyewa='${JSON.stringify({
        namePenyewa: data.namePenyewa || "-",
        noHpPenyewa: data.noHpPenyewa || "-",
        tanggalSewa: data.tanggalSewa || "-",
        tujuan: data.tujuan || "-",
        jaminan: data.jaminan || "-",
        qty: data.qty || "-",
        total: data.total || "-",
        pencatat: data.pencatat || "-",
      })}'   class="konfirmasiButton bg-green-500 text-white px-4 py-2 rounded text-center" >Cek Barang</button>

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
        const transaksiId = button.getAttribute("data-transaksi-id");
        const namaBarang = button.getAttribute("data-nama-barang").split(",");
        const dataPenyewa = JSON.parse(
          button.getAttribute("data-data-penyewa")
        );
        createCekBarangModalWithData(dataPenyewa, namaBarang, transaksiId);
      });
    });
    // Tambahkan fitur pencarian setelah data dimuat
    setupSearchBar();
  } catch (error) {
    console.error("Error fetching transaksi:", error);
  }
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
// Fungsi untuk membuat modal pengecekan barang berdasarkan namaBarang
async function createCekBarangModalWithData(dataPenyewa, namaBarang, transaksiId) {
  try {
    if (!namaBarang || namaBarang.length === 0) {
      console.error("Nama barang tidak ditemukan.");
      alert("Nama barang tidak ditemukan.");
      return;
    }

    // Ambil data barang dari Firestore berdasarkan nama
    const barangRef = collection(db, "pengadaanBarang");
    const querySnapshot = await getDocs(
      query(barangRef, where("nama", "in", namaBarang))
    );

    // Hilangkan barang duplikat
    const barangList = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Tambahkan hanya barang unik
      if (!barangList.some((item) => item.nama === data.nama)) {
        barangList.push({
          id: doc.id,
          nama: data.nama,
          dendaRusakRingan: data.dendaRusakRingan || 0,
          dendaRusakSedang: data.dendaRusakSedang || 0,
          dendaRusakBerat: data.dendaRusakBerat || 0,
          dendaHilang: data.dendaHilang || 0,
        });
      }
    });

    console.log("Barang unik yang akan dirender:", barangList);

    // Buat modal
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
        <div class="mb-4">
          <p><strong>Nama Penyewa:</strong> ${dataPenyewa.namePenyewa}</p>
          <p><strong>No HP:</strong> ${dataPenyewa.noHpPenyewa}</p>
          <p><strong>Tanggal Sewa:</strong> ${dataPenyewa.tanggalSewa}</p>
          <p><strong>Tujuan:</strong> ${dataPenyewa.tujuan}</p>
          <p><strong>Jaminan:</strong> ${dataPenyewa.jaminan}</p>
          <p><strong>Keterangan:</strong> ${dataPenyewa.keterangan}</p>
          <p><strong>Total Harga:</strong> ${dataPenyewa.total}</p>
          <p><strong>Pencatat:</strong> ${dataPenyewa.pencatat}</p>
        </div>
         <div class="mb-4">
      <label for="tanggalDikembalikan" class="block font-bold mb-2">Tanggal Dikembalikan:</label>
      <input type="date" id="tanggalDikembalikan" class="border p-2 rounded w-full" />
      <p id="keteranganTerlambat" class="text-red-500 mt-2 hidden"></p>
    </div>
    <input type="hidden" id="transaksiId" value="${transaksiId}" />
        <div id="barangList" class="space-y-4"></div>
        <div class="flex justify-between items-center mt-4">
          <h3 class="font-bold">Total Denda: <span id="totalDenda">Rp 0</span></h3>
          <div class="flex space-x-4">
            <button id="cancelButton" class="bg-red-500 text-white px-4 py-2 rounded">Batal</button>
            <button id="submitButton" class="bg-blue-500 text-white px-4 py-2 rounded">Selesai</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalContainer);

    // Render barang dan setup event listener
    renderBarangListWithOptions(barangList,dataPenyewa);
    setupBarangConditionListeners(barangList);

    document.getElementById("cancelButton").addEventListener("click", () => {
      document.body.removeChild(modalContainer);
    });

    function formatTanggal(tanggal) {
      if (!tanggal) return "Tanggal tidak diatur"; // Jika tanggal kosong
      const [year, month, day] = tanggal.split("-"); // Pisahkan tahun, bulan, dan hari
      return `${day}-${month}-${year}`; // Susun kembali dalam format dd-mm-yyyy
    }

    function parseTanggal(tanggal) {
      if (!tanggal) return null;
      const [day, month, year] = tanggal.split("-");
      return `${year}-${month}-${day}`; // Ubah ke format yyyy-mm-dd
    }

    document
      .getElementById("tanggalDikembalikan")
      .addEventListener("change", (event) => {
        // Mendapatkan tanggal dikembalikan dari input user (yyyy-mm-dd)
        const tanggalDikembalikan = new Date(event.target.value);

        // Parsing tanggal sewa yang diambil dari dataPenyewa (dd-mm-yyyy)
        const tanggalSewa = new Date(parseTanggal(dataPenyewa.tanggalSewa));

        const keteranganTerlambat = document.getElementById(
          "keteranganTerlambat"
        );

        if (tanggalDikembalikan > tanggalSewa) {
          // Menghitung jumlah hari terlambat
          const hariTerlambat = Math.ceil(
            (tanggalDikembalikan - tanggalSewa) / (1000 * 60 * 60 * 24)
          );
          keteranganTerlambat.textContent = `Penyewa terlambat mengembalikan barang selama ${hariTerlambat} hari (Tanggal Dikembalikan: ${formatTanggal(
            event.target.value
          )}).`;
          keteranganTerlambat.classList.remove("hidden");
        } else if (tanggalDikembalikan.getTime() === tanggalSewa.getTime()) {
          // Menampilkan pesan jika dikembalikan tepat waktu
          keteranganTerlambat.textContent = `Barang dikembalikan tepat waktu (Tanggal Dikembalikan: ${formatTanggal(
            event.target.value
          )}).`;
          keteranganTerlambat.classList.remove("hidden");
        } else {
          // Menampilkan pesan jika dikembalikan lebih awal
          keteranganTerlambat.textContent = `Barang dikembalikan lebih awal (Tanggal Dikembalikan: ${formatTanggal(
            event.target.value
          )}).`;
          keteranganTerlambat.classList.remove("hidden");
        }
      });

      

    document
      .getElementById("submitButton")
      .addEventListener("click", async () => {
        try {
          const tanggalDikembalikanInput = document.getElementById(
            "tanggalDikembalikan"
          );
          if (!tanggalDikembalikanInput) {
            console.error(
              "Elemen dengan ID 'tanggalDikembalikan' tidak ditemukan."
            );
            alert(
              "Tanggal Dikembalikan tidak ditemukan. Pastikan modal sudah dibuat dengan benar."
            );
            return;
          }
function formatTanggalToDDMMYYYY(tanggal) {
  if (!tanggal) return ""; // Jika tanggal kosong, kembalikan string kosong
  const [year, month, day] = tanggal.split("-"); // Pisahkan menjadi [yyyy, mm, dd]
  return `${day}-${month}-${year}`; // Susun ulang menjadi dd-mm-yyyy
}


          const tanggalDikembalikan = tanggalDikembalikanInput.value;
          const tanggalDikembalikanFormatted =
            formatTanggalToDDMMYYYY(tanggalDikembalikan);
          const keteranganTanggal = document.getElementById(
            "keteranganTerlambat"
          )
          const keteranganTanggalText = keteranganTanggal.textContent;

          const barangElements = document
            .getElementById("barangList")
            .querySelectorAll(".flex.justify-between.items-center");

          const barangData = Array.from(barangElements).map((barangElement) => {
            const namaBarang = barangElement
              .querySelector("span")
              .textContent.trim();
            const kondisiBarang =
              barangElement.querySelector(".barang-condition").value;
            const idBarang =
              barangElement.querySelector(".barang-condition").dataset.id;

            return {
              id: idBarang,
              nama: namaBarang,
              kondisi: kondisiBarang,
            };
          });

          console.log("Barang Data:", barangData);

          const totalDendaElement = document.getElementById("totalDenda");
          const totalDenda = totalDendaElement
            ? parseFloat(
                totalDendaElement.textContent
                  .replace("Rp", "")
                  .replace(",", "")
                  .trim()
              )
            : 0;

          const dataUntukSimpan = {
            ...dataPenyewa,
            tanggalDikembalikanFormatted,
            totalDenda,
            barang: barangData,
            keteranganTerlambat: keteranganTanggalText,
          };

          console.log("Data untuk disimpan:", dataUntukSimpan);

          await addDoc(collection(db, "dataPenyewaan"), dataUntukSimpan);

          const transaksiId = document.getElementById("transaksiId").value; // Pastikan ID transaksi tersedia
          if (transaksiId) {
            await updateDoc(doc(db, "transaksi", transaksiId), {
              status: "siap",
            });
            console.log(
              "Status transaksi berhasil diperbarui menjadi 'siap':",
              transaksiId
            );
          }


          // Tutup modal
          const modalContainer = document.getElementById("cekBarangModal");
          if (modalContainer) {
            modalContainer.remove();
            console.log("Modal ditutup.");
          }

          // Refresh data transaksi
          fetchAndDisplayTransaksi();

          alert("Data berhasil disimpan!");
        } catch (error) {
          console.error("Error saat menyimpan data:", error);
          alert("Terjadi kesalahan saat menyimpan data.");
        }
      });

  } catch (error) {
    console.error("Error fetching barang:", error);
    alert("Gagal memuat data barang");
  }
}

function renderBarangListWithOptions(barangList, dataPenyewa) {
  const barangListContainer = document.getElementById("barangList");
  barangListContainer.innerHTML = ""; // Reset kontainer untuk mencegah duplikasi

  // Pastikan qty dari dataPenyewa sesuai dengan jumlah barang
  const qtyArray = dataPenyewa.qty
    ? dataPenyewa.qty.split(", ").map((item) => parseInt(item.trim(), 10))
    : [1];

  barangList.forEach((item, index) => {
    // Dapatkan qty sesuai dengan index barang
    const qty = qtyArray[index] || 1; // Gunakan qty dari array jika ada, jika tidak default ke 1

    // Loop berdasarkan qty dan render barang sesuai jumlahnya
    for (let i = 0; i < qty; i++) {
      const itemElement = document.createElement("div");
      itemElement.classList.add(
        "flex",
        "justify-between",
        "items-center",
        "border",
        "p-2",
        "rounded-lg"
      );

       const kondisiDefault = "Baik"; // Default condition is "Baik"

       itemElement.innerHTML = `
        <span>${item.nama}</span>
        <select class="barang-condition" data-id="${item.id}">
          <option value="Baik" ${
            kondisiDefault === "Baik" ? "selected" : ""
          }>Baik</option>
          <option value="Rusak Ringan" ${
            kondisiDefault === "Rusak Ringan" ? "selected" : ""
          }>Denda Ringan</option>
          <option value="Rusak Sedang" ${
            kondisiDefault === "Rusak Sedang" ? "selected" : ""
          }>Denda Sedang</option>
          <option value="Rusak Berat" ${
            kondisiDefault === "Rusak Berat" ? "selected" : ""
          }>Denda Berat</option>
          <option value="Hilang" ${
            kondisiDefault === "Hilang" ? "selected" : ""
          }>Hilang</option>
        </select>
      `;

      barangListContainer.appendChild(itemElement);
    }
  });
}



function calculateTotalDenda(conditions, barangList) {
  let totalDenda = 0;

  conditions.forEach(({ id, condition }) => {
    const item = barangList.find((b) => b.id === id);
    if (item) {
      switch (condition) {
        case "Rusak Ringan":
          totalDenda += item.dendaRusakRingan || 0;
          break;
        case "Rusak Sedang":
          totalDenda += item.dendaRusakSedang || 0;
          break;
        case "Rusak Berat":
          totalDenda += item.dendaRusakBerat || 0;
          break;
        case "Hilang":
          totalDenda += item.dendaHilang || 0;
          break;
      }
    }
  });

  // Perbarui tampilan total denda di modal
  const totalDendaElement = document.getElementById("totalDenda");
  if (totalDendaElement) {
    totalDendaElement.textContent = `Rp ${totalDenda.toLocaleString()}`;
  }
}

function setupBarangConditionListeners(barangList) {
  const conditionDropdowns = document.querySelectorAll(".barang-condition");

  conditionDropdowns.forEach((dropdown) => {
    dropdown.addEventListener("change", () => {
      const barangConditions = Array.from(conditionDropdowns).map(
        (dropdown) => ({
          id: dropdown.dataset.id,
          condition: dropdown.value, // Ambil nilai yang dipilih
        })
      );

      calculateTotalDenda(barangConditions, barangList);
    });

  });
}


// Panggil fungsi saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayTransaksi();
});
