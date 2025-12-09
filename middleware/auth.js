import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token gerekli" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Yetkiniz yok" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Geçersiz token" });
  }
}
