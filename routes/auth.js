const router = require("express").Router();
const passport = require("passport");

// Front-end URL for redirects after auth
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "https://www.googleapis.com/auth/youtube.force-ssl"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: FRONTEND_URL + "/" }),
  (req, res) => res.redirect(FRONTEND_URL + "/home")
);

router.get("/logout", (req, res) => {
  req.logout();
  // Redirect back to front-end root
  res.redirect(FRONTEND_URL + "/");
});

module.exports = router;
