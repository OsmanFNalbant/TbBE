import express from "express";
import { adminLogin } from "../controllers/adminController.js";

const router = express.Router();

// POST /admin/login
router.post("/login", adminLogin);

export default router;
