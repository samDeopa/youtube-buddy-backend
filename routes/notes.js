const router = require("express").Router();
const Note = require("../models/Note");
const Event = require("../models/Event");

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

router.use(ensureAuthenticated);

// Get notes for a specific video
router.get("/", async (req, res) => {
  try {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ error: "videoId is required" });
    const notes = await Note.find({ userId: req.user.id, videoId }).sort(
      "-createdAt"
    );
    await Event.create({
      userId: req.user.id,
      eventType: "FETCH_NOTES",
      payload: { videoId },
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new note for a video
router.post("/", async (req, res) => {
  try {
    const { videoId, content } = req.body;
    if (!videoId || !content)
      return res
        .status(400)
        .json({ error: "videoId and content are required" });
    const note = await Note.create({ userId: req.user.id, videoId, content });
    await Event.create({
      userId: req.user.id,
      eventType: "CREATE_NOTE",
      payload: { videoId, noteId: note._id, content },
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing note
router.patch("/:id", async (req, res) => {
  try {
    const { content } = req.body;
    const noteId = req.params.id;
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user.id },
      { content },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "Note not found" });
    await Event.create({
      userId: req.user.id,
      eventType: "UPDATE_NOTE",
      payload: { noteId, content },
    });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.user.id,
    });
    if (!note) return res.status(404).json({ error: "Note not found" });
    await Event.create({
      userId: req.user.id,
      eventType: "DELETE_NOTE",
      payload: { noteId },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
