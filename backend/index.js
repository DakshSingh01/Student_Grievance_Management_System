const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ---------------- Middleware ---------------- */

app.use(cors());
app.use(express.json());

/* ---------------- MongoDB Connection ---------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ---------------- Schema ---------------- */

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course: { type: String },
});

const Student = mongoose.model("Student", studentSchema);

/* ---------------- Auth Middleware ---------------- */

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied" });
  }

  let token;

  // ✅ Support BOTH formats
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader; // raw token
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.student = verified;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid token" });
  }
};

/* ---------------- Routes ---------------- */

/* Register */
app.post("/api/register", async (req, res, next) => {
  try {
    const { name, email, password, course } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      password: hashed,
      course,
    });

    await student.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    next(err);
  }
});

/* Login */
app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/* Dashboard */
app.get("/api/dashboard", authMiddleware, async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    res.json(student);
  } catch (err) {
    next(err);
  }
});

/* Update Password */
app.put("/api/update-password", authMiddleware, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const student = await Student.findById(req.student.id);

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password incorrect" });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
});

/* Update Course */
app.put("/api/update-course", authMiddleware, async (req, res, next) => {
  try {
    const { course } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.student.id,
      { course },
      { new: true }
    );

    res.json(student);
  } catch (err) {
    next(err);
  }
});

/* ---------------- Error Handler ---------------- */

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message || "Server Error" });
});

/* ---------------- Server ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});