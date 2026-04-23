const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

require("dotenv").config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- DB ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ---------------- SCHEMAS ---------------- */
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const grievanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: String,
  status: { type: String, default: "Pending" },
  date: { type: Date, default: Date.now },
  userId: String,
});

const Student = mongoose.model("Student", studentSchema);
const Grievance = mongoose.model("Grievance", grievanceSchema);

/* ---------------- AUTH ---------------- */
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ error: "Invalid token" });
  }
};

/* ---------------- ROUTES ---------------- */

/* Register */
app.post("/api/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exist = await Student.findOne({ email });
    if (exist) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await Student.create({ name, email, password: hash });

    res.json({ message: "Registered Successfully" });
  } catch (err) {
    next(err);
  }
});

/* Login */
app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/* ---------------- GRIEVANCE ROUTES ---------------- */

/* CREATE */
app.post("/api/grievances", auth, async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title & Description required" });
    }

    const grievance = await Grievance.create({
      title,
      description,
      category,
      userId: req.user.id,
    });

    res.json(grievance);
  } catch (err) {
    next(err);
  }
});

/* GET ALL (ONLY USER DATA) */
app.get("/api/grievances", auth, async (req, res, next) => {
  try {
    const data = await Grievance.find({ userId: req.user.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/* 🔥 SEARCH (IMPORTANT ORDER) */
app.get("/api/grievances/search", auth, async (req, res, next) => {
  try {
    const title = req.query.title || "";

    const data = await Grievance.find({
      title: new RegExp(title, "i"),
      userId: req.user.id,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/* GET BY ID (USER SAFE) */
app.get("/api/grievances/:id", auth, async (req, res, next) => {
  try {
    const data = await Grievance.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/* UPDATE (USER SAFE) */
app.put("/api/grievances/:id", auth, async (req, res, next) => {
  try {
    const data = await Grievance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/* DELETE (USER SAFE) */
app.delete("/api/grievances/:id", auth, async (req, res, next) => {
  try {
    const data = await Grievance.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!data) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
});

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    error: err.message || "Server Error",
  });
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});