import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: "dw02olr57", // Ganti dengan Cloudinary Cloud Name Anda
  api_key: "982321774595764", // Ganti dengan API Key Anda
  api_secret: "DGkvh9e_XPtzy0qwfsotiByIZzc", // Ganti dengan API Secret Anda
});

// Middleware untuk menangani file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default async function handler(req, res) {
  if (req.method === "POST") {
    upload.single("file")(req, {}, (err) => {
      if (err) {
        console.error("Error multer:", err);
        return res.status(400).json({ error: "File upload error" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
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
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

