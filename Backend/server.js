import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/configs/mongodb.js";
import questionRoutes from "./src/routes/questionRoutes.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB
await connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? ["http://localhost:5173"],
    credentials: true,
  })
);

// Serve audio files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/questions", questionRoutes);

// Health
app.get("/", (_req, res) => res.send("Spelling Contest API running"));

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
