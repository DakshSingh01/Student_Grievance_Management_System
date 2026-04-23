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

/* ---------------- MongoDB ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ---------------- Student Schema ---------------- */
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course: { type: String },
});

const Student = mongoose.model("Student", studentSchema);

/* ---------------- Grievance Schema ---------------- */
const grievanceSchema = new mongoose.Schema({
  title: String,
  description: String,
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Grievance = mongoose.model("Grievance", grievanceSchema);

/* ---------------- Auth Middleware ---------------- */
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Access Denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.student = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

/* ---------------- Routes ---------------- */

/* Register */
app.post("/api/register", async (req, res) => {
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

    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Login */
app.post("/api/login", async (req, res) => {
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
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Dashboard */
app.get("/api/dashboard", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- Grievance Routes ---------------- */

/* Add Grievance */
app.post("/api/grievances", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const grievance = new Grievance({
      title,
      description,
      studentId: req.student.id,
    });

    await grievance.save();

    res.json({ message: "Grievance added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get Grievances */
app.get("/api/grievances", authMiddleware, async (req, res) => {
  try {
    const data = await Grievance.find({ studentId: req.student.id }).sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Update Grievance */
app.put("/api/grievances/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const updated = await Grievance.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Delete Grievance */
app.delete("/api/grievances/:id", authMiddleware, async (req, res) => {
  try {
    await Grievance.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});