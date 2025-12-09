import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String, // Cloudinary URL
  createdAt: { type: Date, default: Date.now },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
});

export default mongoose.model("Product", productSchema);
