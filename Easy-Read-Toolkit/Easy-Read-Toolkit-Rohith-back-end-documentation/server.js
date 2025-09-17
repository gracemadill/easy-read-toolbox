// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const { z } = require("zod");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: (process.env.ALLOWED_ORIGIN || "*").split(",") }));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

// Uploads kept in memory (no temp files)
const upload = multer({ storage: multer.memoryStorage() });
const clamp = (s, max = 20000) => (s && s.length > max ? s.slice(0, max) : s);

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// (i) HOME PAGE BACKEND — AI rewrite (stub)
const rewriteSchema = z.object({
  sentence: z.string().min(1).max(1500),
  keepTerms: z.array(z.string()).optional().default([]),
});

app.post("/ai/rewrite", (req, res) => {
  try {
    const { sentence } = rewriteSchema.parse(req.body);
    res.json({
      candidates: [
        "They did not follow the policy.",
        "They failed to follow the policy.",
        "They did not comply with the policy.",
      ],
    });
  } catch (e) {
    res.status(400).json({ error: e.message || "Bad request" });
  }
});

// (ii) DOCUMENT PAGE BACKEND — PDF → text
app.post("/upload/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Please upload a PDF (application/pdf)" });
    }

    const data = await pdfParse(req.file.buffer);
    const text = (data.text || "").trim();

    if (!text) {
      return res.json({
        text: "",
        note: "No embedded text found (likely a scanned PDF). Use Image OCR instead.",
      });
    }
    res.json({ text: clamp(text) });
  } catch (err) {
    console.error("PDF parse error:", err);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

// (ii) DOCUMENT PAGE BACKEND — Image OCR
app.post("/upload/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const okTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!okTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Please upload an image (jpeg/png/webp)" });
    }

    const result = await Tesseract.recognize(req.file.buffer, "eng");
    const text = (result?.data?.text || "").trim();
    res.json({ text: clamp(text) });
  } catch (err) {
    console.error("Image OCR error:", err);
    res.status(500).json({ error: "Failed to OCR image" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API up on :${port}`));
