// routes/productRoutes.js
import express from "express";
import { getProducts, addProduct, deleteProduct, parser } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", parser.single("image"), addProduct);
router.delete("/:id", deleteProduct);

export default router;

