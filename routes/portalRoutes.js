// portalRoutes.js
import express from "express";
import Feed from "../models/Feed.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

/* ----------------------------------------------
   CLOUDINARY AYARLARI
---------------------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ----------------------------------------------
   MULTER + CLOUDINARY
---------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "portal_feed",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const parser = multer({ storage });



/* ----------------------------------------------
   2️⃣ FEED GETİR
---------------------------------------------- */
router.get("/feed", async (req, res) => {
  try {
    const feed = await Feed.find().sort({ createdAt: -1 });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Feed yüklenemedi" });
  }
});

/* ----------------------------------------------
   3️⃣ FOTO YÜKLE
---------------------------------------------- */
/* ----------------------------------------------
   3️⃣ FOTO YÜKLE (studentId YOK)
---------------------------------------------- */
router.post("/upload", parser.single("image"), async (req, res) => {
  try {
    const { studentName, studentNumber } = req.body;

    if (!studentName || !studentNumber) {
      return res.status(400).json({ error: "Ad ve numara zorunlu" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Resim gerekli" });
    }

    const feedItem = new Feed({
      studentName,
      studentNumber,
      image: req.file.path // Cloudinary URL
    });

    await feedItem.save();
    res.json(feedItem);

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});



/* ----------------------------------------------
   4️⃣ FEED SİL
---------------------------------------------- */
router.delete("/feed/:id", async (req, res) => {
  try {
    const feedItem = await Feed.findById(req.params.id);
    if (!feedItem) {
      return res.status(404).json({ error: "Fotoğraf bulunamadı" });
    }

    const publicId = feedItem.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`portal_feed/${publicId}`);

    await feedItem.deleteOne();
    res.json({ message: "Fotoğraf silindi" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Silme sırasında hata oluştu" });
  }
});

