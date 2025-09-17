const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const { z } = require("zod");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: (process.env.ALLOWED_ORIGIN || "*").split(",") }));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const clamp = (value, max = 20000) => {
  if (!value) return "";
  return value.length > max ? value.slice(0, max) : value;
};

const collapseWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const toSnippet = (text = "", max = 280) => {
  const clean = collapseWhitespace(text);
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

const documents = new Map();

const storeDocument = ({ title, type, text, note, sizeBytes }) => {
  const id = crypto.randomUUID();
  const trimmedText = clamp(text || "");
  const createdAt = new Date().toISOString();

  const defaultTitle =
    type === "image"
      ? `Image ${id.slice(0, 6)}`
      : type === "text"
      ? `Note ${id.slice(0, 6)}`
      : `Document ${id.slice(0, 6)}`;

  const record = {
    id,
    title: title?.trim() || defaultTitle,
    type,
    text: trimmedText,
    note: note || (type === "text" ? "Added manually." : null),
    snippet: trimmedText ? toSnippet(trimmedText) : "",
    createdAt,
    sizeBytes: typeof sizeBytes === "number" ? sizeBytes : null,
  };

  documents.set(id, record);
  return record;
};

const toDocumentResponse = (doc, { includeText = false } = {}) => {
  const base = {
    id: doc.id,
    title: doc.title,
    type: doc.type,
    createdAt: doc.createdAt,
    sizeBytes: doc.sizeBytes,
    note: doc.note,
    snippet: doc.snippet,
  };

  if (includeText) {
    base.text = doc.text;
  }

  return base;
};

app.get("/health", (_req, res) => res.json({ ok: true }));

const rewriteSchema = z.object({
  sentence: z.string().min(1).max(1500),
  keepTerms: z.array(z.string()).optional().default([]),
});

const simplifySentence = (sentence = "") => {
  const replacements = [
    [/utilise|utilize/gi, "use"],
    [/commence/gi, "start"],
    [/approximately/gi, "about"],
    [/assist/gi, "help"],
    [/inform/gi, "tell"],
    [/individuals?/gi, "people"],
    [/purchase/gi, "buy"],
    [/terminate/gi, "end"],
    [/prior to/gi, "before"],
    [/subsequent to/gi, "after"],
    [/requirement/gi, "need"],
    [/mandatory/gi, "required"],
    [/endeavour/gi, "try"],
    [/obtain/gi, "get"],
    [/attempt/gi, "try"],
    [/proceed/gi, "go"],
    [/assistance/gi, "help"],
    [/commencing/gi, "starting"],
  ];

  let result = sentence;
  replacements.forEach(([pattern, value]) => {
    result = result.replace(pattern, value);
  });

  result = result
    .replace(/\bshall\b/gi, "must")
    .replace(/\bfailure to\b/gi, "not")
    .replace(/\butilisation\b/gi, "use");

  return collapseWhitespace(result);
};

const ensureKeepTerms = (text, keepTerms) => {
  if (!keepTerms?.length) return text;
  const missing = keepTerms
    .map((term) => term.trim())
    .filter(Boolean)
    .filter(
      (term) => !text.toLowerCase().includes(term.toLowerCase())
    );

  if (!missing.length) return text;
  return `${text} (${missing.join(", ")} stay the same.)`;
};

app.post("/ai/rewrite", (req, res) => {
  try {
    const { sentence, keepTerms } = rewriteSchema.parse(req.body);
    const keepList = keepTerms.filter((term) => term && term.trim());

    const simplified = simplifySentence(sentence);
    const shorter = simplifySentence(sentence.replace(/, which/gi, ". This"));
    const plain = collapseWhitespace(sentence)
      .replace(/\bthey are\b/gi, "they're")
      .replace(/\bdoes not\b/gi, "doesn't");

    const set = new Map();
    [simplified, shorter, plain].forEach((variant) => {
      const withKeeps = ensureKeepTerms(variant, keepList);
      set.set(withKeeps.toLowerCase(), withKeeps);
    });

    if (!set.size) {
      const withKeeps = ensureKeepTerms(sentence, keepList);
      set.set(withKeeps.toLowerCase(), withKeeps);
    }

    res.json({ candidates: Array.from(set.values()).slice(0, 5) });
  } catch (e) {
    res.status(400).json({ error: e.message || "Bad request" });
  }
});

const textDocumentSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  text: z.string().min(1).max(20000),
  note: z.string().min(1).max(240).optional(),
  source: z.string().min(1).max(200).optional(),
});

app.post("/documents/text", (req, res) => {
  try {
    const payload = textDocumentSchema.parse(req.body);

    const document = storeDocument({
      title: payload.title,
      type: "text",
      text: payload.text,
      note:
        payload.note ||
        (payload.source ? `Imported from ${payload.source}.` : "Added manually."),
      sizeBytes: null,
    });

    res
      .status(201)
      .json({ document: toDocumentResponse(document, { includeText: true }) });
  } catch (err) {
    res.status(400).json({ error: err.message || "Bad request" });
  }
});

app.get("/documents", (_req, res) => {
  const list = Array.from(documents.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((doc) => toDocumentResponse(doc));

  res.json({ documents: list });
});

app.get("/documents/:id", (req, res) => {
  const doc = documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }

  res.json({ document: toDocumentResponse(doc, { includeText: true }) });
});

app.delete("/documents/:id", (req, res) => {
  if (!documents.has(req.params.id)) {
    return res.status(404).json({ error: "Document not found" });
  }
  documents.delete(req.params.id);
  res.status(204).send();
});

app.post("/upload/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ error: "Please upload a PDF (application/pdf)" });
    }

    const data = await pdfParse(req.file.buffer);
    const text = (data.text || "").trim();

    const note = text
      ? null
      : "No embedded text found (likely a scanned PDF). Use Image OCR instead.";

    const document = storeDocument({
      title: path.basename(req.file.originalname || "PDF document"),
      type: "pdf",
      text,
      note,
      sizeBytes: req.file.size,
    });

    res.json({ document: toDocumentResponse(document, { includeText: true }) });
  } catch (err) {
    console.error("PDF parse error:", err);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
});

app.post("/upload/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const okTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!okTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ error: "Please upload an image (jpeg/png/webp)" });
    }

    const result = await Tesseract.recognize(req.file.buffer, "eng");
    const text = (result?.data?.text || "").trim();

    const note = text ? "Extracted from image using OCR." : "No text recognised.";

    const document = storeDocument({
      title: path.basename(req.file.originalname || "Image document"),
      type: "image",
      text,
      note,
      sizeBytes: req.file.size,
    });

    res.json({ document: toDocumentResponse(document, { includeText: true }) });
  } catch (err) {
    console.error("Image OCR error:", err);
    res.status(500).json({ error: "Failed to OCR image" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API up on :${port}`));
