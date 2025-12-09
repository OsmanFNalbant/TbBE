// portalRoutes.js
import express from "express";
import Student from "../models/Student.js";
import Feed from "../models/Feed.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import XLSX from "xlsx";

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
   1️⃣ LOGIN (studentNumber + password)
---------------------------------------------- */
router.post("/login", async (req, res) => {
  const { studentNumber, password } = req.body;

  try {
    const student = await Student.findOne({ studentNumber });
    if (!student)
      return res.status(400).json({ error: "Kullanıcı bulunamadı" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(400).json({ error: "Şifre yanlış" });

    res.json({
      _id: student._id,
      studentNumber: student.studentNumber,
      fullName: student.fullName,
      school: student.school
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

/* ----------------------------------------------
   2️⃣ FEED GETİR
---------------------------------------------- */
router.get("/feed", async (req, res) => {
  try {
    const feed = await Feed.find().populate("studentId", "fullName studentNumber school");
    res.json(feed);
  } catch (err) {
    console.error("Feed yüklenemedi:", err);
    res.status(500).json({ error: "Feed yüklenemedi", details: err.message });
  }
});

/* ----------------------------------------------
   3️⃣ FOTO YÜKLE
---------------------------------------------- */
router.post("/upload", parser.single("image"), async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId || studentId.length !== 24) {
      return res.status(400).json({ error: "Geçersiz studentId" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Resim gerekli" });
    }

    const feedItem = new Feed({
      studentId: new mongoose.Types.ObjectId(studentId),
      image: req.file.path,
    });

    await feedItem.save();
    res.json(feedItem);

  } catch (err) {
    console.error(err);
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

/* ----------------------------------------------
   5️⃣ ÖĞRENCİ EKLE (TEK TEK)
---------------------------------------------- */
router.post("/students", async (req, res) => {
  try {
    const { studentNumber, fullName, school, password } = req.body;

    // Tüm alanlar dolu mu kontrolü
    if (!studentNumber || !fullName || !school || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur" });
    }

    // Aynı studentNumber var mı kontrolü
    const exists = await Student.findOne({ studentNumber });
    if (exists) {
      return res.status(400).json({ error: "Bu öğrenci zaten var." });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni öğrenci oluştur
    const newStudent = new Student({
      studentNumber,
      fullName,
      school,
      password: hashedPassword,
    });

    await newStudent.save();
    console.log("Yeni öğrenci kaydedildi:", newStudent);

    res.json({ message: "Öğrenci başarıyla eklendi", student: newStudent });
  } catch (err) {
    console.error("Öğrenci ekleme hatası detaylı:", err);
    res.status(500).json({ error: "Sunucu hatası", details: err.message });
  }
});

/* ----------------------------------------------
   6️⃣ EXCEL TOPLU YÜKLE
---------------------------------------------- */
const excelUpload = multer({ dest: "temp/" });

router.post("/students/excel", excelUpload.single("excel"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let added = [];

    for (let row of rows) {
      if (!row.studentNumber || !row.fullName || !row.school || !row.password)
        continue;

      const exists = await Student.findOne({ studentNumber: row.studentNumber });
      if (exists) continue;

      const hashed = await bcrypt.hash(row.password, 10);

      const s = new Student({
        studentNumber: row.studentNumber,
        fullName: row.fullName,
        school: row.school,
        password: hashed,
      });

      await s.save();
      added.push(s);
    }

    res.json({ message: "Excel başarıyla işlendi", added });

  } catch (err) {
    res.status(500).json({ error: "Excel yükleme hatası", details: err });
  }
});

export default router;
