const mongoose = require("mongoose");
const { Schema } = mongoose;

const EventSchema = new Schema({
  userId: { type: String },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", EventSchema);
