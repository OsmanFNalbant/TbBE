import mongoose from "mongoose";
import Student from "./models/Student.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB bağlı"))
  .catch((err) => console.error(err));

const createTestStudents = async () => {
  await Student.deleteMany({});

  const students = [
    { username: "20250001", password: "1234" },
    { username: "20250002", password: "abcd" }
  ];

  for (let s of students) {
    const hashed = await bcrypt.hash(s.password, 10);
    const student = new Student({ username: s.username, password: hashed });
    await student.save();
    console.log(`Eklendi: ${s.username}`);
  }

  mongoose.disconnect();
};

createTestStudents();
