// server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5500;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dbPath = path.join(__dirname, "db.json");

// Ensure db.json exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Get all items
app.get("/api/items", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dbPath));
  res.json(data);
});

// Add new item
app.post("/api/items", (req, res) => {
  const items = JSON.parse(fs.readFileSync(dbPath));
  const newItem = { id: Date.now().toString(), ...req.body };
  items.push(newItem);
  fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
  res.status(201).json(newItem);
});

// Delete item
app.delete("/api/items/:id", (req, res) => {
  let items = JSON.parse(fs.readFileSync(dbPath));
  items = items.filter((item) => item.id !== req.params.id);
  fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
  res.json({ message: "Item deleted" });
});

// Update item
app.put("/api/items/:id", (req, res) => {
  let items = JSON.parse(fs.readFileSync(dbPath));
  const index = items.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Item not found" });
  items[index] = { ...items[index], ...req.body };
  fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
  res.json(items[index]);
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
