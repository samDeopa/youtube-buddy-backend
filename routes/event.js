const router = require("express").Router();
const Event = require("../models/Event");

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

router.use(ensureAuthenticated);

router.get("/", async (req, res) => {
  const events = await Event.find({ userId: req.user.id }).sort("-timestamp");
  res.json(events);
});

module.exports = router;
