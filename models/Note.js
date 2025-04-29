const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoteSchema = new Schema({
  userId: { type: String, required: true },
  videoId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", NoteSchema);
