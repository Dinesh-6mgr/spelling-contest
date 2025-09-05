import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Question from "../models/Question.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + safe);
  }
});
const fileFilter = (_req, file, cb) => {
  const ok = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/aac", "audio/x-m4a"].includes(file.mimetype)
    || [".mp3", ".wav", ".m4a", ".aac"].includes(path.extname(file.originalname).toLowerCase());
  cb(ok ? null : new Error("Only audio files are allowed"), ok);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// Normalize answer
const normalize = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "")
    .trim();

// POST /upload
router.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const { questionNo, answer } = req.body;
    if (!questionNo || !answer || !req.file) {
      return res.status(400).json({ success: false, message: "questionNo, answer, audio required" });
    }

    const audioUrl = `/uploads/${req.file.filename}`;

    const doc = await Question.findOneAndUpdate(
      { questionNo: Number(questionNo) },
      {
        questionNo: Number(questionNo),
        originalAnswer: answer.trim(),
        answer: normalize(answer),
        audioUrl
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: "Question saved", data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all
router.get("/", async (_req, res) => {
  try {
    const all = await Question.find().sort({ questionNo: 1, createdAt: 1 }).lean();
    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET one by number
router.get("/:number", async (req, res) => {
  const q = await Question.findOne({ questionNo: Number(req.params.number) }).lean();
  if (!q) return res.status(404).json({ success: false, message: "Question not found" });
  res.json({ success: true, data: q });
});

// POST check answer
router.post("/check/:number", async (req, res) => {
  const { answer } = req.body;
  const q = await Question.findOne({ questionNo: Number(req.params.number) }).lean();
  if (!q) return res.status(404).json({ success: false, message: "Question not found" });

  const isCorrect = normalize(answer) === q.answer;
  res.json({
    success: true,
    correct: isCorrect,
    ...(isCorrect ? {} : { correctAnswer: q.originalAnswer })
  });
});

// DELETE single question
router.delete("/:id", async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ success: false, message: "Question not found" });

    const filePath = path.join(process.cwd(), q.audioUrl.replace(/^\//, ""));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await q.deleteOne();
    res.json({ success: true, message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE ALL questions
router.delete("/", async (_req, res) => {
  try {
    const all = await Question.find();
    for (const q of all) {
      const filePath = path.join(process.cwd(), q.audioUrl.replace(/^\//, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Question.deleteMany({});
    res.json({ success: true, message: "All questions deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE answer by _id
router.put("/:id", async (req, res) => {
  try {
    const { originalAnswer } = req.body;
    if (!originalAnswer) return res.status(400).json({ success: false, message: "originalAnswer required" });

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      {
        originalAnswer: originalAnswer.trim(),
        answer: normalize(originalAnswer)
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Question not found" });

    res.json({ success: true, message: "Answer updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
