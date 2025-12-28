// controllers/productController.js
import Product from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "teknobot_products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const parser = multer({ storage });

// GET → tüm ürünler
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Ürünler yüklenemedi" });
  }
};

// DELETE → ürün sil
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    // Cloudinary URL → FULL PATH
    // örnek: https://res.cloudinary.com/.../teknobot_products/xxyyzz.jpg

    const parts = product.image.split("/");
    const fileName = parts.pop(); // xxyyzz.jpg
    const folder = parts.pop();   // teknobot_products

    const publicId = `${folder}/${fileName.split(".")[0]}`;

    console.log("Silinecek Public ID:", publicId);

    // Cloudinary’den sil
    await cloudinary.uploader.destroy(publicId);

    // MongoDB’den sil
    await product.deleteOne();

    res.json({ message: "Ürün başarıyla silindi" });
  } catch (err) {
    console.error("Ürün silme hatası:", err);
    res.status(500).json({ error: "Ürün silinirken hata oluştu" });
  }
};

// POST → ürün ekle (resimli)
// POST → ürün ekle (resimli)
export const addProduct = async (req, res) => {
  try {
    console.log("📦 BODY:", req.body);
    console.log("🖼️ FILE:", req.file);

    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: "Ad ve açıklama zorunludur" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Resim yüklenmedi" });
    }

    const newProduct = new Product({
      name,
      description,
      image: req.file.path,
    });

    await newProduct.save();
    console.log("✅ PRODUCT SAVED");

    res.json(newProduct);
  } catch (err) {
    console.error("❌ Ürün ekleme backend hatası:", err);
    res.status(500).json({ error: "Ürün eklenirken hata oluştu" });
  }
};


