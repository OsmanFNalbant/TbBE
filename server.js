import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import portalRoutes from "./routes/portalRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/portal", portalRoutes);
app.use("/admin", adminRoutes);   

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlı"))
  .catch((err) => console.error(err));

app.listen(5000, () => console.log("Server 5000'de çalışıyor"));
