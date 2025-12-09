import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin)
      return res.status(400).json({ message: "Admin bulunamadı!" });

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch)
      return res.status(400).json({ message: "Şifre yanlış!" });

    const token = jwt.sign(
      { id: admin._id },
      process.env.ADMIN_SECRET || "PORTAL_ADMIN_SECRET",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin girişi başarılı!",
      token
    });

  } catch (err) {
    return res.status(500).json({
      message: "Sunucu hatası",
      error: err.message
    });
  }
};
