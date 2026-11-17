const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  muni: { type: String, required: true, enum: ["San Fernando", "Cajidiocan", "Magdiwang"] },
  brgy: { type: String, required: true, trim: true, maxlength: 40 },
  time: { type: Date, required: true },                 // when the power went out
  mins: { type: Number, default: 0, min: 0, max: 2880 }, // how long (optional)
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema, "students");
