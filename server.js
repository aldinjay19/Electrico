require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Report = require("./models/Report");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Only these fields can be saved
const pick = (b) => ({ muni: b.muni, brgy: b.brgy, time: b.time, mins: b.mins || 0 });

// READ: all reports
app.get("/api/reports", async (req, res) => {
  const reports = await Report.find().sort({ time: -1 });
  res.json(reports);
});

// CREATE: a new report
app.post("/api/reports", async (req, res) => {
  try { res.status(201).json(await Report.create(pick(req.body))); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// UPDATE: edit a report
app.put("/api/reports/:id", async (req, res) => {
  try {
    const r = await Report.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!r) return res.status(404).json({ error: "Report not found" });
    res.json(r);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE: remove a report
app.delete("/api/reports/:id", async (req, res) => {
  try {
    const r = await Report.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: "Report not found" });
    res.status(204).end();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log("Electrico running on port " + PORT)))
  .catch((e) => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
