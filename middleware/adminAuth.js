import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Admin girişi gerekli!" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_SECRET || "PORTAL_ADMIN_SECRET"
    );

    req.adminId = decoded.id;
    next();

  } catch (err) {
    res.status(401).json({ message: "Token geçersiz veya süresi dolmuş!" });
  }
};
