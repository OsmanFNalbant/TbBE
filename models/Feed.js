import mongoose from "mongoose";

const feedSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Feed = mongoose.model("Feed", feedSchema);
export default Feed;
