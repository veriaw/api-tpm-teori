import multer from "multer";

// Simpan di memori karena nantinya langsung di-pipe ke Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("File harus berupa image"), false);
    } else {
      cb(null, true);
    }
  }
});

export default upload;