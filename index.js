require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

require("./config/passport"); // Passport strategy

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");
const videoRoutes = require("./routes/videos");
const noteRoutes = require("./routes/notes");

const app = express();
// Enable CORS with credentials for front-end app
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
// Configure session cookie to allow cross-site requests
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // not using HTTPS in dev
      sameSite: "lax", // allow cookies on top-level navigations
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/videos", videoRoutes);
app.use("/notes", noteRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
