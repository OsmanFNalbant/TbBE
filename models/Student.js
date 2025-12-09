import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;
