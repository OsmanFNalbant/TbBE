import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  image: String,

  studentName: {
    type: String,
    required: true
  },

  studentNumber: {
    type: String,
    required: true
  },

  school: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Product", ProductSchema);
