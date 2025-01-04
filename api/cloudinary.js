const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const cors = require("cors"); // Tambahkan ini

const app = express();
const port = 3000;

// Aktifkan CORS untuk semua origin
app.use(cors());

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: "dw02olr57", // Ganti dengan Cloudinary Cloud Name Anda
  api_key: "982321774595764", // Ganti dengan API Key Anda
  api_secret: "DGkvh9e_XPtzy0qwfsotiByIZzc", // Ganti dengan API Secret Anda
});

// Middleware untuk menangani file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Tambahkan route GET /
app.get("/", (req, res) => {
  res.send(
    "Server berjalan! Gunakan endpoint POST /upload untuk mengunggah gambar."
  );
});

// Endpoint untuk upload gambar
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Tidak ada file yang diupload." });
  }

  cloudinary.uploader
    .upload_stream({ resource_type: "image" }, (error, result) => {
      if (error) {
        console.error("Error dari Cloudinary:", error);
        return res
          .status(500)
          .json({ error: "Gagal mengunggah ke Cloudinary" });
      }

      res.status(200).json({ url: result.secure_url });
    })
    .end(req.file.buffer);
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
