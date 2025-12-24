import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    studentName: String,
    studentNumber: String,
    image: String,
  },
  { timestamps: true }
);

export default mongoose.model("Feed", feedSchema);
