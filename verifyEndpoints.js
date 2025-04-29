// verifyEndpoints.js
// A simple Node script to verify your YouTube Companion Dashboard API endpoints.
// Usage:
//   SESSION_COOKIE="connect.sid=<your-session-cookie>" BASE_URL="http://localhost:8000" node verifyEndpoints.js

require("dotenv").config();
const axios = require("axios");

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const SESSION_COOKIE = process.env.SESSION_COOKIE;

if (!SESSION_COOKIE) {
  console.error(
    "Error: SESSION_COOKIE env var is required. Copy your connect.sid cookie from the browser session."
  );
  process.exit(1);
}

const config = {
  headers: {
    Cookie: SESSION_COOKIE,
    "Content-Type": "application/json",
  },
};

async function verifyEndpoints() {
  try {
    console.log("1) GET /videos");
    const videosRes = await axios.get(`${BASE_URL}/videos`, config);
    console.log("Videos:", videosRes.data);

    const videos = videosRes.data;
    if (!Array.isArray(videos) || videos.length === 0) {
      console.log("No videos found, skipping detail/comment tests.");
      return;
    }

    const videoId = videos[0].id;
    console.log(`\n2) GET /videos/${videoId}`);
    const detailRes = await axios.get(`${BASE_URL}/videos/${videoId}`, config);
    console.log("Video details:", detailRes.data);

    console.log(`\n3) GET /videos/${videoId}/comments`);
    const commentsRes = await axios.get(
      `${BASE_URL}/videos/${videoId}/comments`,
      config
    );
    console.log("Comments:", commentsRes.data);

    console.log(`\n4) GET /notes?videoId=${videoId}`);
    const notesRes = await axios.get(
      `${BASE_URL}/notes?videoId=${videoId}`,
      config
    );
    console.log("Notes:", notesRes.data);

    console.log("\n5) GET /events");
    const eventsRes = await axios.get(`${BASE_URL}/events`, config);
    console.log("Events:", eventsRes.data);
  } catch (err) {
    if (err.response) {
      console.error("Request failed:", err.response.status, err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}

verifyEndpoints();
