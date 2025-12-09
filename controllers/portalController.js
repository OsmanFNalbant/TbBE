import Student from "../models/Student.js";
import Product from "../models/Product.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;
  const student = await Student.findOne({ username });

  if (!student) return res.status(400).json({ error: "Öğrenci bulunamadı" });

  const match = await bcrypt.compare(password, student.password);
  if (!match) return res.status(400).json({ error: "Şifre yanlış" });

  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token, userId: student._id, username: student.username });
};

export const getFeed = async (req, res) => {
  const feed = await Product.find().populate("studentId");
  res.json(feed);
};

export const uploadImage = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!req.file) return res.status(400).json({ error: "Dosya yok" });

    const newProduct = new Product({
      name: req.body.name || "Öğrenci Fotoğrafı",
      description: req.body.description || "",
      image: req.file.path,
      studentId,
    });

    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

router.post("/students", async (req, res) => {
  try {
    const { studentNumber, fullName, school, password } = req.body;

    if (!studentNumber || !fullName || !school || !password) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur" });
    }

    console.log("Yeni öğrenci ekleme isteği:", req.body);

    const exists = await Student.findOne({ studentNumber });
    if (exists) {
      console.log("Öğrenci zaten var:", studentNumber);
      return res.status(400).json({ error: "Bu öğrenci zaten var." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      studentNumber,
      fullName,
      school,
      password: hashed,
    });

    await newStudent.save();

    console.log("Yeni öğrenci kaydedildi:", newStudent);
    res.json({ message: "Öğrenci başarıyla eklendi", student: newStudent });
  } catch (err) {
    console.error("Öğrenci ekleme hatası detaylı:", err);
    res.status(500).json({ error: "Sunucu hatası", details: err.message });
  }
});


import XLSX from "xlsx";
import multer from "multer";

const upload = multer({ dest: "temp/" });

router.post("/students/excel", upload.single("excel"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let added = [];

    for (let row of rows) {
      if (!row.username || !row.fullName || !row.password) continue;

      const exists = await Student.findOne({ username: row.username });
      if (!exists) {
        const s = new Student({
          username: row.username,
          fullName: row.fullName,
          password: row.password
        });
        await s.save();
        added.push(s);
      }
    }

    res.json({ message: "Excel yüklendi", added });
  } catch (err) {
    res.status(500).json({ error: "Yükleme hatası", details: err });
  }
});


