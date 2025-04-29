const router = require("express").Router();
const { google } = require("googleapis");
const Event = require("../models/Event");

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// Apply authentication middleware
router.use(ensureAuthenticated);

// Attach YouTube API client to request
router.use((req, res, next) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    access_token: req.user.tokens.accessToken,
    refresh_token: req.user.tokens.refreshToken,
  });
  req.youtube = google.youtube({ version: "v3", auth: oauth2Client });
  next();
});

// Fetch all uploaded videos for the authenticated user
router.get("/", async (req, res) => {
  try {
    const channelResponse = await req.youtube.channels.list({
      part: "contentDetails",
      mine: true,
    });
    const uploadPlaylistId =
      channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
    const playlistResponse = await req.youtube.playlistItems.list({
      part: "snippet,contentDetails",
      playlistId: uploadPlaylistId,
      maxResults: 50,
    });
    // Map playlist items to return real video IDs
    const videos = playlistResponse.data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.default?.url,
      publishedAt: item.contentDetails.videoPublishedAt,
    }));
    await Event.create({
      userId: req.user.id,
      eventType: "FETCH_ALL_VIDEOS",
      payload: { playlistId: uploadPlaylistId },
    });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch video details
router.get("/:id", async (req, res) => {
  console.log("HI from get method");
  try {
    const videoId = req.params.id;
    const response = await req.youtube.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });
    console.log(response);

    const video = response.data.items[0];
    await Event.create({
      userId: req.user.id,
      eventType: "FETCH_VIDEO_DETAILS",
      payload: { videoId },
    });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update video title and description
router.patch("/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    const { title, description } = req.body;
    // Fetch existing snippet to preserve required fields (e.g., categoryId)
    const getRes = await req.youtube.videos.list({
      part: "snippet",
      id: videoId,
    });
    const existingSnippet = getRes.data.items[0].snippet;
    const updatedSnippet = {
      ...existingSnippet,
      title,
      description,
    };
    const response = await req.youtube.videos.update({
      part: "snippet",
      requestBody: {
        id: videoId,
        snippet: updatedSnippet,
      },
    });
    await Event.create({
      userId: req.user.id,
      eventType: "UPDATE_VIDEO",
      payload: { videoId, title, description },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch comments for a video
router.get("/:id/comments", async (req, res) => {
  try {
    const videoId = req.params.id;
    const response = await req.youtube.commentThreads.list({
      part: "snippet,replies",
      videoId,
      maxResults: 50,
    });
    await Event.create({
      userId: req.user.id,
      eventType: "FETCH_COMMENTS",
      payload: { videoId },
    });
    res.json(response.data.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a top-level comment
router.post("/:id/comments", async (req, res) => {
  try {
    const videoId = req.params.id;
    const { text } = req.body;
    const response = await req.youtube.commentThreads.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          videoId,
          topLevelComment: { snippet: { textOriginal: text } },
        },
      },
    });
    const comment = response.data;
    await Event.create({
      userId: req.user.id,
      eventType: "CREATE_COMMENT",
      payload: { videoId, commentId: comment.id, text },
    });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to a comment
router.post("/:id/comments/:commentId/replies", async (req, res) => {
  try {
    const videoId = req.params.id;
    const commentId = req.params.commentId;
    const { text } = req.body;
    const response = await req.youtube.comments.insert({
      part: "snippet",
      requestBody: { snippet: { parentId: commentId, textOriginal: text } },
    });
    const reply = response.data;
    await Event.create({
      userId: req.user.id,
      eventType: "REPLY_COMMENT",
      payload: { videoId, commentId, replyId: reply.id, text },
    });
    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const videoId = req.params.id;
    const commentId = req.params.commentId;
    await req.youtube.comments.delete({ id: commentId });
    await Event.create({
      userId: req.user.id,
      eventType: "DELETE_COMMENT",
      payload: { videoId, commentId },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
