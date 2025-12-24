// models/Feed.js
import mongoose from "mongoose";

const feedSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true
    },
    studentNumber: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Feed", feedSchema);
