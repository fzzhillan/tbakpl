  import { db, auth } from "./firebase.js";
  import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    getDoc,
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

  // Elemen DOM
  const penyewaContainer = document.getElementById("user-container-penyewa");
  const searchBarPenyewa = document.getElementById("search-bar-penyewa");
  const addUserModalPenyewa = document.getElementById("add-user-modal-penyewa");
  const addUserFormPenyewa = document.getElementById("add-user-form-penyewa");
  const editUserModalPenyewa = document.getElementById("edit-user-modal-penyewa");
  const cancelBtnPenyewa = document.getElementById("cancel-btn-penyewa");
  const cancelEditBtnPenyewa = document.getElementById("cancel-edit-btn-penyewa");

  let selectedUserId = null; // Untuk menyimpan ID user yang sedang dipilih

  document.addEventListener("click", (e) => {
    const target = e.target.getAttribute("data-target");
    if (target) {
      document.getElementById(target).classList.remove("hidden");
    }
  });


  function formatDate(timestamp) {
    const date = timestamp.toDate(); // Mengonversi Timestamp ke objek Date JavaScript
    const day = date.getDate().toString().padStart(2, "0"); // Mengambil tanggal dan memastikan dua digit
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mengambil bulan (1-12)
    const year = date.getFullYear(); // Mengambil tahun (4 digit)

    return `${day}-${month}-${year}`; // Format DD-MM-YYYY
  }
  // 1. Fungsi untuk memuat data penyewa
  async function fetchPenyewa(search = "") {
    const section = document.createElement("div");
    const list = document.createElement("ul");
    list.className = "";
    penyewaContainer.innerHTML = "";
    section.appendChild(list);

    try {
      const penyewaQuery = query(collection(db, "penyewa"));
      const querySnapshot = await getDocs(penyewaQuery);

      querySnapshot.forEach((doc) => {
        const penyewa = doc.data();

        // Filter pencarian
        if (
          search &&
          !(
            penyewa.namePenyewa.toLowerCase().includes(search.toLowerCase()) ||
            penyewa.nik.includes(search)
          )
        ) {
          return;
        }

        // Buat elemen untuk setiap penyewa
        const listItem = document.createElement("li");
        listItem.className = "font-light flex text-center items-stretch";

        listItem.innerHTML = `
  <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${penyewa.namePenyewa}
    </div>
  </div>

  <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-x-2 border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${penyewa.nik}
    </div>
  </div>

  <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center  border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${penyewa.status}
    </div>
  </div>

  <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-x-2 border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${penyewa.alamat}
    </div>
  </div>

  <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center  border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${penyewa.noHpPenyewa}
    </div>
  </div>

  <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center border-x-2 border-black p-2">
    <div class="bg-[#D9D9D9] w-full flex justify-center rounded-xl">
      ${penyewa.dateRegistered ? formatDate(penyewa.dateRegistered) : ""}
    </div>
  </div>

  <div class="snap-start flex-shrink-0 w-[180px] flex justify-center items-center border-r-2 border-black p-2">
    <img class="h-[100px] rounded-xl" src="${penyewa.gambar}" alt="${penyewa.namePenyewa}"> 
</div>

  <div class="snap-start flex-shrink-0 w-[180px] flex items-center justify-center gap-x-2 border-black p-2">
    <button class="edit-btn-penyewa px-4 rounded bg-[#177209] text-white" data-uid="${
      doc.id
    }">Edit</button>
    <button class="delete-btn-penyewa px-4 rounded bg-[#FF0000] text-white" data-uid="${
      doc.id
    }">Hapus</button>
  </div>
`;

        list.appendChild(listItem);
      });
    } catch (error) {
      console.error("Gagal memuat data penyewa:", error);
    }
    penyewaContainer.appendChild(section);
  }

  // 2. Event: Tambah User
  addUserFormPenyewa.addEventListener("submit", async (e) => {
    e.preventDefault();

    const namePenyewa = document.getElementById("namePenyewa").value;
    const nik = document.getElementById("nik").value;
    const status = document.getElementById("status").value;
    const alamat = document.getElementById("alamat").value;
    const noHpPenyewa = document.getElementById("noHpPenyewa").value;
    const gambarFile = document.getElementById("gambar-user").files[0];

  let gambarUrl = "";
  if (gambarFile) {
    gambarUrl = await uploadImageToServer(gambarFile);
    if (!gambarUrl) {
      alert("Gagal mengupload gambar.");
      return;
    }
  }

    if (nik.length !== 16) {
      alert("NIK harus terdiri dari 16 karakter.");
      return;
    }


    async function uploadImageToServer(file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "https://tbakpl.vercel.app/api/cloudinary",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response Error:", errorText);
          throw new Error(`Error: ${errorText}`);
        }

        const data = await response.json();
        return data.url; // URL gambar dari Cloudinary
      } catch (error) {
        console.error("Error uploading image:", error);
        return null;
      }
    }

    try {
      await addDoc(collection(db, "penyewa"), {
        namePenyewa,
        nik,
        status,
        alamat,
        noHpPenyewa,
        dateRegistered: serverTimestamp(),
        gambar : gambarUrl,
      });

      alert("Penyewa berhasil ditambahkan.");
      addUserModalPenyewa.classList.add("hidden");
      addUserFormPenyewa.reset();
      fetchPenyewa();
    } catch (error) {
      console.error("Gagal menambah penyewa:", error);
    }
  });

  // 3. Event: Edit User
  penyewaContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn-penyewa")) {
      selectedUserId = e.target.getAttribute("data-uid");
      openEditModal(selectedUserId);
    }
  });

  // Fungsi untuk membuka modal edit
  async function openEditModal(userId) {
    try {
      const docRefPenyewa = doc(db, "penyewa", userId);
      const penyewaDoc = await getDoc(docRefPenyewa);
      const penyewa = penyewaDoc.data();

      document.getElementById("edit-name-penyewa").value = penyewa.namePenyewa;
      document.getElementById("edit-nik").value = penyewa.nik;
      document.getElementById("edit-status").value = penyewa.status;
      document.getElementById("edit-alamat").value = penyewa.alamat;
      document.getElementById("edit-no-hp-penyewa").value = penyewa.noHpPenyewa;

      editUserModalPenyewa.classList.remove("hidden");
    } catch (error) {
      console.error("Gagal membuka modal edit:", error);
    }
  }

  // 4. Event: Simpan Edit User
  document
    .getElementById("edit-user-form-penyewa")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const namePenyewa = document.getElementById("edit-name-penyewa").value;
      const nik = document.getElementById("edit-nik").value;
      const status = document.getElementById("edit-status").value;
      const alamat = document.getElementById("edit-alamat").value;
      const noHpPenyewa = document.getElementById("edit-no-hp-penyewa").value;

      if (nik.length !== 16) {
        alert("NIK harus terdiri dari 16 karakter.");
        return;
      }

      try {
        const docRef = doc(db, "penyewa", selectedUserId);
        await updateDoc(docRef, {
          namePenyewa,
          nik,
          status,
          alamat,
          noHpPenyewa,
        });

        alert("Penyewa berhasil diperbarui.");
        editUserModalPenyewa.classList.add("hidden");
        fetchPenyewa();
      } catch (error) {
        console.error("Gagal mengupdate penyewa:", error);
      }
    });

  // 5. Event: Hapus User


  // Fungsi untuk menghapus penyewa





  cancelBtnPenyewa.addEventListener("click", () => {
    document.getElementById("add-user-modal-penyewa").classList.add("hidden");
  });

  cancelEditBtnPenyewa.addEventListener("click", () => {
    document.getElementById("edit-user-modal-penyewa").classList.add("hidden");
  });

  

  // 6. Event: Pencarian
  searchBarPenyewa.addEventListener("input", (e) => {
    fetchPenyewa(e.target.value);
  });

  // Memuat data penyewa saat halaman pertama kali dimuat
  fetchPenyewa();


  penyewaContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn-penyewa")) {
      selectedUserId = e.target.getAttribute("data-uid");
      openDeleteModalPenyewa(selectedUserId);
    }
  });

  async function openDeleteModalPenyewa(userId) {
    try {
      const docRef = doc(db, "penyewa", userId);
      const docSnapshot = await getDoc(docRef);
      const user = docSnapshot.data();

      if (user) {
        // Tampilkan nama pengguna di modal
        document.getElementById("delete-user-name-penyewa").textContent = user.namePenyewa;

        // Tampilkan modal delete
        document
          .getElementById("delete-user-modal-penyewa")
          .classList.remove("hidden");

        // Menangani klik pada tombol hapus
        document.getElementById("confirm-delete-btn-penyewa").onclick = async () => {
          await deleteDoc(docRef); // Menghapus pengguna
          alert("User berhasil dihapus!");
          document
            .getElementById("delete-user-modal-penyewa")
            .classList.add("hidden");
          fetchPenyewa(); // Memuat ulang daftar pengguna
        };
      } else {
        console.error("User data not found for deletion");
      }
    } catch (error) {
      console.error("Error fetching user data for delete:", error);
    }
  }

  // Event listener untuk tombol batal
  document.getElementById("cancel-delete-btn-penyewa").addEventListener("click", () => {
    document.getElementById("delete-user-modal-penyewa").classList.add("hidden");
  });

  document.getElementById("kelolaPenyewaBtn").addEventListener("click", function(){
    fetchPenyewa();
    console.log("reload penyewa");
  });

